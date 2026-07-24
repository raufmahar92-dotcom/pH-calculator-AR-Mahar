import React from 'react';
import { 
  Calculator, 
  Sparkles, 
  Atom, 
  BookOpen, 
  ArrowLeftRight, 
  Activity, 
  History 
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
}) => {
  const tabs = [
    { id: 'calculators', label: 'Calculators', icon: Calculator, badge: 'Core' },
    { id: 'ai_tutor', label: 'AI Tutor', icon: Sparkles, highlight: true },
    { id: 'periodic_table', label: 'Periodic Table', icon: Atom },
    { id: 'formulas', label: 'Formulas', icon: BookOpen },
    { id: 'unit_converter', label: 'Unit Converter', icon: ArrowLeftRight },
    { id: 'ph_diagram', label: 'pH Scale', icon: Activity },
    { id: 'history', label: 'History', icon: History, count: favoritesCount },
  ];

  return (
    <nav className="bg-indigo-900 border-b border-indigo-800 text-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-700 text-white shadow-sm border border-indigo-500/50'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-indigo-300'}`} />
                <span>{tab.label}</span>
                
                {tab.badge && !isActive && (
                  <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-indigo-950 text-indigo-300 rounded border border-indigo-700/50">
                    {tab.badge}
                  </span>
                )}

                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 text-[11px] font-bold rounded-full ${
                    isActive ? 'bg-amber-400 text-slate-900' : 'bg-indigo-950 text-amber-300 border border-indigo-700/60'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
