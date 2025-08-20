import React from 'react';
import { findSiloByNumber } from '../services/siloData';
import { fetchSiloFillPercent } from '../services/siloLevelService';
import { API_CONFIG } from '../config/apiConfig';

interface GrainLevelCylinderProps {
  selectedSilo?: number;
  readingSilo?: number | null;
  onSiloClick?: (number: number, temp: number) => void;
  isAutoTestRunning?: boolean;
}

const GrainLevelCylinderComponent = ({
  selectedSilo,
  readingSilo,
  onSiloClick,
  isAutoTestRunning = false
}: GrainLevelCylinderProps) => {
  const currentSiloNum = readingSilo || selectedSilo || 112;
  const currentSilo = findSiloByNumber(currentSiloNum);

  // API-based fill percent and derived filled levels (each level = 12.5%)
  const [fillPercent, setFillPercent] = React.useState<number | null>(null);
  const levelsFromAPI = React.useMemo(() => {
    if (fillPercent == null) return 0;
    // Only show 8/8 when API says 100%; otherwise floor to avoid overfilling
    if (fillPercent >= 100) return 8;
    const levels = Math.floor(fillPercent / 12.5);
    return Math.max(0, Math.min(8, levels));
  }, [fillPercent]);

  const [pouringLevel, setPouringLevel] = React.useState(8);
  const [isPouring, setIsPouring] = React.useState(false);

  React.useEffect(() => {
    // Fetch fill percent from API whenever the silo changes
    let cancelled = false;
    async function loadFill() {
      const value = await fetchSiloFillPercent(currentSiloNum);
      if (!cancelled) setFillPercent(value);
    }
    loadFill();
    const interval = window.setInterval(() => {
      loadFill();
    }, API_CONFIG.refreshInterval);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [currentSiloNum]);

  React.useEffect(() => {
    if (readingSilo || isAutoTestRunning) {
      setIsPouring(true);
      setPouringLevel(0);

      const pouringInterval = setInterval(() => {
        setPouringLevel(prev => {
          if (prev >= 8) {
            clearInterval(pouringInterval);
            setIsPouring(false);
            return 8;
          }
          return prev + 1;
        });
      }, 300);

      return () => {
        clearInterval(pouringInterval);
      };
    } else {
      setIsPouring(false);
      // When idle, display based on API-derived levels
      setPouringLevel(levelsFromAPI || 0);
    }
  }, [readingSilo, isAutoTestRunning, levelsFromAPI]);

  const handleClick = () => {
    if (onSiloClick && currentSilo) {
      onSiloClick(currentSilo.num, currentSilo.temp);
    }
  };

  const heightStyle = { height: '20px', paddingTop: '2px', paddingBottom: '2px' };

  const getGrainLevelClass = (levelIndex: number, currentLevel: number) => {
    const isFilledLevel = levelIndex < currentLevel;
    const isPouringLevel = isPouring && levelIndex === pouringLevel - 1;
    const baseClass =
      "border border-gray-300 rounded px-2 transition-all duration-300 flex items-center justify-center text-xs font-medium relative overflow-hidden";

    if (readingSilo || isAutoTestRunning) {
      const shouldBeFilled = levelIndex < pouringLevel;
      if (isPouringLevel) {
        return `${baseClass} bg-gradient-to-t from-yellow-400 to-yellow-300 text-yellow-900 animate-pulse`;
      } else if (shouldBeFilled) {
        return `${baseClass} bg-yellow-400 text-yellow-900`;
      } else {
        return `${baseClass} bg-gray-100 text-gray-400`;
      }
    } else {
      return `${baseClass} ${
        isFilledLevel ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-400'
      }`;
    }
  };

  return (
    <div className="relative">
      <div
        className="bg-lab-cylinder border-2 border-gray-400 rounded-lg"
        style={{
          width: '128px',
          padding: '2px 6px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        data-testid="grain-level-cylinder"
      >
        {/* Fixed-height header to mirror LabCylinder (56px) */}
        <div style={{ height: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div
            className="text-xs font-bold text-center text-lab-text"
            style={{ marginBottom: '2px' }}
          >
            Grain Level
          </div>
          <div className="text-[10px] text-center text-lab-text" style={{ marginBottom: '2px' }}>
            {fillPercent == null ? 'Fill: -- %' : `Fill: ${fillPercent.toFixed(1)}%`}
          </div>
          {/* Silo and Level in one row */}
          <div className="text-[10px] text-lab-text flex items-center justify-center" style={{ marginBottom: '0px', gap: '6px' }}>
            {(() => {
              const displaySiloNum = readingSilo
                ? (readingSilo === 1 ? 1 : (readingSilo || 0) - 1)
                : (selectedSilo || 112);
              return (
                <span>
                  Silo {displaySiloNum}
                </span>
              );
            })()}
            <span className={`${(readingSilo || isAutoTestRunning) ? 'text-blue-600 font-bold animate-pulse' : 'font-bold text-lab-text'}`}>
              Level: {readingSilo || isAutoTestRunning ? `${pouringLevel}/8` : `${levelsFromAPI}/8`}
            </span>
          </div>
        </div>

        {/* Levels list */}
        <div className="flex flex-col-reverse" style={{ gap: '3px' }}>
          {[...Array(8)].map((_, index) => {
            const levelNumber = index + 1; // L1 at bottom, L8 at top (reversed order)
            const currentLevel =
              readingSilo || isAutoTestRunning
                ? pouringLevel
                : levelsFromAPI;
            const isPouringLevel = isPouring && levelNumber === pouringLevel;

            return (
              <div
                key={levelNumber}
                className={getGrainLevelClass(levelNumber - 1, currentLevel)}
                style={{ height: '20px', paddingTop: '2px', paddingBottom: '2px' }}
                onClick={() => onSiloClick && onSiloClick(selectedSilo || 112, 0)}
              >
                <span className="text-xs font-bold relative z-10">{`L${levelNumber}`}</span>

                {isPouringLevel && (
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-500 via-yellow-400 to-transparent rounded-sm animate-pulse">
                    <div
                      className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-yellow-400 to-yellow-300 rounded-sm animate-bounce"
                      style={{ animationDuration: '0.6s' }}
                    ></div>
                  </div>
                )}

                {(readingSilo || isAutoTestRunning) &&
                  levelNumber <= currentLevel &&
                  !isPouringLevel && (
                    <div className="absolute inset-0 bg-blue-100 bg-opacity-20 rounded-sm"></div>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const GrainLevelCylinder = React.memo(GrainLevelCylinderComponent);
