import React, { useMemo } from 'react';
import { DeformationPhase } from '../types';
import { THRESHOLDS } from '../utils/physics';
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';

interface TensileSpecimenProps {
  currentStrain: number;
  phase: DeformationPhase;
}

const TensileSpecimen: React.FC<TensileSpecimenProps> = ({ currentStrain, phase }) => {
  // Calculate specimen elongation for visual effect
  const visualStretchFactor = 300; 
  const elongationPixels = currentStrain * visualStretchFactor; 
  const baseWidth = 220;
  const currentWidth = baseWidth + elongationPixels;

  // --- Necking & Fracture Logic ---
  const isFractured = phase === DeformationPhase.FRACTURE;
  let neckingAmount = 0;
  
  if (phase === DeformationPhase.NECKING) {
    const neckProgress = (currentStrain - THRESHOLDS.neckingStart) / (THRESHOLDS.fracture - THRESHOLDS.neckingStart);
    neckingAmount = Math.min(1, neckProgress) * 20; // Max 20px pinch
  } else if (isFractured) {
    neckingAmount = 20;
  }

  // --- Lüders Band Logic ---
  const numberOfSlices = 50;
  const bands = useMemo(() => {
    return Array.from({ length: numberOfSlices }).map((_, i) => ({
      id: i,
      threshold: Math.random(), 
      widthVar: 0.8 + Math.random() * 0.4, 
    }));
  }, []);

  let plateauProgress = 0;
  if (phase === DeformationPhase.LUDERS_PLATEAU) {
     const plateauDuration = THRESHOLDS.plateauEnd - THRESHOLDS.lowerYieldStart;
     plateauProgress = (currentStrain - THRESHOLDS.lowerYieldStart) / plateauDuration;
     plateauProgress = Math.max(0, Math.min(1, plateauProgress));
  } else if (
      phase === DeformationPhase.STRAIN_HARDENING || 
      phase === DeformationPhase.NECKING || 
      phase === DeformationPhase.FRACTURE
  ) {
     // Persist the bands after plateau
     plateauProgress = 2.0; 
  }

  // Colors
  const yieldedColor = "#000080"; // Navy Blue
  const activeBandColor = "#0033cc"; 
  const glowColor = "#00f3ff"; 

  // SVG Path Generation for Necking/Fracture
  const halfW = currentWidth / 2;
  const h = 30; // Half height
  
  const generatePath = (side: 'full' | 'left' | 'right') => {
    // Neck curve control
    const neckW = 30; // Width of neck region
    const pinch = neckingAmount;
    
    if (side === 'full' && !isFractured) {
      return `
        M ${-halfW} ${-h} 
        L ${-neckW} ${-h} 
        Q 0 ${-h + pinch} ${neckW} ${-h} 
        L ${halfW} ${-h} 
        V ${h} 
        L ${neckW} ${h} 
        Q 0 ${h - pinch} ${-neckW} ${h} 
        L ${-halfW} ${h} 
        Z
      `;
    } else if (side === 'left' && isFractured) {
       // Left half with jagged edge
       return `
        M ${-halfW} ${-h} 
        L ${-neckW} ${-h} 
        Q -5 ${-h + pinch} 0 ${-h + pinch + 5}
        L -5 0
        L 0 ${h - pinch - 5}
        Q -5 ${h - pinch} ${-neckW} ${h}
        L ${-halfW} ${h} 
        Z
       `;
    } else if (side === 'right' && isFractured) {
       // Right half with gap
       const gap = 10;
       return `
        M ${halfW} ${-h} 
        L ${neckW} ${-h} 
        Q ${gap} ${-h + pinch} ${gap} ${-h + pinch + 5}
        L ${gap + 5} 0
        L ${gap} ${h - pinch - 5}
        Q ${gap} ${h - pinch} ${neckW} ${h}
        L ${halfW} ${h} 
        Z
       `;
    }
    return '';
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
        <div className="absolute top-0 left-0 w-full p-2 z-10 flex justify-between items-start">
             <h3 className="text-neon-blue font-mono text-sm flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isFractured ? 'bg-red-500' : 'bg-neon-blue animate-pulse'}`}></span>
                {isFractured ? 'TEST COMPLETE: FAILURE' : 'MICROSTRUCTURE VISUALIZATION'}
            </h3>
        </div>

      {/* SVG Container */}
      <div className="relative w-full h-64 flex items-center justify-center overflow-visible">
        
        {/* Force Arrows - Hide on Fracture */}
        {!isFractured && (
            <>
                <div 
                    className="absolute flex items-center gap-2 text-neon-blue font-mono text-xs transition-all duration-100"
                    style={{ transform: `translateX(-${currentWidth / 2 + 60}px)` }}
                >
                    <ArrowLeft className="animate-pulse" /> F
                </div>
                <div 
                    className="absolute flex items-center gap-2 text-neon-blue font-mono text-xs transition-all duration-100"
                    style={{ transform: `translateX(${currentWidth / 2 + 60}px)` }}
                >
                    F <ArrowRight className="animate-pulse" />
                </div>
            </>
        )}

        <svg 
          width="100%" 
          height="200" 
          viewBox="-250 -100 500 200" 
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="steelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#777" />
              <stop offset="50%" stopColor="#999" />
              <stop offset="100%" stopColor="#777" />
            </linearGradient>
            
            <pattern id="navyYieldPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
               <rect width="8" height="8" fill={yieldedColor} />
               <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#001133" strokeWidth="1" opacity="0.5"/>
            </pattern>

            <clipPath id="specimenClip">
                 {isFractured ? (
                     <path d={generatePath('left') + " " + generatePath('right')} />
                 ) : (
                     <path d={generatePath('full')} />
                 )}
            </clipPath>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Grip */}
          <path 
            d={`M -${currentWidth/2 + 40} -50 H -${currentWidth/2} V 50 H -${currentWidth/2 + 40} Z`} 
            fill="#333" stroke="#555" strokeWidth="2"
          />
          
          {/* Right Grip */}
          <path 
            d={`M ${currentWidth/2} -50 H ${currentWidth/2 + 40} V 50 H ${currentWidth/2} Z`} 
            fill="#333" stroke="#555" strokeWidth="2"
          />

          {/* Main Specimen Body */}
          <g>
              {/* If fractured, draw two parts. If not, draw one. */}
              {isFractured ? (
                  <>
                    <path d={generatePath('left')} fill="url(#steelGradient)" stroke="#666" strokeWidth="1" />
                    <path d={generatePath('right')} fill="url(#steelGradient)" stroke="#666" strokeWidth="1" />
                  </>
              ) : (
                    <path d={generatePath('full')} fill="url(#steelGradient)" stroke={phase === DeformationPhase.ELASTIC ? "#00f3ff" : "#666"} strokeWidth={phase === DeformationPhase.ELASTIC ? 2 : 1} />
              )}
          </g>

          {/* Layer for Random Lüders Bands - Clipped to Specimen Shape */}
          <g clipPath="url(#specimenClip)">
             {bands.map((band) => {
                 const isActive = plateauProgress > band.threshold;
                 if (!isActive) return null;

                 const xStart = -currentWidth/2 + (band.id * (currentWidth / numberOfSlices));
                 const bandWidth = (currentWidth / numberOfSlices) * band.widthVar;
                 // Glow only during plateau formation
                 const isFresh = phase === DeformationPhase.LUDERS_PLATEAU && (plateauProgress - band.threshold) < 0.05;

                 return (
                     <g key={band.id}>
                         <rect
                            x={xStart}
                            y="-50" 
                            width={bandWidth * 1.5}
                            height="100"
                            fill="url(#navyYieldPattern)"
                            transform={`skewX(-30)`}
                            transform-origin={`${xStart} 0`}
                            opacity={isActive ? 0.9 : 0}
                            className="transition-opacity duration-300"
                         />
                         {isFresh && (
                             <rect
                                x={xStart}
                                y="-50"
                                width={2}
                                height="100"
                                fill={glowColor}
                                transform={`skewX(-30)`}
                                transform-origin={`${xStart} 0`}
                                filter="url(#glow)"
                                opacity="0.8"
                             />
                         )}
                     </g>
                 )
             })}
          </g>
          
          {/* Fracture Spark/Flash Effect */}
          {isFractured && (
              <circle cx="0" cy="0" r="30" fill="rgba(255, 255, 255, 0.5)" filter="url(#glow)">
                  <animate attributeName="opacity" values="1;0" dur="0.5s" fill="freeze" />
                  <animate attributeName="r" values="10;60" dur="0.3s" fill="freeze" />
              </circle>
          )}

        </svg>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 w-full px-6 flex justify-center">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-xs font-mono text-gray-300 flex gap-4 shadow-lg">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-500 rounded-sm"></span> Unyielded
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-900 border border-blue-500 rounded-sm"></span> Yielded
            </div>
            {phase === DeformationPhase.NECKING && (
                 <div className="flex items-center gap-2 text-red-400 animate-pulse">
                    <AlertTriangle size={12} /> Necking
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TensileSpecimen;