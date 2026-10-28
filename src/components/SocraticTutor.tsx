import React, { useState, useRef, useEffect } from 'react';
import { TutorMessage } from '../types';
import { SOCRATIC_KNOWLEDGE_BASE } from '../data/quizAndTutorData';
import { MathFormula } from './MathFormula';
import { Send, Sparkles, HelpCircle, Bot, User, RotateCcw, Lightbulb, CheckCircle } from 'lucide-react';

export const SocraticTutor: React.FC = () => {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'init-1',
      sender: 'tutor',
      text: '¡Hola! Soy tu Tutor Socrático especializado en Electromagnetismo y Microondas. Mi rol no es darte respuestas directas ni recetas de memoria, sino guiarte paso a paso para que construyas tu propio entendimiento riguroso a partir de las leyes de Maxwell y la física de campos.\n\n¿Qué fenómeno o concepto te gustaría analizar hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [currentTopicIdx, setCurrentTopicIdx] = useState<number | null>(null);
  const [hintStage, setHintStage] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    {
      label: '¿Por qué no puede existir el modo TEM en una guía metálica?',
      query: '¿Por qué no puede existir el modo TEM en una guía metálica de un solo conductor?',
      topicIdx: 0,
    },
    {
      label: '¿Qué pasa si aumento la permitividad del dieléctrico εr?',
      query: '¿Qué pasa si aumento la permitividad del dieléctrico εr dentro de la guía?',
      topicIdx: 1,
    },
    {
      label: '¿Por qué la atenuación se dispara cerca de la frecuencia de corte?',
      query: '¿Por qué la constante de atenuación debida al conductor se dispara al acercarse a la frecuencia de corte?',
      topicIdx: 2,
    },
    {
      label: '¿Por qué la velocidad de fase vp es mayor que c?',
      query: '¿Por qué la velocidad de fase es mayor que la velocidad de la luz y no viola la relatividad?',
      topicIdx: 3,
    },
    {
      label: '¿Cómo influye la conductividad en el Factor Q de una cavidad?',
      query: '¿Cómo influye la conductividad y el efecto skin en el Factor de Calidad Q de una cavidad?',
      topicIdx: 4,
    },
  ];

  const handleSelectQuick = (query: string, topicIdx: number) => {
    handleSendMessage(query, topicIdx);
  };

  const handleSendMessage = (textToSend?: string, forcedTopicIdx?: number) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    // Determine matching knowledge base item
    const lower = text.toLowerCase();
    let matchIdx = forcedTopicIdx !== undefined ? forcedTopicIdx : null;

    if (matchIdx === null) {
      matchIdx = SOCRATIC_KNOWLEDGE_BASE.findIndex((item) =>
        item.keywords.some((kw) => lower.includes(kw))
      );
    }

    setTimeout(() => {
      if (matchIdx !== null && matchIdx !== -1) {
        const topic = SOCRATIC_KNOWLEDGE_BASE[matchIdx];
        setCurrentTopicIdx(matchIdx);
        setHintStage(1);

        const tutorReply: TutorMessage = {
          id: `tutor-${Date.now()}`,
          sender: 'tutor',
          text: `${topic.initialHint}\n\n${topic.followUpQuestion}`,
          math: topic.math,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hintLevel: 1,
        };
        setMessages((prev) => [...prev, tutorReply]);
      } else {
        // Generic Socratic guiding response
        const genericReply: TutorMessage = {
          id: `tutor-${Date.now()}`,
          sender: 'tutor',
          text: `Esa es una observación intrigante sobre "${text}". Antes de concluir, analicemos las condiciones de frontera electromagnéticas: en una pared metálica perfecta conductora, ¿qué condición deben satisfacer las componentes tangenciales del campo eléctrico E y magnético H?\n\n¿Cómo se relaciona esto con la ecuación de Helmholtz y el número de onda de corte kc = sqrt(k² - β²)?`,
          math: '\\vec{E}_{\\text{tangencial}} = 0, \\quad \\hat{n} \\cdot \\vec{B} = 0',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, genericReply]);
      }
    }, 600);
  };

  // Provide progressive hints on active topic
  const handleRequestHint = () => {
    if (currentTopicIdx === null) return;
    const topic = SOCRATIC_KNOWLEDGE_BASE[currentTopicIdx];

    const nextStage = hintStage + 1;
    setHintStage(nextStage);

    let hintText = '';
    if (nextStage === 2) {
      hintText = topic.progressiveHints[0];
    } else if (nextStage === 3) {
      hintText = topic.progressiveHints[1];
    } else {
      hintText = topic.progressiveHints[2];
    }

    const hintMsg: TutorMessage = {
      id: `tutor-hint-${Date.now()}`,
      sender: 'tutor',
      text: hintText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hintLevel: nextStage,
    };

    setMessages((prev) => [...prev, hintMsg]);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'init-1',
        sender: 'tutor',
        text: '¡Conversación reiniciada! Estoy listo para acompañarte en tu razonamiento electromagnético. Selecciona una sugerencia o formula tu hipótesis.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setCurrentTopicIdx(null);
    setHintStage(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Tutor Socrático de Microondas
                </h1>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Método de Mayéutica Activa
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Diálogo interactivo para deducir las leyes de propagación sin respuestas prehechas.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Diálogo</span>
          </button>
        </div>

        {/* Quick Suggestion Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 block mb-2">
            Preguntas y Desafíos Socráticos Frecuentes:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectQuick(q.query, q.topicIdx)}
                className="text-xs bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isTutor = msg.sender === 'tutor';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isTutor ? 'justify-start' : 'justify-end'}`}
              >
                {isTutor && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-xs text-sm leading-relaxed ${
                    isTutor
                      ? 'bg-white text-slate-800 border border-slate-200'
                      : 'bg-blue-600 text-white border border-blue-600 rounded-tr-xs'
                  }`}
                >
                  {isTutor && (
                    <div className="flex items-center justify-between text-[11px] font-semibold text-blue-600 mb-1.5">
                      <span>Tutor Socrático</span>
                      <span className="text-slate-400 font-normal">{msg.timestamp}</span>
                    </div>
                  )}

                  {!isTutor && (
                    <div className="flex items-center justify-between text-[11px] font-semibold text-blue-100 mb-1.5">
                      <span>Tú (Alumno)</span>
                      <span className="text-blue-200 font-normal">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Message body with paragraphs */}
                  <div className="space-y-2 whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* Math formula block if present */}
                  {msg.math && (
                    <div className={`mt-3 p-2.5 rounded-xl border ${
                      isTutor ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-blue-700/60 border-blue-500 text-white'
                    }`}>
                      <MathFormula math={msg.math} block />
                    </div>
                  )}
                </div>

                {!isTutor && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Socratic Hint Progression Bar */}
        {currentTopicIdx !== null && hintStage < 4 && (
          <div className="bg-amber-50/90 border-t border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {hintStage === 1 && '¿Necesitas una pista conceptual sobre las condiciones de frontera?'}
                {hintStage === 2 && 'Pista Nivel 1 desbloqueada. ¿Avanzar a Pista Nivel 2?'}
                {hintStage === 3 && '¿Listo para ver la Conclusión Socrática formal?'}
              </span>
            </div>
            <button
              onClick={handleRequestHint}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md shadow-2xs transition-colors shrink-0"
            >
              {hintStage === 3 ? 'Ver Conclusión' : `Solicitar Pista ${hintStage}`}
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Escribe tu razonamiento, duda o hipótesis física..."
              className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
