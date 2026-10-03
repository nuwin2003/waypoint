import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Flashlight,
  RefreshCw,
  Maximize2,
  CheckCircle2,
  Keyboard,
  Flag,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Scan,
} from 'lucide-react';
import QrScanner from 'qr-scanner';

export interface PackageData {
  stopId?: string;
  id: string;
  type: string;
  weight: string;
  dimensions?: string;
  zone?: string;
  category?: string;
  status: 'scanned' | 'current' | 'pending';
  destination?: string;
  timestamp?: string;
}

interface PackageScannerCardProps {
  currentPackage: PackageData;
  onPrevPackage: () => void;
  onNextPackage: () => void;
  onOpenManualCode: () => void;
  onOpenFlagDefect: () => void;
  onReviewPackage: () => void;
  onScanSuccess: (pkg: PackageData) => void;
  isAllCompleted?: boolean;
}

export function PackageScannerCard({
  currentPackage,
  onPrevPackage,
  onNextPackage,
  onOpenManualCode,
  onOpenFlagDefect,
  onReviewPackage,
  onScanSuccess,
  isAllCompleted = false,
}: PackageScannerCardProps) {
  const [autoCapture, setAutoCapture] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraMode, setCameraMode] = useState<'rear' | 'front'>('rear');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scanFlash, setScanFlash] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  // Initialize and attach live QR scanner to video element
  useEffect(() => {
    if (!videoRef.current || !autoCapture) {
      if (scannerRef.current) {
        scannerRef.current.stop();
        setCameraActive(false);
      }
      return;
    }

    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        if (isAllCompleted) return;
        setScanFlash(true);
        setTimeout(() => {
          setScanFlash(false);
          onScanSuccess({
            ...currentPackage,
            id: result.data || currentPackage.id,
          });
        }, 350);
      },
      {
        preferredCamera: cameraMode === 'rear' ? 'environment' : 'user',
        highlightScanRegion: false,
        highlightCodeOutline: false,
      }
    );

    scannerRef.current = qrScanner;

    qrScanner
      .start()
      .then(() => {
        setCameraActive(true);
      })
      .catch((err) => {
        console.warn('Live camera stream not started:', err);
        setCameraActive(false);
      });

    return () => {
      qrScanner.destroy();
      scannerRef.current = null;
    };
  }, [autoCapture, isAllCompleted, currentPackage, cameraMode, onScanSuccess]);

  const toggleTorch = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.toggleFlash();
        const isFlash = await scannerRef.current.isFlashOn();
        setTorchOn(isFlash);
      } catch {
        setTorchOn((prev) => !prev);
      }
    } else {
      setTorchOn((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    const nextMode = cameraMode === 'rear' ? 'front' : 'rear';
    setCameraMode(nextMode);
    if (scannerRef.current) {
      scannerRef.current.setCamera(nextMode === 'rear' ? 'environment' : 'user');
    }
  };

  const handleTriggerScan = () => {
    if (isAllCompleted) return;
    setScanFlash(true);
    setTimeout(() => {
      setScanFlash(false);
      onScanSuccess(currentPackage);
    }, 400);
  };

  return (
    <div className="scanner-card">
      {/* Scanner Header */}
      <div className="scanner-header">
        <div className="scanner-header-text">
          <h2>Scan current package</h2>
          <p>
            {cameraActive
              ? 'Point camera at QR label. Capture is automatic.'
              : 'Center the QR label inside the frame or tap to scan.'}
          </p>
        </div>
        <button
          type="button"
          className={`auto-capture-badge ${autoCapture ? 'active' : 'inactive'}`}
          onClick={() => setAutoCapture(!autoCapture)}
          title="Toggle Auto-Capture"
        >
          <span className="status-dot" />
          <span>{autoCapture ? 'AUTO-CAPTURE ON' : 'AUTO-CAPTURE OFF'}</span>
        </button>
      </div>

      {/* Scanner Viewfinder */}
      <div className={`scanner-viewfinder ${isFullscreen ? 'fullscreen' : ''}`}>
        {/* Live video feed from qr-scanner */}
        <video
          ref={videoRef}
          className="scanner-video-feed"
          playsInline
          muted
        />

        <div className={`viewfinder-overlay ${torchOn ? 'torch-active' : ''} ${scanFlash ? 'scan-flash' : ''}`} />

        {/* Top Controls Overlay */}
        <div className="viewfinder-top-bar">
          <div className="camera-info-pill">
            <Camera className="w-4 h-4 text-purple-600" />
            <span>
              {cameraMode === 'rear' ? 'Rear camera' : 'Front camera'} •{' '}
              {cameraActive ? 'Live' : 'Ready'}
            </span>
          </div>
          <div className="viewfinder-quick-actions">
            <button
              type="button"
              className={`viewfinder-icon-btn ${torchOn ? 'active-torch' : ''}`}
              onClick={toggleTorch}
              aria-label="Toggle flashlight"
              title={torchOn ? 'Turn off light' : 'Turn on light'}
            >
              <Flashlight className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="viewfinder-icon-btn"
              onClick={toggleCamera}
              aria-label="Switch camera"
              title="Switch camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper Chevron Left */}
        <button
          type="button"
          className="viewfinder-nav-arrow left"
          onClick={onPrevPackage}
          aria-label="Previous package"
          title="Previous package"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Stepper Chevron Right */}
        <button
          type="button"
          className="viewfinder-nav-arrow right"
          onClick={onNextPackage}
          aria-label="Next package"
          title="Next package"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* QR Reticle / Target Box (Clickable fallback & scan frame) */}
        <div
          className={`scan-target-box ${scanFlash ? 'scanned-pulse' : ''}`}
          onClick={handleTriggerScan}
          title="Click to scan package barcode"
        >
          <div className="scan-corner top-left" />
          <div className="scan-corner top-right" />
          <div className="scan-corner bottom-left" />
          <div className="scan-corner bottom-right" />

          {/* Stylized QR Glyphs in center */}
          <div className="qr-reticle-graphic" aria-hidden="true">
            <QrCode className="w-32 h-32 opacity-90" />
          </div>

          {/* Hover hint */}
          <span className="reticle-tap-hint">
            <Scan className="w-3.5 h-3.5" />
            <span>Tap to Scan</span>
          </span>
        </div>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          className="viewfinder-fullscreen-btn"
          onClick={() => setIsFullscreen(!isFullscreen)}
          aria-label="Toggle expand"
          title={isFullscreen ? 'Exit full screen' : 'Expand scanner view'}
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Matched Detection Bottom Banner */}
        <div className="viewfinder-match-banner">
          <div className="match-banner-left">
            <div className="match-check-circle">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="match-info">
              <strong>
                {isAllCompleted ? 'All Packages Loaded' : 'Package detected and matched'}
              </strong>
              <small>
                {currentPackage.id} • {currentPackage.type} • {currentPackage.weight}
              </small>
            </div>
          </div>
          <button
            type="button"
            className="match-review-btn"
            onClick={onReviewPackage}
          >
            REVIEW
          </button>
        </div>
      </div>

      {/* Bottom Actions Row */}
      <div className="scanner-action-buttons">
        <button
          type="button"
          className="btn-manual-code"
          onClick={onOpenManualCode}
        >
          <div className="btn-icon-wrapper">
            <Keyboard className="w-5 h-5" />
          </div>
          <div className="btn-label-group">
            <strong>Enter code</strong>
            <span>Manual fallback</span>
          </div>
        </button>

        <button
          type="button"
          className="btn-flag-defect"
          onClick={onOpenFlagDefect}
        >
          <div className="btn-icon-wrapper">
            <Flag className="w-5 h-5" />
          </div>
          <div className="btn-label-group">
            <strong>Flag a Defect</strong>
            <span>Report Issue</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default PackageScannerCard;
