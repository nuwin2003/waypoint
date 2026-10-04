import { Check, Clock, Scan, ChevronLeft, ChevronRight } from 'lucide-react';
import { PackageData } from './PackageScannerCard';

interface LoadingSequenceCardProps {
  packages: PackageData[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export function LoadingSequenceCard({
  packages,
  currentIndex,
  onSelectIndex,
}: LoadingSequenceCardProps) {
  const total = packages.length;
  const currentNum = Math.min(currentIndex + 1, total);
  const progressPct = total > 0 ? ((currentIndex) / total) * 100 : 0;

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      onSelectIndex(currentIndex + 1);
    }
  };

  // Get window of items around currentIndex (showing prev, current, next)
  const getVisibleItems = () => {
    const items = [];
    const prev = packages[currentIndex - 1];
    const curr = packages[currentIndex];
    const next = packages[currentIndex + 1];

    if (prev) items.push({ pkg: prev, index: currentIndex - 1, state: 'COMPLETED' });
    if (curr) items.push({ pkg: curr, index: currentIndex, state: 'CURRENT' });
    if (next) items.push({ pkg: next, index: currentIndex + 1, state: 'NEXT' });

    // Fallback if at start or end to keep 3 cards visible if available
    if (items.length < 3 && packages.length >= 3) {
      if (!prev && packages[currentIndex + 2]) {
        items.push({ pkg: packages[currentIndex + 2], index: currentIndex + 2, state: 'NEXT' });
      } else if (!next && packages[currentIndex - 2]) {
        items.unshift({ pkg: packages[currentIndex - 2], index: currentIndex - 2, state: 'COMPLETED' });
      }
    }

    return items;
  };

  const visibleItems = getVisibleItems();

  return (
    <div className="loading-sequence-card">
      {/* Sequence Card Header */}
      <div className="sequence-header-flex">
        <div className="sequence-title-group">
          <h3>Loading sequence</h3>
          <p>Keep scanning — the next package advances automatically.</p>
        </div>
        <div className="sequence-counter">
          <strong>{currentNum}</strong>
          <span>of {total} packages</span>
        </div>
      </div>

      {/* Cards Row with Navigation Arrows */}
      <div className="sequence-carousel-container">
        <button
          type="button"
          className="carousel-nav-btn prev"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Previous package card"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="sequence-cards-track">
          {visibleItems.map(({ pkg, index, state }) => {
            const isCurrent = state === 'CURRENT';
            const isCompleted = state === 'COMPLETED' || index < currentIndex;

            return (
              <div
                key={pkg.id}
                className={`sequence-item-card ${
                  isCurrent
                    ? 'card-current'
                    : isCompleted
                    ? 'card-completed'
                    : 'card-upcoming'
                }`}
                onClick={() => onSelectIndex(index)}
              >
                {/* Top Status Badges */}
                <div className="card-top-badges">
                  {isCurrent ? (
                    <>
                      <span className="badge-current-label">
                        <Scan className="w-3.5 h-3.5" />
                        <span>CURRENT PACKAGE</span>
                      </span>
                      <span className="badge-live-pulse">
                        <span className="pulse-dot" />
                        <span>LIVE</span>
                      </span>
                    </>
                  ) : isCompleted ? (
                    <span className="badge-completed-label">
                      <Check className="w-3.5 h-3.5" />
                      <span>COMPLETED</span>
                    </span>
                  ) : (
                    <span className="badge-upcoming-label">
                      <Clock className="w-3.5 h-3.5" />
                      <span>UP NEXT</span>
                    </span>
                  )}
                </div>

                {/* Main Package Code & Info */}
                <div className="card-package-main">
                  <div className="card-package-code-group">
                    <strong className="card-package-code">{pkg.id}</strong>
                    <span className="card-package-details">
                      {pkg.type} {pkg.zone ? `• ${pkg.zone}` : ''}{' '}
                      {pkg.category ? `• ${pkg.category}` : ''}
                    </span>
                  </div>
                  <span className="card-package-weight">{pkg.weight}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="carousel-nav-btn next"
          onClick={handleNext}
          disabled={currentIndex >= total - 1}
          aria-label="Next package card"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Track Progress Line */}
      <div className="sequence-bottom-progress-track">
        <div
          className="sequence-bottom-progress-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
