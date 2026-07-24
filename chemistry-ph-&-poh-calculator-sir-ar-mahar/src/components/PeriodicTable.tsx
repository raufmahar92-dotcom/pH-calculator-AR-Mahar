import React, { useState } from 'react';
import { PERIODIC_ELEMENTS } from '../data/elements';
import { ElementData } from '../types';
import { Atom, Search, X, Zap, FlaskConical, Filter } from 'lucide-react';

export const PeriodicTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);

  const categories = [
    { id: 'all', label: 'All Elements' },
    { id: 'alkali-metal', label: 'Alkali Metals', color: 'bg-red-500' },
    { id: 'alkaline-earth', label: 'Alkaline Earth', color: 'bg-amber-500' },
    { id: 'transition-metal', label: 'Transition Metals', color: 'bg-blue-500' },
    { id: 'post-transition', label: 'Post-Transition', color: 'bg-teal-500' },
    { id: 'metalloid', label: 'Metalloids', color: 'bg-emerald-500' },
    { id: 'reactive-nonmetal', label: 'Reactive Nonmetals', color: 'bg-lime-600' },
    { id: 'noble-gas', label: 'Noble Gases', color: 'bg-purple-500' },
    { id: 'actinide', label: 'Actinides', color: 'bg-pink-500' },
  ];

  const filteredElements = PERIODIC_ELEMENTS.filter((el) => {
    const matchesSearch =
      el.name.toLowerCase().includes(search.toLowerCase()) ||
      el.symbol.toLowerCase().includes(search.toLowerCase()) ||
      el.number.toString() === search.trim();

    const matchesCategory = categoryFilter === 'all' || el.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'alkali-metal':
        return 'bg-rose-500 text-white';
      case 'alkaline-earth':
        return 'bg-amber-500 text-white';
      case 'transition-metal':
        return 'bg-sky-500 text-white';
      case 'post-transition':
        return 'bg-teal-500 text-white';
      case 'metalloid':
        return 'bg-emerald-500 text-white';
      case 'reactive-nonmetal':
        return 'bg-emerald-600 text-white';
      case 'noble-gas':
        return 'bg-purple-500 text-white';
      case 'actinide':
        return 'bg-pink-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Search Bar */}
      <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Atom className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Interactive Periodic Table of Elements
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore atomic properties & acid-base roles in aqueous chemistry
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by symbol, name, or #..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              categoryFilter === cat.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Elements */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
        {filteredElements.map((el) => (
          <div
            key={el.number}
            onClick={() => setSelectedElement(el)}
            className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 font-bold">#{el.number}</span>
              <span className={`w-2 h-2 rounded-full ${getCategoryBadgeClass(el.category).split(' ')[0]}`}></span>
            </div>

            <div className="text-center my-auto">
              <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform font-mono">
                {el.symbol}
              </div>
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                {el.name}
              </div>
            </div>

            <div className="text-[9px] text-slate-400 font-mono text-center">
              {el.atomicMass}
            </div>
          </div>
        ))}
      </div>

      {/* Element Detail Modal */}
      {selectedElement && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5 relative animate-in fade-in zoom-in-95">
            
            <button
              onClick={() => setSelectedElement(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Box */}
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center font-mono shadow-md">
                <span className="text-[10px] opacity-80">#{selectedElement.number}</span>
                <span className="text-2xl font-black">{selectedElement.symbol}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {selectedElement.name}
                </h3>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${getCategoryBadgeClass(selectedElement.category)}`}>
                  {selectedElement.category.replace('-', ' ')}
                </span>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                <span className="text-slate-400 font-medium block">Atomic Mass</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-100 text-sm">{selectedElement.atomicMass} u</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                <span className="text-slate-400 font-medium block">Electron Config</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-100 text-sm">{selectedElement.electronConfig}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                <span className="text-slate-400 font-medium block">Electronegativity</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-100 text-sm">{selectedElement.electronegativity ?? 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                <span className="text-slate-400 font-medium block">Standard Phase</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{selectedElement.phase}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">Summary & Overview:</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                {selectedElement.summary}
              </p>
            </div>

            {/* Acid Base Role */}
            {selectedElement.acidBaseRole && (
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-1">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4" />
                  Acid-Base & Reaction Role:
                </span>
                <p className="text-xs text-blue-900 dark:text-blue-200">
                  {selectedElement.acidBaseRole}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
