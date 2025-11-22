import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { THRESHOLDS } from '../utils/physics';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  progress: number; // 0 to 100
  onSeek: (val: number) => void;
}

const Controls: React.FC<ControlsProps> = ({ isPlaying, onPlayPause, onReset, progress, onSeek }) => {
  return (
    <div className="w-full bg-glass-200 border-t border-white/10 p-4 flex flex-col md:flex-row items-center gap-4 backdrop-blur-lg z-50">
      
      {/* Playback Buttons */}
      <div className="flex items-center gap-2">
        <button 
            onClick={onReset}
            className="p-2 rounded-full hover:bg-white/10 text-neon-blue transition-colors"
            title="Reset"
        >
            <RotateCcw size={20} />
        </button>
        
        <button 
            onClick={onPlayPause}
            className="p-3 rounded-full bg-neon-blue text-black hover:bg-white hover:text-neon-blue transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
        >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
      </div>

      {/* Timeline Slider */}
      <div className="flex-grow flex flex-col gap-1 w-full">
        <div className="flex justify-between text-xs font-mono text-gray-400">
            <span>START</span>
            <span>YIELD</span>
            <span>PLATEAU</span>
            <span>HARDENING</span>
            <span>NECK</span>
        </div>
        <div className="relative w-full h-6 flex items-center">
            {/* Custom Range Input */}
            <input 
                type="range" 
                min="0" 
                max="100" 
                step="0.1"
                value={progress} 
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-blue z-10 focus:outline-none focus:ring-0"
            />
            
            {/* Markers for key events on the slider track */}
            <div 
                className="absolute h-2 w-0.5 bg-yellow-500 top-2 z-0" 
                style={{ left: `${(THRESHOLDS.upperYield / THRESHOLDS.fracture) * 100}%` }}
                title="Upper Yield Point"
            />
            <div 
                className="absolute h-2 w-0.5 bg-neon-pink top-2 z-0" 
                style={{ left: `${(THRESHOLDS.plateauEnd / THRESHOLDS.fracture) * 100}%` }}
                title="End of Plateau"
            />
            <div 
                className="absolute h-2 w-0.5 bg-red-500 top-2 z-0" 
                style={{ left: `${(THRESHOLDS.neckingStart / THRESHOLDS.fracture) * 100}%` }}
                title="Start of Necking (UTS)"
            />
        </div>
      </div>

      {/* Time/Phase Display */}
      <div className="hidden md:block font-mono text-xs text-gray-500 w-24 text-right">
        {progress.toFixed(1)}% SIM
      </div>
    </div>
  );
};

export default Controls;