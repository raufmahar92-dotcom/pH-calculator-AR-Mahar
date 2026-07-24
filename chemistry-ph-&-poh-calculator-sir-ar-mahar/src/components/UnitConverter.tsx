import React, { useState } from 'react';
import { ArrowLeftRight, ArrowRight, Thermometer, FlaskConical } from 'lucide-react';
import { getKwFromTemp } from '../utils/chemistry';

type ConverterCategory = 'concentration' | 'volume' | 'mass' | 'temperature';

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<ConverterCategory>('concentration');
  const [inputValue, setInputValue] = useState<string>('1.0');

  // Concentration units
  const [concFrom, setConcFrom] = useState<'M' | 'mM' | 'uM' | 'ppm'>('M');
  const [concTo, setConcTo] = useState<'mM' | 'uM' | 'M' | 'ppm'>('mM');

  // Volume units
  const [volFrom, setVolFrom] = useState<'L' | 'mL' | 'uL' | 'm3'>('L');
  const [volTo, setVolTo] = useState<'mL' | 'uL' | 'L' | 'm3'>('mL');

  // Mass units
  const [massFrom, setMassFrom] = useState<'g' | 'mg' | 'kg' | 'lb'>('g');
  const [massTo, setMassTo] = useState<'mg' | 'g' | 'kg' | 'lb'>('mg');

  // Temperature units
  const [tempFrom, setTempFrom] = useState<'C' | 'K' | 'F'>('C');
  const [tempTo, setTempTo] = useState<'K' | 'C' | 'F'>('K');

  const numVal = parseFloat(inputValue) || 0;

  // Convert Concentration
  const convertConcentration = (val: number, from: string, to: string) => {
    // base unit = Molar (M)
    let baseM = val;
    if (from === 'mM') baseM = val / 1000;
    if (from === 'uM') baseM = val / 1e6;
    if (from === 'ppm') baseM = val / 1000; // rough 1ppm = 1mg/L ≈ 1mM for MW=100

    if (to === 'M') return baseM;
    if (to === 'mM') return baseM * 1000;
    if (to === 'uM') return baseM * 1e6;
    if (to === 'ppm') return baseM * 1000;
    return baseM;
  };

  // Convert Volume
  const convertVolume = (val: number, from: string, to: string) => {
    // base unit = Liters (L)
    let baseL = val;
    if (from === 'mL') baseL = val / 1000;
    if (from === 'uL') baseL = val / 1e6;
    if (from === 'm3') baseL = val * 1000;

    if (to === 'L') return baseL;
    if (to === 'mL') return baseL * 1000;
    if (to === 'uL') return baseL * 1e6;
    if (to === 'm3') return baseL / 1000;
    return baseL;
  };

  // Convert Mass
  const convertMass = (val: number, from: string, to: string) => {
    // base unit = Grams (g)
    let baseG = val;
    if (from === 'mg') baseG = val / 1000;
    if (from === 'kg') baseG = val * 1000;
    if (from === 'lb') baseG = val * 453.592;

    if (to === 'g') return baseG;
    if (to === 'mg') return baseG * 1000;
    if (to === 'kg') return baseG / 1000;
    if (to === 'lb') return baseG / 453.592;
    return baseG;
  };

  // Convert Temperature
  const convertTemp = (val: number, from: string, to: string) => {
    let degC = val;
    if (from === 'K') degC = val - 273.15;
    if (from === 'F') degC = ((val - 32) * 5) / 9;

    if (to === 'C') return degC;
    if (to === 'K') return degC + 273.15;
    if (to === 'F') return (degC * 9) / 5 + 32;
    return degC;
  };

  let convertedOutput = 0;
  if (category === 'concentration') convertedOutput = convertConcentration(numVal, concFrom, concTo);
  if (category === 'volume') convertedOutput = convertVolume(numVal, volFrom, volTo);
  if (category === 'mass') convertedOutput = convertMass(numVal, massFrom, massTo);
  if (category === 'temperature') convertedOutput = convertTemp(numVal, tempFrom, tempTo);

  // Temperature Kw info
  const tempInC = category === 'temperature' ? convertTemp(numVal, tempFrom, 'C') : 25;
  const kwVal = getKwFromTemp(tempInC);
  const pKwVal = -Math.log10(kwVal);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Category Pills */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
        {[
          { id: 'concentration', label: 'Concentration' },
          { id: 'volume', label: 'Volume' },
          { id: 'mass', label: 'Mass' },
          { id: 'temperature', label: 'Temperature & Kw' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id as any)}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              category === cat.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Converter Card */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
        
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <ArrowLeftRight className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
            Chemistry Unit Converter
          </h3>
        </div>

        {/* Input & Unit Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          
          {/* From Box */}
          <div className="sm:col-span-5 space-y-2">
            <label className="text-xs font-semibold text-slate-500">From Value:</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono text-base font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            {/* From Unit Select */}
            {category === 'concentration' && (
              <select value={concFrom} onChange={(e) => setConcFrom(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="M">Molar (M = mol/L)</option>
                <option value="mM">Millimolar (mM)</option>
                <option value="uM">Micromolar (µM)</option>
                <option value="ppm">Parts per Million (ppm)</option>
              </select>
            )}

            {category === 'volume' && (
              <select value={volFrom} onChange={(e) => setVolFrom(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="L">Liters (L)</option>
                <option value="mL">Milliliters (mL)</option>
                <option value="uL">Microliters (µL)</option>
                <option value="m3">Cubic Meters (m³)</option>
              </select>
            )}

            {category === 'mass' && (
              <select value={massFrom} onChange={(e) => setMassFrom(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="g">Grams (g)</option>
                <option value="mg">Milligrams (mg)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            )}

            {category === 'temperature' && (
              <select value={tempFrom} onChange={(e) => setTempFrom(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="C">Celsius (°C)</option>
                <option value="K">Kelvin (K)</option>
                <option value="F">Fahrenheit (°F)</option>
              </select>
            )}
          </div>

          {/* Arrow */}
          <div className="sm:col-span-2 text-center py-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-300 mx-auto flex items-center justify-center font-bold">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* To Box */}
          <div className="sm:col-span-5 space-y-2">
            <label className="text-xs font-semibold text-slate-500">Converted Output:</label>
            <div className="w-full px-4 py-3 rounded-xl bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 font-mono text-lg font-black text-blue-700 dark:text-blue-300">
              {convertedOutput.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </div>

            {/* To Unit Select */}
            {category === 'concentration' && (
              <select value={concTo} onChange={(e) => setConcTo(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="mM">Millimolar (mM)</option>
                <option value="uM">Micromolar (µM)</option>
                <option value="M">Molar (M)</option>
                <option value="ppm">Parts per Million (ppm)</option>
              </select>
            )}

            {category === 'volume' && (
              <select value={volTo} onChange={(e) => setVolTo(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="mL">Milliliters (mL)</option>
                <option value="uL">Microliters (µL)</option>
                <option value="L">Liters (L)</option>
                <option value="m3">Cubic Meters (m³)</option>
              </select>
            )}

            {category === 'mass' && (
              <select value={massTo} onChange={(e) => setMassTo(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="mg">Milligrams (mg)</option>
                <option value="g">Grams (g)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            )}

            {category === 'temperature' && (
              <select value={tempTo} onChange={(e) => setTempTo(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="K">Kelvin (K)</option>
                <option value="C">Celsius (°C)</option>
                <option value="F">Fahrenheit (°F)</option>
              </select>
            )}
          </div>

        </div>

        {/* Temperature Kw Box */}
        {category === 'temperature' && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-indigo-600" />
              Water Autoionization at {tempInC.toFixed(1)}°C:
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>Kw = <strong className="text-indigo-600 dark:text-indigo-300">{kwVal.toExponential(3)} M²</strong></div>
              <div>pKw = <strong className="text-indigo-600 dark:text-indigo-300">{pKwVal.toFixed(2)}</strong></div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
