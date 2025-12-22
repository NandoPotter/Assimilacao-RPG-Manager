// ============================================================================
// src/interfaces/Gameplay.ts
// Definições de Tipos para o Sistema de Jogo (RPG)
// ============================================================================

// Tipos Literais (String Unions) para garantir segurança no código
export type GenerationType = 'Pré-Colapso' | 'Colapso' | 'Pós-Colapso';
export type CharacterStatus = 'Vivo' | 'Ferido' | 'Morto' | 'Em Criação';

// Estrutura dos Instintos (Atributos Principais)
export interface Instincts {
  influencia: number;
  percepcao: number;
  potencia: number;
  reacao: number;
  resolucao: number;
  sagacidade: number;
  [key: string]: number;
}

// Estrutura das Aptidões (Perícias)
export interface Aptitudes {
  // Conhecimentos
  biologia: number;
  erudicao: number;
  engenharia: number;
  geografia: number;
  medicina: number;
  seguranca: number;
  // Práticas
  armas: number;
  atletismo: number;
  expressao: number;
  furtividade: number;
  manufaturas: number;
  sobrevivencia: number;
  [key: string]: number;
}

// Estrutura de Barra Vital (Saúde, Determinação, etc)
export interface VitalBar {
  current: number;
  max: number;
  temp?: number; // Pontos temporários (ex: adrenalina)
}

// Estrutura Agrupada de Vitais
export interface Vitals {
  health: VitalBar;
  determination: VitalBar;
  assimilation: VitalBar;
}

// Dados Narrativos (Background)
export interface BackgroundData {
  occupation: string;
  event: string;
  description: string;
  notes: string;
  purposes: {
    p1: string; // Pessoal 1
    p2: string; // Pessoal 2
    c1: string; // Coletivo 1
    c2: string; // Coletivo 2
  };
}

// ============================================================================
// A INTERFACE PRINCIPAL DO PERSONAGEM
// (Espelha a tabela 'characters' do Supabase)
// ============================================================================
export interface Character {
  id: string; // UUID
  user_id: string; // Dono
  name: string;
  avatar_url?: string | null;
  generation: GenerationType;
  
  status: CharacterStatus;
  is_draft: boolean;

  // Campos JSONB transformados em Objetos Tipados
  background: BackgroundData;
  instincts: Instincts;
  aptitudes: Aptitudes;
  base_aptitudes: Aptitudes; // Para saber quanto evoluiu
  vitals: Vitals;

  // Metadados de Regras
  xp_available: number;
  kit_name?: string;
  characteristics_ids?: number[]; // IDs das vantagens compradas

  created_at: string;
}