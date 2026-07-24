import React, { useState } from 'react';
import { 
  calculatePhFromH, 
  calculateHFromPh, 
  calculatePohFromOh, 
  calculateOhFromPoh, 
  convertPhPoh, 
  parseChemNumber, 
  formatScientific 
} from '../../utils/chemistry';
import { generateCalculationPDF } from '../../utils/pdfGenerator';
import { CalculationResult } from '../../types';
import { 
  Copy, 
  FileDown, 
  Star, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Sparkles, 
  Thermometer, 
  HelpCircle,
  Calculator,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface PhPohCalculatorProps {
  onSaveResult: (result: CalculationResult) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (result: CalculationResult) => void;
}

type Mode = 'ph_from_h' | 'h_from_ph' | 'poh_from_oh' | 'oh_from_poh' | 'convert_ph_poh' | 'acid_base';

export const PhPohCalculator: React.FC<PhPohCalculatorProps> = ({
  onSaveResult,
  toggleFavorite,
}) => {
  const [mode, setMode] = useState<Mode>('ph_from_h');
  const [inputValue, setInputValue] = useState<string>('0.0000001'); // 1e-7 M
  const [temperature, setTemperature] = useState<number>(25);
  const [convertType, setConvertType] = useState<'pH' | 'pOH'>('pH');
  const [copied, setCopied] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const [showFormulas, setShowFormulas] = useState(false);

  // Manual calculation state
  const [calculatedResult, setCalculatedResult] = useState<CalculationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setCalculatedResult(null);
    setValidationError(null);
    if (newMode === 'ph_from_h') setInputValue('0.0000001'); // 1e-7 M
    else if (newMode === 'h_from_ph') setInputValue('7.0');
    else if (newMode === 'poh_from_oh') setInputValue('0.0000001');
    else if (newMode === 'oh_from_poh') setInputValue('7.0');
    else if (newMode === 'convert_ph_poh') setInputValue('7.0');
    else if (newMode === 'acid_base') setInputValue('7.0');
  };

  const handleCalculate = () => {
    if (!inputValue || inputValue.trim() === '') {
      setValidationError('Please enter a value before calculating.');
      setCalculatedResult(null);
      return;
    }

    const numericInput = parseChemNumber(inputValue);
    if (numericInput === null || isNaN(numericInput) || numericInput < 0) {
      setValidationError('Please enter a valid non-negative numeric value.');
      setCalculatedResult(null);
      return;
    }

    let res: CalculationResult | null = null;
    if (mode === 'ph_from_h') {
      if (numericInput <= 0) {
        setValidationError('Concentration [H⁺] must be greater than 0 M.');
        setCalculatedResult(null);
        return;
      }
      res = calculatePhFromH(numericInput, temperature);
    } else if (mode === 'h_from_ph') {
      if (numericInput > 16) {
        setValidationError('pH value typically ranges between 0 and 16.');
        setCalculatedResult(null);
        return;
      }
      res = calculateHFromPh(numericInput, temperature);
    } else if (mode === 'poh_from_oh') {
      if (numericInput <= 0) {
        setValidationError('Concentration [OH⁻] must be greater than 0 M.');
        setCalculatedResult(null);
        return;
      }
      res = calculatePohFromOh(numericInput, temperature);
    } else if (mode === 'oh_from_poh') {
      if (numericInput > 16) {
        setValidationError('pOH value typically ranges between 0 and 16.');
        setCalculatedResult(null);
        return;
      }
      res = calculateOhFromPoh(numericInput, temperature);
    } else if (mode === 'convert_ph_poh') {
      if (numericInput > 16) {
        setValidationError('pH/pOH value typically ranges between 0 and 16.');
        setCalculatedResult(null);
        return;
      }
      res = convertPhPoh(numericInput, convertType, temperature);
    } else if (mode === 'acid_base') {
      if (numericInput > 16) {
        setValidationError('pH value typically ranges between 0 and 16.');
        setCalculatedResult(null);
        return;
      }
      res = calculateHFromPh(numericInput, temperature);
    }

    if (res) {
      setValidationError(null);
      setCalculatedResult(res);
    } else {
      setValidationError('Invalid input parameters for calculation.');
      setCalculatedResult(null);
    }
  };

  const handleReset = () => {
    setInputValue('');
    setCalculatedResult(null);
    setValidationError(null);
    setTemperature(25);
  };

  const handleCopy = () => {
    if (!calculatedResult) return;
    const text = `
Chemistry pH & pOH Calculation Report (Sir AR Mahar)
Mode: ${calculatedResult.title}
----------------------------------------
pH Value: ${calculatedResult.outputs.ph}
pOH Value: ${calculatedResult.outputs.poh}
[H⁺] Concentration: ${formatScientific(calculatedResult.outputs.hConcentration)} M
[OH⁻] Concentration: ${formatScientific(calculatedResult.outputs.ohConcentration)} M
Chemical Nature: ${calculatedResult.outputs.nature}
Temperature: ${temperature}°C

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
      
      {/* Sub Mode Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { id: 'ph_from_h', label: '1. pH from [H⁺]' },
          { id: 'h_from_ph', label: '2. [H⁺] from pH' },
          { id: 'poh_from_oh', label: '3. pOH from [OH⁻]' },
          { id: 'oh_from_poh', label: '4. [OH⁻] from pOH' },
          { id: 'convert_ph_poh', label: '5. pH ↔ pOH' },
          { id: 'acid_base', label: '6. Acid/Base Test' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleModeChange(item.id as Mode)}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
              mode === item.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Calculation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs Panel */}
        <div className="lg:col-span-6 space-y-5 bg-white dark:bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-blue-100 dark:border-slate-700/80 shadow-xs">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              {mode === 'ph_from_h' && 'Calculate pH & pOH from [H⁺]'}
              {mode === 'h_from_ph' && 'Calculate Hydrogen Ions [H⁺] from pH'}
              {mode === 'poh_from_oh' && 'Calculate pOH & pH from Hydroxide [OH⁻]'}
              {mode === 'oh_from_poh' && 'Calculate Hydroxide Ions [OH⁻] from pOH'}
              {mode === 'convert_ph_poh' && 'Convert between pH and pOH'}
              {mode === 'acid_base' && 'Acid, Base & Neutral Identifier'}
            </h3>
          </div>

          {/* Special Toggle for Convert Mode */}
          {mode === 'convert_ph_poh' && (
            <div className="flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <button
                onClick={() => { setConvertType('pH'); setCalculatedResult(null); setValidationError(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  convertType === 'pH' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Input is pH
              </button>
              <button
                onClick={() => { setConvertType('pOH'); setCalculatedResult(null); setValidationError(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  convertType === 'pOH' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Input is pOH
              </button>
            </div>
          )}

          {/* Primary Input Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              {mode === 'ph_from_h' && 'Hydrogen Ion Concentration [H⁺] in Molar (M):'}
              {mode === 'h_from_ph' && 'pH Value (0.0 to 14.0):'}
              {mode === 'poh_from_oh' && 'Hydroxide Ion Concentration [OH⁻] in Molar (M):'}
              {mode === 'oh_from_poh' && 'pOH Value (0.0 to 14.0):'}
              {mode === 'convert_ph_poh' && `${convertType} Value:`}
              {mode === 'acid_base' && 'Enter pH Value to Analyze:'}
            </label>

            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setCalculatedResult(null);
                  setValidationError(null);
                }}
                placeholder="e.g. 1e-7 or 0.0001 or 7.0"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
              <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">
                {mode.includes('from_h') || mode.includes('from_oh') ? 'M (mol/L)' : 'pH Units'}
              </span>
            </div>

            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              💡 Supports scientific notation e.g., <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-blue-600 dark:text-blue-300">1.5e-3</code> or <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-blue-600 dark:text-blue-300">0.0015</code>
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Quick Benchmarks:</span>
            <div className="flex flex-wrap gap-1.5">
              {mode.includes('ph') || mode.includes('poh') || mode === 'convert_ph_poh' || mode === 'acid_base' ? (
                <>
                  <button onClick={() => { setInputValue('1.0'); setCalculatedResult(null); setValidationError(null); }} className="px-2.5 py-1 text-xs rounded-lg bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 hover:bg-red-100 font-medium">Strong Acid (pH 1)</button>
                  <button onClick={() => { setInputValue('3.0'); setCalculatedResult(null); setValidationError(null); }} className="px-2.5 py-1 text-xs rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 hover:bg-orange-100 font-medium">Weak Acid (pH 3)</button>
                  <button onClick={() => { setInputValue('7.0'); setCalculatedResult(null); setValidationError(null); }} className="px-2.5 py-1 text-xs rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 hover:bg-sky-100 font-medium">Neutral Water (pH 7)</button>
                  <button onClick={() => { setInputValue('10.0'); setCalculatedResult(null); setValidationError(null); }} className="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 font-medium">Weak Base (pH 10)</button>
                  <button onClick={() => { setInputValue('13.0'); setCalculatedResult(null); setValidationError(null); }} className="px-2.5 py-1 text-xs rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 font-medium">Strong Base (pH 13)</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setInputValue('1.0e-1'); setCalculatedResult(null); setValidationError(null); }} className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono">0.1 M</button>
                  <button onClick={() => { setInputValue('1.0e-3'); setCalculatedResult(null); setValidationError(null); }} className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono">10⁻³ M</button>
                  <button onClick={() => { setInputValue('1.0e-7'); setCalculatedResult(null); setValidationError(null); }} className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono">10⁻⁷ M</button>
                  <button onClick={() => { setInputValue('1.0e-11'); setCalculatedResult(null); setValidationError(null); }} className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono">10⁻¹¹ M</button>
                </>
              )}
            </div>
          </div>

          {/* Temperature Parameter Adjustment */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-rose-500" />
                Temperature Correction (°C):
              </label>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{temperature}°C</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={temperature}
                onChange={(e) => {
                  setTemperature(parseInt(e.target.value, 10));
                  setCalculatedResult(null);
                  setValidationError(null);
                }}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <button
                onClick={() => {
                  setTemperature(25);
                  setCalculatedResult(null);
                  setValidationError(null);
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 underline whitespace-nowrap"
              >
                Reset 25°C
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Water autoionization Kw adjusts with temperature (at 25°C Kw = 1.0×10⁻¹⁴, pKw = 14.00).
            </p>
          </div>

          {/* Calculate & Reset Action Buttons */}
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

        {/* Right Output Results Panel */}
        <div className="lg:col-span-6 space-y-5">

          {/* Validation Alert Message */}
          {validationError && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
          
          {calculatedResult ? (
            <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl space-y-6 border border-blue-500/20 relative overflow-hidden">
              
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

              {/* Title & Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Calculation Output</span>
                  <h4 className="text-xl font-extrabold text-white">{calculatedResult.title}</h4>
                </div>

                {/* Nature Badge */}
                {calculatedResult.outputs.nature && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                    calculatedResult.outputs.nature === 'Acidic'
                      ? 'bg-rose-500 text-white'
                      : calculatedResult.outputs.nature === 'Basic'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {calculatedResult.outputs.nature} Solution
                  </span>
                )}
              </div>

              {/* Key Metrics Cards Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                
                {/* pH Box */}
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
                  <span className="text-xs text-blue-200 font-medium">pH Value</span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-1">
                    {calculatedResult.outputs.ph ?? 'N/A'}
                  </div>
                  <span className="text-[10px] text-blue-300">
                    {calculatedResult.outputs.ph! < 7 ? 'Acidic (<7.0)' : calculatedResult.outputs.ph! > 7 ? 'Alkaline (>7.0)' : 'Neutral (7.0)'}
                  </span>
                </div>

                {/* pOH Box */}
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
                  <span className="text-xs text-blue-200 font-medium">pOH Value</span>
                  <div className="text-2xl sm:text-3xl font-black text-sky-300 font-mono mt-1">
                    {calculatedResult.outputs.poh ?? 'N/A'}
                  </div>
                  <span className="text-[10px] text-blue-300">14.00 - pH</span>
                </div>

                {/* [H+] Box */}
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
                  <span className="text-xs text-blue-200 font-medium">[H⁺] Concentration</span>
                  <div className="text-base sm:text-lg font-bold text-white font-mono mt-1 truncate">
                    {formatScientific(calculatedResult.outputs.hConcentration)} M
                  </div>
                  <span className="text-[10px] text-blue-300">Hydrogen ions</span>
                </div>

                {/* [OH-] Box */}
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
                  <span className="text-xs text-blue-200 font-medium">[OH⁻] Concentration</span>
                  <div className="text-base sm:text-lg font-bold text-white font-mono mt-1 truncate">
                    {formatScientific(calculatedResult.outputs.ohConcentration)} M
                  </div>
                  <span className="text-[10px] text-blue-300">Hydroxide ions</span>
                </div>

              </div>

              {/* Actions Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={handleCopy}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Result!' : 'Copy Summary'}</span>
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => toggleFavorite(calculatedResult!)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-amber-300 rounded-xl transition-all"
                  title="Save to Favorites"
                >
                  <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                </button>
              </div>

            </div>
          ) : (
            !validationError && (
              <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-2xl text-center border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                <Calculator className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ready to Calculate</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Enter parameters above and click <span className="font-bold text-blue-600 dark:text-blue-400">Calculate</span> to compute pH, pOH, concentrations, and full step-by-step breakdown.
                </p>
              </div>
            )
          )}

        </div>

      </div>

      {/* Accordion: Step by Step Breakdown */}
      {calculatedResult && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-100 text-sm hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Step-by-Step Mathematical Derivation</span>
            </div>
            {showSteps ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>

          {showSteps && (
            <div className="p-6 space-y-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
              {calculatedResult.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-blue-600 dark:text-blue-400 select-none">[{idx + 1}]</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accordion: Formulas Used */}
      {calculatedResult && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-100 text-sm hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Chemistry Formulas & Definitions Applied</span>
            </div>
            {showFormulas ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>

          {showFormulas && (
            <div className="p-6 space-y-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
              {calculatedResult.formulasUsed.map((formula, idx) => (
                <div key={idx} className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span>{formula}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

