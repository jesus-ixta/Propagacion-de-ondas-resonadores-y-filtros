import React, { useState, useMemo, useRef } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizAndTutorData';
import { MathFormula } from './MathFormula';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle,
  XCircle,
  FileDown,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  User,
  AlertCircle,
  Printer,
  Sparkles,
} from 'lucide-react';

interface QuizCertificateSectionProps {
  studentName: string;
  setStudentName: (name: string) => void;
  onReturnToLab: () => void;
}

export const QuizCertificateSection: React.FC<QuizCertificateSectionProps> = ({
  studentName,
  setStudentName,
  onReturnToLab,
}) => {
  // Input name validation
  const [nameInput, setNameInput] = useState<string>(studentName);
  const [isNameConfirmed, setIsNameConfirmed] = useState<boolean>(!!studentName.trim());
  const [nameError, setNameError] = useState<string>('');

  // Selected answers: { [questionId: number]: optionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [scorePercentage, setScorePercentage] = useState<number>(0);
  const [numCorrect, setNumCorrect] = useState<number>(0);

  // Diploma ref for PDF export
  const certificateRef = useRef<HTMLDivElement | null>(null);

  // Shuffle options dynamically on first render or retry so correct answers are distributed across all letters
  const [seed, setSeed] = useState<number>(1);
  const questions = useMemo(() => {
    return QUIZ_QUESTIONS.map((q) => {
      const correctText = q.options[q.correctIndex];
      const shuffledOptions = [...q.options];
      // Fisher-Yates shuffle algorithm for options
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      return {
        ...q,
        options: shuffledOptions,
        correctIndex: shuffledOptions.indexOf(correctText),
      };
    });
  }, [seed]);

  const handleConfirmName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setNameError('Por favor introduce tu nombre y apellidos para registrar la evaluación.');
      return;
    }
    setNameError('');
    setStudentName(nameInput.trim());
    setIsNameConfirmed(true);
  };

  const handleSelectAnswer = (qId: number, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    setNumCorrect(correctCount);
    setScorePercentage(percentage);
    setIsSubmitted(true);

    if (percentage >= 80) {
      // Fire celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0066FF', '#D97706', '#10B981', '#6366F1'],
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScorePercentage(0);
    setNumCorrect(0);
    setSeed((prev) => prev + 1);
  };

  // Generate dynamic verification code
  const verificationHash = useMemo(() => {
    const input = `${studentName}-${scorePercentage}-${new Date().toISOString().slice(0, 10)}-STEM-WAVEGUIDE-AUTH`;
    let hash = 0x811c9dc5;
    const bytes: number[] = [];
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
      bytes.push(Math.abs(hash % 256));
    }
    let hex = '';
    for (let i = 0; i < 32; i++) {
      const val = (bytes[i % bytes.length] ^ (i * 19 + 7)) & 0xff;
      hex += val.toString(16).padStart(2, '0');
    }
    return hex.toUpperCase();
  }, [studentName, scorePercentage]);

  // Export to PDF using html2pdf.js CDN
  const handleDownloadPDF = () => {
    const element = certificateRef.current;
    if (!element) return;

    // Check if html2pdf is available on window
    const win = window as any;
    if (win.html2pdf) {
      const safeName = studentName.trim().replace(/[^a-zA-Z0-9]/g, '_');
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Constancia_Guias_de_Onda_${safeName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.5, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      };
      win.html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  };

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <span>Evaluación de Competencias</span>
              <span>·</span>
              <span>15 Reactivos Teórico-Prácticos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Evaluación y Generación de Constancia Digital
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Valida tu dominio sobre propagación de ondas, potencia activa, atenuación pelicular y cavidades resonantes. Obtén 80% o más para expedir tu constancia formal verificable.
            </p>
          </div>

          <button
            onClick={onReturnToLab}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors self-start sm:self-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Regresar al Laboratorio Virtual</span>
          </button>
        </div>
      </div>

      {/* 2. Registration Step: Full Student Name */}
      {!isNameConfirmed ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-center text-slate-900">
            Registro Obligatorio del Alumno
          </h2>
          <p className="text-xs text-center text-slate-500 mt-1 mb-6">
            Ingresa tu nombre y apellidos completos exactamente como deberán aparecer impresos en tu constancia oficial de acreditación.
          </p>

          <form onSubmit={handleConfirmName} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nombre Completo del Alumno:
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (nameError) setNameError('');
                }}
                placeholder="Ej. Ing. Carlos Alberto Mendoza Ríos"
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900"
              />
              {nameError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Comenzar Examen de 15 Preguntas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Active Student Bar */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl px-5 py-3 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span>
                Alumno Registrado: <strong className="text-slate-900 font-bold">{studentName}</strong>
              </span>
            </div>
            {!isSubmitted && (
              <button
                onClick={() => setIsNameConfirmed(false)}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Modificar Nombre
              </button>
            )}
          </div>

          {/* 3. Quiz Results Summary if submitted */}
          {isSubmitted && (
            <div
              className={`border rounded-2xl p-6 sm:p-8 shadow-xs ${
                scorePercentage >= 80
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-rose-50/70 border-rose-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
                      scorePercentage >= 80
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {scorePercentage >= 80 ? (
                      <Award className="w-8 h-8" />
                    ) : (
                      <AlertCircle className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Resultado de Evaluación
                    </span>
                    <h2 className="text-2xl font-black text-slate-900">
                      Calificación Obtenida: {scorePercentage}% ({numCorrect} de {questions.length} reactivos)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      {scorePercentage >= 80
                        ? '¡Aprobación Sobresaliente! Has demostrado dominio práctico y teórico riguroso. Tu constancia oficial ha sido generada abajo.'
                        : 'Calificación inferior al mínimo aprobatorio del 80%. Revisa los detalles de cada reactivo abajo y vuelve a intentar.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {scorePercentage >= 80 ? (
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Descargar PDF</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleRetryQuiz}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reintentar Examen</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. DIGITAL CERTIFICATE (Only rendered if score >= 80% and isSubmitted) */}
          {isSubmitted && scorePercentage >= 80 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-lg">
                    Constancia Oficial de Aprobación y Dominio Práctico
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Descargar PDF (1 Clic)</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* DIPLOMA CONTAINER (Landscape A4 proportion) */}
              <div className="p-2 sm:p-4 bg-slate-200/60 rounded-2xl overflow-x-auto shadow-inner">
                <div
                  ref={certificateRef}
                  id="certificate-print-area"
                  className="w-full min-w-[760px] max-w-[900px] mx-auto bg-white aspect-[1.414/1] p-10 sm:p-14 relative rounded-lg shadow-xl border-8 border-slate-900 text-slate-900 flex flex-col justify-between"
                  style={{
                    boxSizing: 'border-box',
                    backgroundImage: 'radial-gradient(circle at center, #FFFFFF 0%, #FAFAFA 100%)',
                  }}
                >
                  {/* Decorative Double Gold Perimeter Border */}
                  <div className="absolute inset-2 sm:inset-3 border-2 border-amber-600/60 pointer-events-none" />
                  <div className="absolute inset-3 sm:inset-4 border border-blue-900/30 pointer-events-none" />

                  {/* Corner Ornaments */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

                  {/* Top Certificate Header */}
                  <div className="text-center relative z-10">
                    {/* Simulated Institutional SVG Crest */}
                    <div className="mx-auto w-16 h-16 mb-2 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-xs">
                        <circle cx="50" cy="50" r="46" fill="#0F172A" stroke="#D97706" strokeWidth="3" />
                        <circle cx="50" cy="50" r="38" fill="#1E293B" stroke="#0066FF" strokeWidth="1.5" strokeDasharray="3 3" />
                        {/* Antenna and Waveguide Icon */}
                        <path d="M 30 70 L 50 30 L 70 70 Z" fill="none" stroke="#D97706" strokeWidth="3" strokeLinejoin="round" />
                        <line x1="50" y1="30" x2="50" y2="70" stroke="#0066FF" strokeWidth="2.5" />
                        {/* Radiating Waves */}
                        <path d="M 40 25 A 12 12 0 0 1 60 25" fill="none" stroke="#60A5FA" strokeWidth="2" />
                        <path d="M 33 20 A 20 20 0 0 1 67 20" fill="none" stroke="#93C5FD" strokeWidth="2" />
                        <circle cx="50" cy="30" r="3" fill="#D97706" />
                      </svg>
                    </div>

                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-slate-500 block">
                      Laboratorio Nacional de Microondas y Electromagnetismo Aplicado
                    </span>
                    <h2
                      className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-wide text-slate-900 mt-1"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      Constancia de Aprobación y Dominio Práctico
                    </h2>
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-2" />
                  </div>

                  {/* Body Content */}
                  <div className="text-center my-auto py-4 relative z-10 space-y-3">
                    <p className="text-xs sm:text-sm text-slate-600 italic">
                      Por medio de la presente se certifica con rigor académico que:
                    </p>

                    {/* Student Name */}
                    <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-blue-950 tracking-tight underline decoration-amber-500/50 decoration-2 underline-offset-8">
                      {studentName}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto pt-2 leading-relaxed">
                      Ha demostrado aprovechamiento sobresaliente obteniendo una puntuación oficial de{' '}
                      <strong className="text-slate-950 font-black">{scorePercentage}%</strong> en el programa de formación avanzada:
                    </p>

                    <div className="text-sm sm:text-base md:text-lg font-bold text-slate-900 uppercase tracking-wide bg-slate-50/80 py-1.5 px-4 rounded-md border border-slate-200 inline-block">
                      Propagación, Potencia y Filtros en Guías de Onda Electromagnéticas
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-500 max-w-lg mx-auto">
                      Acreditando competencias en ecuaciones de Helmholtz, modos de corte TE/TM, integración del Vector de Poynting, atenuación pelicular y factor Q en cavidades resonantes.
                    </p>
                  </div>

                  {/* Signatures & Dynamic Verification Footer */}
                  <div className="pt-4 border-t border-slate-200/80 relative z-10 flex items-end justify-between text-left">
                    {/* Left: Verification Hash and Date */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-700">Verificación Criptográfica:</span>
                      </div>
                      <div className="font-mono text-[9px] text-slate-500 tracking-wider max-w-[240px] truncate bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {verificationHash}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Fecha de Expedición: <strong>{formattedDate}</strong>
                      </span>
                    </div>

                    {/* Right: Simulated Digital Signature */}
                    <div className="text-center space-y-1">
                      <div className="font-serif italic text-lg sm:text-xl text-blue-900 font-bold tracking-tight select-none">
                        Dr. M. A. Hertz & Dr. J. C. Maxwell
                      </div>
                      <div className="w-48 h-0.5 bg-slate-400 mx-auto" />
                      <div className="text-[10px] uppercase font-bold text-slate-700 tracking-wider">
                        Comité Académico de Electromagnetismo
                      </div>
                      <div className="text-[9px] text-slate-400">
                        Firma Digitalizada Verificada por Hash SHA-256
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation button to return to the virtual lab */}
              <div className="text-center pt-2">
                <button
                  onClick={onReturnToLab}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>🔄 Regresar al Laboratorio Virtual</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. 15-Question Interactive Exam Paper */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Cuestionario de Evaluación (15 Reactivos)
                </h3>
                <p className="text-xs text-slate-500">
                  Selecciona la opción correcta en cada planteamiento. Se requiere un mínimo de 12 aciertos (80%) para acreditar.
                </p>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Progreso:{' '}
                <strong className="text-slate-900">
                  {Object.keys(selectedAnswers).length} / {questions.length}
                </strong>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const userChoice = selectedAnswers[q.id];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isSubmitted
                        ? isCorrect
                          ? 'bg-emerald-50/40 border-emerald-300'
                          : 'bg-rose-50/40 border-rose-300'
                        : userChoice !== undefined
                        ? 'bg-slate-50/70 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">
                          {q.topicTitle}
                        </span>
                      </div>
                      {isSubmitted && (
                        <div>
                          {isCorrect ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <CheckCircle className="w-4 h-4" />
                              <span>Correcto (+1)</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-rose-700">
                              <XCircle className="w-4 h-4" />
                              <span>Incorrecto</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Question Text */}
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h4>

                    {/* Math equation hint if available */}
                    {q.mathExplanation && (
                      <div className="my-2 bg-slate-100/70 py-1.5 px-3 rounded-lg border border-slate-200/80 inline-block text-xs">
                        <MathFormula math={q.mathExplanation} />
                      </div>
                    )}

                    {/* Options list */}
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userChoice === optIdx;
                        const isThisCorrect = optIdx === q.correctIndex;

                        let optStyle = 'border-slate-200 hover:bg-slate-50 text-slate-700';
                        if (isSubmitted) {
                          if (isThisCorrect) {
                            optStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-semibold';
                          } else if (isSelected && !isThisCorrect) {
                            optStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-semibold';
                          } else {
                            optStyle = 'border-slate-200 opacity-60 text-slate-500';
                          }
                        } else if (isSelected) {
                          optStyle = 'bg-blue-50 border-blue-500 text-blue-950 font-semibold ring-1 ring-blue-500';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${optStyle}`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                isSubmitted && isThisCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : isSubmitted && isSelected
                                  ? 'bg-rose-600 text-white'
                                  : isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Rationale feedback after submit */}
                    {isSubmitted && (
                      <div className="mt-3 p-3 bg-white/90 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 block mb-0.5 font-bold">
                          Justificación Física:
                        </strong>
                        {q.rationale}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Submit / Retry Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                {!isSubmitted && (
                  <>
                    Preguntas respondidas:{' '}
                    <strong>
                      {Object.keys(selectedAnswers).length} de {questions.length}
                    </strong>
                    {!allAnswered && ' (Completa todas para enviar)'}
                  </>
                )}
              </span>

              {!isSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Calificar Examen y Generar Resultados</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRetryQuiz}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reintentar Examen</span>
                  </button>
                  {scorePercentage >= 80 && (
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Descargar Constancia</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
