import React, { useState } from 'react';
import { CalculationResult } from '../types';
import { generateCalculationPDF } from '../utils/pdfGenerator';
import { formatScientific } from '../utils/chemistry';
import { Star, History, Search, Trash2, FileDown, Copy, Check, Filter } from 'lucide-react';

interface HistoryAndFavoritesProps {
  history: CalculationResult[];
  favorites: CalculationResult[];
  toggleFavorite: (item: CalculationResult) => void;
  clearHistory: () => void;
  deleteItem: (id: string) => void;
}

export const HistoryAndFavorites: React.FC<HistoryAndFavoritesProps> = ({
  history,
  favorites,
  toggleFavorite,
  clearHistory,
  deleteItem,
}) => {
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const displayList = filter === 'favorites' ? favorites : history;

  const filteredList = displayList.filter((item) => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCopy = (item: CalculationResult) => {
    const text = `
Calculation: ${item.title}
Result: ${JSON.stringify(item.outputs, null, 2)}
Date: ${new Date(item.timestamp).toLocaleString()}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Toggle Pills */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All History ({history.length})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'favorites' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Favorites ({favorites.length})</span>
          </button>
        </div>

        {/* Search & Clear */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

      </div>

      {/* History Cards Grid */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => {
            const isFav = favorites.some((f) => f.id === item.id);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {item.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => toggleFavorite(item)}
                    className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700"
                    title={isFav ? 'Remove Favorite' : 'Add Favorite'}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                </div>

                {/* Outputs Summary */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1 text-xs font-mono">
                  {item.outputs.ph !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">pH:</span>
                      <strong className="text-blue-600 dark:text-blue-400">{item.outputs.ph}</strong>
                    </div>
                  )}
                  {item.outputs.poh !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">pOH:</span>
                      <strong className="text-sky-600 dark:text-sky-400">{item.outputs.poh}</strong>
                    </div>
                  )}
                  {item.outputs.hConcentration !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">[H⁺]:</span>
                      <span>{formatScientific(item.outputs.hConcentration)} M</span>
                    </div>
                  )}
                  {item.outputs.nature && (
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Nature:</span>
                      <span className="text-indigo-600 dark:text-indigo-300">{item.outputs.nature}</span>
                    </div>
                  )}
                  {item.outputs.molarity !== undefined && (
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Molarity:</span>
                      <span className="text-amber-500">{item.outputs.molarity} M</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleCopy(item)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => generateCalculationPDF(item)}
                    className="flex-1 py-1.5 px-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-white dark:bg-slate-800 rounded-2xl text-center border border-slate-200 dark:border-slate-700 space-y-2">
          <History className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No calculation records found</h4>
          <p className="text-xs text-slate-400">Perform calculations in any mode to automatically populate your history log.</p>
        </div>
      )}

    </div>
  );
};
