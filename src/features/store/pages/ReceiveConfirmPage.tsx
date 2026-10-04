import { useEffect, useMemo, useState } from 'react';
import { api, type Order } from '../../../api';
import cameraIcon from '../../../assets/camera-icon.png';
import qrIcon from '../../../assets/qr-icon.png';
import { StorePageHeader } from '../components/StoreUI';
import type { OrderCondition } from '../data/storeData';

type ChecklistItem = {
  id: string;
  name: string;
  quantity: number;
};

function parseChecklistItems(order: Order): ChecklistItem[] {
  const rawDesc = order.itemDescription || 'Dispatched goods';
  const parts = rawDesc
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return [{ id: 'item-1', name: rawDesc, quantity: order.units }];
  }

  const baseQty = Math.max(1, Math.floor(order.units / parts.length));
  let remaining = order.units;

  return parts.map((part, index) => {
    const quantity = index === parts.length - 1 ? remaining : baseQty;
    remaining -= quantity;
    return {
      id: `item-${index + 1}`,
      name: part,
      quantity: Math.max(1, quantity),
    };
  });
}

export function ReceiveConfirmPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conditions, setConditions] = useState<Record<string, OrderCondition | undefined>>({});
  const [proof, setProof] = useState<'none' | 'qr' | 'photo'>('none');
  const [photoName, setPhotoName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedOrderRef, setSubmittedOrderRef] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders();
      setOrders(data);
      if (data.length > 0 && !selectedOrderId) {
        // Prefer an order ready for receiving (e.g. DELIVERED or IN_TRANSIT) or default to the first order
        const readyOrder = data.find((o) => o.status === 'DELIVERED' || o.status === 'IN_TRANSIT') || data[0];
        setSelectedOrderId(readyOrder.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || orders[0] || null,
    [orders, selectedOrderId]
  );

  const checklistItems = useMemo(
    () => (selectedOrder ? parseChecklistItems(selectedOrder) : []),
    [selectedOrder]
  );

  const allReviewed =
    checklistItems.length > 0 && checklistItems.every((item) => conditions[item.id]);

  const handleOrderChange = (newId: string) => {
    setSelectedOrderId(newId);
    setConditions({});
    setProof('none');
    setPhotoName('');
    setSubmitted(false);
    setError(null);
  };

  const setCondition = (id: string, value: OrderCondition) => {
    setConditions((current) => ({
      ...current,
      [id]: current[id] === value ? undefined : value,
    }));
  };

  const submit = async () => {
    if (!selectedOrder || !allReviewed || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const updatedOrder = await api.receiveOrder(selectedOrder.id);
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
      setSubmittedOrderRef(updatedOrder.orderRef);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit delivery confirmation.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isAlreadyReceived = selectedOrder?.status === 'RECEIVED';

  return (
    <div className="store-page store-receive-page">
      <StorePageHeader title="Receive & Confirm" subtitle="Check what arrived and close the delivery" />

      {error && (
        <div className="store-notice error" role="alert" style={{ background: '#fde8e8', color: '#ce5555', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {submitted && (
        <div className="store-notice success" role="status">
          Delivery confirmation submitted for order {submittedOrderRef || selectedOrder?.orderRef}.
        </div>
      )}

      {loading ? (
        <section className="store-panel store-receive-card">
          <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>Loading order data...</p>
        </section>
      ) : orders.length === 0 ? (
        <section className="store-panel store-receive-card">
          <div className="store-empty-state">
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              No orders found
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              There are currently no orders assigned to your store outlet to receive or confirm.
            </p>
          </div>
        </section>
      ) : (
        <>
          {orders.length > 1 && (
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label htmlFor="order-select" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select Order:
              </label>
              <select
                id="order-select"
                value={selectedOrder?.id || ''}
                onChange={(e) => handleOrderChange(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--store-border, #dce5df)',
                  background: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--store-ink, #29343e)',
                  cursor: 'pointer',
                }}
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderRef} · {o.productBrand} ({o.tempRequirement}) — Status: {o.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedOrder && (
            <section className="store-panel store-receive-card">
              <div className="store-receive-header">
                <div>
                  <h2>
                    Order: {selectedOrder.orderRef}{' '}
                    <span>· {selectedOrder.productBrand} ({selectedOrder.tempRequirement.toLowerCase()})</span>
                  </h2>
                  <p>
                    {selectedOrder.units} units · {selectedOrder.weightKg} kg · {selectedOrder.volumeM3} m³ · Date:{' '}
                    {selectedOrder.orderDate || 'Today'}
                  </p>
                </div>
                <span
                  className="store-arrived-badge"
                  style={{
                    background: isAlreadyReceived ? '#e9ddff' : selectedOrder.status === 'DELIVERED' ? '#d1f1e8' : '#e7f3fb',
                    color: isAlreadyReceived ? '#7644ed' : selectedOrder.status === 'DELIVERED' ? '#16836d' : '#4e88b3',
                  }}
                >
                  {isAlreadyReceived ? 'Received' : selectedOrder.status === 'DELIVERED' ? 'Arrived' : selectedOrder.status}
                </span>
              </div>

              <div className="store-receive-content">
                <fieldset className="store-checklist">
                  <legend>Dispatched item checklist</legend>
                  {checklistItems.map((item) => (
                    <div className="store-checklist-item" key={item.id}>
                      <label className="store-item-name">
                        <input
                          type="checkbox"
                          disabled={isAlreadyReceived || submitted}
                          checked={Boolean(conditions[item.id])}
                          onChange={(event) => {
                            if (!event.target.checked) {
                              setConditions((current) => ({ ...current, [item.id]: undefined }));
                            } else {
                              setCondition(item.id, 'received');
                            }
                          }}
                        />
                        <span>
                          {item.name} · {item.quantity} units
                        </span>
                      </label>

                      <div className="store-condition-options" role="group" aria-label={`Condition for ${item.name}`}>
                        {(['received', 'damaged', 'missing'] as const).map((condition) => (
                          <button
                            key={condition}
                            type="button"
                            disabled={isAlreadyReceived || submitted}
                            className={conditions[item.id] === condition ? 'selected' : ''}
                            aria-pressed={conditions[item.id] === condition}
                            onClick={() => setCondition(item.id, condition)}
                          >
                            {condition[0].toUpperCase() + condition.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </fieldset>

                <fieldset className="store-proof-section">
                  <legend>Confirmation proof</legend>
                  <div className="store-proof-actions">
                    <button
                      className={proof === 'qr' ? 'selected' : ''}
                      type="button"
                      disabled={isAlreadyReceived || submitted}
                      onClick={() => setProof(proof === 'qr' ? 'none' : 'qr')}
                    >
                      <img src={qrIcon} alt="" aria-hidden="true" />
                      {proof === 'qr' ? 'QR scanned' : 'Scan QR'}
                    </button>
                    <label className={`store-proof-upload${proof === 'photo' ? ' selected' : ''}`}>
                      <img src={cameraIcon} alt="" aria-hidden="true" />
                      {photoName || 'Add photo'}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isAlreadyReceived || submitted}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            setPhotoName(file.name);
                            setProof('photo');
                          }
                        }}
                      />
                    </label>
                  </div>
                  {proof === 'photo' && photoName && (
                    <small className="store-proof-filename">Attached: {photoName}</small>
                  )}
                </fieldset>

                <div className="store-receive-submit">
                  <button
                    type="button"
                    className="store-primary-button"
                    disabled={!allReviewed || submitted || isAlreadyReceived || submitting}
                    onClick={submit}
                  >
                    {submitting
                      ? 'Submitting...'
                      : isAlreadyReceived || submitted
                      ? 'Confirmation submitted'
                      : 'Submit confirmation'}
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
