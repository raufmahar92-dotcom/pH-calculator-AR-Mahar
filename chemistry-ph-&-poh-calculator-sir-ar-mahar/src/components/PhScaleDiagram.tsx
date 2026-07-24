import React, { useState } from 'react';
import { PH_BENCHMARKS } from '../data/phExamples';
import { Activity, Droplet, Sparkles, AlertTriangle } from 'lucide-react';

export const PhScaleDiagram: React.FC = () => {
  const [selectedPh, setSelectedPh] = useState<number>(7.0);

  const matchedBenchmark = PH_BENCHMARKS.reduce((prev, curr) => {
    return Math.abs(curr.ph - selectedPh) < Math.abs(prev.ph - selectedPh) ? curr : prev;
  });

  // Get indicator colors for Litmus & Phenolphthalein
  const getLitmusColor = (ph: number) => (ph < 7 ? 'Red' : ph > 7 ? 'Blue' : 'Purple');
  const getPhenolphthaleinColor = (ph: number) => (ph < 8.2 ? 'Colorless (Transparent)' : 'Magenta Pink');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Interactive pH Scale Spectrum
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visual acid-base spectrum with real-world substances and chemical indicator responses
          </p>
        </div>
      </div>

      {/* Visual pH Spectrum Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
        
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span className="text-red-500">Acidic (pH &lt; 7)</span>
          <span className="text-cyan-500">Neutral (pH = 7)</span>
          <span className="text-purple-500">Alkaline (pH &gt; 7)</span>
        </div>

        {/* Gradient Bar Container */}
        <div className="relative h-12 rounded-2xl bg-gradient-to-r from-red-600 via-yellow-400 via-green-400 via-cyan-400 via-blue-600 to-purple-600 p-1 shadow-inner">
          <input
            type="range"
            min="0"
            max="14"
            step="0.1"
            value={selectedPh}
            onChange={(e) => setSelectedPh(parseFloat(e.target.value))}
            className="w-full h-full opacity-0 cursor-pointer z-10 relative"
          />

          {/* Marker Thumb */}
          <div
            className="absolute top-0 bottom-0 w-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white rounded-full shadow-lg pointer-events-none transition-all transform -translate-x-1/2 flex items-center justify-center"
            style={{ left: `${(selectedPh / 14) * 100}%` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
          </div>
        </div>

        {/* pH Slider Direct Control */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">pH 0.0</span>
          <div className="text-center">
            <span className="text-xs font-semibold text-slate-400 block">Selected pH</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {selectedPh.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">pH 14.0</span>
        </div>

      </div>

      {/* Active Benchmark Substance Info Card */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-lg border border-blue-500/20 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900" style={{ backgroundColor: matchedBenchmark.color }}>
              pH ≈ {matchedBenchmark.ph}
            </span>
            <span className="text-xs text-slate-300 font-bold uppercase">
              {matchedBenchmark.category}
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white">
            {matchedBenchmark.name}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {matchedBenchmark.description}
          </p>

          <div className="text-xs font-mono text-cyan-300">
            [H⁺] Concentration: <strong>{matchedBenchmark.hConcentration}</strong>
          </div>
        </div>

        {/* Indicators Card */}
        <div className="md:col-span-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-3 text-xs">
          <span className="font-bold text-amber-300 block border-b border-white/10 pb-1.5">
            Chemical Indicators Color Response:
          </span>

          <div>
            <span className="text-slate-300 block">Litmus Paper:</span>
            <strong className="text-white text-sm">{getLitmusColor(selectedPh)}</strong>
          </div>

          <div>
            <span className="text-slate-300 block">Phenolphthalein:</span>
            <strong className="text-white text-sm">{getPhenolphthaleinColor(selectedPh)}</strong>
          </div>
        </div>

      </div>

      {/* All Benchmarks Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Reference pH Benchmark List (0 to 14)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PH_BENCHMARKS.map((item) => (
            <div
              key={item.ph}
              onClick={() => setSelectedPh(item.ph)}
              className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                >
                  {item.ph}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</h4>
                  <span className="text-[10px] text-slate-400">{item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
