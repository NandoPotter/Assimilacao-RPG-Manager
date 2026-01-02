import { useEffect, useState } from 'react';
import type { Refuge, WorldLibrary } from '../../../../../interfaces/World';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Refuge) => void;
    library: WorldLibrary;
    initialData?: Refuge | null;
}

const STAT_LABELS: Record<string, string> = {
    mobility: 'Mobilidade',
    defense: 'Defesa',
    morale: 'Moral',
    belligerence: 'Beligerância'
};

export const RefugeModal = ({ isOpen, onClose, onSave, library, initialData }: Props) => {
    // Estado Base
    const defaultStats = { 
        population: { current: 0, max: 0 }, 
        reserves: { current: 0, max: 0 }, 
        mobility: 0, 
        defense: 0, 
        morale: 0, 
        belligerence: 0 
    };
    
    const defaultDesc = { 
        population: '', reserves: '', mobility: '', defense: '', morale: '', belligerence: '', general: '' 
    };

    const [formData, setFormData] = useState<Refuge>({
        library_id: library.id,
        name: '',
        type: 'community',
        archetype: '',
        stats: defaultStats,
        descriptions: defaultDesc,
        assets: { constructions: [], stock: {} } // CORRIGIDO: stock inicializa como objeto vazio
    });

    const [tab, setTab] = useState<'geral' | 'stats' | 'ativos'>('geral');
    
    // Estados temporários
    const [newConstruction, setNewConstruction] = useState({ name: '', notes: '' });
    const [newStockItem, setNewStockItem] = useState({ name: '', quantity: 1 });

    // Filtra arquétipos
    const availableArchetypes = library.settings.archetypes?.filter(a => a.type === formData.type) || [];

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(JSON.parse(JSON.stringify(initialData)));
            } else {
                setFormData({
                    library_id: library.id,
                    name: '',
                    type: 'community',
                    archetype: '',
                    stats: defaultStats,
                    descriptions: defaultDesc,
                    assets: { constructions: [], stock: {} } // CORRIGIDO
                });
            }
            setTab('geral');
        }
    }, [isOpen, initialData, library]);

    if (!isOpen) return null;

    // --- HANDLERS ---

    const handleStatChange = (stat: string, value: number) => {
        setFormData({
            ...formData,
            stats: { ...formData.stats, [stat]: value }
        });
    };

    const handleDualStatChange = (stat: 'population' | 'reserves', field: 'current' | 'max', value: number) => {
        setFormData({
            ...formData,
            stats: {
                ...formData.stats,
                [stat]: { ...formData.stats[stat], [field]: value }
            }
        });
    };

    const handleDescChange = (key: string, value: string) => {
        setFormData({
            ...formData,
            descriptions: { ...formData.descriptions, [key]: value }
        });
    };

    // --- ASSETS MANAGERS ---

    const addConstruction = () => {
        if (!newConstruction.name) return;
        setFormData({
            ...formData,
            assets: {
                ...formData.assets,
                constructions: [...formData.assets.constructions, newConstruction]
            }
        });
        setNewConstruction({ name: '', notes: '' });
    };

    const removeConstruction = (idx: number) => {
        const list = [...formData.assets.constructions];
        list.splice(idx, 1);
        setFormData({ ...formData, assets: { ...formData.assets, constructions: list } });
    };

    // CORRIGIDO: Adiciona ao objeto Record<string, number>
    const addStock = () => {
        if (!newStockItem.name) return;
        setFormData({
            ...formData,
            assets: {
                ...formData.assets,
                stock: { 
                    ...formData.assets.stock, 
                    [newStockItem.name]: newStockItem.quantity 
                }
            }
        });
        setNewStockItem({ name: '', quantity: 1 });
    };

    // CORRIGIDO: Remove pela chave (string)
    const removeStock = (key: string) => {
        const newStock = { ...formData.assets.stock };
        delete newStock[key];
        setFormData({ ...formData, assets: { ...formData.assets, stock: newStock } });
    };

    const handleSave = () => {
        if (!formData.name) return alert("O refúgio precisa de um nome.");
        onSave(formData);
    };

    return (
        <div className="modal-overlay" style={{zIndex: 2200}}>
            <div className="modal-box" style={{ maxWidth: '800px', height: '85vh', display: 'flex', flexDirection: 'column' }}>
                
                <div className="modal-header-row">
                    <h3 className="modal-title">{initialData ? 'EDITAR REFÚGIO' : 'NOVO REFÚGIO'}</h3>
                    <div className="wm-tabs" style={{marginBottom: 0, borderBottom: 'none'}}>
                        <button className={`wm-tab ${tab === 'geral' ? 'active' : ''}`} onClick={() => setTab('geral')}>GERAL</button>
                        <button className={`wm-tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>ESTATÍSTICAS</button>
                        <button className={`wm-tab ${tab === 'ativos' ? 'active' : ''}`} onClick={() => setTab('ativos')}>ATIVOS</button>
                    </div>
                </div>

                <div className="modal-body-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    
                    {/* --- TAB GERAL --- */}
                    {tab === 'geral' && (
                        <div className="wm-grid-2col">
                            <div>
                                <div className="mb-2">
                                    <label className="input-label">NOME DO REFÚGIO</label>
                                    <input className="input-dark-sheet" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                                </div>
                                
                                <div className="mb-2">
                                    <label className="input-label">TIPO</label>
                                    <div style={{display: 'flex', gap: '10px'}}>
                                        <button 
                                            className="btn-action-primary" 
                                            style={{flex:1, opacity: formData.type === 'community' ? 1 : 0.4}}
                                            onClick={() => setFormData({...formData, type: 'community'})}
                                        >
                                            🏠 COMUNIDADE
                                        </button>
                                        <button 
                                            className="btn-action-primary" 
                                            style={{flex:1, opacity: formData.type === 'group' ? 1 : 0.4}}
                                            onClick={() => setFormData({...formData, type: 'group'})}
                                        >
                                            👣 GRUPO MÓVEL
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <label className="input-label">ARQUÉTIPO</label>
                                    <select className="input-dark-sheet" value={formData.archetype} onChange={e => setFormData({...formData, archetype: e.target.value})}>
                                        <option value="">Selecione...</option>
                                        {availableArchetypes.map((a, idx) => (
                                            <option key={idx} value={a.name}>{a.name}</option>
                                        ))}
                                    </select>
                                    <div style={{
                                        fontSize: '0.85rem', color: '#ccc', marginTop: '10px', lineHeight: '1.5',
                                        textAlign: 'justify', textIndent: '2em',
                                        background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '4px', borderLeft: '2px solid var(--cor-tema)'
                                    }}>
                                        {library.settings.archetypes.find(a => a.name === formData.archetype)?.description || "Selecione um arquétipo para ver a descrição."}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="input-label">DESCRIÇÃO GERAL / VISUAL</label>
                                <textarea 
                                    className="input-dark-sheet" 
                                    style={{height: '100%'}} 
                                    value={formData.descriptions.general} 
                                    onChange={e => handleDescChange('general', e.target.value)} 
                                    placeholder="Como este grupo ou lugar se parece? Cheiros, sons, aparência..." 
                                />
                            </div>
                        </div>
                    )}

                    {/* --- TAB ESTATÍSTICAS --- */}
                    {tab === 'stats' && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                            
                            {/* POPULAÇÃO E RESERVAS (DUAL STATS) */}
                            {['population', 'reserves'].map((stat) => {
                                const key = stat as 'population' | 'reserves';
                                const label = stat === 'population' ? 'População' : 'Reservas';
                                const values = formData.stats[key];

                                return (
                                    <div key={stat} className="stat-box" style={{background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '6px'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center'}}>
                                            <label className="input-label" style={{color: 'var(--cor-tema)', margin:0, fontSize:'1rem'}}>{label.toUpperCase()}</label>
                                            <div style={{display:'flex', gap:'10px', alignItems:'center', fontSize:'0.9rem'}}>
                                                <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                                    <span>Atual:</span>
                                                    <input 
                                                        type="number" className="input-dark-sheet" style={{width:'60px', textAlign:'center', padding:'2px', background:'rgba(0,0,0,0.3)'}}
                                                        value={values.current}
                                                        onChange={e => handleDualStatChange(key, 'current', Number(e.target.value))}
                                                    />
                                                </div>
                                                <span>Máx: <b>{values.max}</b></span>
                                            </div>
                                        </div>
                                        
                                        <input 
                                            type="range" min="0" max="6" step="1"
                                            className="tech-range"
                                            value={values.max} 
                                            onChange={e => handleDualStatChange(key, 'max', Number(e.target.value))} 
                                        />

                                        <textarea 
                                            className="input-dark-sheet" rows={2} 
                                            placeholder={`Detalhes sobre ${label.toLowerCase()}...`}
                                            value={(formData.descriptions as any)[stat]}
                                            onChange={e => handleDescChange(stat, e.target.value)}
                                            style={{marginTop: '10px', fontSize: '0.9rem'}}
                                        />
                                    </div>
                                );
                            })}

                            {/* ESTATÍSTICAS SIMPLES */}
                            {['mobility', 'defense', 'morale', 'belligerence'].map((statKey) => {
                                const currentValue = formData.stats[statKey as keyof typeof formData.stats] as number;
                                return (
                                    <div key={statKey} className="stat-box" style={{background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '6px'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center'}}>
                                            <label className="input-label" style={{color: 'var(--cor-tema)', margin:0, fontSize:'1rem'}}>{STAT_LABELS[statKey].toUpperCase()}</label>
                                            <span style={{fontWeight: 'bold', fontSize: '1.2rem', background: '#000', padding: '2px 10px', borderRadius:'4px'}}>{currentValue}</span>
                                        </div>
                                        
                                        <input 
                                            type="range" min="0" max="6" step="1"
                                            className="tech-range"
                                            value={currentValue} 
                                            onChange={e => handleStatChange(statKey, Number(e.target.value))} 
                                        />

                                        <textarea 
                                            className="input-dark-sheet" rows={2} 
                                            placeholder={`Descreva o nível de ${STAT_LABELS[statKey].toLowerCase()}...`}
                                            value={(formData.descriptions as any)[statKey]}
                                            onChange={e => handleDescChange(statKey, e.target.value)}
                                            style={{marginTop: '10px', fontSize: '0.9rem'}}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* --- TAB ATIVOS (Construções e Estoque) --- */}
                    {tab === 'ativos' && (
                        <div>
                            {/* CONSTRUÇÕES */}
                            <div className="mb-2">
                                <label className="input-label">CONSTRUÇÕES / PROJETOS</label>
                                <div className="wm-landmark-grid landmark-input-group" style={{gridTemplateColumns: '1fr 2fr 40px', padding:0}}>
                                    <select 
                                        className="input-dark-sheet" 
                                        value={newConstruction.name} 
                                        onChange={e => setNewConstruction({...newConstruction, name: e.target.value})}
                                    >
                                        <option value="">Selecione...</option>
                                        {library.settings.constructions.map((c, i) => (
                                            <option key={i} value={c.name}>{c.name}</option>
                                        ))}
                                        <option value="Personalizado">Personalizado...</option>
                                    </select>
                                    
                                    {newConstruction.name === 'Personalizado' ? (
                                        <input 
                                            className="input-dark-sheet" placeholder="Nome da construção..."
                                            onChange={e => setNewConstruction({...newConstruction, name: e.target.value})}
                                        />
                                    ) : (
                                        <input 
                                            className="input-dark-sheet" placeholder="Notas (opcional)..."
                                            value={newConstruction.notes}
                                            onChange={e => setNewConstruction({...newConstruction, notes: e.target.value})}
                                        />
                                    )}
                                    
                                    <button className="btn-action-primary" onClick={addConstruction}>+</button>
                                </div>

                                <div style={{display: 'flex', flexDirection: 'column', gap: '5px', marginTop:'10px'}}>
                                    <div className="wm-landmark-grid" style={{color:'#888', fontSize:'0.7rem', fontWeight:'bold', gridTemplateColumns: '1fr 2fr 40px'}}>
                                        <span>Nome</span>
                                        <span>Detalhes / Efeito</span>
                                        <span></span>
                                    </div>

                                    {formData.assets.constructions.map((c, idx) => {
                                        const standard = library.settings.constructions.find(libC => libC.name === c.name);
                                        return (
                                            <div key={idx} className="wm-landmark-item" style={{gridTemplateColumns: '1fr 2fr 40px'}}>
                                                <div style={{fontWeight:'bold', color: '#ffd700'}}>{c.name}</div>
                                                <div style={{fontSize:'0.85rem', color:'#ccc'}}>
                                                    {standard ? <span style={{fontStyle:'italic', color:'#aaa'}}>{standard.effect} </span> : ''}
                                                    {c.notes && <span>— {c.notes}</span>}
                                                </div>
                                                <button className="btn-icon danger" onClick={() => removeConstruction(idx)} style={{justifySelf:'end'}}>🗑️</button>
                                            </div>
                                        );
                                    })}
                                    {formData.assets.constructions.length === 0 && <div className="empty-state-mini">Nenhuma construção listada.</div>}
                                </div>
                            </div>

                            <hr style={{borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0'}} />

                            {/* ESTOQUE - CORRIGIDO PARA OBJECT ENTRIES */}
                            <div className="mb-2">
                                <label className="input-label">ESTOQUE / RECURSOS</label>
                                <div className="wm-landmark-grid landmark-input-group" style={{gridTemplateColumns: '2fr 1fr 40px', padding:0}}>
                                    <input 
                                        className="input-dark-sheet" placeholder="Item (Ex: Água, Munição)..."
                                        value={newStockItem.name}
                                        onChange={e => setNewStockItem({...newStockItem, name: e.target.value})}
                                    />
                                    <input 
                                        type="number" className="input-dark-sheet" placeholder="Qtd"
                                        value={newStockItem.quantity}
                                        onChange={e => setNewStockItem({...newStockItem, quantity: Number(e.target.value)})}
                                    />
                                    <button className="btn-action-primary" onClick={addStock}>+</button>
                                </div>

                                <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px'}}>
                                    {Object.entries(formData.assets.stock).map(([key, qtd]) => (
                                        <div key={key} style={{
                                            background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '4px',
                                            display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <span>{key}: <b>{qtd}</b></span>
                                            <button className="btn-icon danger" onClick={() => removeStock(key)} style={{padding:'0 5px'}}>🗑️</button>
                                        </div>
                                    ))}
                                    {Object.keys(formData.assets.stock).length === 0 && <div className="empty-state-mini" style={{width:'100%'}}>Estoque vazio.</div>}
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary-action" onClick={onClose}>CANCELAR</button>
                    <button className="btn-primary-action" onClick={handleSave}>SALVAR REFÚGIO</button>
                </div>
            </div>
        </div>
    );
};