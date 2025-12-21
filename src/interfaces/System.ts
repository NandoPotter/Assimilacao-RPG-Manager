/** ============================================================
 *  ARQUIVO: src/interfaces/System.ts
 *  DESCRIÇÃO: Definições de tipos globais do sistema.
 *  ============================================================ */

export type UserMode = 'assimilador' | 'infectado';

export interface LocationState {
  role: UserMode;
}