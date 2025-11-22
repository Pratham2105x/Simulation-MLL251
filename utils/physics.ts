import { DataPoint, DeformationPhase, PhaseThresholds } from '../types';

// Physical constants for Mild Steel simulation
const E_MODULUS = 200000; // MPa (Young's Modulus)
const UPPER_YIELD_STRESS = 320; // MPa
const LOWER_YIELD_STRESS = 280; // MPa
const ULTIMATE_TENSILE_STRENGTH = 420; // MPa
const FRACTURE_STRESS = 300; // MPa

export const THRESHOLDS: PhaseThresholds = {
  elasticLimit: UPPER_YIELD_STRESS / E_MODULUS, // approx 0.0016
  upperYield: 0.0018, // Small buffer for the peak
  lowerYieldStart: 0.0022, // Where drop finishes
  plateauEnd: 0.07, // Reduced slightly from 0.10 to 0.07 per request
  neckingStart: 0.12, // Start of necking (UTS)
  fracture: 0.15, // Point of failure
};

/**
 * Generates the full dataset for the simulation curve.
 * Resolution determines how many points are generated.
 */
export const generateCurveData = (resolution: number = 600): DataPoint[] => {
  const data: DataPoint[] = [];
  const maxStrain = THRESHOLDS.fracture + 0.01; // Go slightly past for visual drop
  const step = maxStrain / resolution;

  for (let strain = 0; strain <= maxStrain; strain += step) {
    let stress = 0;
    let phase = DeformationPhase.ELASTIC;

    if (strain <= THRESHOLDS.elasticLimit) {
      // Elastic Region: Hooke's Law
      stress = strain * E_MODULUS;
      phase = DeformationPhase.ELASTIC;
    } else if (strain <= THRESHOLDS.upperYield) {
      // Upper Yield Peak
      stress = UPPER_YIELD_STRESS;
      phase = DeformationPhase.UPPER_YIELD;
    } else if (strain <= THRESHOLDS.lowerYieldStart) {
      // Drop to Lower Yield
      const t = (strain - THRESHOLDS.upperYield) / (THRESHOLDS.lowerYieldStart - THRESHOLDS.upperYield);
      stress = UPPER_YIELD_STRESS - (UPPER_YIELD_STRESS - LOWER_YIELD_STRESS) * t;
      phase = DeformationPhase.YIELD_DROP;
    } else if (strain <= THRESHOLDS.plateauEnd) {
      // Lüders Plateau
      // Randomized serrations (Portevin-Le Chatelier effect style noise)
      const oscillation = Math.sin(strain * 2500) * 1.5 + Math.cos(strain * 9000) * 1.5;
      stress = LOWER_YIELD_STRESS + oscillation;
      phase = DeformationPhase.LUDERS_PLATEAU;
    } else if (strain <= THRESHOLDS.neckingStart) {
      // Strain Hardening (Parabolic rise to UTS)
      const hardeningStart = THRESHOLDS.plateauEnd;
      const hardeningRange = THRESHOLDS.neckingStart - hardeningStart;
      const t = (strain - hardeningStart) / hardeningRange;
      
      // Power law hardening
      stress = LOWER_YIELD_STRESS + (ULTIMATE_TENSILE_STRENGTH - LOWER_YIELD_STRESS) * Math.pow(t, 0.5);
      
      phase = DeformationPhase.STRAIN_HARDENING;
    } else if (strain <= THRESHOLDS.fracture) {
      // Necking (Stress drops from UTS to Fracture Stress)
      const neckingRange = THRESHOLDS.fracture - THRESHOLDS.neckingStart;
      const t = (strain - THRESHOLDS.neckingStart) / neckingRange;
      
      // Inverted parabola for necking curve
      stress = ULTIMATE_TENSILE_STRENGTH - (ULTIMATE_TENSILE_STRENGTH - FRACTURE_STRESS) * (t * t);
      
      phase = DeformationPhase.NECKING;
    } else {
      // Fracture
      stress = 0;
      phase = DeformationPhase.FRACTURE;
    }

    data.push({ strain, stress, phase });
  }
  return data;
};

export const calculateCurrentPhase = (strain: number): DeformationPhase => {
  if (strain <= THRESHOLDS.elasticLimit) return DeformationPhase.ELASTIC;
  if (strain <= THRESHOLDS.upperYield) return DeformationPhase.UPPER_YIELD;
  if (strain <= THRESHOLDS.lowerYieldStart) return DeformationPhase.YIELD_DROP;
  if (strain <= THRESHOLDS.plateauEnd) return DeformationPhase.LUDERS_PLATEAU;
  if (strain <= THRESHOLDS.neckingStart) return DeformationPhase.STRAIN_HARDENING;
  if (strain < THRESHOLDS.fracture) return DeformationPhase.NECKING;
  return DeformationPhase.FRACTURE;
};