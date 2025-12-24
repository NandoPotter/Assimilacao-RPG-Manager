/** ========================================================================================
 * ARQUIVO: src/pages/Dashboard/contents/CharacterSheet/components/CharacteristicsTab.tsx
 * DESCRIÇÃO: Aba de Características (Editor Grid 3 Colunas - Sem XP Display)
 * ========================================================================================= */

import React, { useEffect, useState } from 'react';
import { characterService } from '../../../../../services/characterService';
import PaginatedSection, { type ItemData } from './PaginatedSection';
import { type Instincts, type Aptitudes } from '../../../../../interfaces/Gameplay';

import iconRulesActive from '../../../../../assets/ui/rules-active.svg';
import iconRulesBroken from '../../../../../assets/ui/rules-broken.svg';

// Mapeamento para labels bonitos nos requisitos
const NAME_MAP: Record<string, string> = {
    influencia: 'Influência', percepcao: 'Percepção', potencia: 'Potência',
    reacao: 'Reação', resolucao: 'Resolução', sagacidade: 'Sagacidade',
    biologia: 'Biologia', erudicao: 'Erudição', engenharia: 'Engenharia',
    geografia: 'Geografia', medicina: 'Medicina', seguranca: 'Segurança',
    armas: 'Armas', atletismo: 'Atletismo', expressao: 'Expressão',
    furtividade: 'Furtividade', manufaturas: 'Manufaturas', sobrevivencia: 'Sobrevivência'
};

interface Requirement { type: 'instintos' | 'aptidoes' | 'ou'; key?: string; val?: number; options?: Requirement[]; }

interface Props {
    ids: number[] | undefined;
    instincts: Instincts;  
    aptitudes: Aptitudes;  
    onUpdate?: (newIds: number[]) => void;
}

function CharacteristicsTab({ ids, instincts, aptitudes, onUpdate }: Props) {
    const [myFeatures, setMyFeatures] = useState<ItemData[]>([]);
    const [allFeatures, setAllFeatures] = useState<ItemData[]>([]); 
    
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [breakRequirements, setBreakRequirements] = useState(false); 

    // Carregar Meus Itens
    useEffect(() => {
        const fetchFeats = async () => {
            if (!ids || ids.length === 0) {
                setMyFeatures([]);
                setLoading(false);
                return;
            }
            try {
                const data = await characterService.getCharacteristicsByIds(ids);
                setMyFeatures(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeats();
    }, [ids]);

    // Carregar Todos (Lazy)
    useEffect(() => {
        if (isEditorOpen && allFeatures.length === 0) {
            const fetchAll = async () => {
                try {
                    const data = await characterService.getAllCharacteristics();
                    setAllFeatures(data || []);
                } catch (err) {
                    console.error("Erro ao carregar lista completa:", err);
                }
            };
            fetchAll();
        }
    }, [isEditorOpen, allFeatures.length]);

    // Lógica de Requisitos
    const checkSingleReq = (req: Requirement): boolean => {
        if (req.type === 'ou' && req.options) return req.options.some(opt => checkSingleReq(opt));
        if (req.key && req.val !== undefined) {
            const currentVal = req.type === 'instintos' 
                ? (instincts as any)[req.key] 
                : (aptitudes as any)[req.key];
            return (currentVal || 0) >= req.val;
        }
        return false;
    };

    const checkAllReqs = (reqs: Requirement[]) => {
        if (breakRequirements) return true;
        if (!reqs || reqs.length === 0) return true;
        const reqArray = Array.isArray(reqs) ? reqs : []; 
        return reqArray.every(r => checkSingleReq(r));
    };

    const renderReqText = (reqs: Requirement[]) => {
        if (!reqs || reqs.length === 0) return <span style={{color:'#666'}}>Livre</span>;
        
        return reqs.map((req, idx) => {
            const isMet = breakRequirements ? true : checkSingleReq(req);
            const label = req.key ? (NAME_MAP[req.key] || req.key) : 'Req';
            // Formato curto: "Armas 2" em vez de "Armas: 2" para economizar espaço no card
            const text = req.type === 'ou' ? 'Opções...' : `${label} ${req.val}`;
            
            return (
                <span key={idx} style={{marginRight:'6px', color: isMet ? '#4caf50' : '#ff5555'}}>
                    {text} {idx < reqs.length - 1 ? ',' : ''}
                </span>
            );
        });
    };

    const handleAdd = (feat: ItemData) => {
        if (!onUpdate || !ids) return;
        const newIds = [...ids, feat.id];
        onUpdate(newIds);
        setMyFeatures(prev => [...prev, feat]);
    };

    const handleRemove = (featId: number) => {
        if (!onUpdate || !ids) return;
        const newIds = ids.filter(id => id !== featId);
        onUpdate(newIds);
        setMyFeatures(prev => prev.filter(f => f.id !== featId));
    };

    if (loading) return <div style={{color:'#666', fontSize:'0.8rem'}}>Carregando...</div>;

    return (
        <>
            <PaginatedSection 
                title="Características" 
                items={myFeatures}
                onEdit={() => setIsEditorOpen(true)}
            />

            {/* --- MODAL EDITOR --- */}
            {isEditorOpen && (
                <div className="detail-overlay-backdrop" onClick={() => setIsEditorOpen(false)}>
                    <div className="detail-card-expanded" style={{width:'90%', maxWidth:'900px', height:'85%', maxHeight:'700px', display:'flex', flexDirection:'column'}} onClick={e => e.stopPropagation()}>
                        
                        {/* Header do Modal */}
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'10px', marginBottom:'10px'}}>
                            <span className="expanded-title">Gerenciar Características</span>
                            
                            {/* BOTÃO ATUALIZADO COM SVG */}
                            <button 
                                className={`btn-req-break ${breakRequirements ? 'broken' : ''}`}
                                onClick={() => setBreakRequirements(!breakRequirements)}
                                // O title (tooltip nativo) é importante agora que não tem texto
                                title={breakRequirements ? "Regras Ignoradas (Permite tudo)" : "Regras Ativas (Valida requisitos)"}
                            >
                                <img 
                                    src={breakRequirements ? iconRulesBroken : iconRulesActive} 
                                    alt="Status Regra" 
                                    className="icon-req-status"
                                />
                            </button>
                            
                        </div>

                        {/* LISTA EM GRID 3 COLUNAS */}
                        <div className="char-editor-list">
                            {allFeatures.map(feat => {
                                const isOwned = myFeatures.some(my => my.id === feat.id);
                                const canAdd = checkAllReqs(feat.requirements);
                                
                                // NOVO: Define se o card está visualmente "Trancado"
                                // Trancado se: Não tenho E (Não posso adicionar E regra não está quebrada)
                                const isLocked = !isOwned && !canAdd && !breakRequirements;

                                return (
                                    <div 
                                        key={feat.id} 
                                        className={`char-edit-card ${isOwned ? 'owned' : ''} ${isLocked ? 'locked' : ''}`}
                                    >
                                        
                                        <div className="char-edit-info">
                                            <span className="char-edit-title">{feat.name}</span>
                                            
                                            <div className="char-edit-req">
                                                {renderReqText(feat.requirements)}
                                            </div>

                                            <span className="char-edit-desc">{feat.description}</span>
                                        </div>

                                        <div className="char-edit-actions">
                                            <button 
                                                className="btn-feat-action add" 
                                                disabled={isOwned || isLocked} // Desabilita se tiver ou se estiver trancado
                                                onClick={() => handleAdd(feat)}
                                                title={isOwned ? "Adquirido" : (isLocked ? "Requisito Insuficiente" : "Adicionar")}
                                            >
                                                +
                                            </button>
                                            
                                            <button 
                                                className="btn-feat-action remove" 
                                                disabled={!isOwned}
                                                onClick={() => handleRemove(feat.id)}
                                                title="Remover"
                                            >
                                                -
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button className="btn-close-modal-wide" style={{marginTop:'auto'}} onClick={() => setIsEditorOpen(false)}>
                            Concluir
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default CharacteristicsTab;