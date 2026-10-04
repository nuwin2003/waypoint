import { useState, useRef, useEffect } from 'react';
import { X, QrCode } from 'lucide-react';
import QrScanner from 'qr-scanner';
import '../modalPopups.css';

export interface VerifyPackagePopupProps {
  isOpen?: boolean;
  onClose?: () => void;
  onScan?: (scannedData?: string) => void;
}

export function VerifyPackagePopup({
  isOpen = true,
  onClose,
  onScan,
}: VerifyPackagePopupProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanningPulse, setScanningPulse] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        setScanningPulse(true);
        setTimeout(() => {
          setScanningPulse(false);
          if (onScan) {
            onScan(result.data);
          }
        }, 350);
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
        console.warn('Verify camera stream not started:', err);
        setCameraActive(false);
      });

    return () => {
      qrScanner.destroy();
      scannerRef.current = null;
      setCameraActive(false);
    };
  }, [isOpen, onScan]);

  if (!isOpen) return null;

  const handleManualScan = () => {
    setScanningPulse(true);
    setTimeout(() => {
      setScanningPulse(false);
      if (onScan) {
        onScan();
      }
    }, 300);
  };

  return (
    <div className="waypoint-popup-backdrop" onClick={onClose}>
      <div
        className="waypoint-popup-card verify-package-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-package-title"
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

        {/* Header */}
        <div className="verify-package-header">
          <h2 id="verify-package-title" className="waypoint-popup-title">
            Verify the package
          </h2>
        </div>

        {/* Viewfinder with Live Camera & QR Graphic Overlay */}
        <div className="verify-qr-container">
          <div className="verify-qr-viewfinder">
            {/* Live Camera Video Feed */}
            <video
              ref={videoRef}
              className="verify-camera-video"
              playsInline
              muted
            />

            {/* Live indicator if webcam is active */}
            {cameraActive && (
              <div className="verify-camera-live-badge">
                <span className="verify-camera-live-dot" />
                <span>Live Scanner</span>
              </div>
            )}

            {/* Purple QR Graphic Overlay */}
            <div
              className="verify-qr-icon-overlay"
              style={{
                opacity: cameraActive ? 0.35 : 1,
                transform: scanningPulse ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <QrCode
                className="verify-qr-icon"
                style={{ width: '170px', height: '170px' }}
                strokeWidth={1.6}
              />
            </div>
          </div>
        </div>

        {/* Scan Button */}
        <button
          type="button"
          className="btn-popup-primary"
          onClick={handleManualScan}
        >
          Scan
        </button>
      </div>
    </div>
  );
}

export default VerifyPackagePopup;
