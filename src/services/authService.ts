/** ============================================================
 *  ARQUIVO: src/services/authService.ts
 *  DESCRIÇÃO: Funções de autenticação (Login, Logout e Sessão).
 *  ============================================================ */

import { supabase } from './supabaseClient';
import { type UserMode } from '../interfaces/System';

export const authService = {
  // Login: Usa apenas Email e Senha
  async login(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    return data;
  },

  // FUNÇÃO DE LOGOUT
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Cadastro: Email e Senha para Login + Username para Perfil
  async register(email: string, pass: string, username: string) {
  // ADICIONE ESSE LOG PARA DEBUG
  console.log("Serviço de Registro iniciado para:", username);

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        display_name: username,
        role: 'infectado'
      }
    }
  });

  if (error) {
    console.error("Erro no Supabase Auth:", error.message);
    throw error;
  }
  
  return data;
},

  // Função para salvar a troca de modo no perfil do usuário
  async updateUserMode(userId: string, newMode: UserMode) {
  console.log("Chamando Supabase para ID:", userId, "Novo Modo:", newMode);

  const { data, error, status } = await supabase
    .from('profiles')
    .update({ role: newMode })
    .eq('id', userId)
    .select(); // O select() força o Supabase a retornar o que foi alterado

  if (error) {
    console.error("Erro retornado pelo Supabase:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn("Aviso: Nenhuma linha foi alterada. Status:", status);
    throw new Error("O banco recebeu o comando, mas não encontrou o perfil ou o RLS bloqueou.");
  }

  console.log("Sucesso no BD! Dados atualizados:", data);
  return data;
}
};