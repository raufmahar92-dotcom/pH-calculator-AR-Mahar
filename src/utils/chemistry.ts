import { CalculationResult, CalculationType } from '../types';

/**
 * Formats a number in standard scientific notation (e.g. 1.00 × 10⁻⁷ M) or decimal format
 */
export function formatScientific(num: number | undefined, decimals = 4): string {
  if (num === undefined || isNaN(num) || num === null) return 'N/A';
  if (num === 0) return '0';

  const absNum = Math.abs(num);
  if (absNum < 0.0001 || absNum >= 10000) {
    const expStr = num.toExponential(decimals);
    const [mantissa, exponent] = expStr.split('e');
    const expNum = parseInt(exponent, 10);
    const superscriptExp = toSuperscript(expNum);
    return `${mantissa} × 10${superscriptExp}`;
  } else {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }
}

/**
 * Converts integers/signs to superscript numbers
 */
export function toSuperscript(num: number): string {
  const map: Record<string, string> = {
    '-': '⁻',
    '+': '⁺',
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };
  return num
    .toString()
    .split('')
    .map((char) => map[char] || char)
    .join('');
}

/**
 * Safely parses input strings including scientific notation like 1e-7, 1.5*10^-3, 0.001
 */
export function parseChemNumber(input: string | number): number | null {
  if (typeof input === 'number') return isNaN(input) ? null : input;
  if (!input || typeof input !== 'string') return null;

  let cleaned = input.trim().toLowerCase();
  // replace x10^ or *10^ or *10** with e
  cleaned = cleaned.replace(/×10\^?/g, 'e');
  cleaned = cleaned.replace(/\*10\^?/g, 'e');
  cleaned = cleaned.replace(/x10\^?/g, 'e');

  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

/**
 * Determine nature of solution based on pH at 25°C
 */
export function getAcidBaseNature(ph: number): 'Acidic' | 'Basic' | 'Neutral' {
  if (Math.abs(ph - 7.0) < 0.01) return 'Neutral';
  return ph < 7.0 ? 'Acidic' : 'Basic';
}

/**
 * Kw value at default 25°C
 */
export const DEFAULT_KW = 1.0e-14;
export const DEFAULT_PKW = 14.0;

// 1. Calculate pH from H+
export function calculatePhFromH(hConc: number, tempC = 25): CalculationResult {
  const kw = getKwFromTemp(tempC);
  const pKw = -Math.log10(kw);

  const ph = -Math.log10(hConc);
  const poh = pKw - ph;
  const ohConc = kw / hConc;
  const nature = getAcidBaseNature(ph);

  const steps = [
    `Given Hydrogen Ion Concentration: [H⁺] = ${formatScientific(hConc)} M`,
    `Step 1: Use the pH definition formula: pH = -log₁₀[H⁺]`,
    `Step 2: Substitute [H⁺]: pH = -log₁₀(${formatScientific(hConc)})`,
    `Step 3: Calculate pH = ${ph.toFixed(4)}`,
    `Step 4: Calculate pOH using pKW (${pKw.toFixed(2)} at ${tempC}°C): pOH = pKw - pH = ${pKw.toFixed(2)} - ${ph.toFixed(4)} = ${poh.toFixed(4)}`,
    `Step 5: Calculate [OH⁻]: [OH⁻] = 10⁻ᵖᴼᴴ = 10^(${-poh.toFixed(4)}) = ${formatScientific(ohConc)} M`,
    `Step 6: Determine Nature: Since pH = ${ph.toFixed(2)} (${ph < 7 ? '< 7' : ph > 7 ? '> 7' : '= 7'}), the solution is ${nature.toUpperCase()}.`,
  ];

  return {
    id: 'calc_' + Date.now(),
    type: 'ph_from_h',
    title: 'pH & pOH from [H⁺]',
    timestamp: Date.now(),
    inputs: { hConcentration: hConc, temperature: tempC },
    outputs: {
      ph: Number(ph.toFixed(4)),
      poh: Number(poh.toFixed(4)),
      hConcentration: hConc,
      ohConcentration: ohConc,
      nature,
    },
    steps,
    formulasUsed: [
      'pH = -log₁₀[H⁺]',
      'pH + pOH = pKw (14.00 @ 25°C)',
      '[H⁺][OH⁻] = Kw (1.0 × 10⁻¹⁴ M²)',
    ],
  };
}

// 2. Calculate H+ from pH
export function calculateHFromPh(ph: number, tempC = 25): CalculationResult {
  const kw = getKwFromTemp(tempC);
  const pKw = -Math.log10(kw);

  const hConc = Math.pow(10, -ph);
  const poh = pKw - ph;
  const ohConc = kw / hConc;
  const nature = getAcidBaseNature(ph);

  const steps = [
    `Given pH = ${ph.toFixed(4)}`,
    `Step 1: Use inverse logarithm formula: [H⁺] = 10⁻ᵖᴴ`,
    `Step 2: Substitute pH value: [H⁺] = 10^(${-ph.toFixed(4)})`,
    `Step 3: Calculate [H⁺] = ${formatScientific(hConc)} M`,
    `Step 4: Calculate pOH: pOH = pKw - pH = ${pKw.toFixed(2)} - ${ph.toFixed(4)} = ${poh.toFixed(4)}`,
    `Step 5: Calculate [OH⁻]: [OH⁻] = 10⁻ᵖᴼᴴ = ${formatScientific(ohConc)} M`,
    `Step 6: Nature Analysis: At pH = ${ph.toFixed(2)}, solution is ${nature.toUpperCase()}.`,
  ];

  return {
    id: 'calc_' + Date.now(),
    type: 'h_from_ph',
    title: '[H⁺] & pOH from pH',
    timestamp: Date.now(),
    inputs: { ph, temperature: tempC },
    outputs: {
      ph: Number(ph.toFixed(4)),
      poh: Number(poh.toFixed(4)),
      hConcentration: hConc,
      ohConcentration: ohConc,
      nature,
    },
    steps,
    formulasUsed: [
      '[H⁺] = 10⁻ᵖᴴ',
      'pOH = pKw - pH',
      '[OH⁻] = Kw / [H⁺]',
    ],
  };
}

// 3. Calculate pOH from OH-
export function calculatePohFromOh(ohConc: number, tempC = 25): CalculationResult {
  const kw = getKwFromTemp(tempC);
  const pKw = -Math.log10(kw);

  const poh = -Math.log10(ohConc);
  const ph = pKw - poh;
  const hConc = kw / ohConc;
  const nature = getAcidBaseNature(ph);

  const steps = [
    `Given Hydroxide Ion Concentration: [OH⁻] = ${formatScientific(ohConc)} M`,
    `Step 1: Use pOH formula: pOH = -log₁₀[OH⁻]`,
    `Step 2: Substitute [OH⁻]: pOH = -log₁₀(${formatScientific(ohConc)})`,
    `Step 3: Calculate pOH = ${poh.toFixed(4)}`,
    `Step 4: Calculate pH: pH = pKw - pOH = ${pKw.toFixed(2)} - ${poh.toFixed(4)} = ${ph.toFixed(4)}`,
    `Step 5: Calculate [H⁺]: [H⁺] = Kw / [OH⁻] = ${formatScientific(hConc)} M`,
    `Step 6: Nature Analysis: Since pH = ${ph.toFixed(2)}, solution is ${nature.toUpperCase()}.`,
  ];

  return {
    id: 'calc_' + Date.now(),
    type: 'poh_from_oh',
    title: 'pOH & pH from [OH⁻]',
    timestamp: Date.now(),
    inputs: { ohConcentration: ohConc, temperature: tempC },
    outputs: {
      ph: Number(ph.toFixed(4)),
      poh: Number(poh.toFixed(4)),
      hConcentration: hConc,
      ohConcentration: ohConc,
      nature,
    },
    steps,
    formulasUsed: [
      'pOH = -log₁₀[OH⁻]',
      'pH = pKw - pOH',
      '[H⁺] = 10⁻ᵖᴴ',
    ],
  };
}

// 4. Calculate OH- from pOH
export function calculateOhFromPoh(poh: number, tempC = 25): CalculationResult {
  const kw = getKwFromTemp(tempC);
  const pKw = -Math.log10(kw);

  const ohConc = Math.pow(10, -poh);
  const ph = pKw - poh;
  const hConc = kw / ohConc;
  const nature = getAcidBaseNature(ph);

  const steps = [
    `Given pOH = ${poh.toFixed(4)}`,
    `Step 1: Use inverse log formula: [OH⁻] = 10⁻ᵖᴼᴴ`,
    `Step 2: Substitute pOH value: [OH⁻] = 10^(${-poh.toFixed(4)})`,
    `Step 3: Calculate [OH⁻] = ${formatScientific(ohConc)} M`,
    `Step 4: Calculate pH: pH = pKw - pOH = ${pKw.toFixed(2)} - ${poh.toFixed(4)} = ${ph.toFixed(4)}`,
    `Step 5: Calculate [H⁺]: [H⁺] = 10⁻ᵖᴴ = ${formatScientific(hConc)} M`,
    `Step 6: Nature Analysis: At pH = ${ph.toFixed(2)}, solution is ${nature.toUpperCase()}.`,
  ];

  return {
    id: 'calc_' + Date.now(),
    type: 'oh_from_poh',
    title: '[OH⁻] & pH from pOH',
    timestamp: Date.now(),
    inputs: { poh, temperature: tempC },
    outputs: {
      ph: Number(ph.toFixed(4)),
      poh: Number(poh.toFixed(4)),
      hConcentration: hConc,
      ohConcentration: ohConc,
      nature,
    },
    steps,
    formulasUsed: [
      '[OH⁻] = 10⁻ᵖᴼᴴ',
      'pH = pKw - pOH',
      '[H⁺] = 10⁻ᵖᴴ',
    ],
  };
}

// 5. Convert pH ↔ pOH
export function convertPhPoh(value: number, inputType: 'pH' | 'pOH', tempC = 25): CalculationResult {
  const kw = getKwFromTemp(tempC);
  const pKw = -Math.log10(kw);

  let ph: number;
  let poh: number;

  if (inputType === 'pH') {
    ph = value;
    poh = pKw - ph;
  } else {
    poh = value;
    ph = pKw - poh;
  }

  const hConc = Math.pow(10, -ph);
  const ohConc = Math.pow(10, -poh);
  const nature = getAcidBaseNature(ph);

  const steps = [
    `Input Value: ${inputType} = ${value.toFixed(4)} at ${tempC}°C`,
    `Step 1: Relationship Equation: pH + pOH = pKw (${pKw.toFixed(2)})`,
    inputType === 'pH'
      ? `Step 2: Solve for pOH = pKw - pH = ${pKw.toFixed(2)} - ${ph.toFixed(4)} = ${poh.toFixed(4)}`
      : `Step 2: Solve for pH = pKw - pOH = ${pKw.toFixed(2)} - ${poh.toFixed(4)} = ${ph.toFixed(4)}`,
    `Step 3: Calculate [H⁺] = 10⁻ᵖᴴ = ${formatScientific(hConc)} M`,
    `Step 4: Calculate [OH⁻] = 10⁻ᵖᴼᴴ = ${formatScientific(ohConc)} M`,
    `Step 5: Chemical Classification: ${nature.toUpperCase()} solution`,
  ];

  return {
    id: 'calc_' + Date.now(),
    type: 'convert_ph_poh',
    title: `Convert ${inputType} ↔ ${inputType === 'pH' ? 'pOH' : 'pH'}`,
    timestamp: Date.now(),
    inputs: { value, inputType, temperature: tempC },
    outputs: {
      ph: Number(ph.toFixed(4)),
      poh: Number(poh.toFixed(4)),
      hConcentration: hConc,
      ohConcentration: ohConc,
      nature,
    },
    steps,
    formulasUsed: ['pH + pOH = pKw (14.00 @ 25°C)', '[H⁺] = 10⁻ᵖᴴ', '[OH⁻] = 10⁻ᵖᴼᴴ'],
  };
}

// 12. Molarity Calculator
export function calculateMolarity(params: {
  moles?: number;
  mass?: number;
  molarMass?: number;
  volumeL?: number;
  target: 'molarity' | 'moles' | 'mass' | 'volume';
}): CalculationResult {
  let { moles, mass, molarMass, volumeL, target } = params;
  let resultMolarity: number | undefined;
  let resultMoles: number | undefined;
  let resultMass: number | undefined;
  let resultVolume: number | undefined;

  const steps: string[] = [];

  if (target === 'molarity') {
    if (moles === undefined && mass !== undefined && molarMass !== undefined) {
      moles = mass / molarMass;
      steps.push(`Step 1: Calculate Moles (n) = Mass (m) / Molar Mass (M)`);
      steps.push(`n = ${mass} g / ${molarMass} g/mol = ${moles.toFixed(6)} moles`);
    } else if (moles !== undefined) {
      steps.push(`Step 1: Moles (n) = ${moles} mol`);
    }

    if (moles !== undefined && volumeL !== undefined && volumeL > 0) {
      resultMolarity = moles / volumeL;
      steps.push(`Step 2: Calculate Molarity (M) = Moles of solute (n) / Volume of solution (V in L)`);
      steps.push(`M = ${moles.toFixed(6)} mol / ${volumeL} L = ${resultMolarity.toFixed(6)} M`);
    }
  } else if (target === 'mass') {
    const molarityInput = params.moles; // overloaded or passed
    if (molarityInput !== undefined && volumeL !== undefined && molarMass !== undefined) {
      resultMoles = molarityInput * volumeL;
      resultMass = resultMoles * molarMass;
      resultMolarity = molarityInput;
      steps.push(`Step 1: Calculate required Moles: n = Molarity × Volume (L) = ${molarityInput} M × ${volumeL} L = ${resultMoles.toFixed(6)} mol`);
      steps.push(`Step 2: Calculate Mass: m = n × Molar Mass = ${resultMoles.toFixed(6)} mol × ${molarMass} g/mol = ${resultMass.toFixed(4)} g`);
    }
  } else if (target === 'volume') {
    const molarityInput = params.moles;
    if (moles === undefined && mass !== undefined && molarMass !== undefined) {
      moles = mass / molarMass;
      steps.push(`Step 1: Calculate Moles (n) = ${mass} g / ${molarMass} g/mol = ${moles.toFixed(6)} mol`);
    }
    if (moles !== undefined && molarityInput !== undefined && molarityInput > 0) {
      resultVolume = moles / molarityInput;
      resultMolarity = molarityInput;
      steps.push(`Step 2: Calculate Volume (V in L) = n / M = ${moles.toFixed(6)} mol / ${molarityInput} M = ${resultVolume.toFixed(6)} L (${(resultVolume * 1000).toFixed(2)} mL)`);
    }
  }

  return {
    id: 'calc_' + Date.now(),
    type: 'molarity',
    title: `Molarity Calculation (${target.toUpperCase()})`,
    timestamp: Date.now(),
    inputs: { ...params },
    outputs: {
      molarity: resultMolarity ? Number(resultMolarity.toFixed(6)) : undefined,
      moles: resultMoles ? Number(resultMoles.toFixed(6)) : moles,
      mass: resultMass ? Number(resultMass.toFixed(4)) : mass,
      volumeL: resultVolume ? Number(resultVolume.toFixed(6)) : volumeL,
    },
    steps,
    formulasUsed: [
      'Molarity (M) = Moles of Solute (n) / Volume of Solution (L)',
      'Moles (n) = Mass (g) / Molar Mass (g/mol)',
    ],
  };
}

// 13. Molality Calculator
export function calculateMolality(params: {
  moles?: number;
  massSolute?: number;
  molarMass?: number;
  massSolventKg?: number;
}): CalculationResult {
  let { moles, massSolute, molarMass, massSolventKg } = params;
  const steps: string[] = [];

  if (moles === undefined && massSolute !== undefined && molarMass !== undefined) {
    moles = massSolute / molarMass;
    steps.push(`Step 1: Calculate Moles of Solute (n) = Mass (g) / Molar Mass (g/mol)`);
    steps.push(`n = ${massSolute} g / ${molarMass} g/mol = ${moles.toFixed(6)} mol`);
  } else {
    steps.push(`Given Moles of Solute (n) = ${moles} mol`);
  }

  let molalityVal = 0;
  if (moles !== undefined && massSolventKg !== undefined && massSolventKg > 0) {
    molalityVal = moles / massSolventKg;
    steps.push(`Step 2: Calculate Molality (m) = Moles of Solute / Mass of Solvent in kg`);
    steps.push(`m = ${moles.toFixed(6)} mol / ${massSolventKg} kg = ${molalityVal.toFixed(6)} mol/kg (m)`);
  }

  return {
    id: 'calc_' + Date.now(),
    type: 'molality',
    title: 'Molality Calculation',
    timestamp: Date.now(),
    inputs: { ...params },
    outputs: {
      molality: Number(molalityVal.toFixed(6)),
      moles: moles ? Number(moles.toFixed(6)) : undefined,
      massSolventKg,
    },
    steps,
    formulasUsed: [
      'Molality (m) = Moles of Solute (n) / Mass of Solvent (kg)',
      'Moles (n) = Solute Mass (g) / Molar Mass (g/mol)',
    ],
  };
}

// 14. Dilution Calculator (M1 * V1 = M2 * V2)
export function calculateDilution(params: {
  m1?: number;
  v1?: number;
  m2?: number;
  v2?: number;
  solveFor: 'm1' | 'v1' | 'm2' | 'v2';
}): CalculationResult {
  const { m1, v1, m2, v2, solveFor } = params;
  let resM1 = m1;
  let resV1 = v1;
  let resM2 = m2;
  let resV2 = v2;
  const steps: string[] = [`Dilution Law: M₁ × V₁ = M₂ × V₂`];

  if (solveFor === 'm1' && v1 && m2 && v2) {
    resM1 = (m2 * v2) / v1;
    steps.push(`Step 1: Rearrange formula for M₁: M₁ = (M₂ × V₂) / V₁`);
    steps.push(`Step 2: Substitute values: M₁ = (${m2} M × ${v2} mL) / ${v1} mL = ${resM1.toFixed(6)} M`);
  } else if (solveFor === 'v1' && m1 && m2 && v2) {
    resV1 = (m2 * v2) / m1;
    steps.push(`Step 1: Rearrange formula for V₁: V₁ = (M₂ × V₂) / M₁`);
    steps.push(`Step 2: Substitute values: V₁ = (${m2} M × ${v2} mL) / ${m1} M = ${resV1.toFixed(6)} mL`);
  } else if (solveFor === 'm2' && m1 && v1 && v2) {
    resM2 = (m1 * v1) / v2;
    steps.push(`Step 1: Rearrange formula for M₂: M₂ = (M₁ × V₁) / V₂`);
    steps.push(`Step 2: Substitute values: M₂ = (${m1} M × ${v1} mL) / ${v2} mL = ${resM2.toFixed(6)} M`);
  } else if (solveFor === 'v2' && m1 && v1 && m2) {
    resV2 = (m1 * v1) / m2;
    steps.push(`Step 1: Rearrange formula for V₂: V₂ = (M₁ × V₁) / M₂`);
    steps.push(`Step 2: Substitute values: V₂ = (${m1} M × ${v1} mL) / ${m2} M = ${resV2.toFixed(6)} mL`);
  }

  return {
    id: 'calc_' + Date.now(),
    type: 'dilution',
    title: `Dilution (Solving for ${solveFor.toUpperCase()})`,
    timestamp: Date.now(),
    inputs: { ...params },
    outputs: {
      dilutionResult: {
        m1: resM1 ? Number(resM1.toFixed(6)) : undefined,
        v1: resV1 ? Number(resV1.toFixed(6)) : undefined,
        m2: resM2 ? Number(resM2.toFixed(6)) : undefined,
        v2: resV2 ? Number(resV2.toFixed(6)) : undefined,
        solvedVar: solveFor.toUpperCase(),
      },
    },
    steps,
    formulasUsed: ['M₁ × V₁ = M₂ × V₂ (Dilution Equation)'],
  };
}

/**
 * Temperature dependency of Kw (auto temperature adjustment)
 */
export function getKwFromTemp(tempC: number): number {
  if (tempC === 25) return 1.0e-14;
  if (tempC === 0) return 0.114e-14;
  if (tempC === 10) return 0.292e-14;
  if (tempC === 20) return 0.681e-14;
  if (tempC === 30) return 1.47e-14;
  if (tempC === 37) return 2.4e-14; // body temperature!
  if (tempC === 50) return 5.47e-14;
  if (tempC === 100) return 51.3e-14;

  // Van 't Hoff approximation for water ionization
  const tempK = tempC + 273.15;
  const T0 = 298.15; // 25°C in K
  const dH = 55800; // J/mol
  const R = 8.314;
  const lnKw = Math.log(1.0e-14) - (dH / R) * (1 / tempK - 1 / T0);
  return Math.exp(lnKw);
}
