// src/utils/DicePoints.ts

// Definição do que um resultado pode conter
export type DiceResult = {
  success: number;    // Quantidade de sucessos
  adaptation: number; // Quantidade de adaptação (Substituiu failure)
  pressure: number;   // Quantidade de pressão
  label: string;      // Nome descritivo (opcional, para debug)
};

// --- TABELA UNIVERSAL (1 a 12) ---
export const UNIVERSAL_TABLE: Record<number, DiceResult> = {
  // Valores para D6
  1:  { success: 0, adaptation: 0, pressure: 0, label: "Face 01" },
  2:  { success: 0, adaptation: 0, pressure: 0, label: "Face 02" },
  3:  { success: 0, adaptation: 0, pressure: 1, label: "Face 03" },
  4:  { success: 0, adaptation: 0, pressure: 1, label: "Face 04" },
  5:  { success: 0, adaptation: 1, pressure: 1, label: "Face 05" },
  6:  { success: 1, adaptation: 0, pressure: 0, label: "Face 06" },

  // Valores para D10
  7:  { success: 2, adaptation: 0, pressure: 0, label: "Face 07" },
  8:  { success: 1, adaptation: 1, pressure: 0, label: "Face 08" },
  9:  { success: 1, adaptation: 1, pressure: 1, label: "Face 09" },
  10: { success: 2, adaptation: 0, pressure: 1, label: "Face 10" },
  
  // Valores para D12
  11: { success: 1, adaptation: 2, pressure: 1, label: "Face 11" },
  12: { success: 0, adaptation: 0, pressure: 2, label: "Face 12" },
};

// Função auxiliar para pegar o resultado
export const getResult = (value: number): DiceResult => {
  return UNIVERSAL_TABLE[value] || { success: 0, adaptation: 0, pressure: 0, label: "Face 01" };
};