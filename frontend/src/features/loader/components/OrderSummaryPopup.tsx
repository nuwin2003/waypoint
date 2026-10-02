import { X } from 'lucide-react';
import '../modalPopups.css';

export interface OrderSummaryData {
  orderId?: string;
  shippingAddress?: string;
  trackingId?: string;
  quantity?: string | number;
  itemCount?: string | number;
  estDeliveryDate?: string;
  tag?: string;
}

export interface OrderSummaryPopupProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  onReportDefect?: () => void;
  data?: OrderSummaryData;
}

export function OrderSummaryPopup({
  isOpen = true,
  onClose,
  onConfirm,
  onReportDefect,
  data = {
    orderId: '153468790876',
    shippingAddress: "45 onye's house",
    trackingId: '153468790876',
    quantity: '10',
    itemCount: '10',
    estDeliveryDate: '11/03/26; 04:54 pm',
    tag: 'Refregirated',
  },
}: OrderSummaryPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="waypoint-popup-backdrop" onClick={onClose}>
      <div
        className="waypoint-popup-card order-summary-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-summary-title"
      >
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            className="waypoint-popup-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Inner Order Summary Box */}
        <div className="order-summary-inner-box">
          <div className="order-summary-box-header">
            <h3 id="order-summary-title">Order Summary</h3>
            <span className="badge-refrigerated">
              <span className="blue-dot" />
              <span>{data.tag || 'Refregirated'}</span>
            </span>
          </div>

          <div className="order-summary-rows-list">
            <div className="order-summary-row">
              <span className="order-summary-label">Order ID:</span>
              <strong className="order-summary-value">{data.orderId}</strong>
            </div>
            <div className="order-summary-row">
              <span className="order-summary-label">Shipping Address:</span>
              <strong className="order-summary-value">{data.shippingAddress}</strong>
            </div>
            <div className="order-summary-row">
              <span className="order-summary-label">Tracking ID:</span>
              <strong className="order-summary-value">{data.trackingId}</strong>
            </div>
            <div className="order-summary-row">
              <span className="order-summary-label">Quantity</span>
              <strong className="order-summary-value">{data.quantity}</strong>
            </div>
            <div className="order-summary-row">
              <span className="order-summary-label">Quantity</span>
              <strong className="order-summary-value">{data.itemCount}</strong>
            </div>
            <div className="order-summary-row">
              <span className="order-summary-label">Est. Delivery Date:</span>
              <strong className="order-summary-value">{data.estDeliveryDate}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="order-summary-actions-group">
          <button
            type="button"
            className="btn-popup-primary"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            type="button"
            className="btn-popup-secondary"
            onClick={onReportDefect}
          >
            Report Defect
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSummaryPopup;
