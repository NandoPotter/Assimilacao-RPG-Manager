/** ============================================================
 * ARQUIVO: src/contexts/AuthContext.tsx
 * DESCRIÇÃO: Gerenciamento global de autenticação e perfil.
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

  // Busca dados do perfil no banco de dados
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', userId)
        .single();

      if (data) {
        setUsername(data.username);
        setRole(data.role as UserMode);
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
  // 1. Tenta recuperar a sessão salva no LocalStorage
  const initializeAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setUser(session.user);
      await fetchProfile(session.user.id); // Busca Username/Role do BD
    }
    
    // Só após tentar carregar tudo, liberamos o app
    setIsLoading(false);
  };

  initializeAuth();

  // 2. Escuta mudanças (se o token expirar ou ele deslogar em outra aba)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      setUser(session.user);
      await fetchProfile(session.user.id);
    } else {
      setUser(null);
      setUsername(null);
      setIsLoading(false);
    }
  });

  return () => subscription.unsubscribe();
  }, []);

  const toggleRole = async () => {
    if (!user) return;
    const newMode: UserMode = role === 'assimilador' ? 'infectado' : 'assimilador';
    
    try {
      await authService.updateUserMode(user.id, newMode);
      setRole(newMode);
    } catch (err) {
      alert("Erro ao trocar modo no banco.");
    }
  };

  const signOut = async () => {
    try {
        await authService.logout(); 
    } catch (error) {
        console.error("Erro ao deslogar:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, username, role, isLoading, toggleRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}