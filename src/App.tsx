import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { PhPohCalculator } from './components/Calculators/PhPohCalculator';
import { MolarityCalculator } from './components/Calculators/MolarityCalculator';
import { MolalityCalculator } from './components/Calculators/MolalityCalculator';
import { DilutionCalculator } from './components/Calculators/DilutionCalculator';
import { AIAssistant } from './components/AIAssistant';
import { PeriodicTable } from './components/PeriodicTable';
import { FormulaSheet } from './components/FormulaSheet';
import { UnitConverter } from './components/UnitConverter';
import { PhScaleDiagram } from './components/PhScaleDiagram';
import { HistoryAndFavorites } from './components/HistoryAndFavorites';
import { CalculationResult } from './types';
import { FlaskConical, Calculator, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('chem_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [activeTab, setActiveTab] = useState<string>('calculators');
  const [calcSubTab, setCalcSubTab] = useState<'ph_poh' | 'molarity' | 'molality' | 'dilution'>('ph_poh');

  // History & Favorites persistence
  const [history, setHistory] = useState<CalculationResult[]>(() => {
    try {
      const saved = localStorage.getItem('chem_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<CalculationResult[]>(() => {
    try {
      const saved = localStorage.getItem('chem_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('chem_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('chem_history', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('chem_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSaveResult = (result: CalculationResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== result.id);
      return [result, ...filtered];
    });
  };

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  const toggleFavorite = (result: CalculationResult) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === result.id);
      if (exists) {
        return prev.filter((f) => f.id !== result.id);
      } else {
        return [{ ...result, isFavorite: true }, ...prev];
      }
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={darkMode ? 'dark bg-slate-950 min-h-screen text-slate-100 flex flex-col font-sans transition-colors' : 'bg-slate-50 min-h-screen text-slate-900 flex flex-col font-sans transition-colors'}>
      
      {/* Top Bar Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TAB 1: Calculators */}
        {activeTab === 'calculators' && (
          <div className="space-y-6">
            
            {/* Calculator Sub-Navigation */}
            <div className="flex bg-indigo-950/90 p-1.5 rounded-xl border border-indigo-800 shadow-xs max-w-2xl mx-auto text-white">
              <button
                onClick={() => setCalcSubTab('ph_poh')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  calcSubTab === 'ph_poh'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-900/60'
                }`}
              >
                pH & pOH Calculator
              </button>
              <button
                onClick={() => setCalcSubTab('molarity')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  calcSubTab === 'molarity'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-900/60'
                }`}
              >
                Molarity (M)
              </button>
              <button
                onClick={() => setCalcSubTab('molality')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  calcSubTab === 'molality'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-900/60'
                }`}
              >
                Molality (m)
              </button>
              <button
                onClick={() => setCalcSubTab('dilution')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  calcSubTab === 'dilution'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-900/60'
                }`}
              >
                Dilution (M₁V₁=M₂V₂)
              </button>
            </div>

            {/* Render Selected Calculator */}
            {calcSubTab === 'ph_poh' && (
              <PhPohCalculator
                onSaveResult={handleSaveResult}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
              />
            )}

            {calcSubTab === 'molarity' && (
              <MolarityCalculator
                onSaveResult={handleSaveResult}
                toggleFavorite={toggleFavorite}
              />
            )}

            {calcSubTab === 'molality' && (
              <MolalityCalculator
                onSaveResult={handleSaveResult}
                toggleFavorite={toggleFavorite}
              />
            )}

            {calcSubTab === 'dilution' && (
              <DilutionCalculator
                onSaveResult={handleSaveResult}
                toggleFavorite={toggleFavorite}
              />
            )}

          </div>
        )}

        {/* TAB 2: AI Chemistry Assistant */}
        {activeTab === 'ai_tutor' && <AIAssistant />}

        {/* TAB 3: Periodic Table */}
        {activeTab === 'periodic_table' && <PeriodicTable />}

        {/* TAB 4: Formula Sheet */}
        {activeTab === 'formulas' && <FormulaSheet />}

        {/* TAB 5: Unit Converter */}
        {activeTab === 'unit_converter' && <UnitConverter />}

        {/* TAB 6: pH Scale Spectrum */}
        {activeTab === 'ph_diagram' && <PhScaleDiagram />}

        {/* TAB 7: History & Favorites */}
        {activeTab === 'history' && (
          <HistoryAndFavorites
            history={history}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            clearHistory={clearHistory}
            deleteItem={deleteHistoryItem}
          />
        )}

      </main>

      {/* Footer / Status Bar */}
      <footer className="mt-auto bg-slate-900 border-t border-slate-800 py-3 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              System Active
            </span>
            <span className="text-slate-600">|</span>
            <span>Standard Temp: 25°C</span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="hidden md:inline">Kw: 1.008 × 10⁻¹⁴</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Chemistry Solution Engine</span>
            <span className="text-indigo-400 font-sans font-bold">Sir AR Mahar © 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
