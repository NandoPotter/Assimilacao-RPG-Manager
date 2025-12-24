/** =====================================================================================
 * ARQUIVO: src/pages/Dashboard/contents/CharacterSheet/components/AttributesTab.tsx
 * DESCRIÇÃO: Aba de Atributos (Sistema de Custos Dramáticos)
 * ====================================================================================== */

import React, { useState, useEffect } from 'react';
import { type Aptitudes, type Instincts } from '../../../../../interfaces/Gameplay';
import InfoTooltip from '../../../../../components/InfoTooltip/Index';
import { DESCRIPTIONS } from '../../../../../constants/Descriptions';

interface Props {
    instincts: Instincts;
    aptitudes: Aptitudes;
    
    currentAssimilation: number;
    currentDetermination: number;
    
    onUpdate?: (updates: { instincts?: Instincts; aptitudes?: Aptitudes }) => void;
    onSpendAssimilation?: () => void;
    onSpendDetermination?: (amount: number) => void;
}

const NAME_MAP: Record<string, string> = {
    influencia: 'Influência', percepcao: 'Percepção', potencia: 'Potência',
    reacao: 'Reação', resolucao: 'Resolução', sagacidade: 'Sagacidade',
    biologia: 'Biologia', erudicao: 'Erudição', engenharia: 'Engenharia',
    geografia: 'Geografia', medicina: 'Medicina', seguranca: 'Segurança',
    armas: 'Armas', atletismo: 'Atletismo', expressao: 'Expressão',
    furtividade: 'Furtividade', manufaturas: 'Manufaturas', sobrevivencia: 'Sobrevivência'
};

function AttributesTab({ 
    instincts, aptitudes, 
    currentAssimilation, currentDetermination, 
    onUpdate, onSpendAssimilation, onSpendDetermination 
}: Props) {
    
    // --- ESTADOS ---
    const [isEditing, setIsEditing] = useState(false);
    const [isAssimilatedRoll, setIsAssimilatedRoll] = useState(false);
    
    // Modais
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    // Valores Locais & Seleção
    const [localInstincts, setLocalInstincts] = useState<Instincts>(instincts);
    const [localAptitudes, setLocalAptitudes] = useState<Aptitudes>(aptitudes);
    const [selectedInstincts, setSelectedInstincts] = useState<string[]>([]);
    const [selectedAptitudes, setSelectedAptitudes] = useState<string[]>([]);

    useEffect(() => {
        setLocalInstincts(instincts);
        setLocalAptitudes(aptitudes);
    }, [instincts, aptitudes]);

    // --- HANDLERS BÁSICOS ---
    const toggleEditMode = () => {
        if (isEditing) {
            if (onUpdate) onUpdate({ instincts: localInstincts, aptitudes: localAptitudes });
            setIsEditing(false);
        } else setIsEditing(true);
    };

    const adjustValue = (e: React.MouseEvent, type: 'instinct' | 'aptitude', key: string, delta: number) => {
        e.stopPropagation();
        if (type === 'instinct') {
            setLocalInstincts(prev => ({ ...prev, [key]: Math.max(0, (prev[key as keyof Instincts] || 0) + delta) }));
        } else {
            setLocalAptitudes(prev => ({ ...prev, [key]: Math.max(0, (prev[key as keyof Aptitudes] || 0) + delta) }));
        }
    };

    // --- LÓGICA DE ATIVAÇÃO ---
    const handleToggleClick = () => {
        if (isAssimilatedRoll) {
            // Desativar
            setIsAssimilatedRoll(false);
            setSelectedInstincts([]);
        } else {
            // Verificar Saldos
            const canPayAssimilation = currentAssimilation >= 1;
            const canPayDetermination = currentDetermination >= 2;

            if (!canPayAssimilation && !canPayDetermination) {
                setShowErrorModal(true);
            } else {
                setShowConfirmModal(true);
            }
        }
    };

    const confirmActivation = (costType: 'assimilation' | 'determination') => {
        if (costType === 'assimilation' && onSpendAssimilation) {
            onSpendAssimilation();
        } else if (costType === 'determination' && onSpendDetermination) {
            onSpendDetermination(2);
        }

        setIsAssimilatedRoll(true);
        setSelectedInstincts([]);
        setSelectedAptitudes([]);
        setShowConfirmModal(false);
    };

    // --- SELEÇÃO ---
    const handleSelect = (key: string, type: 'instinct' | 'aptitude') => {
        if (type === 'instinct') {
            if (selectedInstincts.includes(key)) {
                setSelectedInstincts(prev => prev.filter(k => k !== key));
                return;
            }
            if (isAssimilatedRoll) {
                if (selectedInstincts.length < 2) setSelectedInstincts(prev => [...prev, key]);
                else setSelectedInstincts(prev => [prev[1], key]); 
            } else {
                setSelectedInstincts([key]);
            }
        } else {
            if (isAssimilatedRoll) return; 
            if (selectedAptitudes.includes(key)) setSelectedAptitudes([]);
            else setSelectedAptitudes([key]);
        }
    };

    const renderMiniCard = (key: string, val: number, type: 'instinct' | 'aptitude') => {
        const isSelected = type === 'instinct' ? selectedInstincts.includes(key) : selectedAptitudes.includes(key);
        const isDisabled = type === 'aptitude' && isAssimilatedRoll;
        const selectionClass = isSelected ? (isAssimilatedRoll ? 'selected-blue' : 'selected') : '';

        return (
            <div 
                className={`mini-card ${selectionClass} ${isDisabled ? 'disabled' : ''}`} 
                key={key} 
                onClick={() => !isDisabled && handleSelect(key, type)}
            >
                <div className="mc-left">
                    <div className="mc-selector" />                    
                    <span className="mini-label">{NAME_MAP[key] || key}</span>
                    <InfoTooltip textKey={key} descriptions={DESCRIPTIONS} />
                </div>
                <div className="mc-right">
                    {isEditing && <button className="btn-attr-tiny" onClick={(e) => adjustValue(e, type, key, -1)}>-</button>}
                    <span className="mini-val">{val}</span>
                    {isEditing && <button className="btn-attr-tiny" onClick={(e) => adjustValue(e, type, key, 1)}>+</button>}
                </div>
            </div>
        );
    };

    return (
        <div style={{display:'flex', flexDirection:'column', gap:'5px', height:'100%'}}>
            
            {/* GRUPO 1: INSTINTOS */}
            <div className="attr-group-container">
                <div className="instincts-header-grid">
                    <div style={{display:'flex', alignItems:'center'}}>
                        <span className={`group-title ${isAssimilatedRoll ? 'blue-mode' : ''}`}>Instintos</span>
                        <InfoTooltip textKey="instincts" descriptions={DESCRIPTIONS} />
                    </div>
                    
                    <button 
                        className={`btn-toggle-assimilated btn-toggle-center ${isAssimilatedRoll ? 'active-blue' : ''}`}
                        onClick={handleToggleClick}
                    >
                        <span className="dot-indicator" />
                        Agir por Instinto
                    </button>

                    <button className={`btn-edit-small btn-edit-right ${isEditing ? 'saving' : ''}`} onClick={toggleEditMode}>
                        {isEditing ? 'Salvar' : 'Editar'}
                    </button>
                </div>
                <div className="grid-instincts">
                    {Object.entries(localInstincts).map(([k, v]) => renderMiniCard(k, v, 'instinct'))}
                </div>
            </div>

            {/* --- GRUPO 2: CONHECIMENTOS --- */}
            <div 
                className="attr-group-container" 
                style={{
                    opacity: isAssimilatedRoll ? 0.3 : 1, 
                    filter: isAssimilatedRoll ? 'grayscale(100%)' : 'none',
                    transition: '0.3s'
                }}
            >
                <div className="group-header-simple">
                    <span className="group-title">Conhecimentos</span>
                    <InfoTooltip textKey="knowledge" descriptions={DESCRIPTIONS} />
                </div>
                
                <div className="grid-aptitudes">
                    {['biologia','erudicao','engenharia','geografia','medicina','seguranca'].map(k => 
                        renderMiniCard(k, (localAptitudes as any)[k], 'aptitude')
                    )}
                </div>
            </div>

            {/* --- GRUPO 3: PRÁTICAS --- */}
            <div 
                className="attr-group-container" 
                style={{
                    opacity: isAssimilatedRoll ? 0.3 : 1, 
                    filter: isAssimilatedRoll ? 'grayscale(100%)' : 'none',
                    transition: '0.3s'
                }}
            >
                <div className="group-header-simple">
                    <span className="group-title">Práticas</span>
                    <InfoTooltip textKey="practices" descriptions={DESCRIPTIONS} />
                </div>
                
                <div className="grid-aptitudes">
                    {['armas','atletismo','expressao','furtividade','manufaturas','sobrevivencia'].map(k => 
                        renderMiniCard(k, (localAptitudes as any)[k], 'aptitude')
                    )}
                </div>
            </div>

            {/* --- MODAL DRAMÁTICO DE CONFIRMAÇÃO --- */}
            {showConfirmModal && (
                <div className="dramatic-overlay">
                    <div className="dramatic-box">
                        <span className="dramatic-title">Fusão Neural</span>

                        <p className="dramatic-text">
                            Ao Agir por Instinto, o infectado elege dois instintos ou usa o mesmo instinto duas vezes, ignorando suas outras Aptidões. 
                        </p>

                        <p className="dramatic-text">
                            Todos os D6 são trocados por D12. 
                        </p>
                        
                        <p className="dramatic-text">
                            Para acessar seus instintos primordiais e agir através da rede, um preço deve ser pago. Como deseja proceder?
                        </p>
                                                
                        <div className="dramatic-choices">
                            {/* OPÇÃO 1: ASSIMILAÇÃO */}
                            {currentAssimilation >= 1 && (
                                <button className="btn-choice cost-assimilation" onClick={() => confirmActivation('assimilation')}>
                                    <span>Fundir Consciência</span>
                                    <span style={{fontSize:'0.7rem', opacity:0.8}}>1 Ponto de Assimilação</span>
                                </button>
                            )}

                            {/* OPÇÃO 2: DETERMINAÇÃO */}
                            {currentDetermination >= 2 && (
                                <button className="btn-choice cost-determination" onClick={() => confirmActivation('determination')}>
                                    <span>Forçar Limites</span>
                                    <span style={{fontSize:'0.7rem', opacity:0.8}}>2 Pontos de Determinação</span>
                                </button>
                            )}
                        </div>
                        
                        <button className="btn-dramatic-cancel" onClick={() => setShowConfirmModal(false)}>
                            Cancelar Conexão
                        </button>
                    </div>
                </div>
            )}

            {/* --- MODAL DE ERRO --- */}
            {showErrorModal && (
                <div className="dramatic-overlay">
                    <div className="dramatic-box error-mode">
                        <span className="dramatic-title error">Falha Crítica</span>
                        
                        <p className="dramatic-text">
                            Sua mente está fragmentada e sua vontade esgotada.<br/><br/>
                            Você não possui <strong>1 Ponto de Assimilação</strong> ou <strong>2 Pontos de Determinação</strong> para Agir por Instinto.
                        </p>
                        
                        <button className="btn-warning-close" onClick={() => setShowErrorModal(false)}>
                            Retornar
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AttributesTab;