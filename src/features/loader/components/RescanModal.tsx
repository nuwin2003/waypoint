import { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, QrCode } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { DefectPackageItem } from './AffectedPackagesList';

interface RescanModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DefectPackageItem | null;
  onConfirmRescan: (item: DefectPackageItem) => void;
}

export function RescanModal({
  isOpen,
  onClose,
  item,
  onConfirmRescan,
}: RescanModalProps) {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (!isOpen || !item || !videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      () => {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onConfirmRescan(item);
          onClose();
        }, 900);
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: false,
        highlightCodeOutline: false,
      }
    );

    scannerRef.current = qrScanner;

    qrScanner
      .start()
      .then(() => setCameraActive(true))
      .catch((err) => {
        console.warn('Modal camera stream not started:', err);
        setCameraActive(false);
      });

    return () => {
      qrScanner.destroy();
      scannerRef.current = null;
      setCameraActive(false);
    };
  }, [isOpen, item, onConfirmRescan, onClose]);

  if (!isOpen || !item) return null;

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onConfirmRescan(item);
        onClose();
      }, 900);
    }, 800);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-container rescan-defect-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge purple-badge">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3>Re-scan Package</h3>
              <p>Re-verifying barcode label for {item.packageCode}</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className="rescan-viewport-preview"
          style={{ position: 'relative', overflow: 'hidden' }}
          onClick={handleSimulateScan}
        >
          <video
            ref={videoRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: cameraActive ? 0.9 : 0,
              pointerEvents: 'none',
            }}
            playsInline
            muted
          />
          {!cameraActive && <QrCode className="w-24 h-24 text-purple-600" />}
          <span
            className="rescan-tap-hint"
            style={{
              position: 'relative',
              zIndex: 2,
              background: 'rgba(255, 255, 255, 0.85)',
              padding: '4px 12px',
              borderRadius: '999px',
            }}
          >
            {scanning
              ? 'Scanning barcode...'
              : cameraActive
              ? 'Point camera at QR code or tap to verify'
              : 'Tap to scan replacement/corrected barcode'}
          </span>
        </div>

        {success && (
          <div className="modal-alert-box success">
            <CheckCircle2 className="w-4 h-4" />
            <span>Barcode verified! Defect cleared and package re-registered.</span>
          </div>
        )}

        <div className="modal-actions-row">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-modal-submit purple"
            onClick={handleSimulateScan}
            disabled={scanning}
          >
            {scanning ? 'Scanning...' : 'Verify Re-scan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RescanModal;
