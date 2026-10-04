import { FormEvent, useState } from 'react';
import { StoreCutoffBanner, StoreIcon, StoreIconButton, StorePageHeader, StoreStatusBadge } from '../components/StoreUI';
import { initialSchedules, type OrderSchedule, type ProductBrand } from '../data/storeData';
import { ApiError, api, type ProductBrandCode, type TempRequirement } from '../../../api';
import { enqueueOfflineOrder } from '../../../shared/offlineSync';

const brands: ProductBrand[] = ['Fresh dry', 'Fresh chilled', 'Style', 'Tech'];
const defaultItems: Record<ProductBrand, string> = {
  'Fresh dry': 'Dry grocery cartons',
  'Fresh chilled': 'Chilled crates',
  Style: 'Style general items',
  Tech: 'Tech general items',
};

export function PlaceOrderPage() {
  const [mode, setMode] = useState<'new' | 'schedule'>('new');
  const [brand, setBrand] = useState<ProductBrand>('Fresh dry');
  const [item, setItem] = useState(defaultItems['Fresh dry']);
  const [quantity, setQuantity] = useState('20');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [weightKg, setWeightKg] = useState('100');
  const [volumeM3, setVolumeM3] = useState('1.5');
  const [schedules, setSchedules] = useState(initialSchedules);
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<OrderSchedule | null>(null);
  const [scheduleBrand, setScheduleBrand] = useState<ProductBrand>('Fresh dry');
  const [scheduleItem, setScheduleItem] = useState(defaultItems['Fresh dry']);
  const [scheduleQuantity, setScheduleQuantity] = useState('30');
  const [frequency, setFrequency] = useState('Every Monday');
  const [firstRun, setFirstRun] = useState('');

  const selectBrand = (value: ProductBrand) => {
    setBrand(value);
    setItem(defaultItems[value]);
  };

  const openScheduleForm = (schedule?: OrderSchedule) => {
    setEditingSchedule(schedule ?? null);
    setScheduleBrand(schedule?.brand ?? 'Fresh dry');
    setScheduleItem(schedule?.item ?? defaultItems['Fresh dry']);
    setScheduleQuantity(String(schedule?.quantity ?? 30));
    setFrequency(schedule?.frequency ?? 'Every Monday');
    setFirstRun(schedule?.firstRun ?? '');
    setScheduleFormOpen(true);
  };

  const saveOrder = async () => {
    setSubmitting(true);
    setOrderError(null);
    const payload: {
      productBrand: ProductBrandCode;
      itemDescription: string;
      deliveryDate: string;
      tempRequirement: TempRequirement;
      units: number;
      weightKg: number;
      volumeM3: number;
    } = {
      productBrand: (brand.startsWith('Fresh') ? 'FRESH' : brand.toUpperCase()) as ProductBrandCode,
      itemDescription: item.trim(),
      deliveryDate,
      tempRequirement: brand === 'Fresh chilled' ? 'CHILLED' : 'AMBIENT',
      units: Number(quantity),
      weightKg: Number(weightKg),
      volumeM3: Number(volumeM3),
    };
    try {
      await api.createOrder(payload);
      setReviewOpen(false);
      setSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 0) {
        enqueueOfflineOrder(payload);
        setReviewOpen(false);
        setSubmitted(true);
        setOrderError('You are offline. The order was saved and will sync when the connection is restored.');
        return;
      }
      setOrderError(error instanceof Error ? error.message : 'Your order could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveSchedule = (event: FormEvent) => {
    event.preventDefault();
    const next: OrderSchedule = {
      id: editingSchedule?.id ?? `SCH-${String(schedules.length + 1).padStart(2, '0')}`,
      item: scheduleItem,
      brand: scheduleBrand,
      quantity: Number(scheduleQuantity),
      frequency,
      firstRun,
      nextRun: firstRun ? new Date(`${firstRun}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Date not set',
      status: editingSchedule?.status ?? 'Active',
    };
    setSchedules((current) => editingSchedule ? current.map((schedule) => schedule.id === editingSchedule.id ? next : schedule) : [...current, next]);
    setScheduleFormOpen(false);
  };

  const toggleSchedule = (id: string) => setSchedules((current) => current.map((schedule) => schedule.id === id ? { ...schedule, status: schedule.status === 'Active' ? 'Paused' : 'Active' } : schedule));
  const removeSchedule = (id: string) => setSchedules((current) => current.filter((schedule) => schedule.id !== id));

  return (
    <div className="store-page store-place-order-page">
      <StorePageHeader title="Place order" subtitle="Create a one-off order or manage recurring schedules" />
      <StoreCutoffBanner />

      <div className="store-tabs" role="tablist" aria-label="Order type">
        <button className={mode === 'new' ? 'active' : ''} type="button" role="tab" aria-selected={mode === 'new'} onClick={() => setMode('new')}>New order</button>
        <button className={mode === 'schedule' ? 'active' : ''} type="button" role="tab" aria-selected={mode === 'schedule'} onClick={() => setMode('schedule')}>Schedule Order</button>
      </div>

      {submitted && <div className="store-notice success" role="status">Your order has been submitted for dispatch review.<button type="button" onClick={() => setSubmitted(false)} aria-label="Dismiss">×</button></div>}
      {orderError && <div className="store-notice" role="alert">{orderError}</div>}

      {mode === 'new' ? (
        <form className="store-panel store-order-form" onSubmit={(event) => { event.preventDefault(); setReviewOpen(true); }}>
          <fieldset className="store-fieldset">
            <legend>Brand and order type</legend>
            <div className="store-brand-grid">
              {brands.map((option) => <button key={option} type="button" className={brand === option ? 'selected' : ''} aria-pressed={brand === option} onClick={() => selectBrand(option)}>{option}</button>)}
            </div>
          </fieldset>
          <p className="store-form-hint">Daily delivery cadence</p>
          <div className="store-form-grid two-columns">
            <label>Item or unit<input required value={item} onChange={(event) => setItem(event.target.value)} /></label>
            <label>Quantity<input required type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
          </div>
          <div className="store-form-grid two-columns">
            <label>Total weight (kg)<input required type="number" min="0.01" step="0.01" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} /></label>
            <label>Total volume (m³)<input required type="number" min="0.001" step="0.001" value={volumeM3} onChange={(event) => setVolumeM3(event.target.value)} /></label>
          </div>
          <label className="store-field">Requested delivery date<input required type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} /></label>
          <p className="store-form-hint">{brand} cadence is applied when dispatch confirms the order.</p>
          <div className="store-form-actions"><button className="store-primary-button" type="submit">Review order</button></div>
        </form>
      ) : (
        <section className="store-schedules-section">
          <div className="store-section-toolbar"><h2>Existing schedules</h2><button className="store-primary-button" type="button" onClick={() => openScheduleForm()}>＋ New schedule</button></div>
          {scheduleFormOpen && <form className="store-panel store-schedule-form" onSubmit={saveSchedule}>
            <label>Schedule items<select value={scheduleBrand} onChange={(event) => { const value = event.target.value as ProductBrand; setScheduleBrand(value); setScheduleItem(defaultItems[value]); }}>{brands.map((value) => <option key={value}>{value}</option>)}</select><input aria-label="Schedule item" required value={scheduleItem} onChange={(event) => setScheduleItem(event.target.value)} /></label>
            <div className="store-form-grid two-columns"><label>Quantity<input type="number" min="1" required value={scheduleQuantity} onChange={(event) => setScheduleQuantity(event.target.value)} /></label><label>Frequency<select value={frequency} onChange={(event) => setFrequency(event.target.value)}>{['Every Monday', 'Every Tuesday', 'Every Wednesday', 'Every Thursday', 'Every Friday', 'Every week'].map((day) => <option key={day}>{day}</option>)}</select></label></div>
            <label className="store-field">First run<input required type="date" value={firstRun} onChange={(event) => setFirstRun(event.target.value)} /></label>
            <div className="store-form-actions"><button className="store-primary-button" type="submit">{editingSchedule ? 'Save changes' : 'Save schedule'}</button><button className="store-secondary-button" type="button" onClick={() => setScheduleFormOpen(false)}>Cancel</button></div>
          </form>}
          <div className="store-schedule-list">
            {schedules.map((schedule) => <article className="store-schedule-card" key={schedule.id}>
              <div className="store-schedule-copy"><div><strong>{schedule.item} · {schedule.quantity} units</strong><StoreStatusBadge status={schedule.status} /></div><p>{schedule.frequency} · Next run {schedule.nextRun}</p></div>
              <div className="store-card-actions">
                <StoreIconButton label={`Edit ${schedule.item}`} onClick={() => openScheduleForm(schedule)}><StoreIcon name="edit" /></StoreIconButton>
                <StoreIconButton label={`${schedule.status === 'Active' ? 'Pause' : 'Resume'} ${schedule.item}`} onClick={() => toggleSchedule(schedule.id)}><StoreIcon name={schedule.status === 'Active' ? 'pause' : 'play'} /></StoreIconButton>
                <StoreIconButton label={`Delete ${schedule.item}`} danger onClick={() => removeSchedule(schedule.id)}><StoreIcon name="trash" /></StoreIconButton>
              </div>
            </article>)}
            {schedules.length === 0 && <p className="store-empty-state">No recurring schedules yet. Add one to automate your regular orders.</p>}
          </div>
        </section>
      )}

      {reviewOpen && <div className="store-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setReviewOpen(false); }}><section className="store-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title"><h2 id="review-title">Review order</h2><p>Check the details before submitting your request.</p><dl><div><dt>Brand</dt><dd>{brand}</dd></div><div><dt>Item</dt><dd>{item}</dd></div><div><dt>Quantity</dt><dd>{quantity} units</dd></div><div><dt>Weight / volume</dt><dd>{weightKg} kg · {volumeM3} m³</dd></div><div><dt>Delivery date</dt><dd>{deliveryDate}</dd></div></dl><div className="store-form-actions"><button className="store-secondary-button" type="button" onClick={() => setReviewOpen(false)} disabled={submitting}>Go back</button><button className="store-primary-button" type="button" onClick={saveOrder} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit order'}</button></div></section></div>}
    </div>
  );
}
