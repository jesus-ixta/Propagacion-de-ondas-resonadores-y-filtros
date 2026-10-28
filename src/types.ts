export type WaveguideMode = 'TE10' | 'TE20' | 'TE01' | 'TM11' | 'TM21';

export interface WaveguideParams {
  mode: WaveguideMode;
  a: number; // width in cm (e.g. 1.0 to 10.0 cm)
  b: number; // height in cm (e.g. 0.5 to 5.0 cm)
  epsR: number; // relative permittivity
  muR: number; // relative permeability
  freqGHz: number; // frequency in GHz (1.0 to 30.0)
  e0Kvm: number; // Amplitude in kV/m (10 to 3000)
}

export interface WaveguideResults {
  m: number;
  n: number;
  isTE: boolean;
  u: number; // m/s
  fcGHz: number; // cutoff frequency in GHz
  isPropagating: boolean; // f > fc
  eta: number; // medium intrinsic impedance in Ohms
  zWave: number; // wave impedance (Ohms) (real or imaginary magnitude)
  isZImaginary: boolean;
  lambdaFreeSpaceMm: number; // mm
  lambdaGMm: number | null; // guided wavelength in mm (null if evanescent)
  vp: number | null; // phase velocity in m/s (null if evanescent)
  vg: number | null; // group velocity in m/s (null if evanescent)
  alphaNpM: number; // attenuation constant in Np/m if evanescent
  powerWatts: number; // transmitted power in Watts (0 if evanescent)
}

export interface QuizQuestion {
  id: number;
  topic: '3.4' | '3.5' | '3.6';
  topicTitle: string;
  question: string;
  mathExplanation?: string;
  options: string[];
  correctIndex: number;
  rationale: string;
}

export interface TutorMessage {
  id: string;
  sender: 'tutor' | 'user';
  text: string;
  math?: string;
  timestamp: string;
  hintLevel?: number;
}
