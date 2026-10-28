/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, TabKey } from './components/Navbar';
import { TheorySection } from './components/TheorySection';
import { LabSection } from './components/LabSection';
import { SocraticTutor } from './components/SocraticTutor';
import { QuizCertificateSection } from './components/QuizCertificateSection';
import { Radio, BookOpen, MessageSquare, Award, Waves, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('lab');
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('waveguide_student_name') || '';
  });

  useEffect(() => {
    if (studentName) {
      localStorage.setItem('waveguide_student_name', studentName);
    }
  }, [studentName]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        studentName={studentName}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'theory' && <TheorySection />}
        {activeTab === 'lab' && <LabSection />}
        {activeTab === 'tutor' && <SocraticTutor />}
        {activeTab === 'quiz' && (
          <QuizCertificateSection
            studentName={studentName}
            setStudentName={setStudentName}
            onReturnToLab={() => {
              setActiveTab('lab');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Academic Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                Plataforma de Simulación y Laboratorio de Guías de Onda
              </p>
              <p className="text-[11px] text-slate-400">
                Ingeniería en Telecomunicaciones, Microondas y Electromagnetismo Aplicado
              </p>
            </div>
          </div>

          {/* Quick tab jumps in footer */}
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => {
                setActiveTab('theory');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-blue-600 transition-colors"
            >
              1. Teoría
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setActiveTab('lab');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-blue-600 transition-colors"
            >
              2. Laboratorio
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setActiveTab('tutor');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-blue-600 transition-colors"
            >
              3. Tutor Socrático
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setActiveTab('quiz');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-blue-600 transition-colors"
            >
              4. Evaluación
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Código de colores: Azul Vivo (<span className="text-blue-600 font-semibold">Campo E</span>) y Rojo Vivo (<span className="text-rose-600 font-semibold">Campo H</span>)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
