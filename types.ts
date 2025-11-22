export enum DeformationPhase {
  ELASTIC = 'Elastic Region',
  UPPER_YIELD = 'Upper Yield Point',
  YIELD_DROP = 'Yield Drop',
  LUDERS_PLATEAU = 'Lüders Plateau',
  STRAIN_HARDENING = 'Strain Hardening',
  NECKING = 'Necking',
  FRACTURE = 'Fracture',
}

export interface DataPoint {
  strain: number; // x-axis
  stress: number; // y-axis
  phase: DeformationPhase;
}

export interface SimulationState {
  currentStrain: number;
  isPlaying: boolean;
  playbackSpeed: number;
}

export interface PhaseThresholds {
  elasticLimit: number;
  upperYield: number;
  lowerYieldStart: number;
  plateauEnd: number;
  neckingStart: number;
  fracture: number;
}