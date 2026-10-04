import { createContext, useContext, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  X, MapPin, Wrench, CircleHelp, Zap, Route as RouteIcon, Box, ScanLine, Check,
} from 'lucide-react';
import { api } from '../../api';
import { useDriverData } from './DriverDataContext';

export type DriverModal = 'incident' | 'fine' | 'verify' | null;

const ModalContext = createContext<(modal: DriverModal) => void>(() => {});

export function useModal() {
  return useContext(ModalContext);
}

const INCIDENT_TYPES: { label: string; icon: typeof Wrench }[] = [
  { label: 'Vehicle breakdown', icon: Wrench },
  { label: 'Flat tyre', icon: CircleHelp },
  { label: 'Accident / collision', icon: Zap },
  { label: 'Road blocked', icon: RouteIcon },
  { label: 'Cargo issue', icon: Box },
  { label: 'Other', icon: CircleHelp },
];

function IncidentModal({ onClose }: { onClose: () => void }) {
  const { route, refreshRoute } = useDriverData();
  const [type, setType] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stop = route?.stops.find((item) => !['DELIVERED', 'PARTIAL_DELIVERY', 'UNABLE_TO_DELIVER', 'SKIPPED'].includes(item.status)) ?? route?.stops[0];
  const save = async () => {
    if (!type) return;
    setSaving(true);
    setError(null);
    try {
      await api.driverCreateIncidentReport({ stopId: stop?.stopId, type, notes: details || undefined });
      await refreshRoute();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the incident report.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="dv-modal" role="document">
      <button className="dv-modal-close" onClick={onClose} aria-label="Close" type="button">
        <X size={20} />
      </button>
      <h2>Report an incident</h2>

      <div className="dv-incident-context">
        <MapPin size={22} aria-hidden />
        <div>
          <strong>{route?.routeLabel ?? 'Current route'} · Vehicle {route?.vehicleId ?? '—'}</strong>
          <span>{stop?.outletName ?? 'No active stop'} · Stop {stop?.sequence ?? '—'} of {route?.totalStops ?? '—'}</span>
        </div>
      </div>

      <p className="dv-field-label dv-muted-label">What type of incident?</p>
      <div className="dv-incident-grid" role="radiogroup" aria-label="Incident type">
        {INCIDENT_TYPES.map(({ label, icon: Icon }) => {
          const selected = type === label;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`dv-incident-option${selected ? ' selected' : ''}`}
              onClick={() => setType(label)}
            >
              {selected && <Check size={16} className="dv-incident-check" aria-hidden />}
              <Icon size={22} aria-hidden />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <label className="dv-field-label" htmlFor="dv-incident-details">Details (optional)</label>
      <textarea
        id="dv-incident-details"
        className="dv-textarea"
        placeholder="What happened? Are you in a safe location?"
        value={details}
        onChange={(event) => setDetails(event.target.value)}
      />

      <button
        className={`dv-danger-button${type ? '' : ' disabled'}`}
        type="button"
        disabled={!type}
        onClick={() => void save()}
      >
        {saving ? 'Saving…' : type ? 'Save incident report' : 'Select an incident type'}
      </button>
      {error && <p className="dv-photo-error" role="alert">{error}</p>}
    </div>
  );
}

function FineModal({ onClose }: { onClose: () => void }) {
  const { route, refreshRoute } = useDriverData();
  const stop = route?.stops.find((item) => !['DELIVERED', 'PARTIAL_DELIVERY', 'UNABLE_TO_DELIVER', 'SKIPPED'].includes(item.status)) ?? route?.stops[0];
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [ticketReference, setTicketReference] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async () => {
    const numericAmount = Number(amount);
    if (!stop || !Number.isFinite(numericAmount) || numericAmount <= 0 || !reason.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.driverCreateFineReport({
        stopId: stop.stopId,
        amount: numericAmount,
        reason: reason.trim(),
        ticketReference: ticketReference.trim() || undefined,
      });
      await refreshRoute();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the fine report.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="dv-modal" role="document">
      <button className="dv-modal-close" onClick={onClose} aria-label="Close" type="button">
        <X size={20} />
      </button>
      <h2>Report a parking fine</h2>
      <p className="dv-modal-sub">Link the fine to your delivery and add the ticket details.</p>

      <div className="dv-fine-context">
        <MapPin size={22} aria-hidden />
        <div>
          <strong>{stop?.outletName ?? 'Current stop'}</strong>
          <span>{stop?.access ?? 'No stop context available'}</span>
        </div>
      </div>

      <label className="dv-field-label" htmlFor="dv-fine-amount">Fine amount (LKR)</label>
      <input id="dv-fine-amount" className="dv-input" type="text" inputMode="numeric" placeholder="e.g. 1500" value={amount} onChange={(event) => setAmount(event.target.value)} />

      <label className="dv-field-label" htmlFor="dv-fine-reason">Reason</label>
      <textarea id="dv-fine-reason" className="dv-textarea" placeholder="Explain the unloading or parking situation" value={reason} onChange={(event) => setReason(event.target.value)} />

      <label className="dv-field-label" htmlFor="dv-fine-photo">Ticket photo</label>
      <input id="dv-fine-photo" className="dv-input" type="text" value={ticketReference} onChange={(event) => setTicketReference(event.target.value)} placeholder="Ticket reference" />

      <button className="dv-primary-button" type="button" disabled={saving} onClick={() => void save()}>{saving ? 'Saving…' : 'Save record'}</button>
      {error && <p className="dv-photo-error" role="alert">{error}</p>}
    </div>
  );
}

function VerifyModal({ onClose }: { onClose: () => void }) {
  const { route } = useDriverData();
  const stop = route?.stops.find((item) => !['DELIVERED', 'PARTIAL_DELIVERY', 'UNABLE_TO_DELIVER', 'SKIPPED'].includes(item.status)) ?? route?.stops[0];
  return (
    <div className="dv-modal" role="document">
      <button className="dv-modal-close" onClick={onClose} aria-label="Close" type="button">
        <X size={20} />
      </button>
      <h2>Verify the receiving store</h2>
      <p className="dv-modal-sub">Sample verification flow. No camera scanning is connected.</p>

      <div className="dv-verify-body">
        <ScanLine size={72} aria-hidden />
        <div className="dv-verify-name">{stop?.outletName ?? 'No active stop'}</div>
        <div className="dv-verify-code">ORDER · {stop?.orderRef ?? '—'}</div>
        <span className="dv-sample-badge">Live route record</span>
      </div>

      <button className="dv-primary-button" type="button" onClick={onClose}>Verify sample store</button>
    </div>
  );
}

export function DriverModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<DriverModal>(null);

  return (
    <ModalContext.Provider value={setModal}>
      {children}
      {modal && createPortal(
        <div className="dv-modal-backdrop" onClick={() => setModal(null)} role="presentation">
          <div onClick={(e) => e.stopPropagation()}>
            {modal === 'incident' && <IncidentModal onClose={() => setModal(null)} />}
            {modal === 'fine' && <FineModal onClose={() => setModal(null)} />}
            {modal === 'verify' && <VerifyModal onClose={() => setModal(null)} />}
          </div>
        </div>,
        document.body,
      )}
    </ModalContext.Provider>
  );
}
