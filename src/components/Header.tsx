import React from 'react';
import { FlaskConical, Sun, Moon, Sparkles, Activity } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-indigo-950 text-white border-b border-indigo-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Credit Title */}
        <div 
          onClick={() => setActiveTab('calculators')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-all">
            <FlaskConical className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Sir AR Mahar
              </h1>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest bg-indigo-900/80 px-2 py-0.5 rounded border border-indigo-700/60">
                Chemistry Pro v2.5
              </span>
              <span className="hidden md:flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <p className="text-[11px] font-medium text-indigo-300/80 flex items-center gap-1.5">
              <span>pH & Solution Analytics Engine</span>
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* AI Tutor Quick Launcher */}
          <button
            onClick={() => setActiveTab('ai_tutor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ai_tutor'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden xs:inline">AI Tutor</span>
          </button>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-200" />}
          </button>
        </div>

      </div>
    </header>
  );
};
