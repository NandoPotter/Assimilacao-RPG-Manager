/** ============================================================
 *  ARQUIVO: src/services/supabaseClient.ts
 *  DESCRIÇÃO: Configura a conexão com o projeto Supabase.
 *  ============================================================ */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// O cliente é exportado para ser usado em toda a aplicação.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);