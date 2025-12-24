/** ============================================================
 * ARQUIVO: src/pages/Auth/Index.tsx
 * DESCRIÇÃO: Redirecionamento de sessão.
 * ============================================================ */

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

const RootRedirect: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            setIsAuthenticated(!!data.session); // !! converte objeto/null para true/false
        };
        checkSession();
    }, []);

    // 1. Estado de Carregamento (Tela preta ou Spinner)
    if (isAuthenticated === null) {
        return <div style={{ height: '100vh', width: '100vw', background: '#121214' }} />;
    }

    // 2. Decisão de Roteamento
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    } else {
        return <Navigate to="/login" replace />;
    }
};

export default RootRedirect;