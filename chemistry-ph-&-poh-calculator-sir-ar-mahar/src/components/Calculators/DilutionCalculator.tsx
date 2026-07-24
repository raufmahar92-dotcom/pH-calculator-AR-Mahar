import React, { useState } from 'react';
import { calculateDilution } from '../../utils/chemistry';
import { generateCalculationPDF } from '../../utils/pdfGenerator';
import { CalculationResult } from '../../types';
import { Copy, FileDown, Star, Check, Sparkles, Droplets, Calculator, RotateCcw, AlertCircle } from 'lucide-react';

interface DilutionCalculatorProps {
  onSaveResult: (result: CalculationResult) => void;
  toggleFavorite: (result: CalculationResult) => void;
}

export const DilutionCalculator: React.FC<DilutionCalculatorProps> = ({
  onSaveResult,
  toggleFavorite,
}) => {
  const [solveFor, setSolveFor] = useState<'m1' | 'v1' | 'm2' | 'v2'>('v1');
  const [m1, setM1] = useState<string>('12.0'); // 12M stock HCl
  const [v1, setV1] = useState<string>('50.0');
  const [m2, setM2] = useState<string>('1.0'); // target 1M HCl
  const [v2, setV2] = useState<string>('600.0'); // target 600mL
  const [copied, setCopied] = useState(false);

  // Manual calculation state
  const [calculatedResult, setCalculatedResult] = useState<CalculationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const clearResults = () => {
    setCalculatedResult(null);
    setValidationError(null);
  };

  const handleSolveForChange = (newSolveFor: 'm1' | 'v1' | 'm2' | 'v2') => {
    setSolveFor(newSolveFor);
    clearResults();
  };

  const handleCalculate = () => {
    const numM1 = m1 ? parseFloat(m1) : undefined;
    const numV1 = v1 ? parseFloat(v1) : undefined;
    const numM2 = m2 ? parseFloat(m2) : undefined;
    const numV2 = v2 ? parseFloat(v2) : undefined;

    if (solveFor === 'v1' && (!numM1 || !numM2 || !numV2 || numM1 <= 0 || numM2 <= 0 || numV2 <= 0)) {
      setValidationError('Please enter valid positive values for M₁, M₂, and V₂.');
      setCalculatedResult(null);
      return;
    }
    if (solveFor === 'm1' && (!numV1 || !numM2 || !numV2 || numV1 <= 0 || numM2 <= 0 || numV2 <= 0)) {
      setValidationError('Please enter valid positive values for V₁, M₂, and V₂.');
      setCalculatedResult(null);
      return;
    }
    if (solveFor === 'm2' && (!numM1 || !numV1 || !numV2 || numM1 <= 0 || numV1 <= 0 || numV2 <= 0)) {
      setValidationError('Please enter valid positive values for M₁, V₁, and V₂.');
      setCalculatedResult(null);
      return;
    }
    if (solveFor === 'v2' && (!numM1 || !numV1 || !numM2 || numM1 <= 0 || numV1 <= 0 || numM2 <= 0)) {
      setValidationError('Please enter valid positive values for M₁, V₁, and M₂.');
      setCalculatedResult(null);
      return;
    }

    const res = calculateDilution({
      m1: numM1,
      v1: numV1,
      m2: numM2,
      v2: numV2,
      solveFor,
    });
    setCalculatedResult(res);
    setValidationError(null);
  };

  const handleReset = () => {
    setM1('');
    setV1('');
    setM2('');
    setV2('');
    setCalculatedResult(null);
    setValidationError(null);
  };

  const handleCopy = () => {
    if (!calculatedResult) return;
    const text = `
Dilution Calculation Report (Sir AR Mahar)
Formula: M₁ × V₁ = M₂ × V₂
Solving for: ${solveFor.toUpperCase()}
Steps:
${calculatedResult.steps.join('\n')}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    onSaveResult(calculatedResult);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (calculatedResult) {
      generateCalculationPDF(calculatedResult);
      onSaveResult(calculatedResult);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Target Variable Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl max-w-lg mx-auto">
        {[
          { id: 'v1', label: 'Solve Stock Vol (V₁)' },
          { id: 'm1', label: 'Solve Stock Conc (M₁)' },
          { id: 'm2', label: 'Solve Target Conc (M₂)' },
          { id: 'v2', label: 'Solve Final Vol (V₂)' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleSolveForChange(item.id as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              solveFor === item.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <Droplets className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
              Dilution Equation Parameters (M₁V₁ = M₂V₂)
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Stock Solution Box */}
            <div className="p-3.5 bg-blue-50/60 dark:bg-slate-900/60 rounded-xl border border-blue-100 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block">Initial / Stock Solution</span>

              {solveFor !== 'm1' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Stock Molarity (M₁):</label>
                  <input
                    type="number"
                    value={m1}
                    onChange={(e) => { setM1(e.target.value); clearResults(); }}
                    placeholder="e.g. 12.0"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {solveFor !== 'v1' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Stock Volume (V₁ in mL):</label>
                  <input
                    type="number"
                    value={v1}
                    onChange={(e) => { setV1(e.target.value); clearResults(); }}
                    placeholder="e.g. 50.0"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Final Solution Box */}
            <div className="p-3.5 bg-sky-50/60 dark:bg-slate-900/60 rounded-xl border border-sky-100 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 block">Diluted / Target Solution</span>

              {solveFor !== 'm2' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Target Molarity (M₂):</label>
                  <input
                    type="number"
                    value={m2}
                    onChange={(e) => { setM2(e.target.value); clearResults(); }}
                    placeholder="e.g. 1.0"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {solveFor !== 'v2' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Final Volume (V₂ in mL):</label>
                  <input
                    type="number"
                    value={v2}
                    onChange={(e) => { setV2(e.target.value); clearResults(); }}
                    placeholder="e.g. 600.0"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

          </div>

          <p className="text-[11px] text-slate-400">
            💡 Volumes must use identical units (mL or L).
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={handleCalculate}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-600"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-6 space-y-4">

          {/* Validation Alert Message */}
          {validationError && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {calculatedResult && calculatedResult.outputs.dilutionResult ? (
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-700 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-sky-400">Dilution Result</span>
                <span className="text-xs px-2.5 py-0.5 bg-sky-900/60 text-sky-300 rounded-full font-bold">M₁V₁ = M₂V₂</span>
              </div>

              <div>
                <span className="text-xs text-slate-400">Solved Variable ({solveFor.toUpperCase()}):</span>
                <div className="text-3xl font-black text-amber-300 font-mono mt-1">
                  {solveFor === 'v1' && `${calculatedResult.outputs.dilutionResult.v1} mL`}
                  {solveFor === 'm1' && `${calculatedResult.outputs.dilutionResult.m1} M`}
                  {solveFor === 'm2' && `${calculatedResult.outputs.dilutionResult.m2} M`}
                  {solveFor === 'v2' && `${calculatedResult.outputs.dilutionResult.v2} mL`}
                </div>
                {solveFor === 'v1' && (
                  <p className="text-xs text-slate-300 mt-2">
                    Take <strong className="text-amber-300">{calculatedResult.outputs.dilutionResult.v1} mL</strong> of stock solution (M₁={m1}M) and dilute with solvent up to <strong className="text-sky-300">{v2} mL</strong>.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button onClick={handleCopy} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button onClick={handleDownloadPDF} className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button onClick={() => toggleFavorite(calculatedResult!)} className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl">
                  <Star className="w-5 h-5 fill-amber-300" />
                </button>
              </div>
            </div>
          ) : (
            !validationError && (
              <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-2xl text-center border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                <Calculator className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ready to Calculate</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Provide parameters above and click <span className="font-bold text-blue-600 dark:text-blue-400">Calculate</span> to compute dilution values.
                </p>
              </div>
            )
          )}

          {calculatedResult && calculatedResult.steps.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                Calculation Steps
              </h4>
              {calculatedResult.steps.map((s, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
