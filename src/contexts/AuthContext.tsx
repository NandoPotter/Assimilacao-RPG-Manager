/** ============================================================
 * ARQUIVO: src/contexts/AuthContext.tsx
 * DESCRIÇÃO: Auth Otimizado
 * ============================================================ */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { type UserMode } from '../interfaces/System';

interface AuthContextType {
  user: any | null;
  username: string | null;
  role: UserMode;
  isLoading: boolean;
  toggleRole: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<UserMode>('infectado');
  const [isLoading, setIsLoading] = useState(true);

  // Função simples que lê o Token
  const loadFromSession = (sessionUser: any) => {
    if (!sessionUser) return;
    
    // Lê direto dos metadados (Rápido e sem ir no banco)
    const meta = sessionUser.user_metadata;
    if (meta) {
        setUsername(meta.display_name || 'Explorador');
        // Se existir role no token, usa. Se não, usa infectado.
        setRole((meta.role as UserMode) || 'infectado');
    }
  };

  useEffect(() => {
    // 1. Inicialização
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadFromSession(session.user);
      }
      setIsLoading(false);
    });

    // 2. Listener de mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadFromSession(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleRole = async () => {
    if (!user) return;
    
    const newMode: UserMode = role === 'assimilador' ? 'infectado' : 'assimilador';
    
    // 1. Muda na tela imediatamente (Feedback visual instantâneo)
    setRole(newMode);

    try {
      // 2. Atualiza Banco + Token
      await authService.updateUserMode(user.id, newMode);
      
      // 3. Força o React a perceber que o Token mudou
      await supabase.auth.refreshSession();

    } catch (err) {
      console.error("Erro ao salvar modo:", err);
      setRole(role); // Desfaz se der erro
    }
  };

  const signOut = async () => {
    try { await authService.logout(); } catch (error) { console.error(error); }
  };

  return (
    <AuthContext.Provider value={{ user, username, role, isLoading, toggleRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) { throw new Error('useAuth deve ser usado dentro de um AuthProvider'); }
  return context;
}