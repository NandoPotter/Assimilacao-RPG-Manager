import { useEffect, useState } from 'react';
import { type Item, type ItemTrait } from '../../../../../services/itemLibraryService';
import { ITEM_QUALITIES } from '../utils/constants';

// ADICIONADO: currentLibraryId nas props para saber onde salvar o item
export const ItemModal = ({ isOpen, onClose, onSave, initialData, availableTraits, onCreateTrait, currentLibraryId }: any) => {
    
    // Estado inicial com library_id vinculado
    const defaultState: Item = { 
        name: '', 
        description: '', 
        slots: 1, 
        category: 'Geral', 
        charges: 0, 
        quality: 3, 
        traits: [], 
        // Se vier initialData (edição), o ID já vem nele. Se for novo, usa a prop.
        library_id: initialData?.library_id || currentLibraryId || '' 
    };

    const [formData, setFormData] = useState<Item>(defaultState);
    const [tab, setTab] = useState<'info' | 'traits'>('info');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // MODO EDIÇÃO: Carrega dados do item existente
                setFormData({ ...defaultState, ...initialData });
            } else {
                // MODO CRIAÇÃO: Reseta e garante que o ID da biblioteca está lá
                setFormData({ 
                    ...defaultState, 
                    library_id: currentLibraryId, // Garante o vínculo
                    traits: [] 
                });
            }
            setTab('info');
        }
    }, [initialData, isOpen, currentLibraryId]);

    if (!isOpen) return null;

    // Lógica simples de seleção visual de traits (apenas ID e Nome)
    const toggleTrait = (trait: ItemTrait) => {
        const exists = formData.traits.find(t => t.id === trait.id);
        let newTraits;
        if (exists) {
            newTraits = formData.traits.filter(t => t.id !== trait.id);
        } else {
            newTraits = [...formData.traits, { id: trait.id!, name: trait.name }];
        }
        setFormData({ ...formData, traits: newTraits });
    };

    const handleSave = () => {
        if (!formData.name.trim()) return alert("O item precisa de um nome.");
        
        // Verificação de segurança
        if (!formData.library_id) {
            console.error("ERRO: library_id está vazio.", formData);
            return alert("Erro: Biblioteca não identificada. Recarregue a página.");
        }
        
        onSave(formData);
    };

    return (
        <div className="modal-overlay" style={{zIndex: 2100}}>
            <div className="modal-box" style={{ maxWidth: '700px' }}>
                <div className="modal-header-row">
                    <h3 className="modal-title">{initialData ? 'RECALIBRAR ITEM' : 'FORJAR NOVO ITEM'}</h3>
                    <div className="im-tabs-inner" style={{ marginBottom: 0 }}>
                        <button className={`im-inner-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>DADOS FÍSICOS</button>
                        <button className={`im-inner-tab ${tab === 'traits' ? 'active' : ''}`} onClick={() => setTab('traits')}>CARACTERÍSTICAS</button>
                    </div>
                </div>

                {tab === 'info' && (
                    <div className="modal-body-scroll">
                        <div className="mb-2">
                            <label className="input-label">NOME</label>
                            <input className="input-dark-sheet" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                        </div>
                        
                        <div className="grid-2col mb-2">
                            <div>
                                <label className="input-label">CATEGORIA</label>
                                <select className="input-dark-sheet" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option>Geral</option>
                                    <option>Arma</option>
                                    <option>Proteção</option>
                                    <option>Consumível</option>
                                    <option>Ferramenta</option>
                                    <option>Vestuário</option>
                                    <option>Acessório</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">ESPAÇO (SLOTS)</label>
                                <input type="number" className="input-dark-sheet" value={formData.slots} onChange={e => setFormData({...formData, slots: Number(e.target.value)})} step="0.5" />
                            </div>
                        </div>

                        {/* SEÇÃO DE QUALIDADE */}
                        <div className="mb-2" style={{background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)'}}>
                            <label className="input-label" style={{color: 'var(--cor-tema)'}}>QUALIDADE & DURABILIDADE</label>
                            <select 
                                className="input-dark-sheet" 
                                value={formData.quality ?? 3} 
                                onChange={e => setFormData({...formData, quality: Number(e.target.value)})}
                                style={{fontWeight: 'bold'}}
                            >
                                {Object.entries(ITEM_QUALITIES).map(([lvl, data]) => (
                                    <option key={lvl} value={lvl}>{data.label}</option>
                                ))}
                            </select>
                            
                            <div style={{marginTop: '8px', fontSize: '0.8rem', color: '#ccc', paddingLeft: '5px', borderLeft: '2px solid var(--cor-tema)'}}>
                                <div style={{marginBottom: '4px'}}>🛠 <b>Regra:</b> {ITEM_QUALITIES[formData.quality ?? 3]?.desc}</div>
                                <div>✨ <b>Bônus:</b> {ITEM_QUALITIES[formData.quality ?? 3]?.bonus}</div>
                            </div>
                        </div>

                        {(formData.category === 'Consumível' || formData.category === 'Arma' || formData.category === 'Ferramenta') && (
                            <div className="mb-2">
                                <label className="input-label">CARGAS / DOSES / MUNIÇÃO</label>
                                <input type="number" className="input-dark-sheet" value={formData.charges} onChange={e => setFormData({...formData, charges: Number(e.target.value)})} />
                            </div>
                        )}
                        <div className="mb-2">
                            <label className="input-label">DESCRIÇÃO</label>
                            <textarea className="input-dark-sheet" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>
                    </div>
                )}

                {tab === 'traits' && (
                    <div className="modal-body-scroll">
                        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'15px'}}>
                            <button className="btn-action-outline" onClick={onCreateTrait} style={{fontSize:'0.7rem'}}>+ NOVA CARACTERÍSTICA</button>
                        </div>
                        <div className="im-section-title" style={{border:'none', padding:0}}>SELECIONAR CARACTERÍSTICAS</div>
                        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                            {availableTraits.map((t: ItemTrait) => {
                                const isSelected = formData.traits.some(sel => sel.id === t.id);
                                return (
                                    <div key={t.id} onClick={() => toggleTrait(t)} style={{
                                        padding:'10px', background: isSelected ? 'rgba(var(--cor-tema-rgb), 0.2)' : 'rgba(255,255,255,0.05)',
                                        border: isSelected ? '1px solid var(--cor-tema)' : '1px solid transparent',
                                        cursor:'pointer', borderRadius:'4px', display:'flex', justifyContent:'space-between', alignItems:'center'
                                    }}>
                                        <div>
                                            <span style={{fontWeight:'bold', color: isSelected ? '#fff' : '#ccc'}}>{t.name}</span>
                                            {t.cost !== 0 && <span style={{fontSize:'0.7rem', color:'#888', marginLeft: '8px'}}>Custo: {t.cost}</span>}
                                            <div style={{fontSize:'0.8rem', color:'#666'}}>{t.description ? t.description.substring(0,50)+'...' : 'Sem descrição'}</div>
                                        </div>
                                        {isSelected && <span style={{color:'var(--cor-tema)'}}>✔</span>}
                                    </div>
                                );
                            })}
                            {availableTraits.length === 0 && <div className="empty-state-mini">Nenhuma característica encontrada. Crie uma nova.</div>}
                        </div>
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn-secondary-action" onClick={onClose}>CANCELAR</button>
                    <button className="btn-primary-action" onClick={handleSave}>SALVAR</button>
                </div>
            </div>
        </div>
    );
};