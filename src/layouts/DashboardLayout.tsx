/** ============================================================
 * ARQUIVO: src/layouts/DashboardLayout.tsx
 * DESCRIÇÃO: Layout principal que reage ao estado global de Auth.
 * ============================================================ */

import { Outlet, Navigate } from 'react-router-dom'; // Adicionei o Navigate
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

import '../styles/DashboardLayout.css';

function DashboardLayout() {
    // Adicionamos o 'user' aqui para checar se a sessão existe
    const { role, toggleRole, username, isLoading, user } = useAuth();

    // 1. Enquanto checa o LocalStorage/Supabase
    if (isLoading) {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>Sincronizando dados da conta...</p>
            </div>
        );
    }

    // 2. PROTEÇÃO SIMPLES: Se terminou de carregar e não há usuário logado,
    // ele é redirecionado automaticamente para a página de login.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. SE ESTIVER TUDO OK, RENDERIZA O PAINEL
    return (
        <div className={`dashboard-container theme-${role}`}>
            
            <Sidebar mode={role} onToggleMode={toggleRole} />
            
            <main className="content-area">
                <header className="dashboard-header">
                    <h1 className="user-role">
                        Bem-vindo, <span className="highlight">{username || 'Explorador'}!</span>
                    </h1>
                </header>

                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;