import React, { useState } from 'react';
import { calculateMolarity } from '../../utils/chemistry';
import { generateCalculationPDF } from '../../utils/pdfGenerator';
import { CalculationResult } from '../../types';
import { Copy, FileDown, Star, Check, Sparkles, Beaker, Calculator, RotateCcw, AlertCircle } from 'lucide-react';

interface MolarityCalculatorProps {
  onSaveResult: (result: CalculationResult) => void;
  toggleFavorite: (result: CalculationResult) => void;
}

export const MolarityCalculator: React.FC<MolarityCalculatorProps> = ({
  onSaveResult,
  toggleFavorite,
}) => {
  const [target, setTarget] = useState<'molarity' | 'mass' | 'volume'>('molarity');
  const [moles, setMoles] = useState<string>('');
  const [mass, setMass] = useState<string>('58.44'); // NaCl mass example
  const [molarMass, setMolarMass] = useState<string>('58.44'); // NaCl Mw
  const [volume, setVolume] = useState<string>('1.0');
  const [volumeUnit, setVolumeUnit] = useState<'L' | 'mL'>('L');
  const [copied, setCopied] = useState(false);

  // Manual calculation state
  const [calculatedResult, setCalculatedResult] = useState<CalculationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const clearResults = () => {
    setCalculatedResult(null);
    setValidationError(null);
  };

  const handleTargetChange = (newTarget: 'molarity' | 'mass' | 'volume') => {
    setTarget(newTarget);
    clearResults();
  };

  const handleCalculate = () => {
    const numMass = mass ? parseFloat(mass) : undefined;
    const numMw = molarMass ? parseFloat(molarMass) : undefined;
    const numMoles = moles ? parseFloat(moles) : undefined;
    const rawVol = volume ? parseFloat(volume) : undefined;
    const volL = rawVol ? (volumeUnit === 'mL' ? rawVol / 1000 : rawVol) : undefined;

    if (target === 'molarity') {
      if (!volL || volL <= 0) {
        setValidationError('Please enter a valid positive volume.');
        setCalculatedResult(null);
        return;
      }
      if ((!numMoles || numMoles <= 0) && (!numMass || !numMw || numMass <= 0 || numMw <= 0)) {
        setValidationError('Please enter solute moles or valid solute mass + molar mass.');
        setCalculatedResult(null);
        return;
      }
      const res = calculateMolarity({
        moles: numMoles,
        mass: numMass,
        molarMass: numMw,
        volumeL: volL,
        target: 'molarity',
      });
      setCalculatedResult(res);
      setValidationError(null);
    } else if (target === 'mass') {
      if (!numMoles || numMoles <= 0) {
        setValidationError('Please enter a valid target molarity (M).');
        setCalculatedResult(null);
        return;
      }
      if (!numMw || numMw <= 0) {
        setValidationError('Please enter a valid solute molar mass (g/mol).');
        setCalculatedResult(null);
        return;
      }
      if (!volL || volL <= 0) {
        setValidationError('Please enter a valid solution volume.');
        setCalculatedResult(null);
        return;
      }
      const res = calculateMolarity({
        moles: numMoles,
        molarMass: numMw,
        volumeL: volL,
        target: 'mass',
      });
      setCalculatedResult(res);
      setValidationError(null);
    } else if (target === 'volume') {
      if (!numMoles || numMoles <= 0) {
        setValidationError('Please enter a valid target molarity (M).');
        setCalculatedResult(null);
        return;
      }
      if ((!numMoles || numMoles <= 0) && (!numMass || !numMw || numMass <= 0 || numMw <= 0)) {
        setValidationError('Please enter valid solute mass and molar mass or moles.');
        setCalculatedResult(null);
        return;
      }
      const res = calculateMolarity({
        moles: numMoles,
        mass: numMass,
        molarMass: numMw,
        target: 'volume',
      });
      setCalculatedResult(res);
      setValidationError(null);
    }
  };

  const handleReset = () => {
    setMoles('');
    setMass('');
    setMolarMass('');
    setVolume('');
    setCalculatedResult(null);
    setValidationError(null);
  };

  const handleCopy = () => {
    if (!calculatedResult) return;
    const text = `
Molarity Calculation Report (Sir AR Mahar)
Title: ${calculatedResult.title}
Result: ${JSON.stringify(calculatedResult.outputs, null, 2)}
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
      
      {/* Target Selector */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setTarget('molarity')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            target === 'molarity' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Solve Molarity (M)
        </button>
        <button
          onClick={() => setTarget('mass')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            target === 'mass' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Solve Mass (g)
        </button>
        <button
          onClick={() => setTarget('volume')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            target === 'volume' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Solve Volume (L)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Input Form */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <Beaker className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
              {target === 'molarity' && 'Calculate Solution Molarity (mol/L)'}
              {target === 'mass' && 'Calculate Solute Mass Required (g)'}
              {target === 'volume' && 'Calculate Solution Volume Needed'}
            </h3>
          </div>

          {target === 'mass' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Target Molarity (M = mol/L):</label>
              <input
                type="number"
                value={moles}
                onChange={(e) => setMoles(e.target.value)}
                placeholder="e.g. 0.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Solute Mass (g):</label>
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="e.g. 58.44 (NaCl)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Molar Mass (g/mol):</label>
            <input
              type="number"
              value={molarMass}
              onChange={(e) => setMolarMass(e.target.value)}
              placeholder="e.g. 58.44 (NaCl), 98.08 (H2SO4)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {target !== 'volume' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Solution Volume:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="e.g. 1.0 or 500"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  value={volumeUnit}
                  onChange={(e) => setVolumeUnit(e.target.value as 'L' | 'mL')}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="L">Liters (L)</option>
                  <option value="mL">Milliliters (mL)</option>
                </select>
              </div>
            </div>
          )}

          {/* Common Preset Solutes */}
          <div className="pt-2">
            <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">Common Compound Molar Masses:</span>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => { setMolarMass('58.44'); setMass('58.44'); clearResults(); }} className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">NaCl (58.44)</button>
              <button onClick={() => { setMolarMass('40.00'); setMass('40.00'); clearResults(); }} className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">NaOH (40.00)</button>
              <button onClick={() => { setMolarMass('36.46'); setMass('36.46'); clearResults(); }} className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">HCl (36.46)</button>
              <button onClick={() => { setMolarMass('98.08'); setMass('98.08'); clearResults(); }} className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">H₂SO₄ (98.08)</button>
              <button onClick={() => { setMolarMass('180.16'); setMass('180.16'); clearResults(); }} className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">Glucose (180.16)</button>
            </div>
          </div>

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
                <span className="text-xs font-semibold text-blue-400">Molarity Output</span>
                <span className="text-xs px-2.5 py-0.5 bg-blue-900/60 text-blue-300 rounded-full font-bold">M = n / V</span>
              </div>

              {target === 'molarity' && (
                <div>
                  <span className="text-xs text-slate-400">Calculated Molarity:</span>
                  <div className="text-3xl font-black text-amber-300 font-mono mt-1">
                    {calculatedResult.outputs.molarity} M
                  </div>
                  <span className="text-xs text-slate-400">moles per liter (mol/L)</span>
                </div>
              )}

              {target === 'mass' && (
                <div>
                  <span className="text-xs text-slate-400">Solute Mass Required:</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                    {calculatedResult.outputs.mass} grams
                  </div>
                  <span className="text-xs text-slate-400">for {volume} {volumeUnit} solution</span>
                </div>
              )}

              {target === 'volume' && (
                <div>
                  <span className="text-xs text-slate-400">Solution Volume Required:</span>
                  <div className="text-3xl font-black text-sky-300 font-mono mt-1">
                    {calculatedResult.outputs.volumeL} L
                  </div>
                  <span className="text-xs text-slate-400">({(calculatedResult.outputs.volumeL! * 1000).toFixed(1)} mL)</span>
                </div>
              )}

              {/* Actions */}
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
                  Fill in the parameters above and click <span className="font-bold text-blue-600 dark:text-blue-400">Calculate</span> to view full molarity solutions and steps.
                </p>
              </div>
            )
          )}

          {/* Steps */}
          {calculatedResult && calculatedResult.steps.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
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
