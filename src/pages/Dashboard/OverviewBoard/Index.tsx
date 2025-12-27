/** ============================================================
 * ARQUIVO: src/pages/DashboardContents/Overview.tsx
 * DESCRIÇÃO: Visão Geral - Tema: Sobrevivência / Pós-Colapso
 * ============================================================ */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { characterService } from '../../../services/characterService';
import { type Character } from '../../../interfaces/Gameplay';
import './Styles.css';

function OverviewBoard() {
    const navigate = useNavigate();
    const [lastChar, setLastChar] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Busca o personagem modificado mais recentemente
    useEffect(() => {
        async function loadOverview() {
            try {
                // Pega a lista completa
                const chars = await characterService.listMyCharacters();
                
                // Se tiver personagens, pega o primeiro (assumindo que a API retorna ordenado ou pegamos o índice 0)
                // Idealmente, o backend ordenaria por 'updated_at', mas aqui pegamos o primeiro da lista como exemplo
                if (chars && chars.length > 0) {
                    setLastChar(chars[0]); 
                }
            } catch (error) {
                console.error("Falha ao carregar visão geral", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadOverview();
    }, []);

    if (isLoading) return <div className="overview-loading">Sintonizando...</div>;

    return (
        <div className="overview-container">
            
            {/* HEADER: Boas vindas simples e direto */}
            <div className="overview-header">
                <h2 className="overview-title">Resumo da Jornada</h2>
                <p className="overview-subtitle">O mundo mudou. Adapte-se ou seja assimilado.</p>
            </div>

            <div className="overview-grid">

                {/* COLUNA 1: ÚLTIMO PERSONAGEM ACESSADO */}
                <div className="overview-card survivor-card">
                    <div className="card-header-row">
                        <span className="card-label">Último Infectado</span>
                        {lastChar && <span className={`status-tag ${lastChar.status === 'Morto' ? 'dead' : 'alive'}`}>{lastChar.status}</span>}
                    </div>

                    {lastChar ? (
                        <>
                            <div className="char-highlight">
                                <div className="char-avatar-frame">
                                    {lastChar.avatar_url ? (
                                        <img src={lastChar.avatar_url} alt={lastChar.name} />
                                    ) : (
                                        <div className="avatar-placeholder">{lastChar.name.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="char-details">
                                    <h3>{lastChar.name}</h3>
                                    <p className="char-occupation">{lastChar.background?.occupation || "Sem Ocupação"}</p>
                                    <p className="char-gen">{lastChar.generation}</p>
                                </div>
                            </div>

                            {/* Status Vitais Reais */}
                            <div className="vitals-grid">
                                <div className="vital-box health">
                                    <span className="vital-label">Saúde</span>
                                    <span className="vital-value">
                                        {lastChar.vitals.health.current} <span className="vital-max">/ {lastChar.vitals.health.max}</span>
                                    </span>
                                </div>
                                <div className="vital-box det">
                                    <span className="vital-label">Determinação</span>
                                    <span className="vital-value">
                                        {lastChar.vitals.determination.current} <span className="vital-max">/ {lastChar.vitals.determination.max}</span>
                                    </span>
                                </div>
                                <div className="vital-box ass">
                                    <span className="vital-label">Assimilação</span>
                                    <span className="vital-value">
                                        {lastChar.vitals.assimilation.current} <span className="vital-max">/ {lastChar.vitals.assimilation.max}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="card-actions">
                                <button className="btn-primary-action" onClick={() => navigate(`/dashboard/ficha-interativa/${lastChar.id}`)}>
                                    Abrir Ficha
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="empty-survivor">
                            <p>Nenhum registro encontrado nos escombros.</p>
                            <button className="btn-create-action" onClick={() => navigate('/dashboard/criador-de-infectado')}>
                                Criar Personagem
                            </button>
                        </div>
                    )}
                </div>

                {/* COLUNA 2: CAMPANHA (Mockado pois não temos o service de campanhas no contexto ainda) */}
                <div className="overview-card campaign-card">
                    <div className="card-header-row">
                        <span className="card-label">Última Campanha</span>
                    </div>
                    
                    <div className="campaign-placeholder">
                        <h3>Nenhuma Campanha Vinculada</h3>
                        <p>Você não está participando de nenhuma mesa ativa no momento.</p>
                        <button className="btn-secondary-action" onClick={() => navigate('/dashboard/campaignsview')}>
                            Procurar Mesas
                        </button>
                    </div>
                </div>

                {/* COLUNA 3: ATALHOS */}
                <div className="overview-card shortcuts-card">
                    <div className="card-header-row">
                        <span className="card-label">Acesso Rápido</span>
                    </div>
                    <div className="shortcuts-list">
                        <button className="shortcut-item" onClick={() => navigate('/dashboard/criador-de-infectado')}>
                            <span className="sc-icon">+</span> Novo Personagem
                        </button>
                        <button className="shortcut-item" onClick={() => navigate('/dashboard/infectados')}>
                            <span className="sc-icon">≡</span> Meus Personagens
                        </button>
                        <button className="shortcut-item" disabled style={{opacity: 0.5, cursor: 'not-allowed'}}>
                            <span className="sc-icon">?</span> Ver campanhas (Em Breve)
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default OverviewBoard;