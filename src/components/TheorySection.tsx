import React, { useState, useRef, useEffect } from 'react';
import { MathFormula } from './MathFormula';
import { Play, Pause, RotateCcw, ChevronDown, ChevronRight, Layers, Zap, Disc3, Eye } from 'lucide-react';

export const TheorySection: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<'3.4' | '3.5' | '3.6'>('3.4');
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    '3.4-helmholtz': true,
    '3.4-notem': true,
    '3.5-poynting': true,
    '3.5-attenuation': true,
    '3.6-cavity': true,
    '3.6-iris': true,
  });

  // Theory simulation state
  const [demoMode, setDemoMode] = useState<'TE10' | 'TE20' | 'TM11'>('TE10');
  const [viewType, setViewType] = useState<'transverse' | 'longitudinal'>('transverse');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Render 60 FPS theory canvas
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
        timeRef.current += dt * animSpeed * 4;
      }
      const t = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.fillStyle = '#FAFBFC';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;

      // Draw bounding metallic waveguide boundary
      const padX = 40;
      const padY = 35;
      const guideW = width - 2 * padX;
      const guideH = height - 2 * padY;

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 4;
      ctx.strokeRect(padX, padY, guideW, guideH);

      // Wall hatching to show metal
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(padX - 8, padY - 8, guideW + 16, 8); // top
      ctx.fillRect(padX - 8, padY + guideH, guideW + 16, 8); // bottom
      ctx.fillRect(padX - 8, padY, 8, guideH); // left
      ctx.fillRect(padX + guideW, padY, 8, guideH); // right

      if (viewType === 'transverse') {
        // VISTA TRANSVERSAL (X-Y)
        // Draw coordinate axes labels
        ctx.fillStyle = '#475569';
        ctx.font = '11px sans-serif';
        ctx.fillText('x = 0', padX - 5, padY + guideH + 20);
        ctx.fillText('x = a', padX + guideW - 15, padY + guideH + 20);
        ctx.fillText('y = b', padX - 30, padY + 12);
        ctx.fillText('y = 0', padX - 30, padY + guideH);

        // Heatmap for Electric Field (Azul Vivo)
        const resX = 35;
        const resY = 20;
        const cellW = guideW / resX;
        const cellH = guideH / resY;

        for (let i = 0; i < resX; i++) {
          const xNorm = (i + 0.5) / resX;
          for (let j = 0; j < resY; j++) {
            const yNorm = 1 - (j + 0.5) / resY;

            let eVal = 0;
            if (demoMode === 'TE10') {
              eVal = Math.sin(Math.PI * xNorm) * Math.cos(t);
            } else if (demoMode === 'TE20') {
              eVal = Math.sin(2 * Math.PI * xNorm) * Math.cos(t);
            } else if (demoMode === 'TM11') {
              eVal = Math.sin(Math.PI * xNorm) * Math.sin(Math.PI * yNorm) * Math.cos(t);
            }

            const alpha = Math.min(Math.abs(eVal) * 0.75, 0.85);
            ctx.fillStyle = `rgba(0, 102, 255, ${alpha})`;
            ctx.fillRect(padX + i * cellW, padY + j * cellH, cellW + 0.5, cellH + 0.5);
          }
        }

        // Draw Electric Field Vectors (Azul Vivo: #0066FF)
        const eCols = demoMode === 'TE20' ? 12 : 9;
        const eRows = 4;
        for (let i = 1; i < eCols; i++) {
          const xNorm = i / eCols;
          const px = padX + xNorm * guideW;

          for (let j = 1; j <= eRows; j++) {
            const py = padY + (j / (eRows + 1)) * guideH;

            let ey = 0;
            if (demoMode === 'TE10') {
              ey = -Math.sin(Math.PI * xNorm) * Math.cos(t);
            } else if (demoMode === 'TE20') {
              ey = -Math.sin(2 * Math.PI * xNorm) * Math.cos(t);
            } else if (demoMode === 'TM11') {
              const yNorm = 1 - j / (eRows + 1);
              ey = -Math.sin(Math.PI * xNorm) * Math.cos(Math.PI * yNorm) * Math.cos(t);
            }

            const arrowLen = ey * 22;
            if (Math.abs(arrowLen) > 2) {
              ctx.strokeStyle = '#0066FF';
              ctx.fillStyle = '#0066FF';
              ctx.lineWidth = 2;

              ctx.beginPath();
              ctx.moveTo(px, py - arrowLen / 2);
              ctx.lineTo(px, py + arrowLen / 2);
              ctx.stroke();

              // Arrowhead
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

        // Draw Magnetic Field Loops or Indicators (Rojo Vivo: #FF2525)
        ctx.strokeStyle = '#FF2525';
        ctx.fillStyle = '#FF2525';
        ctx.lineWidth = 1.8;

        if (demoMode === 'TE10' || demoMode === 'TE20') {
          // Closed H-loops represented in cross section (transverse components + longitudinal in/out of page)
          const lobes = demoMode === 'TE10' ? 1 : 2;
          for (let l = 0; l < lobes; l++) {
            const centerX = padX + ((l + 0.5) / lobes) * guideW;
            const sign = l % 2 === 0 ? 1 : -1;
            const hzVal = sign * Math.sin(t);

            // Dots (out of page) and Crosses (into page) for H
            const dotX = centerX - guideW / (lobes * 4.2);
            const crossX = centerX + guideW / (lobes * 4.2);
            const centerY = padY + guideH / 2;

            if (Math.abs(hzVal) > 0.15) {
              // Left symbol
              ctx.beginPath();
              ctx.arc(dotX, centerY, 7, 0, Math.PI * 2);
              ctx.stroke();
              if (hzVal > 0) {
                // Dot
                ctx.beginPath();
                ctx.arc(dotX, centerY, 2.5, 0, Math.PI * 2);
                ctx.fill();
              } else {
                // Cross
                ctx.beginPath();
                ctx.moveTo(dotX - 4, centerY - 4);
                ctx.lineTo(dotX + 4, centerY + 4);
                ctx.moveTo(dotX + 4, centerY - 4);
                ctx.lineTo(dotX - 4, centerY + 4);
                ctx.stroke();
              }

              // Right symbol (opposite)
              ctx.beginPath();
              ctx.arc(crossX, centerY, 7, 0, Math.PI * 2);
              ctx.stroke();
              if (hzVal > 0) {
                // Cross
                ctx.beginPath();
                ctx.moveTo(crossX - 4, centerY - 4);
                ctx.lineTo(crossX + 4, centerY + 4);
                ctx.moveTo(crossX + 4, centerY - 4);
                ctx.lineTo(crossX - 4, centerY + 4);
                ctx.stroke();
              } else {
                // Dot
                ctx.beginPath();
                ctx.arc(crossX, centerY, 2.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        } else if (demoMode === 'TM11') {
          // In TM11, H-field forms closed circular loops around Ez peak
          const centerX = padX + guideW / 2;
          const centerY = padY + guideH / 2;
          const hAmp = Math.cos(t);

          if (Math.abs(hAmp) > 0.1) {
            for (let r = 25; r <= 55; r += 15) {
              ctx.beginPath();
              ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
              ctx.stroke();

              // Tangential arrow on loop
              const arrowAngle = hAmp > 0 ? 0 : Math.PI;
              const ax = centerX + Math.cos(arrowAngle) * r;
              const ay = centerY + Math.sin(arrowAngle) * r;
              ctx.beginPath();
              ctx.arc(ax, ay, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      } else {
        // VISTA LONGITUDINAL (Corte X-Z)
        ctx.fillStyle = '#475569';
        ctx.font = '11px sans-serif';
        ctx.fillText('z = 0 (Entrada)', padX + 5, padY + guideH + 20);
        ctx.fillText('z = L (Propagación →)', padX + guideW - 120, padY + guideH + 20);
        ctx.fillText('Pared Conductora (x = a)', padX + 5, padY - 12);
        ctx.fillText('Pared Conductora (x = 0)', padX + 5, padY + guideH + 12);

        // Draw traveling sine wave bouncing between walls
        const wavePts = 120;
        const lambdaZ = guideW / 2.5;
        const betaZ = (2 * Math.PI) / lambdaZ;

        // Wave lines (Azul Vivo: Campo Eléctrico)
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= wavePts; i++) {
          const z = (i / wavePts) * guideW;
          const xPos = padX + z;
          const amp = Math.sin(t - betaZ * z);
          const yPos = padY + guideH / 2 + amp * (guideH * 0.38);
          if (i === 0) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
        }
        ctx.stroke();

        // Magnetic Field closed loops along z (Rojo Vivo)
        const numLoops = 3;
        for (let k = 0; k < numLoops; k++) {
          const zCenter = padX + ((k + 0.5) * lambdaZ + (t * 22) % lambdaZ) % guideW;
          if (zCenter > padX + 20 && zCenter < padX + guideW - 20) {
            ctx.strokeStyle = '#FF2525';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.ellipse(zCenter, padY + guideH / 2, lambdaZ * 0.35, guideH * 0.32, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Direction arrow on H loop
            ctx.fillStyle = '#FF2525';
            ctx.beginPath();
            ctx.arc(zCenter, padY + guideH / 2 - guideH * 0.32, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Legend in top corner
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(padX + 10, padY + 10, 195, 48);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.strokeRect(padX + 10, padY + 10, 195, 48);

      // Blue E line
      ctx.fillStyle = '#0066FF';
      ctx.fillRect(padX + 18, padY + 22, 16, 4);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Campo Eléctrico E (Azul)', padX + 42, padY + 27);

      // Red H line
      ctx.fillStyle = '#FF2525';
      ctx.fillRect(padX + 18, padY + 40, 16, 4);
      ctx.fillStyle = '#0F172A';
      ctx.fillText('Campo Magnético H (Rojo)', padX + 42, padY + 45);

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [demoMode, viewType, isPlaying, animSpeed]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <span>Módulo Académico Teórico</span>
              <span>·</span>
              <span>Leyes de Maxwell y Microondas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Teoría Rigurosa y Visualización Dinámica de Campos
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl">
              Explora con precisión matemática la propagación guiada, los modos de corte, el cálculo de potencia, atenuación pelicular y el comportamiento de cavidades resonantes e iris de acoplamiento.
            </p>
          </div>

          {/* Quick Subtopic Navigation */}
          <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-center">
            <button
              onClick={() => setActiveTopic('3.4')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTopic === '3.4' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3.4 Modos y Propagación
            </button>
            <button
              onClick={() => setActiveTopic('3.5')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTopic === '3.5' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3.5 Potencia y Atenuación
            </button>
            <button
              onClick={() => setActiveTopic('3.6')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTopic === '3.6' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3.6 Cavidades e Iris
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Theory Simulation Canvas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Visualizador de Campos Electromagnéticos en Tiempo Real
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Representación visual a 60 FPS de la densidad y líneas de campo para modos seleccionados.
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Selector */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewType('transverse')}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  viewType === 'transverse' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Corte Transversal (x-y)
              </button>
              <button
                onClick={() => setViewType('longitudinal')}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  viewType === 'longitudinal' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Corte Longitudinal (x-z)
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              {(['TE10', 'TE20', 'TM11'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setDemoMode(m)}
                  className={`px-2 py-1.5 rounded-md transition-all ${
                    demoMode === m ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title={isPlaying ? 'Pausar Animación' : 'Reanudar'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-blue-600" />}
            </button>

            {/* Reset */}
            <button
              onClick={() => {
                timeRef.current = 0;
              }}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Reiniciar Fase"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="relative mt-4 flex justify-center bg-slate-900/5 rounded-xl overflow-hidden border border-slate-200/80">
          <canvas
            ref={canvasRef}
            width={720}
            height={320}
            className="w-full max-w-[760px] h-[300px] sm:h-[340px] block"
          />
        </div>

        {/* Speed Slider */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-3 px-1">
          <span>Velocidad de Oscilación Temporal:</span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-700">{animSpeed.toFixed(1)}x</span>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={animSpeed}
              onChange={(e) => setAnimSpeed(parseFloat(e.target.value))}
              className="w-28 accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* THEMATIC CONTENT ACCORDIONS */}
      {activeTopic === '3.4' && (
        <div className="space-y-4">
          {/* Card 1: Fundamentos y Helmholtz */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleAccordion('3.4-helmholtz')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  3.4.1
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Ecuaciones de Onda de Helmholtz y Modos de Propagación
                  </h3>
                  <p className="text-xs text-slate-500">
                    Derivación a partir de las Ecuaciones de Maxwell armónicas temporales
                  </p>
                </div>
              </div>
              {openAccordions['3.4-helmholtz'] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {openAccordions['3.4-helmholtz'] && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 space-y-4 leading-relaxed">
                <p>
                  A partir de las Ecuaciones de Maxwell en un medio dieléctrico homogéneo, isotrópico y sin pérdidas caracterizado por <MathFormula math="\epsilon" /> y <MathFormula math="\mu" />, los campos eléctrico <MathFormula math="\vec{E}" /> y magnético <MathFormula math="\vec{H}" /> satisfacen las ecuaciones vectoriales de Helmholtz:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-blue-700 block mb-1">Ecuación para Campo Eléctrico:</span>
                    <MathFormula math="\nabla^2 \vec{E} + k^2 \vec{E} = 0" block />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-rose-700 block mb-1">Ecuación para Campo Magnético:</span>
                    <MathFormula math="\nabla^2 \vec{H} + k^2 \vec{H} = 0" block />
                  </div>
                </div>

                <p>
                  Donde el número de onda del medio sin límites es <MathFormula math="k = \omega \sqrt{\mu \epsilon} = \frac{\omega}{u}" />. Asumiendo propagación armónica en la dirección <MathFormula math="+z" /> según <MathFormula math="e^{-j\beta z}" />, el operador Laplaciano tridimensional se descompone en su parte transversal y longitudinal:
                </p>

                <MathFormula math="\nabla^2 = \nabla_t^2 + \frac{\partial^2}{\partial z^2} = \nabla_t^2 - \beta^2" block />

                <p>
                  Definiendo el número de onda de corte transversal <MathFormula math="k_c^2 = k^2 - \beta^2" />, cualquier componente de campo satisface la ecuación de Helmholtz bidimensional:
                </p>

                <MathFormula math="\left(\frac{\partial^2}{\partial x^2} + \frac{\partial^2}{\partial y^2} + k_c^2\right) \psi(x, y) = 0" block />

                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 text-slate-800 text-xs sm:text-sm">
                  <h4 className="font-bold text-blue-900 mb-1">Clasificación Rigurosa de Familias de Modos:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>Modos TE (Transversales Eléctricos):</strong> <MathFormula math="E_z = 0, \; H_z \ne 0" />. Todos los campos se derivan de la componente longitudinal <MathFormula math="H_z(x, y)" /> sujeta a condición de Neumann en las paredes conductoras (<MathFormula math="\partial H_z / \partial n = 0" />).
                    </li>
                    <li>
                      <strong>Modos TM (Transversales Magnéticos):</strong> <MathFormula math="H_z = 0, \; E_z \ne 0" />. Todos los campos se derivan de <MathFormula math="E_z(x, y)" /> sujeta a condición de Dirichlet en las paredes (<MathFormula math="E_z = 0" />).
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Imposibilidad del modo TEM */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleAccordion('3.4-notem')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  3.4.2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Demostración: ¿Por qué NO puede propagarse el modo TEM en un solo conductor hueco?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Teorema de Unicidad de Laplace y Fronteras Conductoras Conexas
                  </p>
                </div>
              </div>
              {openAccordions['3.4-notem'] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {openAccordions['3.4-notem'] && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 space-y-4 leading-relaxed">
                <p>
                  Por definición, en una onda <strong>TEM (Transversal Electromagnética)</strong> tanto <MathFormula math="E_z = 0" /> como <MathFormula math="H_z = 0" /> simultáneamente. Aplicando la Ley de Faraday en el dominio estático transversal:
                </p>

                <MathFormula math="\nabla_t \times \vec{E}_t = -j\omega \mu H_z \hat{z} = 0 \implies \vec{E}_t = -\nabla_t \Phi" block />

                <p>
                  Al no existir fuentes de carga libres en el interior del dieléctrico de la guía (<MathFormula math="\nabla \cdot \vec{D} = 0" />), el potencial electrostático <MathFormula math="\Phi(x, y)" /> debe satisfacer la <strong>Ecuación de Laplace en dos dimensiones</strong>:
                </p>

                <MathFormula math="\nabla_t^2 \Phi(x, y) = \frac{\partial^2 \Phi}{\partial x^2} + \frac{\partial^2 \Phi}{\partial y^2} = 0" block />

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Paso Clave del Teorema de Liouville y Principio del Máximo:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Las paredes metálicas de la guía forman un único conductor conexo continuo cerrado. En régimen estacionario o sinusoidal perfecto, toda la superficie interna del metal es equipotencial: <MathFormula math="\Phi_{\text{pared}} = \Phi_0 = \text{constante}" />.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    El <em>Teorema del Valor Extremo</em> para funciones armónicas dicta que una función que satisface <MathFormula math="\nabla^2 \Phi = 0" /> en una región cerrada y acotada solo puede alcanzar sus valores máximo y mínimo en la frontera exterior. Dado que la frontera completa tiene el mismo valor <MathFormula math="\Phi_0" />, el potencial debe ser estrictamente uniforme en todo el volumen interior:
                  </p>
                  <MathFormula math="\Phi(x, y) = \Phi_0 \implies \vec{E}_t = -\nabla_t \Phi \equiv 0" block />
                  <p className="text-xs font-semibold text-rose-700">
                    Conclusión definitiva: El campo eléctrico transversal es forzosamente cero. No puede existir ningún campo electromagnético TEM sin al menos dos conductores aislados (como una línea coaxial o bifilar).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTopic === '3.5' && (
        <div className="space-y-4">
          {/* Card 3: Potencia y Poynting */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleAccordion('3.5-poynting')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  3.5.1
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Vector de Poynting y Flujo de Potencia Transmitida
                  </h3>
                  <p className="text-xs text-slate-500">
                    Integración sobre la sección transversal y cálculo de potencia activa media
                  </p>
                </div>
              </div>
              {openAccordions['3.5-poynting'] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {openAccordions['3.5-poynting'] && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 space-y-4 leading-relaxed">
                <p>
                  El transporte de energía electromagnética a lo largo de la guía se calcula mediante el valor medio temporal del <strong>Vector de Poynting</strong>:
                </p>

                <MathFormula math="\langle \vec{S} \rangle = \frac{1}{2} \text{Re}\left(\vec{E} \times \vec{H}^*\right)" block />

                <p>
                  Para una onda propagándose hacia <MathFormula math="+z" />, la potencia activa media total <MathFormula math="P_{\text{avg}}" /> que fluye a través de la sección rectangular <MathFormula math="S = [0, a] \times [0, b]" /> es:
                </p>

                <MathFormula math="P_{\text{avg}} = \int_0^b \int_0^a \langle \vec{S} \rangle \cdot \hat{z} \, dx dy = \frac{1}{2} \int_0^b \int_0^a \text{Re}\left(E_x H_y^* - E_y H_x^*\right) dx dy" block />

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider">
                    Potencia para el Modo Fundamental <MathFormula math="TE_{10}" />:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Para <MathFormula math="TE_{10}" />, <MathFormula math="E_x = 0" /> y <MathFormula math="E_y = -E_0 \sin\left(\frac{\pi x}{a}\right)" />, con <MathFormula math="H_x = -\frac{E_y}{Z_{TE}}" />. Sustituyendo:
                  </p>
                  <MathFormula math="P_{\text{avg}} = \frac{1}{2 Z_{TE}} \int_0^b dy \int_0^a E_0^2 \sin^2\left(\frac{\pi x}{a}\right) dx = \frac{|E_0|^2 \cdot a \cdot b}{4 Z_{TE}}" block />
                  <p className="text-xs text-slate-500 mt-2">
                    Nótese que si <MathFormula math="f \le f_c" />, la impedancia <MathFormula math="Z_{TE}" /> es puramente imaginaria (<MathFormula math="\text{Re}(Z_{TE}) = 0" />), por lo que <MathFormula math="P_{\text{avg}} = 0 \text{ W}" /> (onda puramente reactiva).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Atenuación y efecto skin */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleAccordion('3.5-attenuation')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                  3.5.2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Atenuación: Pérdidas Conductoras, Dieléctricas y Efecto Pelicular
                  </h3>
                  <p className="text-xs text-slate-500">
                    Resistencia superficial Rs, profundidad de penetración y comportamiento asintótico en el corte
                  </p>
                </div>
              </div>
              {openAccordions['3.5-attenuation'] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {openAccordions['3.5-attenuation'] && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 space-y-4 leading-relaxed">
                <p>
                  En una guía real con paredes metálicas de conductividad finita <MathFormula math="\sigma" /> y dieléctrico con tangente de pérdidas <MathFormula math="\tan\delta" />, la constante de atenuación total es <MathFormula math="\alpha = \alpha_d + \alpha_c" />.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-900 block mb-1">
                      1. Pérdidas en Dieléctrico (<MathFormula math="\alpha_d" />):
                    </span>
                    <MathFormula math="\alpha_d = \frac{k^2 \tan\delta}{2\beta} = \frac{k \tan\delta}{2\sqrt{1 - (f_c/f)^2}} \quad [\text{Np/m}]" block />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-900 block mb-1">
                      2. Resistencia Superficial (<MathFormula math="R_s" />) y Skin Depth (<MathFormula math="\delta_s" />):
                    </span>
                    <MathFormula math="\delta_s = \sqrt{\frac{1}{\pi f \mu_0 \sigma}}, \quad R_s = \frac{1}{\sigma \delta_s} = \sqrt{\frac{\pi f \mu_0}{\sigma}}" block />
                  </div>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider mb-1">
                    Comportamiento Crítico en el Corte (<MathFormula math="f \to f_c^+" />):
                  </h4>
                  <p className="text-xs text-rose-800">
                    La fórmula para las pérdidas en el conductor del modo <MathFormula math="TE_{10}" /> es:
                  </p>
                  <MathFormula math="\alpha_c = \frac{R_s}{b \, \eta \sqrt{1 - (f_c/f)^2}} \left[ 1 + \frac{2b}{a} \left(\frac{f_c}{f}\right)^2 \right]" block />
                  <p className="text-xs text-rose-800 mt-2">
                    Cuando la frecuencia se aproxima a la frecuencia de corte <MathFormula math="f \to f_c" />, el denominador tiende a cero, provocando que <MathFormula math="\alpha_c \to \infty" />. Físicamente, las ondas rebotan prácticamente a 90° respecto al eje longitudinal, multiplicando las reflexiones por unidad de longitud y generando corrientes superficiales gigantescas en las paredes metálicas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTopic === '3.6' && (
        <div className="space-y-4">
          {/* Card 5: Cavidades Resonantes */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleAccordion('3.6-cavity')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  3.6.1
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Cavidades Resonantes Rectangulares y Factor de Calidad Q
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cierre metálico en z = 0 y z = d, modos tridimensionales TE_mnp y factor de mérito
                  </p>
                </div>
              </div>
              {openAccordions['3.6-cavity'] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {openAccordions['3.6-cavity'] && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 space-y-4 leading-relaxed">
                <p>
                  Una cavidad resonante rectangular se forma cerrando una sección de guía de dimensiones <MathFormula math="a \times b" /> con paredes conductoras en <MathFormula math="z = 0" /> y <MathFormula math="z = d" />. Para satisfacer las condiciones de frontera de campo tangencial nulo en las 6 paredes metálicas, la dimensión longitudinal debe ser un múltiplo entero de media longitud de onda guiada: <MathFormula math="d = p \frac{\lambda_g}{2}" /> con <MathFormula math="p = 1, 2, 3 \dots" />
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-indigo-700 block mb-1">
                    Frecuencia de Resonancia Tri-índice (<MathFormula math="f_{r,mnp}" />):
                  </span>
                  <MathFormula math="f_{r,mnp} = \frac{u}{2} \sqrt{\left(\frac{m}{a}\right)^2 + \left(\frac{n}{b}\right)^2 + \left(\frac{p}{d}\right)^2}" block />
                  <p className="text-xs text-slate-500 mt-2">
                    Si <MathFormula math="d > a > b" />, el modo resonante dominante es el <MathFormula math="TE_{101}" />, cuya frecuencia es <MathFormula math="f_{r,101} = \frac{u}{2}\sqrt{\frac{1}{a^2} + \frac{1}{d^2}}" />.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-indigo-700 block mb-1">
                    Factor de Calidad Energético (<MathFormula math="Q" />):
                  </span>
                  <MathFormula math="Q = \omega_0 \frac{W_{\text{almacenada}}}{P_{\text{disipada}}} = \omega_0 \frac{W_e + W_m}{P_c + P_d}" block />
                  <p className="text-xs text-slate-600 mt-1">
                    En la frecuencia de resonancia <MathFormula math="\omega_0" />, la energía almacenada eléctrica y magnética son exactamente iguales (<MathFormula math="W_e = W_m" />). En cavidades de cobre pulido a microondas, los valores de <MathFormula math="Q" /> alcanzan típicamente entre <strong>5,000 y 35,000</strong>, superando por varios órdenes de magnitud a los circuitos resonantes LC concentrados tradicionales.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card 6: Iris Inductivos y Capacitivos */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleAccordion('3.6-iris')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs">
                  3.6.2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Diafragmas e Iris Reactivos en Guías de Onda
                  </h3>
                  <p className="text-xs text-slate-500">
                    Elementos discontinuos inductivos, capacitivos y resonantes para diseño de filtros
                  </p>
                </div>
              </div>
              {openAccordions['3.6-iris'] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {openAccordions['3.6-iris'] && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 space-y-4 leading-relaxed">
                <p>
                  Un <strong>iris</strong> es un diafragma o placa metálica delgada colocada transversalmente dentro de la guía con una abertura central o lateral. Actúa como una discontinuidad reactiva que perturba localmente los campos electromagnéticos:
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Inductive Iris */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 mb-2">
                        <Zap className="w-4 h-4" />
                        <span>Iris Inductivo</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">
                        Bordes metálicos paralelos a <MathFormula math="\vec{E}" /> (postes verticales en x).
                      </p>
                      <MathFormula math="B_L < 0" block />
                      <p className="text-xs text-slate-500">
                        Almacena exceso de energía magnética en los bordes. Se modela como un <strong>inductor en paralelo</strong> en la línea de transmisión equivalente.
                      </p>
                    </div>
                  </div>

                  {/* Capacitive Iris */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-2">
                        <Disc3 className="w-4 h-4" />
                        <span>Iris Capacitivo</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">
                        Bordes metálicos perpendiculares a <MathFormula math="\vec{E}" /> (diafragmas horizontales en y).
                      </p>
                      <MathFormula math="B_C > 0" block />
                      <p className="text-xs text-slate-500">
                        Acumula carga electrostática en la ranura estrecha, incrementando la energía eléctrica. Se modela como un <strong>capacitor en paralelo</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Resonant Iris */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                        <Layers className="w-4 h-4" />
                        <span>Iris Resonante</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">
                        Abertura rectangular u ovalada que combina bordes horizontales y verticales.
                      </p>
                      <MathFormula math="B = B_C + B_L = 0" block />
                      <p className="text-xs text-slate-500">
                        A la frecuencia de resonancia se comporta como un circuito LC tanque resonante en paralelo, logrando transmisión casi total (ventana transparente).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
