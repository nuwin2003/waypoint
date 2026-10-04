import { Lock, CheckCircle2 } from 'lucide-react';

interface FinishLoadCardProps {
  remainingCount: number;
  totalCount: number;
  onCompleteLoad: () => void;
}

export function FinishLoadCard({
  remainingCount,
  totalCount,
  onCompleteLoad,
}: FinishLoadCardProps) {
  const isReadyToComplete = totalCount > 0 && remainingCount === 0;

  return (
    <div className={`loader-side-card finish-load-card ${isReadyToComplete ? 'ready-state' : ''}`}>
      <div className="card-header-flex">
        <h3>Finish the load</h3>
        <span className={`badge-pill ${isReadyToComplete ? 'badge-success' : 'badge-warning'}`}>
          {isReadyToComplete ? 'READY' : `${remainingCount} LEFT`}
        </span>
      </div>

      <p className="finish-load-subtitle">
        {isReadyToComplete
          ? `All ${totalCount} packages scanned successfully. Ready for departure authorization.`
          : totalCount === 0 ? 'This trip has no orders to load.' : `Available when all ${totalCount} orders are scanned.`}
      </p>

      <button
        type="button"
        className={`btn-complete-load ${isReadyToComplete ? 'active' : 'disabled'}`}
        disabled={!isReadyToComplete}
        onClick={onCompleteLoad}
        title={isReadyToComplete ? 'Click to complete loading' : 'Scan all remaining packages first'}
      >
        {isReadyToComplete ? (
          <CheckCircle2 className="w-5 h-5 text-white" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        <span>Complete loading</span>
      </button>
    </div>
  );
}
