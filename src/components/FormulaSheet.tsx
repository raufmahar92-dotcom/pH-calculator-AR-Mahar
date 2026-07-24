import React, { useState } from 'react';
import { CHEMISTRY_FORMULAS } from '../data/formulas';
import { BookOpen, Search, Copy, Check, Info } from 'lucide-react';

export const FormulaSheet: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'all',
    'pH & pOH',
    'Solutions & Concentration',
    'Dilution & Titration',
    'Gas Laws',
  ];

  const filteredFormulas = CHEMISTRY_FORMULAS.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.formula.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleCopyFormula = (id: string, formulaText: string) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Bar */}
      <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Common Chemistry Formula Sheet
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Essential equations for pH, pOH, molarity, buffers, dilution, and solutions
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search formulas or variables..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Formula Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFormulas.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 hover:border-blue-300 transition-all relative group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {item.title}
                </h3>
              </div>

              <button
                onClick={() => handleCopyFormula(item.id, item.formula)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors"
                title="Copy Formula"
              >
                {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Formula Highlight Box */}
            <div className="p-3.5 bg-slate-900 text-amber-300 rounded-xl font-mono text-center text-base sm:text-lg font-bold border border-slate-700 shadow-inner">
              {item.formula}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.description}
            </p>

            {/* Variables Legend */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block">Variables:</span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {item.variables.map((v, idx) => (
                  <div key={idx} className="p-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg">
                    <strong className="text-blue-600 dark:text-blue-400 font-mono">{v.symbol}</strong> = {v.name} ({v.unit})
                  </div>
                ))}
              </div>
            </div>

            {/* Example */}
            <div className="p-3 bg-blue-50/60 dark:bg-slate-900/40 rounded-xl border border-blue-100 dark:border-slate-800 text-xs text-blue-900 dark:text-blue-200">
              <strong className="font-bold">Example: </strong> {item.example}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
