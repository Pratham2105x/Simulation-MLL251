import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceArea
} from 'recharts';
import { DataPoint, DeformationPhase } from '../types';
import { THRESHOLDS } from '../utils/physics';

interface StressStrainChartProps {
  data: DataPoint[];
  currentStrain: number;
  currentStress: number;
  phase: DeformationPhase;
}

const StressStrainChart: React.FC<StressStrainChartProps> = ({
  data,
  currentStrain,
  currentStress,
  phase,
}) => {
  const pastData = useMemo(() => {
    return data.filter((d) => d.strain <= currentStrain);
  }, [data, currentStrain]);

  const maxStress = 500;
  const maxStrain = 0.16; // Adjusted for new fracture point

  return (
    <div className="w-full h-full flex flex-col relative">
      <h3 className="text-neon-blue font-mono text-sm mb-2 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${phase === DeformationPhase.FRACTURE ? 'bg-red-500' : 'bg-neon-blue animate-pulse'}`}></span>
        LIVE SENSOR DATA: STRESS-STRAIN
      </h3>
      
      <div className="flex-grow relative bg-glass-100 rounded-lg border border-white/10 p-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="strain" 
              type="number" 
              domain={[0, maxStrain]} 
              tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={(val) => val.toFixed(2)}
              label={{ value: 'Strain (ε)', position: 'insideBottomRight', offset: -5, fill: '#888', fontSize: 12 }}
            />
            <YAxis 
              dataKey="stress" 
              domain={[0, maxStress]} 
              tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }}
              label={{ value: 'Stress (σ) [MPa]', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
            />
            
            {/* Phase Background Highlights */}
            <ReferenceArea x1={THRESHOLDS.lowerYieldStart} x2={THRESHOLDS.plateauEnd} fill="rgba(255, 0, 255, 0.05)" strokeOpacity={0.3} />
            <ReferenceArea x1={THRESHOLDS.neckingStart} x2={THRESHOLDS.fracture} fill="rgba(255, 0, 0, 0.05)" />
            
            {/* Ghost Line */}
            <Line
              type="monotone"
              dataKey="stress"
              stroke="#333"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />

            {/* Active Line */}
            <Line
              data={pastData}
              type="monotone"
              dataKey="stress"
              stroke={phase === DeformationPhase.FRACTURE ? "#ff3333" : "#00f3ff"}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              filter="url(#glow)"
            />

            {/* Current Value Dot */}
            {phase !== DeformationPhase.FRACTURE && (
                <ReferenceDot
                x={currentStrain}
                y={currentStress}
                r={6}
                fill="#ffffff"
                stroke={phase === DeformationPhase.NECKING ? "#ff0000" : "#00f3ff"}
                strokeWidth={2}
                isFront={true}
                />
            )}

            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', borderRadius: '8px', backdropFilter: 'blur(4px)' }}
              itemStyle={{ color: '#00f3ff', fontFamily: 'monospace' }}
              labelStyle={{ color: '#888' }}
              formatter={(value: number) => [`${value.toFixed(1)} MPa`, 'Stress']}
              labelFormatter={(label: number) => `ε: ${label.toFixed(4)}`}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Overlay Stats */}
        <div className="absolute top-4 right-4 font-mono text-xs text-right space-y-1 pointer-events-none">
           <div className="text-gray-400">CURRENT PHASE</div>
           <div className={`text-base font-bold ${
             phase === DeformationPhase.LUDERS_PLATEAU ? 'text-neon-pink' : 
             phase === DeformationPhase.UPPER_YIELD ? 'text-yellow-400' : 
             phase === DeformationPhase.NECKING ? 'text-red-500' :
             phase === DeformationPhase.FRACTURE ? 'text-red-700' : 'text-white'
           }`}>
             {phase.toUpperCase()}
           </div>
           <div className="mt-2 text-gray-400">STRESS</div>
           <div className={`text-xl ${phase === DeformationPhase.FRACTURE ? 'text-red-500' : 'text-neon-blue'}`}>{currentStress.toFixed(1)} <span className="text-xs text-gray-500">MPa</span></div>
           <div className="text-gray-400">STRAIN</div>
           <div className="text-xl text-neon-green">{(currentStrain * 100).toFixed(2)} <span className="text-xs text-gray-500">%</span></div>
        </div>
      </div>
    </div>
  );
};

export default StressStrainChart;