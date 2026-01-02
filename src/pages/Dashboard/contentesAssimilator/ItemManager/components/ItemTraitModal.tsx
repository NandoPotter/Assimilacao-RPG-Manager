/** ============================================================
 * ARQUIVO: src/pages/Dashboard/contentsAssimilator/ItemManager/components/TraitModal.tsx
 * DESCRIÇÃO: Modal de caracteristicas dos itens
 * ============================================================ */

import { useEffect, useState } from 'react';
import { type ItemTrait, type TraitEffect, type TraitCooldown } from '../../../../../services/itemLibraryService';
import { NAME_MAP, RPG_RULES } from '../utils/constants';

export const TraitModal = ({ isOpen, onClose, onSave, initialData }: any) => {
    // Helper de ID robusto
    const generateSafeId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

    const defaultState: ItemTrait = {
        name: '', description: '', library_id: '', cost: 0,
        mechanics: { 
            effects: [], 
            cooldown: { type: 'unlimited' } 
        }
    };

    const [formData, setFormData] = useState<ItemTrait>(defaultState);
    const [tab, setTab] = useState<'info' | 'mechanics'>('info');

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...defaultState,
                ...initialData,
                mechanics: initialData.mechanics || defaultState.mechanics,
            });
        } else {
            setFormData(defaultState);
        }
        setTab('info');
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    // --- HELPERS DE CRIAÇÃO ---
    const createNewEffect = (isPenalty = false): TraitEffect => ({
        id: generateSafeId(),
        
        // GATILHOS / TESTES
        trigger_type: isPenalty ? 'instinct' : 'practice', 
        trigger_val_1: isPenalty ? RPG_RULES.instincts[0] : RPG_RULES.practices[0],
        
        // AÇÃO / RESULTADO
        action: isPenalty ? 'remove' : 'add', 
        target_qty: 1, 
        target_resource: isPenalty ? 'health.current' : 'success',
        source_qty: 1, source_resource: 'success',
        
        // CONFIGURAÇÕES
        is_mandatory: true,
        negate_main_effect_on_failure: false, // Anula o pai?
        apply_on_first_use: false, // Regra de 1º uso individual
        risk_condition: 'always', // Condição de Cena
        
        // DIFICULDADE (Individual por consequência)
        difficulty_mode: 'fixed',
        difficulty_target: 1,
        difficulty_resource: 'success',

        // Container PAI (Apenas o efeito principal tem isso)
        penalty: isPenalty ? undefined : { 
            enabled: false, 
            description: '',
            consequences: [] 
        }
    });

    // --- GERENCIAMENTO DE ESTADO ---
    const addEffect = () => {
        setFormData(prev => ({ 
            ...prev, 
            mechanics: { ...prev.mechanics, effects: [...prev.mechanics.effects, createNewEffect(false)] } 
        }));
    };

    const removeEffect = (id: string) => {
        setFormData(prev => ({ 
            ...prev, 
            mechanics: { ...prev.mechanics, effects: prev.mechanics.effects.filter(e => e.id !== id) } 
        }));
    };

    const updateEffect = (id: string, field: keyof TraitEffect | 'penalty', value: any) => {
        setFormData(prev => ({
            ...prev,
            mechanics: {
                ...prev.mechanics,
                effects: prev.mechanics.effects.map(e => {
                    if (e.id !== id) return e;
                    
                    if (field === 'penalty') {
                        // @ts-ignore
                        return { ...e, penalty: { ...e.penalty!, ...value } };
                    }

                    const updated = { ...e, [field]: value };
                    
                    // Reset inteligente de gatilhos
                    if (field === 'trigger_type') {
                        updated.trigger_val_2 = undefined;
                        if (value === 'instinct') updated.trigger_val_1 = RPG_RULES.instincts[0];
                        else if (value === 'knowledge') updated.trigger_val_1 = RPG_RULES.knowledges[0];
                        else if (value === 'practice') updated.trigger_val_1 = RPG_RULES.practices[0];
                        else if (value === 'specific_roll') {
                            updated.trigger_val_1 = RPG_RULES.instincts[0];
                            updated.trigger_val_2 = RPG_RULES.practices[0];
                        }
                        else updated.trigger_val_1 = 'always';
                    }
                    return updated;
                })
            }
        }));
    };

    // --- GERENCIAMENTO DE CONSEQUÊNCIAS (NESTED) ---
    const addPenaltyConsequence = (parentEffectId: string) => {
        setFormData(prev => ({
            ...prev,
            mechanics: {
                ...prev.mechanics,
                effects: prev.mechanics.effects.map(e => {
                    if (e.id !== parentEffectId) return e;
                    return {
                        ...e,
                        penalty: {
                            ...e.penalty!,
                            consequences: [...(e.penalty?.consequences || []), createNewEffect(true)]
                        }
                    };
                })
            }
        }));
    };

    const removePenaltyConsequence = (parentEffectId: string, consequenceId: string) => {
        setFormData(prev => ({
            ...prev,
            mechanics: {
                ...prev.mechanics,
                effects: prev.mechanics.effects.map(e => {
                    if (e.id !== parentEffectId) return e;
                    return {
                        ...e,
                        penalty: {
                            ...e.penalty!,
                            consequences: e.penalty!.consequences.filter(c => c.id !== consequenceId)
                        }
                    };
                })
            }
        }));
    };

    const updatePenaltyConsequence = (parentEffectId: string, consequenceId: string, field: keyof TraitEffect | string, value: any) => {
        setFormData(prev => ({
            ...prev,
            mechanics: {
                ...prev.mechanics,
                effects: prev.mechanics.effects.map(e => {
                    if (e.id !== parentEffectId) return e;
                    return {
                        ...e,
                        penalty: {
                            ...e.penalty!,
                            consequences: e.penalty!.consequences.map(c => {
                                if (c.id !== consequenceId) return c;
                                const updated = { ...c, [field]: value };
                                
                                // Reset de trigger individual da consequência
                                if (field === 'trigger_type') {
                                    updated.trigger_val_2 = undefined;
                                    if (value === 'instinct') updated.trigger_val_1 = RPG_RULES.instincts[0];
                                    else if (value === 'knowledge') updated.trigger_val_1 = RPG_RULES.knowledges[0];
                                    else if (value === 'practice') updated.trigger_val_1 = RPG_RULES.practices[0];
                                    else if (value === 'specific_roll') {
                                        updated.trigger_val_1 = RPG_RULES.instincts[0];
                                        updated.trigger_val_2 = RPG_RULES.practices[0];
                                    }
                                    else updated.trigger_val_1 = 'always';
                                }
                                return updated;
                            })
                        }
                    };
                })
            }
        }));
    };

    const updateCooldown = (field: keyof TraitCooldown, value: any) => {
        setFormData(prev => ({ ...prev, mechanics: { ...prev.mechanics, cooldown: { ...prev.mechanics.cooldown, [field]: value } } }));
    };

    const getTriggerLabel = (type: string) => {
        if (type === 'practice') return 'QUAL PRÁTICA?';
        if (type === 'instinct') return 'QUAL INSTINTO?';
        if (type === 'knowledge') return 'QUAL CONHECIMENTO?';
        if (type === 'specific_roll') return 'COMBINAÇÃO EXATA';
        return 'DETALHE';
    };

    // --- RENDERIZADOR UNIFICADO ---
    const renderEffectCard = (effect: TraitEffect, index: number, isNested: boolean, parentId?: string) => {
        const updateFn = isNested 
            ? (id: string, f: any, v: any) => updatePenaltyConsequence(parentId!, id, f, v)
            : updateEffect;
        
        const removeFn = isNested 
            ? (id: string) => removePenaltyConsequence(parentId!, id)
            : removeEffect;

        const borderColor = isNested ? 'rgba(255,100,100,0.3)' : 'rgba(255,255,255,0.05)';
        const bgColor = isNested ? 'rgba(50,0,0,0.2)' : 'rgba(0,0,0,0.2)';
        const labelPrefix = isNested ? 'CONSEQUÊNCIA' : 'EFEITO';
        const labelColor = isNested ? '#ff6666' : 'var(--cor-tema)';

        return (
            <div key={effect.id} className="effect-row-container" style={{position: 'relative', padding: '15px', background: bgColor, border: `1px solid ${borderColor}`, borderRadius: '6px', marginBottom: '10px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px'}}>
                    <span className="effect-number" style={{fontWeight: 'bold', color: labelColor}}>
                        {labelPrefix} #{index + 1}
                    </span>
                    <button className="btn-icon-small danger" onClick={() => removeFn(effect.id)} style={{background: 'transparent', border: 'none', color: '#ff5555', cursor: 'pointer', fontSize: '1.2rem'}}>✕</button>
                </div>
                
                {/* --- SEÇÃO DE CONDIÇÕES (SÓ PARA CONSEQUÊNCIA) --- */}
                {isNested && (
                    <div style={{display:'flex', gap:'15px', marginBottom:'15px', paddingBottom:'10px', borderBottom:'1px dashed rgba(255,255,255,0.1)'}}>
                        <div style={{flex: 1}}>
                            <label className="input-label" style={{color: '#ffaa88'}}>QUANDO OCORRE ESSE RISCO?</label>
                            <select className="input-dark-sheet" 
                                // @ts-ignore
                                value={effect.risk_condition || 'always'} 
                                onChange={e => updateFn(effect.id, 'risk_condition', e.target.value)}
                            >
                                <option value="always">Sempre (Todas as cenas)</option>
                                <option value="conflict">Somente em Conflito</option>
                                <option value="non_conflict">Fora de Conflito (Pacífico)</option>
                            </select>
                        </div>
                        <div style={{width: '120px', display:'flex', flexDirection:'column', justifyContent:'center'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <span style={{fontSize: '0.7rem', color: '#aaa'}}>NO 1º USO?</span>
                                <label className="tech-switch" style={{transform:'scale(0.8)'}}>
                                    {/* @ts-ignore */}
                                    <input type="checkbox" checked={effect.apply_on_first_use} onChange={e => updateFn(effect.id, 'apply_on_first_use', e.target.checked)} />
                                    <span className="tech-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* --- ESQUERDA: GATILHO (Ou Teste de Penalidade) --- */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label className="input-label" style={{color: '#aaa', fontWeight: 600}}>
                            {isNested ? 'TESTE PARA EVITAR A PENALIDADE' : 'CONDIÇÃO DE ATIVAÇÃO'}
                        </label>
                        
                        <select className="input-dark-sheet" value={effect.trigger_type} onChange={e => updateFn(effect.id, 'trigger_type', e.target.value)}>
                            {isNested ? (
                                <>
                                    <option value="instinct">Rolagem com Instinto ...</option>
                                    <option value="knowledge">Rolagem com Conhecimento ...</option>
                                    <option value="practice">Rolagem com Prática ...</option>
                                    <option value="specific_roll">Rolagem específica (Instinto + Aptidão)</option>
                                    <option value="always">Automático (Falha Crítica / Sem teste)</option>
                                </>
                            ) : (
                                <>
                                    <option value="practice">Rolagem com Prática ...</option>
                                    <option value="instinct">Rolagem com Instinto ...</option>
                                    <option value="knowledge">Rolagem com Conhecimento ...</option>
                                    <option value="specific_roll">Rolagem específica (Instinto + Aptidão)</option>
                                    <option value="always">Sempre / Ao Usar</option>
                                </>
                            )}
                        </select>

                        {/* Detalhes do Gatilho */}
                        {effect.trigger_type !== 'always' ? (
                            <div>
                                <label className="input-label" style={{fontSize: '0.75rem', marginTop: '5px'}}>{getTriggerLabel(effect.trigger_type)}</label>
                                {effect.trigger_type === 'specific_roll' ? (
                                    <div style={{display:'flex', gap:'5px'}}>
                                        <select className="input-dark-sheet" value={effect.trigger_val_1} onChange={e => updateFn(effect.id, 'trigger_val_1', e.target.value)}>{RPG_RULES.instincts.map(k => <option key={k} value={k}>{NAME_MAP[k]}</option>)}</select>
                                        <span style={{alignSelf:'center', color: '#666'}}>+</span>
                                        <select className="input-dark-sheet" value={effect.trigger_val_2} onChange={e => updateFn(effect.id, 'trigger_val_2', e.target.value)}>{[...RPG_RULES.practices, ...RPG_RULES.knowledges].map(k => <option key={k} value={k}>{NAME_MAP[k]}</option>)}</select>
                                    </div>
                                ) : (
                                    <select className="input-dark-sheet" value={effect.trigger_val_1} onChange={e => updateFn(effect.id, 'trigger_val_1', e.target.value)}>
                                        {(effect.trigger_type === 'instinct' ? RPG_RULES.instincts : effect.trigger_type === 'knowledge' ? RPG_RULES.knowledges : RPG_RULES.practices).map(key => (<option key={key} value={key}>{NAME_MAP[key] || key}</option>))}
                                    </select>
                                )}
                            </div>
                        ) : (
                            <input className="input-dark-sheet" disabled value="Acontece Automaticamente" style={{opacity: 0.5, fontStyle: 'italic', marginTop: '5px'}} />
                        )}

                        {/* REGULADOR DE DIFICULDADE (INDIVIDUAL DA CONSEQUÊNCIA) */}
                        {isNested && effect.trigger_type !== 'always' && (
                            <div style={{marginTop: '10px', padding: '8px', background: 'rgba(50,0,0,0.2)', borderRadius: '4px'}}>
                                <label className="input-label" style={{fontSize: '0.7rem', color: '#ffaaaa', marginBottom: '5px'}}>DIFICULDADE DESTE TESTE</label>
                                <div style={{display: 'flex', gap: '5px', marginBottom: '5px'}}>
                                    <select className="input-dark-sheet" style={{fontSize: '0.8rem'}} value={effect.difficulty_mode || 'fixed'} onChange={e => updateFn(effect.id, 'difficulty_mode', e.target.value)}>
                                        <option value="fixed">Fixo (Dificuldade constante)</option>
                                        <option value="increasing">Crescente (Valor x Usos)</option>
                                    </select>
                                </div>
                                <div style={{display: 'flex', gap: '5px'}}>
                                    <input type="number" className="input-dark-sheet" style={{width: '50px', textAlign: 'center'}} value={effect.difficulty_target ?? 1} onChange={e => updateFn(effect.id, 'difficulty_target', Number(e.target.value))} />
                                    <select className="input-dark-sheet" style={{flex: 1, fontSize: '0.8rem'}} value={effect.difficulty_resource ?? 'success'} onChange={e => updateFn(effect.id, 'difficulty_resource', e.target.value)}>
                                        {RPG_RULES.targets.map(key => (<option key={key} value={key}>{NAME_MAP[key] || key}</option>))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- DIREITA: AÇÃO / CONSEQUÊNCIA --- */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label className="input-label" style={{color: '#aaa', fontWeight: 600}}>
                            {isNested ? 'CONSEQUÊNCIA' : 'EFEITO'}
                        </label>
                        <select className="input-dark-sheet" value={effect.action} onChange={e => updateFn(effect.id, 'action', e.target.value)}>
                            <option value="add">Gerar / Adicionar (+)</option>
                            <option value="remove">Remover / Dano (-)</option>
                            <option value="convert">Converter</option>
                            <option value="none">Nenhum (Apenas Informativo)</option>
                        </select>
                        
                        {effect.action !== 'none' && (
                            <div style={{marginTop: '5px'}}>
                                {effect.action === 'convert' ? (
                                    <div style={{display:'flex', flexDirection:'column', gap:'8px', background: 'rgba(255,255,255,0.03)', padding:'8px', borderRadius:'4px'}}>
                                        <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                                            <span style={{fontSize:'0.6rem', width:'25px'}}>DE:</span>
                                            <input type="number" className="input-dark-sheet" style={{width:'50px', textAlign:'center'}} value={effect.source_qty ?? 1} onChange={e => updateFn(effect.id, 'source_qty', Number(e.target.value))} />
                                            <select className="input-dark-sheet" style={{flex:1}} value={effect.source_resource ?? 'success'} onChange={e => updateFn(effect.id, 'source_resource', e.target.value)}>{RPG_RULES.targets.map(key => (<option key={key} value={key}>{NAME_MAP[key] || key}</option>))}</select>
                                        </div>
                                        <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                                            <span style={{fontSize:'0.6rem', width:'25px'}}>PARA:</span>
                                            <input type="number" className="input-dark-sheet" style={{width:'50px', textAlign:'center'}} value={effect.target_qty} onChange={e => updateFn(effect.id, 'target_qty', Number(e.target.value))} />
                                            <select className="input-dark-sheet" style={{flex:1}} value={effect.target_resource} onChange={e => updateFn(effect.id, 'target_resource', e.target.value)}>{RPG_RULES.targets.map(key => (<option key={key} value={key}>{NAME_MAP[key] || key}</option>))}</select>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input type="number" className="input-dark-sheet" style={{ width: '70px', textAlign: 'center' }} value={effect.target_qty} onChange={e => updateFn(effect.id, 'target_qty', Number(e.target.value))} />
                                        <select className="input-dark-sheet" style={{ flex: 1 }} value={effect.target_resource} onChange={e => updateFn(effect.id, 'target_resource', e.target.value)}>{RPG_RULES.targets.map(key => (<option key={key} value={key}>{NAME_MAP[key] || key}</option>))}</select>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div style={{marginTop: 'auto', paddingTop: '10px', display:'flex', flexDirection: 'column', gap: '10px'}}>
                            {/* SWITCH 1: OBRIGATÓRIO / ANULA PRINCIPAL */}
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <span style={{fontSize: '0.8rem', color: isNested ? '#ff6666' : '#888'}}>
                                    {isNested ? 'ANULA O EFEITO PRINCIPAL?' : 'OBRIGATÓRIO?'}
                                </span>
                                <label className="tech-switch">
                                    {isNested ? (
                                        <input type="checkbox" checked={effect.negate_main_effect_on_failure} onChange={e => updateFn(effect.id, 'negate_main_effect_on_failure', e.target.checked)} />
                                    ) : (
                                        <input type="checkbox" checked={effect.is_mandatory} onChange={e => updateFn(effect.id, 'is_mandatory', e.target.checked)} />
                                    )}
                                    <span className="tech-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ÁREA DE PENALIDADE DO EFEITO (CONTAINER) --- */}
                {!isNested && (
                    <div style={{marginTop: '20px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <span style={{fontSize: '0.8rem', fontWeight: 'bold', color: effect.penalty?.enabled ? '#ff5555' : '#666'}}>
                                ⚠️ RISCO / PENALIDADE NESTE EFEITO
                            </span>
                            <label className="tech-switch">
                                <input type="checkbox" checked={effect.penalty?.enabled} onChange={e => updateEffect(effect.id, 'penalty', { ...effect.penalty, enabled: e.target.checked })} />
                                <span className="tech-slider"></span>
                            </label>
                        </div>

                        {/* CONTAINER LIMPO: SÓ DESCRIÇÃO E LISTA */}
                        {effect.penalty?.enabled && (
                            <div style={{marginTop: '15px', padding: '10px', background: 'rgba(50,0,0,0.15)', borderRadius: '4px', borderLeft: '3px solid #ff5555'}}>
                                <div className="mb-2">
                                    <label className="input-label" style={{color: '#ff8888'}}>DESCRIÇÃO NARRATIVA DO RISCO</label>
                                    <input className="input-dark-sheet" placeholder="Ex: Causa superaquecimento se falhar..." value={effect.penalty.description || ''} onChange={e => updateEffect(effect.id, 'penalty', { ...effect.penalty, description: e.target.value })} />
                                </div>

                                <div className="im-section-title" style={{fontSize:'0.75rem', color:'#ff8888', border:'none', padding:0, marginTop: '10px'}}>CONSEQUÊNCIAS (LISTA DE RISCOS)</div>
                                {effect.penalty.consequences?.map((cons, i) => renderEffectCard(cons, i, true, effect.id))}
                                
                                <button type="button" className="btn-action-outline danger" style={{width: '100%', marginTop: '5px', padding: '6px', fontSize:'0.7rem', borderStyle: 'dashed', borderColor: '#ff4444', color: '#ff8888'}} onClick={() => addPenaltyConsequence(effect.id)}>
                                    + ADICIONAR NOVA CONSEQUÊNCIA
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="modal-overlay" style={{zIndex: 2100}}>
            <div className="modal-box" style={{ maxWidth: '900px', width: '95%' }}>
                <div className="modal-header-row">
                    <h3 className="modal-title">{initialData ? 'EDITAR CARACTERÍSTICA' : 'NOVA CARACTERÍSTICA'}</h3>
                    <div className="im-tabs-inner" style={{ marginBottom: 0 }}>
                        <button className={`im-inner-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>DADOS</button>
                        <button className={`im-inner-tab ${tab === 'mechanics' ? 'active' : ''}`} onClick={() => setTab('mechanics')}>MECÂNICA</button>
                    </div>
                </div>

                {tab === 'info' && (
                    <div className="modal-body-scroll">
                        <div style={{display: 'grid', gridTemplateColumns: '4fr 1fr', gap: '15px', marginBottom: '15px'}}>
                            <div><label className="input-label">NOME</label><input className="input-dark-sheet" placeholder="Nome..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus /></div>
                            <div><label className="input-label">CUSTO</label><input type="number" className="input-dark-sheet" style={{textAlign: 'center'}} value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} /></div>
                        </div>
                        <div className="mb-2"><label className="input-label">DESCRIÇÃO</label><textarea className="input-dark-sheet" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                    </div>
                )}

                {tab === 'mechanics' && (
                    <div className="modal-body-scroll">
                        <div className="im-section-title" style={{border: 'none', padding: 0, marginBottom: '15px'}}>EFEITOS E GATILHOS</div>
                        {formData.mechanics.effects.map((effect, index) => renderEffectCard(effect, index, false))}
                        <button type="button" className="btn-action-outline" style={{width: '100%', marginTop: '10px', marginBottom: '30px', padding: '12px', borderStyle: 'dashed'}} onClick={addEffect}>
                            + ADICIONAR EFEITO
                        </button>

                        <div className="im-section-title" style={{border: 'none', padding: 0, marginBottom: '10px'}}>LIMITAÇÕES (TEMPO)</div>
                        <div className="sync-panel">
                            <div className="mb-2"><label className="input-label">COOLDOWN (FREQUÊNCIA DE USO)</label><select className="input-dark-sheet" value={formData.mechanics.cooldown.type} onChange={e => updateCooldown('type', e.target.value)}><option value="unlimited">Ilimitado</option><option value="1_scene">1x por Cena</option><option value="1_session">1x por Sessão</option><option value="1_day">1x por Dia</option></select></div>
                        </div>
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn-secondary-action" onClick={onClose}>CANCELAR</button>
                    <button className="btn-primary-action" onClick={() => onSave(formData)}>{initialData ? 'ATUALIZAR' : 'CRIAR'}</button>
                </div>
            </div>
        </div>
    );
};