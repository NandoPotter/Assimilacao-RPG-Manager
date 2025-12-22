/** ============================================================
 *  ARQUIVO: src/services/supabaseClient.ts
 *  DESCRIÇÃO: Configura a conexão com o projeto Supabase.
 *  ============================================================ */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 1. Verificação de Variáveis de Ambiente (Onde costuma travar)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas.');
  console.error('URL:', supabaseUrl);
  console.error('KEY:', supabaseAnonKey ? 'Definida' : 'Indefinida');
  alert('Erro de Configuração: Verifique seu arquivo .env');
}

console.log("Inicializando Supabase Client em:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // IMPORTANTE: Configurações para evitar travamentos locais
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // Desligue isso para evitar conflitos de redirecionamento
  },
  // Aumenta o timeout para não ficar pendente para sempre se a rede engasgar
  global: {
    headers: { 'x-my-custom-header': 'rpg-manager' },
  },
});