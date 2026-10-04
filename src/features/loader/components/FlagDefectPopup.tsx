import { useState, useRef, useEffect } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';
import '../modalPopups.css';

export interface FlagDefectPopupProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: { packageInfo: string; notes: string; photo?: string | File | null }) => void;
  defaultPackage?: string;
}

export function FlagDefectPopup({
  isOpen = true,
  onClose,
  onSubmit,
  defaultPackage = 'PKG-9041 · Summit Foods',
}: FlagDefectPopupProps) {
  const [packageInfo, setPackageInfo] = useState(defaultPackage);
  const [notes, setNotes] = useState('');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream helper
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  if (!isOpen) return null;

  // Start live camera stream
  const handleStartCamera = async () => {
    if (capturedPhotoUrl) {
      setCapturedPhotoUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setIsCameraActive(true);

      // Attach stream to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 50);
    } catch {
      // If camera access fails, trigger file picker as fallback
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // Capture snapshot from video stream
  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhotoUrl(photoDataUrl);
    }

    stopCameraStream();
  };

  // Handle file picker selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ packageInfo, notes, photo: capturedPhotoUrl });
    }
  };

  return (
    <div className="waypoint-popup-backdrop" onClick={onClose}>
      <div
        className="waypoint-popup-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="flag-defect-title"
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            className="waypoint-popup-close-btn"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="waypoint-popup-header">
          <h2 id="flag-defect-title" className="waypoint-popup-title">
            Flag a defect
          </h2>
          <p className="waypoint-popup-subtitle">
            Photo required · Notifies dispatch instantly
          </p>
        </div>

        {/* Form Body */}
        <form className="flag-defect-form" onSubmit={handleSubmit}>
          {/* Field: Package */}
          <div className="popup-field-group">
            <label className="popup-field-label">
              Package<span className="required-star">*</span>
            </label>
            <input
              type="text"
              className="popup-text-input"
              value={packageInfo}
              onChange={(e) => setPackageInfo(e.target.value)}
              placeholder="e.g. PKG-9041 · Summit Foods"
              required
            />
          </div>

          {/* Field: Photo Evidence with Camera Access */}
          <div className="popup-field-group">
            <label className="popup-field-label">
              Photo evidence<span className="required-star">*</span>
            </label>

            {/* State 1: Live Camera Viewfinder */}
            {isCameraActive ? (
              <div className="popup-live-camera-feed-box">
                <video
                  ref={videoRef}
                  className="popup-live-camera-video"
                  playsInline
                  autoPlay
                  muted
                />
                <button
                  type="button"
                  className="popup-take-snap-btn"
                  onClick={handleTakeSnapshot}
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo</span>
                </button>
              </div>
            ) : capturedPhotoUrl ? (
              /* State 2: Captured Photo Preview */
              <div className="popup-photo-preview-container">
                <img
                  src={capturedPhotoUrl}
                  alt="Defect evidence snapshot"
                  className="popup-photo-preview-img"
                />
                <div className="popup-photo-preview-overlay">
                  <button
                    type="button"
                    className="popup-retake-btn"
                    onClick={handleStartCamera}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>
            ) : (
              /* State 3: Glove-friendly Tap Target to Open Camera */
              <div
                className="popup-photo-capture-box"
                role="button"
                tabIndex={0}
                onClick={handleStartCamera}
              >
                <div className="popup-camera-icon-badge">
                  <Camera className="w-5 h-5" />
                </div>
                <strong className="popup-capture-title">Capture photo</strong>
                <span className="popup-capture-sub">Glove-friendly tap target</span>
              </div>
            )}

            <span className="popup-field-hint">
              JPG or PNG, max 10MB · Hold tablet steady
            </span>
          </div>

          {/* Field: Notes */}
          <div className="popup-field-group">
            <label className="popup-field-label">Notes</label>
            <textarea
              className="popup-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the defect... e.g. corner crushed, wet patch ~10cm, smells like leak"
            />
          </div>

          {/* Submit CTA */}
          <button type="submit" className="btn-popup-primary">
            Submit defect
          </button>
        </form>
      </div>
    </div>
  );
}

export default FlagDefectPopup;
