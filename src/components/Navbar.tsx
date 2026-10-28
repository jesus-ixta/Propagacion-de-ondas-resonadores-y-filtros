import React from 'react';
import { BookOpen, Radio, MessageSquareCode, Award, Waves } from 'lucide-react';

export type TabKey = 'theory' | 'lab' | 'tutor' | 'quiz';

interface NavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  studentName?: string;
  isPassed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  studentName,
  isPassed,
}) => {
  const tabs = [
    {
      id: 'theory' as TabKey,
      label: '1. Teoría y Visualización',
      icon: BookOpen,
      badge: 'Temas 3.4 - 3.6',
    },
    {
      id: 'lab' as TabKey,
      label: '2. Laboratorio Virtual',
      icon: Radio,
      badge: 'Simulación 60 FPS',
    },
    {
      id: 'tutor' as TabKey,
      label: '3. Tutor Socrático',
      icon: MessageSquareCode,
      badge: 'Diálogo Guiado',
    },
    {
      id: 'quiz' as TabKey,
      label: '4. Evaluación y Constancia',
      icon: Award,
      badge: isPassed ? 'Aprobado ✓' : '15 Reactivos',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-500/30">
              <Waves className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  Guías de Onda Electromagnéticas
                </span>
                <span className="hidden md:inline-flex text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  STEM Lab v2.5
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Simulador Dinámico de Modos TE/TM, Potencia y Cavidades Resonantes
              </p>
            </div>
          </div>

          {/* User info if available */}
          {studentName && (
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-slate-400">Alumno:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                {studentName}
              </span>
              {isPassed && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Constancia Disponible" />
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar border-t border-slate-100 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                    isActive
                      ? 'bg-blue-700/60 text-blue-100'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
