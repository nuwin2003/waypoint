import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck, Check, CheckCheck, QrCode, ChevronRight, Camera, Plus, X, ClipboardList, Box,
} from 'lucide-react';
import { useModal } from '../DriverModals';
import {
  STOPS, CURRENT_STOP_INDEX, PACKAGES, TRIP_ID, type DeliveryOutcome,
} from '../data/driverData';

interface PhotoState { url: string; name: string }

export function DeliveryPage() {
  const setModal = useModal();
  const stop = STOPS[CURRENT_STOP_INDEX];
  const total = PACKAGES.length;

  const [checked, setChecked] = useState<boolean[]>(() => PACKAGES.map((_, i) => i === 0));
  const [outcome, setOutcome] = useState<DeliveryOutcome>('Delivered');
  const [receiver, setReceiver] = useState('');
  const [photo, setPhoto] = useState<PhotoState | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [completed, setCompleted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const checkedCount = checked.filter(Boolean).length;

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url); }, [photo]);

  const toggle = (index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const selectAll = () => setChecked(PACKAGES.map(() => true));

  const changeOutcome = (next: DeliveryOutcome) => {
    setOutcome(next);
    if (next === 'Delivered') setChecked(PACKAGES.map(() => true));
    else if (next === 'Unable to deliver') setChecked(PACKAGES.map(() => false));
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setPhotoError('Please choose an image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setPhotoError('Image must be under 10 MB.'); return; }
    setPhotoError('');
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto({ url: URL.createObjectURL(file), name: file.name });
  };

  const removePhoto = () => {
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const needsReceiver = outcome !== 'Unable to deliver';
  let canComplete = false;
  if (outcome === 'Delivered') canComplete = checkedCount === total && receiver.trim() !== '';
  else if (outcome === 'Partial delivery') canComplete = checkedCount >= 1 && checkedCount < total && receiver.trim() !== '';
  else canComplete = true;

  let helper = 'Everything looks good. You can complete the delivery.';
  if (outcome === 'Delivered' && checkedCount !== total) helper = 'Select all packages to mark as delivered.';
  else if (outcome === 'Partial delivery' && (checkedCount === 0 || checkedCount === total)) helper = 'Select the packages you handed over (not all of them).';
  else if (needsReceiver && receiver.trim() === '') helper = 'Enter the receiver\u2019s name to continue.';

  if (completed) {
    return (
      <div className="dv-success-card">
        <span className="dv-success-icon"><CheckCheck size={30} aria-hidden /></span>
        <h2 className="dv-success-title">{outcome === 'Unable to deliver' ? 'Stop recorded' : 'Delivery complete'}</h2>
        <p className="dv-success-sub">{stop.name} · Stop {stop.position} of {STOPS.length}</p>
        <dl className="dv-success-list">
          <div><dt>Outcome</dt><dd>{outcome}</dd></div>
          <div><dt>Packages</dt><dd>{checkedCount} / {total}</dd></div>
          {outcome !== 'Unable to deliver' && <div><dt>Received by</dt><dd>{receiver || '—'}</dd></div>}
          <div><dt>Photo</dt><dd>{photo ? 'Attached' : 'None'}</dd></div>
        </dl>
        {photo && <img src={photo.url} alt="Handoff" className="dv-success-photo" />}
        <Link to="/drive/route" className="dv-primary-button">Continue to next stop <ChevronRight size={18} aria-hidden /></Link>
      </div>
    );
  }

  return (
    <>
      <p className="dv-eyebrow">STOP {stop.position} OF {STOPS.length} · {TRIP_ID}</p>
      <h1 className="dv-title">Confirm delivery</h1>
      <p className="dv-subhead">Check the store. Hand over. You're done.</p>

      <section className="dv-panel dv-stop-card">
        <div className="dv-stop-pills">
          <span className="dv-step-pill">CURRENT STOP</span>
          <span className="dv-status-green"><Check size={14} aria-hidden /> Arrived</span>
        </div>
        <div className="dv-stop-name">{stop.name}</div>
        <div className="dv-stop-address">{stop.address}</div>
        <div className="dv-stop-divider" />
        <div className="dv-stop-access"><Truck size={20} aria-hidden /> {stop.access}</div>
      </section>

      <section className="dv-panel">
        <div className="dv-panel-head">
          <h2>Package handoff</h2>
          <span className="dv-step-pill">{checkedCount} / {total}</span>
        </div>
        <p className="dv-panel-help">Select each package as you hand it over.</p>
        <div className="dv-handoff-list">
          {PACKAGES.map((id, i) => (
            <button
              key={id}
              type="button"
              className="dv-handoff-row"
              aria-pressed={checked[i]}
              onClick={() => toggle(i)}
            >
              <span className={`dv-checkbox${checked[i] ? ' checked' : ''}`}>{checked[i] && <Check size={15} aria-hidden />}</span>
              <Box size={20} aria-hidden className="dv-handoff-box" />
              <span className="dv-handoff-text">
                <strong>{id}</strong>
                <small>{stop.category} · {stop.name}</small>
              </span>
              {checked[i] && <Check size={20} aria-hidden className="dv-handoff-done" />}
            </button>
          ))}
        </div>
        <button type="button" className="dv-secondary-button" onClick={selectAll}>
          Select all packages <CheckCheck size={18} aria-hidden />
        </button>
      </section>

      <section className="dv-panel dv-complete-handoff">
        <h2>Complete the handoff</h2>

        <div className="dv-arrival-row">
          <span className="dv-arrival-icon"><Check size={18} aria-hidden /></span>
          <div><strong>Arrival recorded</strong><small>Manual check-in · demo location</small></div>
        </div>

        <button type="button" className="dv-verify-row" onClick={() => setModal('verify')}>
          <span className="dv-verify-icon"><QrCode size={18} aria-hidden /></span>
          <div><strong>Verify store QR</strong><small>Open sample store verification</small></div>
          <ChevronRight size={18} aria-hidden className="dv-chevron" />
        </button>

        <label className="dv-field-label" htmlFor="dv-outcome">Delivery outcome</label>
        <select
          id="dv-outcome"
          className="dv-select"
          value={outcome}
          onChange={(e) => changeOutcome(e.target.value as DeliveryOutcome)}
        >
          <option>Delivered</option>
          <option>Partial delivery</option>
          <option>Unable to deliver</option>
        </select>

        {needsReceiver && (
          <>
            <label className="dv-field-label" htmlFor="dv-receiver">Receiver's name</label>
            <input
              id="dv-receiver"
              className="dv-input"
              type="text"
              autoComplete="off"
              placeholder="e.g. Anoma Perera"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
          </>
        )}

        {photo ? (
          <div className="dv-photo-preview">
            <img src={photo.url} alt="" className="dv-photo-thumb" />
            <div className="dv-photo-meta">
              <span className="dv-photo-name">{photo.name}</span>
              <button type="button" className="dv-text-button" onClick={() => fileRef.current?.click()}>Change</button>
            </div>
            <button type="button" className="dv-photo-remove" aria-label="Remove photo" onClick={removePhoto}><X size={18} aria-hidden /></button>
          </div>
        ) : (
          <label className="dv-photo-add">
            <Camera size={20} aria-hidden />
            <div><strong>Add handoff photo</strong><small>Optional · preview only, not uploaded</small></div>
            <Plus size={18} aria-hidden className="dv-chevron" />
            <input ref={fileRef} type="file" accept="image/*" className="dv-visually-hidden" onChange={onPhoto} />
          </label>
        )}
        {photoError && <p className="dv-photo-error" role="alert">{photoError}</p>}

        <button type="button" className="dv-primary-button" disabled={!canComplete} onClick={() => setCompleted(true)}>
          <CheckCheck size={18} aria-hidden /> Complete delivery
        </button>
        <p className="dv-complete-helper">{helper}</p>
      </section>

      <button type="button" className="dv-parking-link" onClick={() => setModal('fine')}>
        <ClipboardList size={18} aria-hidden /> Report a parking fine
        <ChevronRight size={18} aria-hidden className="dv-chevron" />
      </button>
    </>
  );
}
