import React from 'react';
import { DeformationPhase } from '../types';
import { Info } from 'lucide-react';

interface InfoPanelProps {
  phase: DeformationPhase;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ phase }) => {
  const getContent = () => {
    switch (phase) {
      case DeformationPhase.ELASTIC:
        return {
          title: "Elastic Deformation",
          desc: "The material deforms reversibly. Stress is proportional to strain (Hooke's Law). Dislocations are pinned by interstitial carbon and nitrogen atoms (Cottrell atmospheres).",
          color: "border-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.2)]"
        };
      case DeformationPhase.UPPER_YIELD:
        return {
          title: "Upper Yield Point",
          desc: "The stress required to break dislocations free from their Cottrell atmospheres. This represents a high energy barrier for the onset of plastic flow.",
          color: "border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]"
        };
      case DeformationPhase.YIELD_DROP:
        return {
          title: "Yield Drop",
          desc: "Once unpinned, dislocations can move at a lower stress level. The rapid multiplication of mobile dislocations causes a sudden drop in the stress required to continue deformation.",
          color: "border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
        };
      case DeformationPhase.LUDERS_PLATEAU:
        return {
          title: "Lüders Band Propagation",
          desc: "Deformation is heterogeneous. Localized bands of plastic deformation (Lüders bands) nucleate at stress concentrations and propagate along the gauge length. Stress remains roughly constant.",
          color: "border-neon-pink shadow-[0_0_10px_rgba(255,0,255,0.2)]"
        };
      case DeformationPhase.STRAIN_HARDENING:
        return {
          title: "Strain Hardening",
          desc: "The entire gauge length has yielded. Deformation becomes uniform again. Dislocation density increases, causing them to tangle and impede each other's motion (work hardening). Stress rises to UTS.",
          color: "border-neon-green shadow-[0_0_10px_rgba(0,255,157,0.2)]"
        };
      case DeformationPhase.NECKING:
        return {
          title: "Necking",
          desc: "Instability sets in at the Ultimate Tensile Strength (UTS). Deformation localizes in a small region, reducing the cross-sectional area significantly. Engineering stress drops despite true stress increasing.",
          color: "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
        };
      case DeformationPhase.FRACTURE:
        return {
          title: "Fracture",
          desc: "The material separates into two pieces. In ductile materials like mild steel, this often involves void nucleation, coalescence, and a cup-and-cone fracture surface.",
          color: "border-gray-500 shadow-[0_0_10px_rgba(100,100,100,0.2)]"
        };
      default:
        return { title: "", desc: "", color: "" };
    }
  };

  const content = getContent();

  return (
    <div className={`absolute bottom-24 left-4 md:left-8 max-w-xs md:max-w-md bg-black/80 backdrop-blur-xl border-l-4 rounded-r-lg p-4 text-left transition-all duration-500 ${content.color}`}>
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 mt-1 shrink-0 text-white/80" />
        <div>
          <h4 className="text-white font-bold font-mono text-sm tracking-wider uppercase mb-1">{content.title}</h4>
          <p className="text-gray-300 text-xs leading-relaxed">
            {content.desc}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;