export type CalculationType = 
  | 'ph_from_h' 
  | 'h_from_ph' 
  | 'poh_from_oh' 
  | 'oh_from_poh' 
  | 'convert_ph_poh' 
  | 'acid_base_neutral'
  | 'molarity'
  | 'molality'
  | 'dilution';

export interface CalculationResult {
  id: string;
  type: CalculationType;
  title: string;
  timestamp: number;
  inputs: Record<string, string | number>;
  outputs: {
    ph?: number;
    poh?: number;
    hConcentration?: number; // M
    ohConcentration?: number; // M
    nature?: 'Acidic' | 'Basic' | 'Neutral';
    molarity?: number;
    molality?: number;
    dilutionResult?: {
      m1?: number;
      v1?: number;
      m2?: number;
      v2?: number;
      solvedVar: string;
    };
    [key: string]: any;
  };
  steps: string[];
  formulasUsed: string[];
  notes?: string;
  isFavorite?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: 
    | 'alkali-metal' 
    | 'alkaline-earth' 
    | 'transition-metal' 
    | 'post-transition' 
    | 'metalloid' 
    | 'reactive-nonmetal' 
    | 'noble-gas' 
    | 'lanthanide' 
    | 'actinide' 
    | 'unknown';
  period: number;
  group: number;
  phase: 'Gas' | 'Liquid' | 'Solid' | 'Unknown';
  electronegativity?: number;
  electronConfig: string;
  summary: string;
  acidBaseRole?: string;
}

export interface ChemistryFormula {
  id: string;
  category: 'pH & pOH' | 'Solutions & Concentration' | 'Dilution & Titration' | 'Stoichiometry' | 'Thermodynamics' | 'Gas Laws';
  title: string;
  formula: string;
  latexFormula?: string;
  variables: { symbol: string; name: string; unit: string }[];
  description: string;
  example: string;
}

export interface PhBenchmark {
  ph: number;
  name: string;
  category: 'Strong Acid' | 'Weak Acid' | 'Neutral' | 'Weak Base' | 'Strong Base';
  color: string;
  description: string;
  hConcentration: string;
  iconName: string;
}
