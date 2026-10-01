import { useState } from 'react';
import { StoreIcon, StorePageHeader } from '../components/StoreUI';
import type { OrderCondition } from '../data/storeData';
import cameraIcon from '../../../assets/camera-icon.png';
import qrIcon from '../../../assets/qr-icon.png';

const deliveredItems = [
  { id: 'chilled-crates', name: 'Chilled crates', quantity: 7 },
  { id: 'temperature-seals', name: 'Temperature seals', quantity: 7 },
];

export function ReceiveConfirmPage() {
  const [conditions, setConditions] = useState<Record<string, OrderCondition | undefined>>({});
  const [proof, setProof] = useState<'none' | 'qr' | 'photo'>('none');
  const [photoName, setPhotoName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const allReviewed = deliveredItems.every((item) => conditions[item.id]);

  const setCondition = (id: string, value: OrderCondition) => setConditions((current) => ({ ...current, [id]: current[id] === value ? undefined : value }));
  const submit = () => { if (allReviewed) setSubmitted(true); };

  return (
    <div className="store-page store-receive-page">
      <StorePageHeader title="Receive & Confirm" subtitle="Check what arrived and close the delivery" />
      {submitted && <div className="store-notice success" role="status">Delivery confirmation submitted for order O-1005.</div>}
      <section className="store-panel store-receive-card">
        <div className="store-receive-header"><div><h2>Order: O-1005 <span>· Chilled</span></h2><p>14 units · 95 kg · ETA 07:45</p></div><span className="store-arrived-badge">Arrived</span></div>
        <div className="store-receive-content">
          <fieldset className="store-checklist"><legend>Dispatched item checklist</legend>{deliveredItems.map((item) => <div className="store-checklist-item" key={item.id}><label className="store-item-name"><input type="checkbox" checked={Boolean(conditions[item.id])} onChange={(event) => { if (!event.target.checked) setConditions((current) => ({ ...current, [item.id]: undefined })); else setCondition(item.id, 'received'); }} /><span>{item.name} · {item.quantity} units</span></label><div className="store-condition-options" role="group" aria-label={`Condition for ${item.name}`}>{(['received', 'damaged', 'missing'] as const).map((condition) => <button key={condition} type="button" className={conditions[item.id] === condition ? 'selected' : ''} aria-pressed={conditions[item.id] === condition} onClick={() => setCondition(item.id, condition)}>{condition[0].toUpperCase() + condition.slice(1)}</button>)}</div></div>)}</fieldset>
          <fieldset className="store-proof-section"><legend>Confirmation proof</legend><div className="store-proof-actions"><button className={proof === 'qr' ? 'selected' : ''} type="button" onClick={() => setProof(proof === 'qr' ? 'none' : 'qr')}><img src={qrIcon} alt="" aria-hidden="true" />{proof === 'qr' ? 'QR scanned' : 'Scan QR'}</button><label className={`store-proof-upload${proof === 'photo' ? ' selected' : ''}`}><img src={cameraIcon} alt="" aria-hidden="true" />{photoName || 'Add photo'}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setPhotoName(file.name); setProof('photo'); } }} /></label></div>{proof === 'photo' && photoName && <small className="store-proof-filename">Attached: {photoName}</small>}</fieldset>
          <div className="store-receive-submit"><button type="button" className="store-primary-button" disabled={!allReviewed || submitted} onClick={submit}>{submitted ? 'Confirmation submitted' : 'Submit confirmation'}</button></div>
        </div>
      </section>
    </div>
  );
}
