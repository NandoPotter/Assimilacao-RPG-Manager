/** ============================================================
 * ARQUIVO: src/components/Sidebar/index.tsx
 * DESCRIÇÃO: Barra lateral com suporte a redirecionamento no Logout.
 * ============================================================ */
 
import { NavLink, useNavigate } from 'react-router-dom'; // ADICIONADO useNavigate
import { type UserMode } from '../../interfaces/System';
import { coreAppName, coreAppVersion } from '../../core/SystemConstants';
import { useAuth } from '../../contexts/AuthContext';

import logoImg from '../../assets/LogoAssimilacao.png';
import './Sidebar.css';

interface SidebarProps {
    mode: UserMode;
    onToggleMode: () => void;
}

export function Sidebar({ mode, onToggleMode }: SidebarProps) {
    const { signOut } = useAuth();
    const navigate = useNavigate(); // INICIALIZADO

    // FUNÇÃO PARA SAIR E REDIRECIONAR
    const handleLogout = async () => {
        try {
            await signOut();    // 1. Limpa a sessão no Supabase e no Contexto
            navigate('/login'); // 2. Empurra o usuário para a tela de login
        } catch (error) {
            console.error("Erro ao deslogar:", error);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <img src={logoImg} alt="Logo" className="sidebar-logo" />
                <h2>{coreAppName}</h2>                    
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                    Dashboard
                </NavLink>
                
                <NavLink to="/dashboard/characters" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                    Personagens
                </NavLink>

                <div className="divider"></div>

                {/* Renderização Condicional */}
                {mode === 'assimilador' ? (
                    <>
                        <NavLink to="/dashboard/campaigns" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            Gestão de Campanhas
                        </NavLink>
                        <NavLink to="/dashboard/npcs" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            Criação de NPCs
                        </NavLink>
                        <NavLink to="/dashboard/threats" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                            Criação de Ameaças
                        </NavLink>
                    </>
                ) : (
                    <NavLink to="/dashboard/campaignsview" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                        Ver Campanhas
                    </NavLink>
                )}
            </nav>

            <div className="sidebar-footer">
                <div 
                    className={`dt-switch-housing mode-${mode}`}
                    onClick={onToggleMode}
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
                    {/* ALTERADO AQUI: agora chama handleLogout */}
                    <button onClick={handleLogout} className="logout-btn">Sair do Sistema</button>
                </div>
            </div>
        </aside>
    );
}