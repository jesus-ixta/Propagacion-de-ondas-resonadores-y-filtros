import { WaveguideParams, WaveguideResults, WaveguideMode } from './types';

export const C_LIGHT = 299792458; // m/s
export const ETA_0 = 376.730313; // Ohms (vacuum wave impedance)

export function getModeIndices(mode: WaveguideMode): { m: number; n: number; isTE: boolean } {
  switch (mode) {
    case 'TE10':
      return { m: 1, n: 0, isTE: true };
    case 'TE20':
      return { m: 2, n: 0, isTE: true };
    case 'TE01':
      return { m: 0, n: 1, isTE: true };
    case 'TM11':
      return { m: 1, n: 1, isTE: false };
    case 'TM21':
      return { m: 2, n: 1, isTE: false };
    default:
      return { m: 1, n: 0, isTE: true };
  }
}

export function calculateWaveguide(params: WaveguideParams): WaveguideResults {
  const { m, n, isTE } = getModeIndices(params.mode);
  
  // Convert dimensions from cm to meters
  const a_m = params.a / 100;
  const b_m = params.b / 100;
  
  // Medium properties
  const u = C_LIGHT / Math.sqrt(params.muR * params.epsR);
  const eta = ETA_0 * Math.sqrt(params.muR / params.epsR);
  
  // Cutoff frequency fc (Hz)
  const cutoffTerm = Math.sqrt(Math.pow(m / a_m, 2) + Math.pow(n / b_m, 2));
  const fcHz = (u / 2) * cutoffTerm;
  const fcGHz = fcHz / 1e9;
  
  // Operating frequency f (Hz)
  const fHz = params.freqGHz * 1e9;
  const isPropagating = fHz > fcHz;
  
  // Free-space wavelength in medium (m)
  const lambdaFreeSpaceM = u / fHz;
  const lambdaFreeSpaceMm = lambdaFreeSpaceM * 1000;
  
  // Convert amplitude to V/m
  const E0 = params.e0Kvm * 1000;
  
  if (isPropagating) {
    const factor = Math.sqrt(1 - Math.pow(fcHz / fHz, 2));
    const lambdaGMm = (lambdaFreeSpaceM / factor) * 1000;
    const vp = u / factor;
    const vg = u * factor;
    
    let zWave = 0;
    if (isTE) {
      zWave = eta / factor;
    } else {
      zWave = eta * factor;
    }
    
    // Transmitted average power (Watts)
    // For TE modes: P_avg = (E0^2 * a * b) / (4 * Z_TE) for m=1,0 or 2,0
    // General rectangular waveguide power integration:
    let powerWatts = 0;
    if (isTE) {
      // Normalizing factor according to m and n
      const normFactor = (m === 0 || n === 0) ? 4 : 8;
      powerWatts = (Math.pow(E0, 2) * a_m * b_m) / (normFactor * zWave);
    } else {
      // For TM modes:
      const k = (2 * Math.PI * fHz) / u;
      const beta = k * factor;
      const kc = Math.PI * cutoffTerm;
      const normFactor = 8;
      powerWatts = (Math.pow(E0, 2) * a_m * b_m * Math.pow(beta / kc, 2)) / (normFactor * zWave);
    }
    
    return {
      m,
      n,
      isTE,
      u,
      fcGHz,
      isPropagating: true,
      eta,
      zWave,
      isZImaginary: false,
      lambdaFreeSpaceMm,
      lambdaGMm,
      vp,
      vg,
      alphaNpM: 0,
      powerWatts,
    };
  } else {
    // Evanescent Mode (f <= fc)
    const factorEvanescent = Math.sqrt(Math.pow(fcHz / fHz, 2) - 1);
    const k = (2 * Math.PI * fHz) / u;
    const alphaNpM = k * factorEvanescent;
    
    let zWaveMag = 0;
    if (isTE) {
      zWaveMag = eta / factorEvanescent;
    } else {
      zWaveMag = eta * factorEvanescent;
    }
    
    return {
      m,
      n,
      isTE,
      u,
      fcGHz,
      isPropagating: false,
      eta,
      zWave: zWaveMag,
      isZImaginary: true,
      lambdaFreeSpaceMm,
      lambdaGMm: null,
      vp: null,
      vg: null,
      alphaNpM,
      powerWatts: 0,
    };
  }
}

/**
 * Calculates field components at a point (x, y, z) inside the rectangular waveguide
 * x in [0, a], y in [0, b], z >= 0
 * Returns normalized field components for visualization
 */
export function getFieldComponents(
  params: WaveguideParams,
  results: WaveguideResults,
  x_norm: number, // [0, 1] across width a
  y_norm: number, // [0, 1] across height b
  z_m: number,    // longitudinal position in meters
  time: number    // animated time in seconds
): { Ex: number; Ey: number; Ez: number; Hx: number; Hy: number; Hz: number; Emag: number; Hmag: number } {
  const { m, n, isTE } = results;
  const omega = 2 * Math.PI * params.freqGHz * 1e9;
  
  // Spatial angle arguments
  const argX = m * Math.PI * x_norm;
  const argY = n * Math.PI * y_norm;
  
  let Ex = 0;
  let Ey = 0;
  let Ez = 0;
  let Hx = 0;
  let Hy = 0;
  let Hz = 0;
  
  if (results.isPropagating && results.lambdaGMm) {
    const beta = (2 * Math.PI) / (results.lambdaGMm / 1000);
    const phase = omega * time - beta * z_m;
    const cosPhase = Math.cos(phase);
    const sinPhase = Math.sin(phase);
    
    if (isTE) {
      if (m === 1 && n === 0) {
        // TE10 Dominant Mode
        Ey = -Math.sin(argX) * cosPhase;
        Hx = (Ey / results.zWave) * results.eta; // scaled
        Hz = -Math.cos(argX) * sinPhase * (results.fcGHz / params.freqGHz);
      } else if (m === 2 && n === 0) {
        // TE20
        Ey = -Math.sin(argX) * cosPhase;
        Hx = (Ey / results.zWave) * results.eta;
        Hz = -Math.cos(argX) * sinPhase * (results.fcGHz / params.freqGHz);
      } else if (m === 0 && n === 1) {
        // TE01
        Ex = Math.sin(argY) * cosPhase;
        Hy = (Ex / results.zWave) * results.eta;
        Hz = -Math.cos(argY) * sinPhase * (results.fcGHz / params.freqGHz);
      } else {
        // General TE
        Ey = -Math.sin(argX) * Math.cos(argY) * cosPhase;
        Ex = Math.cos(argX) * Math.sin(argY) * cosPhase;
        Hx = (Ey / results.zWave) * results.eta;
        Hy = -(Ex / results.zWave) * results.eta;
        Hz = -Math.cos(argX) * Math.cos(argY) * sinPhase;
      }
    } else {
      // TM Modes
      Ez = Math.sin(argX) * Math.sin(argY) * sinPhase;
      Ex = -Math.cos(argX) * Math.sin(argY) * cosPhase;
      Ey = -Math.sin(argX) * Math.cos(argY) * cosPhase;
      Hx = (Ey * results.eta) / results.zWave;
      Hy = -(Ex * results.eta) / results.zWave;
    }
  } else {
    // Evanescent decay e^(-alpha * z)
    const decay = Math.exp(-Math.min(results.alphaNpM * z_m, 15));
    const phase = omega * time;
    const cosPhase = Math.cos(phase) * decay;
    const sinPhase = Math.sin(phase) * decay;
    
    if (isTE) {
      if (m === 1 && n === 0) {
        Ey = -Math.sin(argX) * cosPhase;
        Hx = -Math.sin(argX) * sinPhase * 0.5;
        Hz = -Math.cos(argX) * cosPhase * 0.5;
      } else {
        Ey = -Math.sin(argX) * cosPhase;
        Hx = -Math.sin(argX) * sinPhase * 0.5;
      }
    } else {
      Ez = Math.sin(argX) * Math.sin(argY) * sinPhase;
      Ex = -Math.cos(argX) * Math.sin(argY) * cosPhase;
    }
  }
  
  const Emag = Math.sqrt(Ex * Ex + Ey * Ey + Ez * Ez);
  const Hmag = Math.sqrt(Hx * Hx + Hy * Hy + Hz * Hz);
  
  return { Ex, Ey, Ez, Hx, Hy, Hz, Emag, Hmag };
}

/**
 * Resonant Cavity Calculation (Topic 3.6)
 */
export function calculateCavityResonance(
  a_cm: number,
  b_cm: number,
  d_cm: number,
  m: number,
  n: number,
  p: number,
  epsR: number,
  muR: number,
  sigmaCond: number = 5.8e7 // Copper conductivity S/m
) {
  const a = a_cm / 100;
  const b = b_cm / 100;
  const d = d_cm / 100;
  
  const u = C_LIGHT / Math.sqrt(muR * epsR);
  const frHz = (u / 2) * Math.sqrt(Math.pow(m / a, 2) + Math.pow(n / b, 2) + Math.pow(p / d, 2));
  const frGHz = frHz / 1e9;
  
  // Q-factor approximation for TE101 mode
  const Rs = Math.sqrt((Math.PI * frHz * (4 * Math.PI * 1e-7)) / sigmaCond);
  const eta = ETA_0 * Math.sqrt(muR / epsR);
  
  // Standard Q_101 formula
  const numerator = (Math.PI * eta * b) * Math.pow(Math.pow(a, 2) + Math.pow(d, 2), 1.5);
  const denomTerm1 = 2 * b * (Math.pow(a, 3) + Math.pow(d, 3));
  const denomTerm2 = a * d * (Math.pow(a, 2) + Math.pow(d, 2));
  const denominator = 2 * Rs * (denomTerm1 + denomTerm2);
  const Q101 = denominator > 0 ? numerator / denominator : 0;
  
  return {
    frGHz,
    Q101,
    Rs,
  };
}
