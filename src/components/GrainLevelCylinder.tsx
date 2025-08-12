import React from 'react';
import { findSiloByNumber } from '../services/siloData';

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
  // Get the current silo being displayed (only selected or reading silo, not hovered)
  const currentSiloNum = readingSilo || selectedSilo || 112;
  const currentSilo = findSiloByNumber(currentSiloNum);

  // Default grain levels - assume all silos are full (level 8) initially
  // In the future, this will come from API
  const grainLevels = Array(8).fill(8); // All levels full by default
  
  // Animation state for liquid pouring effect
  const [pouringLevel, setPouringLevel] = React.useState(8);
  const [isPouring, setIsPouring] = React.useState(false);
  
  // Trigger pouring animation when testing starts
  React.useEffect(() => {
    if (readingSilo || isAutoTestRunning) {
      setIsPouring(true);
      setPouringLevel(0);
      
      // Animate liquid pouring from bottom to top
      const pouringInterval = setInterval(() => {
        setPouringLevel(prev => {
          if (prev >= 8) {
            clearInterval(pouringInterval);
            setIsPouring(false);
            return 8;
          }
          return prev + 1;
        });
      }, 300); // 300ms per level for smooth pouring effect
      
      return () => {
        clearInterval(pouringInterval);
      };
    } else {
      setIsPouring(false);
      setPouringLevel(8);
    }
  }, [readingSilo, isAutoTestRunning]);

  const handleClick = () => {
    if (onSiloClick && currentSilo) {
      onSiloClick(currentSilo.num, currentSilo.temp);
    }
  };

  // Height style: 1% increase from 22px to 23px for responsive height adjustment
  const heightStyle = { height: '23px', paddingTop: '2px', paddingBottom: '2px' };

  // Animation class for wheat color filling during testing with liquid pouring effect
  const getGrainLevelClass = (levelIndex: number, currentLevel: number) => {
    const isFilledLevel = levelIndex < currentLevel;
    const isPouringLevel = isPouring && levelIndex === pouringLevel - 1;
    const baseClass = "border border-gray-300 rounded px-2 transition-all duration-300 flex items-center justify-center text-xs font-medium relative overflow-hidden";
    
    if (readingSilo || isAutoTestRunning) {
      // During testing, use pouring animation level
      const shouldBeFilled = levelIndex < pouringLevel;
      if (isPouringLevel) {
        // Currently pouring level with liquid animation
        return `${baseClass} bg-gradient-to-t from-yellow-400 to-yellow-300 text-yellow-900 animate-pulse`;
      } else if (shouldBeFilled) {
        // Already filled levels with wheat color
        return `${baseClass} bg-yellow-400 text-yellow-900`;
      } else {
        // Empty levels
        return `${baseClass} bg-gray-100 text-gray-400`;
      }
    } else {
      // Normal state - wheat color for filled levels
      return `${baseClass} ${isFilledLevel ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-400'}`;
    }
  };

  return (
    <div className="relative" style={{ height: '100%', minHeight: '350px' }}>
      <div className="bg-lab-cylinder border-2 border-gray-400 rounded-lg" style={{ width: '83px', padding: '6px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} data-testid="grain-level-cylinder">
        <div className="text-xs font-bold text-center text-lab-text" style={{ marginBottom: '6px' }}>
          Grain Level
        </div>
        <div className="text-xs text-center text-lab-text" style={{ marginBottom: '10px' }}>
          {readingSilo ? (
            <span className="text-blue-600 font-bold animate-pulse">
              Reading Silo {readingSilo === 1 ? 1 : readingSilo - 1}
            </span>
          ) : (
            <span>Silo {selectedSilo || 112}</span>
          )}
        </div>
        
        {/* Display current grain level status with pouring animation */}
        <div className="text-center" style={{ marginBottom: '6px' }}>
          <div className="text-xs text-lab-text">Level:</div>
          <div className={`text-sm font-bold ${
            readingSilo || isAutoTestRunning ? 'text-blue-600 animate-pulse' : 'text-lab-text'
          }`}>
            {readingSilo || isAutoTestRunning ? `${pouringLevel}/8` : `${Math.max(...grainLevels)}/8`}
            {isPouring && (
              <span className="ml-1 text-yellow-600 animate-bounce">⬇</span>
            )}
          </div>
        </div>
        
        {/* 8 Grain Level Indicators - displayed from top (L8) to bottom (L1) with liquid pouring animation */}
        <div className="flex flex-col" style={{ gap: '3px', flex: 1, overflow: 'hidden' }}>
          {[...Array(8)].map((_, index) => {
            const levelNumber = 8 - index; // L8 at top, L1 at bottom
            const currentLevel = readingSilo || isAutoTestRunning ? pouringLevel : Math.max(...grainLevels);
            const isPouringLevel = isPouring && levelNumber === pouringLevel;
            
            return (
              <div 
                key={levelNumber} 
                className={getGrainLevelClass(levelNumber - 1, currentLevel)}
                onClick={handleClick}
                style={{ cursor: onSiloClick ? 'pointer' : 'default', ...heightStyle }}
              >
                <span className="text-xs font-bold relative z-10">
                  L{levelNumber}
                </span>
                
                {/* Liquid pouring animation effect */}
                {isPouringLevel && (
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-500 via-yellow-400 to-transparent rounded-sm animate-pulse">
                    <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-sm animate-bounce" 
                         style={{ animationDuration: '0.6s' }}></div>
                  </div>
                )}
                
                {/* Blue overlay for reading state */}
                {(readingSilo || isAutoTestRunning) && levelNumber <= currentLevel && !isPouringLevel && (
                  <div className="absolute inset-0 bg-blue-100 bg-opacity-20 rounded-sm"></div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Future API integration placeholder */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 text-center mt-2">
            API Ready
          </div>
        )}
      </div>
    </div>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export const GrainLevelCylinder = React.memo(GrainLevelCylinderComponent);
