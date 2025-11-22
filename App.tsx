import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import StressStrainChart from './components/StressStrainChart';
import TensileSpecimen from './components/TensileSpecimen';
import Controls from './components/Controls';
import InfoPanel from './components/InfoPanel';
import { generateCurveData, calculateCurrentPhase, THRESHOLDS } from './utils/physics';
import { DeformationPhase } from './types';

const App: React.FC = () => {
  // --- State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStrain, setCurrentStrain] = useState(0);
  
  // Generate data once
  const curveData = useMemo(() => generateCurveData(400), []);
  
  // --- Physics Helpers ---
  const maxStrain = THRESHOLDS.fracture;
  
  // Get current stress based on strain from the pre-calculated curve
  const getCurrentState = useCallback((strain: number) => {
    // Clamp strain
    const clampedStrain = Math.max(0, Math.min(strain, maxStrain));
    const point = curveData.find(p => p.strain >= clampedStrain) || curveData[curveData.length - 1];
    const phase = calculateCurrentPhase(clampedStrain);
    return { stress: point.stress, phase, strain: clampedStrain };
  }, [curveData, maxStrain]);

  const currentState = getCurrentState(currentStrain);

  // --- Animation Loop ---
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      
      // Base speed: Full simulation in approx 10 seconds at 1x
      const baseStrainPerSecond = maxStrain / 10; 
      
      // Determine Phase-based Speed Multiplier
      // We calculate phase inside the loop to react instantly
      const currentPhase = calculateCurrentPhase(currentStrain);
      let speedMultiplier = 1;

      if (currentPhase === DeformationPhase.LUDERS_PLATEAU) {
        // Slow down significantly during serrations/plateau for visualization
        speedMultiplier = 0.25; 
      }

      if (isPlaying) {
        setCurrentStrain(prev => {
          const next = prev + (baseStrainPerSecond * speedMultiplier * (deltaTime / 1000));
          if (next >= maxStrain) {
            setIsPlaying(false);
            return maxStrain;
          }
          return next;
        });
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [isPlaying, maxStrain, currentStrain]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  // --- Handlers ---
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStrain(0);
  };
  const handleSeek = (percentage: number) => {
    const strain = (percentage / 100) * maxStrain;
    setCurrentStrain(strain);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden text-white selection:bg-neon-blue selection:text-black">
      
      {/* Header */}
      <header className="h-14 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center font-bold text-black">Y</div>
          <h1 className="font-mono font-bold tracking-tight text-lg hidden md:block">
            YIELD POINT PHENOMENON <span className="text-gray-500 font-normal">| SIMULATOR 2025</span>
          </h1>
        </div>
        <div className="text-xs font-mono text-gray-400 flex gap-4">
            <div className="flex items-center gap-1"><span className="w-2 h-2 bg-neon-blue rounded-full"></span> Mild Steel</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> 298 K</div>
        </div>
      </header>

      {/* Main Content - Grid Layout */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Panel: Specimen Visualization (40% width on desktop) */}
        <section className="w-full md:w-5/12 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-white/10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat relative">
           <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-slate-900/90"></div>
           
           {/* Specimen Component */}
           <div className="relative z-10 w-full h-full p-4">
              <div className="w-full h-full border border-white/5 bg-white/5 rounded-xl backdrop-blur-sm shadow-2xl flex flex-col relative overflow-hidden">
                 <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]"></div>
                 <TensileSpecimen 
                    currentStrain={currentState.strain} 
                    phase={currentState.phase}
                 />
              </div>
           </div>
        </section>

        {/* Right Panel: Graph (60% width on desktop) */}
        <section className="w-full md:w-7/12 h-1/2 md:h-full bg-slate-900 relative p-4">
           <StressStrainChart 
              data={curveData}
              currentStrain={currentState.strain}
              currentStress={currentState.stress}
              phase={currentState.phase}
           />
        </section>

        {/* Floating Info Panel */}
        <InfoPanel phase={currentState.phase} />

      </main>

      {/* Footer Controls */}
      <Controls 
        isPlaying={isPlaying} 
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        progress={(currentStrain / maxStrain) * 100}
        onSeek={handleSeek}
      />
    </div>
  );
};

export default App;