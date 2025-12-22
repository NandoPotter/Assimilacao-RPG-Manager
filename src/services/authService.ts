/** ============================================================
 *  ARQUIVO: src/services/authService.ts
 *  DESCRIÇÃO: Serviços de autenticação do usuário.
 *  ============================================================ */

import { supabase } from './supabaseClient';
import { type UserMode } from '../interfaces/System';

export const authService = {
  // Login
  async login(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    return data;
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Cadastro
  async register(email: string, pass: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          display_name: username,
          role: 'infectado' // Define o padrão inicial no Token
        }
      }
    });
    if (error) throw error;
    return data;
  },

  // ATUALIZAR MODO (A Mágica acontece aqui)
  async updateUserMode(userId: string, newMode: UserMode) {
    // 1. Atualiza a Tabela (Para persistência no banco)
    const dbUpdate = await supabase
      .from('profiles')
      .update({ role: newMode })
      .eq('id', userId);

    if (dbUpdate.error) throw dbUpdate.error;

    // 2. Atualiza o TOKEN do Usuário (Para persistência na Sessão/Navegador)
    // Isso evita ter que ir no banco buscar a role toda hora
    const authUpdate = await supabase.auth.updateUser({
      data: { role: newMode }
    });

    if (authUpdate.error) throw authUpdate.error;

    return authUpdate.data;
  }
};