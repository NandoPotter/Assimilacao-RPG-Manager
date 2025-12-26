/** ============================================================
 * ARQUIVO: src/pages/Dashboard/Index.tsx
 * DESCRIÇÃO: Layout principal (Atualizado para Mobile)
 * ============================================================ */

import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar'; // Ajuste o import conforme sua estrutura de pastas
import { useAuth } from '../../contexts/AuthContext';

import '../../styles/DashboardLayout.css';

function DashboardLayout() {

    const { role, toggleRole, username, isLoading, user } = useAuth();

    // 1. Loading State
    if (isLoading) {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>Sincronizando dados da conta...</p>
            </div>
        );
    }

    // 2. Proteção de Rota
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Renderização
    return (
        <div className={`dashboard-container theme-${role}`}>
            
            {/* A Sidebar agora contém a Navbar Fixa Mobile dentro dela */}
            <Sidebar mode={role} onToggleMode={toggleRole} />
            
            <main className="content-area">
                <header className="dashboard-header">
                    <h1 className="user-role">
                        Bem-vindo, <span className="highlight">{username || 'Viajante'}!</span>
                    </h1>
                </header>

                {/* Aqui entra o conteúdo das páginas (Characters, Campaigns, etc) */}
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;