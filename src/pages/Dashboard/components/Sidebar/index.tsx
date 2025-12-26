/** ============================================================
 * ARQUIVO: src/pages/Dashboard/components/Sidebar/index.tsx
 * DESCRIÇÃO: Sidebar Responsiva com Barra Superior Fixa no Mobile
 * ============================================================ */

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { type UserMode } from '../../../../interfaces/System';
import { coreAppName, coreAppVersion } from '../../../../core/SystemConstants';
import { useAuth } from '../../../../contexts/AuthContext';

import logoImg from '../../../../assets/LogoAssimilacao.png';
import './Styles.css';

interface SidebarProps {
    mode: UserMode;
    onToggleMode: () => void;
}

export function Sidebar({ mode, onToggleMode }: SidebarProps) {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    
    // Estado para controlar abertura no Mobile
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error("Erro ao deslogar:", error);
        }
    };

    const handleModeSwitch = () => {
        onToggleMode();
        navigate('/dashboard');
        setIsMobileOpen(false); 
    };

    const handleLinkClick = () => {
        setIsMobileOpen(false);
    };

    return (
        <>
            {/* --- HEADER MOBILE FIXO (NOVO) --- */}
            {/* Substitui o antigo botão flutuante solto */}
            <header className="mobile-navbar">
                <button 
                    className="mobile-toggle-btn"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    aria-label="Abrir Menu"
                >
                    ☰
                </button>
                
                {/* Título/Logo no topo do mobile para identidade */}
                <div className="mobile-brand">
                    <span className="brand-text">{coreAppName}</span>
                </div>
            </header>

            {/* OVERLAY ESCURO */}
            <div 
                className={`sidebar-overlay ${isMobileOpen ? 'visible' : ''}`}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* SIDEBAR (Gaveta Lateral) */}
            <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <img src={logoImg} alt="Logo" className="sidebar-logo" />
                    <h2>{coreAppName}</h2>                    
                </div>

                <nav className="sidebar-nav">
                    <NavLink 
                        to="/dashboard" 
                        end 
                        className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}
                        onClick={handleLinkClick}
                    >
                        Dashboard
                    </NavLink>
                    
                    <div className="divider"></div>

                {/* Usamos a prop 'mode' vinda do DashboardLayout */}
                {mode === 'assimilador' ? (
                    <>
                        <NavLink to="/dashboard/campaigns" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            Gestão de Campanhas
                        </NavLink>
                        <NavLink to="/dashboard/npcs" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            Criação de NPCs
                        </NavLink>
                        <NavLink to="/dashboard/ameacas" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            Criador de conflitos
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/dashboard/characters" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"} onClick={handleLinkClick}>
                            Personagens
                        </NavLink>
                        <NavLink to="/dashboard/campaignsview" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            Ver Campanhas
                        </NavLink>
                    </>
                )}
            </nav>

                <div className="sidebar-footer">
                    <div 
                        className={`dt-switch-housing mode-${mode}`}
                        onClick={handleModeSwitch} 
                        title="Alternar Perspectiva (Salva no Banco)"
                    >
                        <span className="dt-label label-assimilador">ASSIMILADOR</span>
                        <span className="dt-label label-infectado">INFECTADO</span>
                        <div className="dt-switch-lever">
                            <div className="dt-lever-led"></div>
                        </div>
                    </div>

                    <div className="footer-info">
                        <p className="sidebar-version">v {coreAppVersion}</p>
                        <button onClick={handleLogout} className="logout-btn">Sair do Sistema</button>
                    </div>
                </div>
            </aside>
        </>
    );
}