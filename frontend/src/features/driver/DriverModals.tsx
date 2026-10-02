import { createContext, useContext, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  X, MapPin, Wrench, CircleHelp, Zap, Route as RouteIcon, Box, ScanLine, Check,
} from 'lucide-react';
import { STOPS, CURRENT_STOP_INDEX, TRIP_ID, VEHICLE } from './data/driverData';

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
  const [type, setType] = useState<string | null>(null);
  const stop = STOPS[CURRENT_STOP_INDEX];
  return (
    <div className="dv-modal" role="document">
      <button className="dv-modal-close" onClick={onClose} aria-label="Close" type="button">
        <X size={20} />
      </button>
      <h2>Report an incident</h2>

      <div className="dv-incident-context">
        <MapPin size={22} aria-hidden />
        <div>
          <strong>{TRIP_ID} · Vehicle {VEHICLE}</strong>
          <span>{stop.name} · Stop {stop.position} of {STOPS.length}</span>
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
      />

      <button
        className={`dv-danger-button${type ? '' : ' disabled'}`}
        type="button"
        disabled={!type}
        onClick={onClose}
      >
        {type ? 'Save incident report' : 'Select an incident type'}
      </button>
    </div>
  );
}

function FineModal({ onClose }: { onClose: () => void }) {
  const stop = STOPS[CURRENT_STOP_INDEX];
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
          <strong>{stop.name}</strong>
          <span>{stop.access}</span>
        </div>
      </div>

      <label className="dv-field-label" htmlFor="dv-fine-amount">Fine amount (LKR)</label>
      <input id="dv-fine-amount" className="dv-input" type="text" inputMode="numeric" placeholder="e.g. 1500" />

      <label className="dv-field-label" htmlFor="dv-fine-reason">Reason</label>
      <textarea id="dv-fine-reason" className="dv-textarea" placeholder="Explain the unloading or parking situation" />

      <label className="dv-field-label" htmlFor="dv-fine-photo">Ticket photo</label>
      <input id="dv-fine-photo" className="dv-input" type="text" />

      <button className="dv-primary-button" type="button" onClick={onClose}>Save record</button>
    </div>
  );
}

function VerifyModal({ onClose }: { onClose: () => void }) {
  const stop = STOPS[CURRENT_STOP_INDEX];
  return (
    <div className="dv-modal" role="document">
      <button className="dv-modal-close" onClick={onClose} aria-label="Close" type="button">
        <X size={20} />
      </button>
      <h2>Verify the receiving store</h2>
      <p className="dv-modal-sub">Sample verification flow. No camera scanning is connected.</p>

      <div className="dv-verify-body">
        <ScanLine size={72} aria-hidden />
        <div className="dv-verify-name">{stop.name}</div>
        <div className="dv-verify-code">STORE · WP-001</div>
        <span className="dv-sample-badge">Sample code</span>
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
