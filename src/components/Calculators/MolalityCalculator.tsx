import React, { useState } from 'react';
import { calculateMolality } from '../../utils/chemistry';
import { generateCalculationPDF } from '../../utils/pdfGenerator';
import { CalculationResult } from '../../types';
import { Copy, FileDown, Star, Check, Sparkles, Scale, Calculator, RotateCcw, AlertCircle } from 'lucide-react';

interface MolalityCalculatorProps {
  onSaveResult: (result: CalculationResult) => void;
  toggleFavorite: (result: CalculationResult) => void;
}

export const MolalityCalculator: React.FC<MolalityCalculatorProps> = ({
  onSaveResult,
  toggleFavorite,
}) => {
  const [soluteMass, setSoluteMass] = useState<string>('180.16'); // 1 mol glucose
  const [molarMass, setMolarMass] = useState<string>('180.16');
  const [solventMass, setSolventMass] = useState<string>('1.0');
  const [solventUnit, setSolventUnit] = useState<'kg' | 'g'>('kg');
  const [copied, setCopied] = useState(false);

  // Manual calculation state
  const [calculatedResult, setCalculatedResult] = useState<CalculationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const clearResults = () => {
    setCalculatedResult(null);
    setValidationError(null);
  };

  const handleCalculate = () => {
    const numSolute = soluteMass ? parseFloat(soluteMass) : undefined;
    const numMw = molarMass ? parseFloat(molarMass) : undefined;
    const rawSolvent = solventMass ? parseFloat(solventMass) : undefined;
    const solventKg = rawSolvent ? (solventUnit === 'g' ? rawSolvent / 1000 : rawSolvent) : undefined;

    if (!numSolute || numSolute <= 0) {
      setValidationError('Please enter a valid solute mass (g).');
      setCalculatedResult(null);
      return;
    }
    if (!numMw || numMw <= 0) {
      setValidationError('Please enter a valid solute molar mass (g/mol).');
      setCalculatedResult(null);
      return;
    }
    if (!solventKg || solventKg <= 0) {
      setValidationError('Please enter a valid solvent mass.');
      setCalculatedResult(null);
      return;
    }

    const res = calculateMolality({
      massSolute: numSolute,
      molarMass: numMw,
      massSolventKg: solventKg,
    });
    setCalculatedResult(res);
    setValidationError(null);
  };

  const handleReset = () => {
    setSoluteMass('');
    setMolarMass('');
    setSolventMass('');
    setCalculatedResult(null);
    setValidationError(null);
  };

  const handleCopy = () => {
    if (!calculatedResult) return;
    const text = `
Molality Calculation Report (Sir AR Mahar)
Title: ${calculatedResult.title}
Molality: ${calculatedResult.outputs.molality} mol/kg (m)
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Input Form */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <Scale className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
            Molality Calculator (mol/kg)
          </h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Solute Mass (grams):</label>
          <input
            type="number"
            value={soluteMass}
            onChange={(e) => { setSoluteMass(e.target.value); clearResults(); }}
            placeholder="e.g. 58.44 (NaCl) or 180.16 (Glucose)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Molar Mass of Solute (g/mol):</label>
          <input
            type="number"
            value={molarMass}
            onChange={(e) => { setMolarMass(e.target.value); clearResults(); }}
            placeholder="e.g. 180.16"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Mass of Solvent:</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={solventMass}
              onChange={(e) => { setSolventMass(e.target.value); clearResults(); }}
              placeholder="e.g. 1.0 or 1000"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <select
              value={solventUnit}
              onChange={(e) => { setSolventUnit(e.target.value as 'kg' | 'g'); clearResults(); }}
              className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="g">Grams (g)</option>
            </select>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Note: Molality (m) is temperature independent because mass does not change with expansion/contraction.
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

      {/* Right Output Card */}
      <div className="lg:col-span-6 space-y-4">

        {/* Validation Alert Message */}
        {validationError && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {calculatedResult ? (
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-700 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-indigo-400">Molality Output</span>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-900/60 text-indigo-300 rounded-full font-bold">m = n / kg</span>
            </div>

            <div>
              <span className="text-xs text-slate-400">Calculated Molality:</span>
              <div className="text-3xl font-black text-indigo-300 font-mono mt-1">
                {calculatedResult.outputs.molality} m
              </div>
              <span className="text-xs text-slate-400">moles of solute per kg of solvent (mol/kg)</span>
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
                Fill in the parameters above and click <span className="font-bold text-blue-600 dark:text-blue-400">Calculate</span> to view molality solutions.
              </p>
            </div>
          )
        )}

        {calculatedResult && calculatedResult.steps.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
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
  );
};

