import React, { useState, useRef, useEffect, useMemo } from 'react';
import { WaveguideParams, WaveguideMode } from '../types';
import { calculateWaveguide, getFieldComponents, C_LIGHT } from '../physics';
import { MathFormula } from './MathFormula';
import { Play, Pause, RotateCcw, Sliders, Activity, Info, CheckCircle2, AlertTriangle, Box, Compass } from 'lucide-react';

export const LabSection: React.FC = () => {
  // Input parameters state with default X-band (WR-90: a=2.29 cm, b=1.02 cm)
  const [params, setParams] = useState<WaveguideParams>({
    mode: 'TE10',
    a: 2.29, // cm
    b: 1.02, // cm
    epsR: 1.0,
    muR: 1.0,
    freqGHz: 10.0, // GHz
    e0Kvm: 250, // kV/m
  });

  const [activeView, setActiveView] = useState<'isometric' | 'longitudinal' | 'transverse'>('isometric');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [hoverInfo, setHoverInfo] = useState<{ xNorm: number; zNorm: number; eMag: number; hMag: number } | null>(null);

  // Canvas and animation loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Compute results
  const results = useMemo(() => calculateWaveguide(params), [params]);

  // Standard Waveguide Presets
  const applyPreset = (preset: 'WR-90' | 'WR-62' | 'WR-284') => {
    if (preset === 'WR-90') {
      // X-Band (8.2 - 12.4 GHz)
      setParams((prev) => ({
        ...prev,
        mode: 'TE10',
        a: 2.29,
        b: 1.02,
        epsR: 1.0,
        muR: 1.0,
        freqGHz: 10.0,
        e0Kvm: 250,
      }));
    } else if (preset === 'WR-62') {
      // Ku-Band (12.4 - 18.0 GHz)
      setParams((prev) => ({
        ...prev,
        mode: 'TE10',
        a: 1.58,
        b: 0.79,
        epsR: 1.0,
        muR: 1.0,
        freqGHz: 15.0,
        e0Kvm: 300,
      }));
    } else if (preset === 'WR-284') {
      // S-Band (2.6 - 3.95 GHz)
      setParams((prev) => ({
        ...prev,
        mode: 'TE10',
        a: 7.21,
        b: 3.40,
        epsR: 1.0,
        muR: 1.0,
        freqGHz: 3.0,
        e0Kvm: 150,
      }));
    }
  };

  // Main 60 FPS animation canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        timeRef.current += dt * animSpeed * 4.5;
      }
      const t = timeRef.current;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Clean background
      ctx.fillStyle = '#0F172A'; // Dark slate for high visual contrast with Bright Blue and Bright Red
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (activeView === 'isometric') {
        // VISTA 3D / ISOMÉTRICA DE LA GUÍA EN CORTE (CUTAWAY)
        renderIsometricView(ctx, w, h, t);
      } else if (activeView === 'longitudinal') {
        // VISTA CORTE LONGITUDINAL X-Z
        renderLongitudinalView(ctx, w, h, t);
      } else {
        // VISTA CORTE TRANSVERSAL X-Y
        renderTransverseView(ctx, w, h, t);
      }

      // Legend in top right corner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(w - 220, 12, 208, 62);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(w - 220, 12, 208, 62);

      // Blue E line
      ctx.fillStyle = '#0066FF';
      ctx.fillRect(w - 208, 24, 18, 4);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('Campo Eléctrico E (Azul)', w - 180, 29);

      // Red H line
      ctx.fillStyle = '#FF2525';
      ctx.fillRect(w - 208, 44, 18, 4);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText('Campo Magnético H (Rojo)', w - 180, 49);

      // Status indicator on canvas
      ctx.fillStyle = results.isPropagating ? '#10B981' : '#EF4444';
      ctx.beginPath();
      ctx.arc(24, 25, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(
        results.isPropagating ? 'PROPAGACIÓN ACTIVA' : 'ONDA EVANESCENTE (CORTE)',
        36,
        29
      );

      animFrameId.current = requestAnimationFrame(render);
    };

    // Render 3D Isometric waveguide with cutaway top and side
    const renderIsometricView = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      // Perspective projection parameters
      const originX = 140;
      const originY = 240;
      const lengthZ = 460;
      const widthX = 180;
      const heightY = 110;

      // Vectors:
      // Z-axis: [cos(-25 deg), sin(-25 deg)] -> [0.906, -0.42]
      // X-axis: [cos(30 deg), sin(30 deg)] -> [0.866, 0.5]
      // Y-axis: [0, -1]
      const zStepX = 0.86;
      const zStepY = -0.32;
      const xStepX = 0.58;
      const xStepY = 0.28;

      // Draw metallic back walls and floor
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;

      // Bottom back corner
      const b0 = { x: originX, y: originY };
      const bX = { x: originX + widthX * xStepX, y: originY + widthX * xStepY };
      const bZ = { x: originX + lengthZ * zStepX, y: originY + lengthZ * zStepY };
      const bXZ = {
        x: originX + widthX * xStepX + lengthZ * zStepX,
        y: originY + widthX * xStepY + lengthZ * zStepY,
      };

      // Top back corner
      const t0 = { x: b0.x, y: b0.y - heightY };
      const tX = { x: bX.x, y: bX.y - heightY };
      const tZ = { x: bZ.x, y: bZ.y - heightY };
      const tXZ = { x: bXZ.x, y: bXZ.y - heightY };

      // Bottom plate
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.beginPath();
      ctx.moveTo(b0.x, b0.y);
      ctx.lineTo(bX.x, bX.y);
      ctx.lineTo(bXZ.x, bXZ.y);
      ctx.lineTo(bZ.x, bZ.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Back vertical wall
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.moveTo(b0.x, b0.y);
      ctx.lineTo(t0.x, t0.y);
      ctx.lineTo(tZ.x, tZ.y);
      ctx.lineTo(bZ.x, bZ.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Render interior electromagnetic fields (E & H vectors)
      const numSlicesZ = 18;
      const numColsX = 7;

      for (let s = 0; s < numSlicesZ; s++) {
        const zNorm = s / numSlicesZ;
        const zPosM = zNorm * 0.15; // 15 cm physical length

        for (let c = 1; c < numColsX; c++) {
          const xNorm = c / numColsX;

          // Compute field at this grid position
          const field = getFieldComponents(params, results, xNorm, 0.5, zPosM, t);

          // Spatial base coordinate on floor
          const baseX =
            originX +
            xNorm * widthX * xStepX +
            zNorm * lengthZ * zStepX;
          const baseY =
            originY +
            xNorm * widthX * xStepY +
            zNorm * lengthZ * zStepY;

          // Electric field (Vertical, Azul Vivo: #0066FF)
          const eLen = field.Ey * heightY * 0.75;
          const eAlpha = results.isPropagating ? Math.min(Math.abs(field.Ey) * 0.9 + 0.1, 1) : Math.max(Math.abs(field.Ey) * 0.6, 0.05);

          if (Math.abs(eLen) > 3) {
            ctx.strokeStyle = `rgba(0, 102, 255, ${eAlpha})`;
            ctx.fillStyle = `rgba(0, 102, 255, ${eAlpha})`;
            ctx.lineWidth = 2.2;

            ctx.beginPath();
            ctx.moveTo(baseX, baseY - heightY / 2);
            ctx.lineTo(baseX, baseY - heightY / 2 - eLen);
            ctx.stroke();

            // Arrowhead
            const tipY = baseY - heightY / 2 - eLen;
            const headDir = eLen > 0 ? -1 : 1;
            ctx.beginPath();
            ctx.moveTo(baseX, tipY);
            ctx.lineTo(baseX - 3, tipY - headDir * 5);
            ctx.lineTo(baseX + 3, tipY - headDir * 5);
            ctx.closePath();
            ctx.fill();
          }

          // Magnetic field vector (Transverse X-direction, Rojo Vivo: #FF2525)
          const hLen = field.Hx * 30 * xStepX;
          const hAlpha = results.isPropagating ? Math.min(Math.abs(field.Hx) * 0.85 + 0.15, 1) : Math.max(Math.abs(field.Hx) * 0.4, 0.05);

          if (Math.abs(hLen) > 2) {
            ctx.strokeStyle = `rgba(255, 37, 37, ${hAlpha})`;
            ctx.fillStyle = `rgba(255, 37, 37, ${hAlpha})`;
            ctx.lineWidth = 1.8;

            ctx.beginPath();
            ctx.moveTo(baseX - hLen / 2, baseY - heightY / 2 - (hLen / 2) * (xStepY / xStepX));
            ctx.lineTo(baseX + hLen / 2, baseY - heightY / 2 + (hLen / 2) * (xStepY / xStepX));
            ctx.stroke();

            // Tip
            ctx.beginPath();
            ctx.arc(baseX + hLen / 2, baseY - heightY / 2 + (hLen / 2) * (xStepY / xStepX), 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Evanescent wave damping overlay if cutoff
      if (!results.isPropagating) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.beginPath();
        ctx.moveTo(b0.x, b0.y);
        ctx.lineTo(bX.x, bX.y);
        ctx.lineTo(bXZ.x, bXZ.y);
        ctx.lineTo(bZ.x, bZ.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#F87171';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText('Atenuación Exponencial e^(-αz)', originX + 160, originY - 140);
      }

      // Draw front transparent edge guides
      ctx.strokeStyle = '#64748B';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(bX.x, bX.y);
      ctx.lineTo(tX.x, tX.y);
      ctx.lineTo(tXZ.x, tXZ.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Axis annotations
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText('Eje z (Propagación →)', originX + lengthZ * zStepX - 60, originY + lengthZ * zStepY + 25);
      ctx.fillText(`Ancho a = ${params.a.toFixed(2)} cm`, bX.x + 10, bX.y + 10);
      ctx.fillText(`Alto b = ${params.b.toFixed(2)} cm`, t0.x - 65, t0.y + heightY / 2);
    };

    // Render longitudinal cut (X-Z)
    const renderLongitudinalView = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      const padX = 60;
      const padY = 50;
      const guideW = w - 2 * padX;
      const guideH = h - 2 * padY;

      // Metallic top & bottom walls
      ctx.fillStyle = '#334155';
      ctx.fillRect(padX - 10, padY - 12, guideW + 20, 12);
      ctx.fillRect(padX - 10, padY + guideH, guideW + 20, 12);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText('Pared Metálica Superior (y = b)', padX + 10, padY - 18);
      ctx.fillText('Pared Metálica Inferior (y = 0)', padX + 10, padY + guideH + 24);
      ctx.fillText('z = 0 (Generador RF)', padX, padY + guideH + 40);
      ctx.fillText('z = L (Carga / Guía)', padX + guideW - 120, padY + guideH + 40);

      // Render traveling or evanescent electric field wave profile
      const pts = 140;
      const zPhysicalM = 0.2; // 20 cm
      ctx.lineWidth = 3;

      if (results.isPropagating && results.lambdaGMm) {
        ctx.strokeStyle = '#0066FF';
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const zNorm = i / pts;
          const zPosM = zNorm * zPhysicalM;
          const xPos = padX + zNorm * guideW;
          const field = getFieldComponents(params, results, 0.5, 0.5, zPosM, t);
          const yPos = padY + guideH / 2 + field.Ey * (guideH * 0.42);
          if (i === 0) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
        }
        ctx.stroke();

        // Magnetic Field vortex loops in x-z plane (Rojo Vivo)
        const lambdaGuiadaPx = (results.lambdaGMm / 1000 / zPhysicalM) * guideW;
        if (lambdaGuiadaPx > 30) {
          const numLoops = Math.floor(guideW / lambdaGuiadaPx) + 1;
          for (let l = 0; l <= numLoops; l++) {
            const zCenter = padX + ((l * lambdaGuiadaPx + (t * 28) % lambdaGuiadaPx) % guideW);
            if (zCenter > padX + 25 && zCenter < padX + guideW - 25) {
              ctx.strokeStyle = '#FF2525';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.ellipse(zCenter, padY + guideH / 2, lambdaGuiadaPx * 0.3, guideH * 0.32, 0, 0, Math.PI * 2);
              ctx.stroke();

              // Direction arrow
              ctx.fillStyle = '#FF2525';
              ctx.beginPath();
              ctx.arc(zCenter, padY + guideH / 2 - guideH * 0.32, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      } else {
        // EVANESCENT DECAY (f <= fc)
        ctx.strokeStyle = 'rgba(0, 102, 255, 0.7)';
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const zNorm = i / pts;
          const zPosM = zNorm * zPhysicalM;
          const xPos = padX + zNorm * guideW;
          const field = getFieldComponents(params, results, 0.5, 0.5, zPosM, t);
          const yPos = padY + guideH / 2 + field.Ey * (guideH * 0.42);
          if (i === 0) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
        }
        ctx.stroke();

        // Decay envelope line
        ctx.strokeStyle = '#EF4444';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const zNorm = i / pts;
          const zPosM = zNorm * zPhysicalM;
          const decay = Math.exp(-results.alphaNpM * zPosM);
          const xPos = padX + zNorm * guideW;
          const envY = padY + guideH / 2 - decay * (guideH * 0.42);
          if (i === 0) ctx.moveTo(xPos, envY);
          else ctx.lineTo(xPos, envY);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#F87171';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText(
          `Decaimiento Exponencial: α = ${results.alphaNpM.toFixed(1)} Np/m (Potencia Activa = 0 W)`,
          padX + 20,
          padY + 25
        );
      }
    };

    // Render transverse cross section (X-Y)
    const renderTransverseView = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      const padX = 100;
      const padY = 50;
      const guideW = w - 2 * padX;
      const guideH = h - 2 * padY;

      // Metallic frame
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 8;
      ctx.strokeRect(padX, padY, guideW, guideH);

      // Color field density map
      const resX = 40;
      const resY = 24;
      const cellW = guideW / resX;
      const cellH = guideH / resY;

      for (let i = 0; i < resX; i++) {
        const xNorm = (i + 0.5) / resX;
        for (let j = 0; j < resY; j++) {
          const yNorm = 1 - (j + 0.5) / resY;
          const field = getFieldComponents(params, results, xNorm, yNorm, 0.05, t);
          const alpha = Math.min(field.Emag * 0.8, 0.95);
          ctx.fillStyle = `rgba(0, 102, 255, ${alpha})`;
          ctx.fillRect(padX + i * cellW, padY + j * cellH, cellW + 0.5, cellH + 0.5);
        }
      }

      // Vector arrows for Electric field (Azul)
      const eGridCols = 10;
      const eGridRows = 6;
      for (let i = 1; i < eGridCols; i++) {
        const xNorm = i / eGridCols;
        const px = padX + xNorm * guideW;
        for (let j = 1; j < eGridRows; j++) {
          const yNorm = 1 - j / eGridRows;
          const py = padY + (j / eGridRows) * guideH;
          const field = getFieldComponents(params, results, xNorm, yNorm, 0.05, t);
          const arrowLen = field.Ey * 22;

          if (Math.abs(arrowLen) > 2) {
            ctx.strokeStyle = '#0066FF';
            ctx.fillStyle = '#0066FF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px, py - arrowLen / 2);
            ctx.lineTo(px, py + arrowLen / 2);
            ctx.stroke();

            // Head
            const headDir = arrowLen > 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(px, py + arrowLen / 2);
            ctx.lineTo(px - 3, py + arrowLen / 2 - headDir * 5);
            ctx.lineTo(px + 3, py + arrowLen / 2 - headDir * 5);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // Magnetic field loop markers (Rojo Vivo)
      ctx.strokeStyle = '#FF2525';
      ctx.fillStyle = '#FF2525';
      ctx.lineWidth = 2;
      const fieldMid = getFieldComponents(params, results, 0.5, 0.5, 0.05, t);
      if (Math.abs(fieldMid.Hx) > 0.1) {
        ctx.beginPath();
        ctx.arc(padX + guideW / 2, padY + guideH / 2, 35, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Coordinate axes
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(`Ancho a = ${params.a.toFixed(2)} cm`, padX + guideW / 2 - 45, padY + guideH + 25);
      ctx.fillText(`Alto b = ${params.b.toFixed(2)} cm`, padX - 85, padY + guideH / 2);
    };

    animFrameId.current = requestAnimationFrame(render);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [params, results, activeView, isPlaying, animSpeed]);

  // Handle canvas mouse move for interactive probe
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xNorm = Math.max(0, Math.min(1, x / canvas.width));
    const zNorm = Math.max(0, Math.min(1, y / canvas.height));
    const field = getFieldComponents(params, results, xNorm, 0.5, zNorm * 0.15, timeRef.current);
    setHoverInfo({
      xNorm,
      zNorm,
      eMag: field.Emag,
      hMag: field.Hmag,
    });
  };

  const handleCanvasMouseLeave = () => {
    setHoverInfo(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Waveguide Presets */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <span>Laboratorio Experimental</span>
              <span>·</span>
              <span>Motor Físico y Calculador en Tiempo Real</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simulador Interactivo de Guías de Onda
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Modifica en tiempo real la geometría, el dieléctrico, el modo electromagnético y la frecuencia de la fuente para observar la transición crítica de corte y propagación.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Presets Comerciales:</span>
            <button
              onClick={() => applyPreset('WR-90')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              WR-90 (Banda X, 10 GHz)
            </button>
            <button
              onClick={() => applyPreset('WR-62')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              WR-62 (Banda Ku, 15 GHz)
            </button>
            <button
              onClick={() => applyPreset('WR-284')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              WR-284 (Banda S, 3 GHz)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Canvas & Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Student Input Controls (4 columns on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">Panel de Controles del Alumno</h2>
            </div>

            <div className="mt-4 space-y-5">
              {/* 1. Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Modo de Operación Electromagnético:
                </label>
                <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-xl">
                  {(['TE10', 'TE20', 'TE01', 'TM11', 'TM21'] as WaveguideMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setParams((prev) => ({ ...prev, mode: m }))}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        params.mode === m
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {params.mode === 'TE10'
                    ? 'Modo fundamental dominante (menor frecuencia de corte para a > b).'
                    : params.mode.startsWith('TM')
                    ? 'Modo transversal magnético (requiere m ≥ 1 y n ≥ 1).'
                    : 'Modo de orden superior.'}
                </p>
              </div>

              {/* 2. Geometría a y b */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                    <span>Ancho de la Guía (<MathFormula math="a" />):</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {params.a.toFixed(2)} cm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.05"
                    value={params.a}
                    onChange={(e) => setParams((prev) => ({ ...prev, a: parseFloat(e.target.value) }))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1.0 cm</span>
                    <span>5.0 cm</span>
                    <span>10.0 cm</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                    <span>Alto de la Guía (<MathFormula math="b" />):</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {params.b.toFixed(2)} cm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.05"
                    value={params.b}
                    onChange={(e) => setParams((prev) => ({ ...prev, b: parseFloat(e.target.value) }))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0.5 cm</span>
                    <span>2.5 cm</span>
                    <span>5.0 cm</span>
                  </div>
                </div>
              </div>

              {/* 3. Propiedades del Dieléctrico */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                    <span>Permitividad Relativa (<MathFormula math="\epsilon_r" />):</span>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {params.epsR.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={params.epsR}
                    onChange={(e) => setParams((prev) => ({ ...prev, epsR: parseFloat(e.target.value) }))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1.0 (Aire / Vacío)</span>
                    <span>2.1 (Teflón)</span>
                    <span>10.0 (Alúmina)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                    <span>Permeabilidad Relativa (<MathFormula math="\mu_r" />):</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {params.muR.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={params.muR}
                    onChange={(e) => setParams((prev) => ({ ...prev, muR: parseFloat(e.target.value) }))}
                    className="w-full accent-slate-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1.0 (No magnético)</span>
                    <span>5.0 (Ferrita)</span>
                  </div>
                </div>
              </div>

              {/* 4. Frecuencia de la Fuente f y Amplitud E0 */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                    <span>Frecuencia de la Fuente (<MathFormula math="f" />):</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {params.freqGHz.toFixed(2)} GHz
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="30.0"
                    step="0.1"
                    value={params.freqGHz}
                    onChange={(e) => setParams((prev) => ({ ...prev, freqGHz: parseFloat(e.target.value) }))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1.0 GHz</span>
                    <span>15.0 GHz</span>
                    <span>30.0 GHz</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                    <span>Amplitud del Campo (<MathFormula math="E_0" />):</span>
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {params.e0Kvm} kV/m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="3000"
                    step="10"
                    value={params.e0Kvm}
                    onChange={(e) => setParams((prev) => ({ ...prev, e0Kvm: parseInt(e.target.value) }))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>10 kV/m</span>
                    <span>1500 kV/m</span>
                    <span>3000 kV/m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Canvas & Real-Time Output Cards (7 columns on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Animated 2D/3D Canvas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Visualizador Gráfico 60 FPS</h3>
              </div>

              {/* View Selector Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setActiveView('isometric')}
                    className={`px-2.5 py-1.5 rounded-md transition-all ${
                      activeView === 'isometric' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    3D Isométrico
                  </button>
                  <button
                    onClick={() => setActiveView('longitudinal')}
                    className={`px-2.5 py-1.5 rounded-md transition-all ${
                      activeView === 'longitudinal' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Corte Longitudinal (x-z)
                  </button>
                  <button
                    onClick={() => setActiveView('transverse')}
                    className={`px-2.5 py-1.5 rounded-md transition-all ${
                      activeView === 'transverse' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Transversal (x-y)
                  </button>
                </div>

                {/* Play / Pause button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title={isPlaying ? 'Pausar' : 'Reanudar'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative mt-4 rounded-xl overflow-hidden border border-slate-700 shadow-inner">
              <canvas
                ref={canvasRef}
                width={720}
                height={350}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
                className="w-full h-[300px] sm:h-[350px] block cursor-crosshair"
              />

              {/* Interactive inspection badge */}
              {hoverInfo && (
                <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700 space-x-2">
                  <span>
                    Sonda local: <MathFormula math={`|E| \\approx ${(hoverInfo.eMag * params.e0Kvm).toFixed(0)}\\text{ kV/m}`} />
                  </span>
                  <span>·</span>
                  <span>
                    <MathFormula math={`x/a = ${hoverInfo.xNorm.toFixed(2)}`} />
                  </span>
                </div>
              )}
            </div>

            {/* Speed & status footer */}
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 px-1">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Pasa el cursor sobre el lienzo para sondear la amplitud de campo en ese punto.</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Velocidad:</span>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={animSpeed}
                  onChange={(e) => setAnimSpeed(parseFloat(e.target.value))}
                  className="w-20 accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* REAL-TIME CALCULATIONS PANEL */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Panel de Salida y Cálculos en Tiempo Real</h3>
              </div>

              {/* Strict Status Pill */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                  results.isPropagating
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                }`}
              >
                {results.isPropagating ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>🟢 PROPAGACIÓN ACTIVA</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>🔴 ONDA EVANESCENTE / CORTE</span>
                  </>
                )}
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* 1. Frecuencia de Corte fc */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Frecuencia de Corte:</span>
                <div className="mt-1">
                  <MathFormula math={`f_c = ${results.fcGHz.toFixed(3)} \\text{ GHz}`} />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {params.freqGHz > results.fcGHz
                    ? `f > fc (Margen: +${(params.freqGHz - results.fcGHz).toFixed(2)} GHz)`
                    : `f ≤ fc (Por debajo del corte)`}
                </span>
              </div>

              {/* 2. Impedancia de Onda Z */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                  Impedancia de Onda ({results.isTE ? 'Z_TE' : 'Z_TM'}):
                </span>
                <div className="mt-1 font-mono font-bold text-slate-900">
                  {results.isPropagating ? (
                    <MathFormula math={`Z = ${results.zWave.toFixed(1)} \\; \\Omega`} />
                  ) : (
                    <MathFormula math={`Z = j ${results.zWave.toFixed(1)} \\; \\Omega \\; (\\text{Reactivo})`} />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  <MathFormula math={`\\eta = ${results.eta.toFixed(1)} \\; \\Omega`} /> (medio intrínseco)
                </span>
              </div>

              {/* 3. Longitud de Onda Guiada lambda_g */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Longitud de Onda Guiada:</span>
                <div className="mt-1 font-mono font-bold text-slate-900">
                  {results.isPropagating && results.lambdaGMm !== null ? (
                    <MathFormula math={`\\lambda_g = ${results.lambdaGMm.toFixed(2)} \\text{ mm}`} />
                  ) : (
                    <span className="text-rose-600 font-semibold text-xs">No definida (Corte)</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  <MathFormula math={`\\lambda = ${results.lambdaFreeSpaceMm.toFixed(2)} \\text{ mm}`} /> (espacio libre)
                </span>
              </div>

              {/* 4. Velocidad de Fase vp */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Velocidad de Fase (vp):</span>
                <div className="mt-1 font-mono font-bold text-slate-900">
                  {results.isPropagating && results.vp !== null ? (
                    <MathFormula math={`v_p = ${(results.vp / C_LIGHT).toFixed(3)} \\; c`} />
                  ) : (
                    <span className="text-rose-600 font-semibold text-xs">Atenuación pura</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {results.vp ? `${(results.vp / 1e6).toFixed(1)} × 10⁶ m/s` : 'Onda estacionaria atenuada'}
                </span>
              </div>

              {/* 5. Velocidad de Grupo vg */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Velocidad de Grupo (vg):</span>
                <div className="mt-1 font-mono font-bold text-slate-900">
                  {results.isPropagating && results.vg !== null ? (
                    <MathFormula math={`v_g = ${(results.vg / C_LIGHT).toFixed(3)} \\; c`} />
                  ) : (
                    <span className="text-rose-600 font-semibold text-xs">0 m/s (Sin transporte)</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {results.vg ? `${(results.vg / 1e6).toFixed(1)} × 10⁶ m/s` : 'Sin transporte de energía'}
                </span>
              </div>

              {/* 6. Potencia Transmitida P */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Potencia Transmitida (P):</span>
                <div className="mt-1 font-mono font-bold text-slate-900">
                  {results.isPropagating ? (
                    results.powerWatts >= 1000 ? (
                      <MathFormula math={`P = ${(results.powerWatts / 1000).toFixed(2)} \\text{ kW}`} />
                    ) : (
                      <MathFormula math={`P = ${results.powerWatts.toFixed(1)} \\text{ W}`} />
                    )
                  ) : (
                    <MathFormula math={`P = 0.00 \\text{ W}`} />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {results.isPropagating ? 'Flujo neto hacia +z' : 'Potencia reactiva pura'}
                </span>
              </div>
            </div>

            {/* Explanation box on physical state */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              results.isPropagating
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}>
              {results.isPropagating ? (
                <p>
                  <strong>Régimen de Propagación Activo:</strong> La frecuencia de la fuente (<MathFormula math="f = 10.0\text{ GHz}" />) supera la frecuencia de corte <MathFormula math="f_c" />. La onda viaja a lo largo de la guía transportando potencia activa neta. Nótese que <MathFormula math="v_p > u" /> mientras que la velocidad de transporte de energía <MathFormula math="v_g < u" />, satisfaciendo rigurosamente la relación relativista <MathFormula math="v_p \cdot v_g = u^2" />.
                </p>
              ) : (
                <p>
                  <strong>Régimen de Corte (Onda Evanescente):</strong> La frecuencia de excitación (<MathFormula math={`${params.freqGHz.toFixed(2)}\\text{ GHz}`} />) es inferior a la frecuencia de corte <MathFormula math={`f_c = ${results.fcGHz.toFixed(2)}\\text{ GHz}`} />. La constante de fase <MathFormula math="\beta = 0" />, y la onda sufre una atenuación espacial exponencial según <MathFormula math={`e^{-\\alpha z}`} /> con <MathFormula math={`\\alpha = ${results.alphaNpM.toFixed(1)}\\text{ Np/m}`} />. Los campos <MathFormula math="\vec{E}" /> y <MathFormula math="\vec{H}" /> están en cuadratura temporal (desfasados 90°), por lo que la potencia promedio activa transportada es exactamente <strong>0 Watts</strong>.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
