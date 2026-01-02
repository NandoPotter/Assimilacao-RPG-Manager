import { useEffect, useState } from 'react';
import type { Region, WorldLibrary } from '../../../../../interfaces/World';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Region) => void;
    library: WorldLibrary;
    initialData?: Region | null;
}

const STAT_LABELS: Record<string, string> = {
    size: 'Tamanho',
    danger: 'Perigo',
    habitation: 'Habitação',
    resources_level: 'Nível de Recursos',
    contamination: 'Contaminação',
    displacement: 'Deslocamento'
};

export const RegionModal = ({ isOpen, onClose, onSave, library, initialData }: Props) => {
    // Estado Base
    const defaultStats = { size: 0, danger: 0, habitation: 0, resources_level: 0, contamination: 0, displacement: 0 };
    const defaultDesc = { size: '', danger: '', habitation: '', resources: '', contamination: '', displacement: '', general: '' };
    
    const [formData, setFormData] = useState<Region>({
        library_id: library.id,
        name: '',
        biome: library.settings.biomes?.[0]?.name || '',
        stats: defaultStats,
        descriptions: defaultDesc,
        details: { resource_types_found: [], landmarks: [], adventure_hooks: '' }
    });

    const [tab, setTab] = useState<'geral' | 'stats' | 'marcos'>('geral');
    
    // Estados temporários para listas
    const [newLandmark, setNewLandmark] = useState({ name: '', description: '', is_visible: true });
    const [newResource, setNewResource] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(JSON.parse(JSON.stringify(initialData))); 
            } else {
                setFormData({
                    library_id: library.id,
                    name: '',
                    biome: library.settings.biomes?.[0]?.name || '',
                    stats: defaultStats,
                    descriptions: defaultDesc,
                    details: { resource_types_found: [], landmarks: [], adventure_hooks: '' }
                });
            }
            setTab('geral');
        }
    }, [isOpen, initialData, library]);

    if (!isOpen) return null;

    // --- HANDLERS ---

    const handleStatChange = (stat: keyof typeof defaultStats, value: number) => {
        const newStats = { ...formData.stats, [stat]: value };

        // REGRA: Habitação <= Tamanho
        if (stat === 'size' && newStats.habitation > value) {
            newStats.habitation = value;
        }
        if (stat === 'habitation' && value > newStats.size) {
            newStats.habitation = newStats.size; 
        }

        setFormData({ ...formData, stats: newStats });
    };

    const handleDescChange = (key: string, value: string) => {
        setFormData({
            ...formData,
            descriptions: { ...formData.descriptions, [key]: value }
        });
    };

    // --- LIST MANAGERS ---

    const addLandmark = () => {
        if (!newLandmark.name) return;
        setFormData({
            ...formData,
            details: {
                ...formData.details,
                // @ts-ignore
                landmarks: [...formData.details.landmarks, newLandmark]
            }
        });
        setNewLandmark({ name: '', description: '', is_visible: true });
    };

    const toggleLandmarkVisibility = (idx: number) => {
        const newList = [...formData.details.landmarks];
        // @ts-ignore
        if (newList[idx].is_visible === undefined) newList[idx].is_visible = true;
        // @ts-ignore
        newList[idx].is_visible = !newList[idx].is_visible;
        setFormData({ ...formData, details: { ...formData.details, landmarks: newList } });
    }

    const removeLandmark = (idx: number) => {
        const newList = [...formData.details.landmarks];
        newList.splice(idx, 1);
        setFormData({ ...formData, details: { ...formData.details, landmarks: newList } });
    };

    const addResource = () => {
        if (!newResource) return;
        setFormData({
            ...formData,
            details: {
                ...formData.details,
                resource_types_found: [...formData.details.resource_types_found, newResource]
            }
        });
        setNewResource('');
    };

    const removeResource = (idx: number) => {
        const newList = [...formData.details.resource_types_found];
        newList.splice(idx, 1);
        setFormData({ ...formData, details: { ...formData.details, resource_types_found: newList } });
    };

    const handleSave = () => {
        if (!formData.name) return alert("A região precisa de um nome.");
        onSave(formData);
    };

    // Lista ordenada de stats para renderização
    const statsOrder = ['size', 'danger', 'habitation', 'resources_level', 'contamination', 'displacement'];

    return (
        <div className="modal-overlay" style={{zIndex: 2200}}>
            <div className="modal-box" style={{ maxWidth: '800px', height: '85vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header-row">
                    <h3 className="modal-title">{initialData ? 'EDITAR REGIÃO' : 'NOVA REGIÃO'}</h3>
                    <div className="wm-tabs" style={{marginBottom: 0, borderBottom: 'none'}}>
                        <button className={`wm-tab ${tab === 'geral' ? 'active' : ''}`} onClick={() => setTab('geral')}>GERAL</button>
                        <button className={`wm-tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>ESTATÍSTICAS</button>
                        <button className={`wm-tab ${tab === 'marcos' ? 'active' : ''}`} onClick={() => setTab('marcos')}>MARCOS</button>
                    </div>
                </div>

                <div className="modal-body-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    
                    {/* TAB GERAL */}
                    {tab === 'geral' && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                            {/* Parte Superior: Grid 2 Colunas */}
                            <div className="wm-grid-2col">
                                <div>
                                    <div className="mb-2">
                                        <label className="input-label">NOME DA REGIÃO</label>
                                        <input className="input-dark-sheet" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                                    </div>
                                    <div className="mb-2">
                                        <label className="input-label">BIOMA DOMINANTE</label>
                                        <select className="input-dark-sheet" value={formData.biome} onChange={e => setFormData({...formData, biome: e.target.value})}>
                                            {library.settings.biomes.map((b, idx) => (
                                                <option key={idx} value={b.name}>{b.name}</option>
                                            ))}
                                        </select>
                                        {/* DESCRIÇÃO DO BIOMA */}
                                        <div style={{
                                            fontSize: '0.85rem', 
                                            color: '#ccc', 
                                            marginTop: '10px', 
                                            lineHeight: '1.5',
                                            textAlign: 'justify',
                                            textIndent: '2em',
                                            background: 'rgba(0,0,0,0.2)',
                                            padding: '15px',
                                            borderRadius: '4px',
                                            borderLeft: '2px solid var(--cor-tema)'
                                        }}>
                                            {library.settings.biomes.find(b => b.name === formData.biome)?.description}
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="input-label">DESCRIÇÃO GERAL / VISUAL</label>
                                    <textarea className="input-dark-sheet" style={{height: '100%'}} value={formData.descriptions.general} onChange={e => handleDescChange('general', e.target.value)} placeholder="Como é a atmosfera deste lugar? Descreva o ambiente..." />
                                </div>
                            </div>

                            {/* Parte Inferior: Ganchos de Aventura (Movido para cá) */}
                            <div>
                                <label className="input-label">GANCHOS DE AVENTURA</label>
                                <textarea 
                                    className="input-dark-sheet" 
                                    rows={4} 
                                    placeholder="Oportunidades, Oposições e Consequências nesta região..."
                                    value={formData.details.adventure_hooks} 
                                    onChange={e => setFormData({...formData, details: {...formData.details, adventure_hooks: e.target.value}})} 
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB ESTATÍSTICAS */}
                    {tab === 'stats' && (
                        <div>
                            <div style={{marginBottom: '15px', padding: '10px', background: 'rgba(255,200,0,0.1)', borderLeft: '3px solid gold', fontSize: '0.8rem'}}>
                                ⚠ <b>Regra:</b> O nível de <b>Habitação</b> não pode exceder o nível de <b>Tamanho</b>.
                            </div>
                            
                            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                                {statsOrder.map((statKey) => {
                                    const isResourceStat = statKey === 'resources_level';
                                    const currentValue = formData.stats[statKey as keyof typeof formData.stats];

                                    return (
                                        <div key={statKey} className="stat-box" style={{background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '6px'}}>
                                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center'}}>
                                                <label className="input-label" style={{color: 'var(--cor-tema)', margin:0, fontSize:'1rem'}}>{STAT_LABELS[statKey]}</label>
                                                <span style={{fontWeight: 'bold', fontSize: '1.2rem', background: '#000', padding: '2px 10px', borderRadius:'4px'}}>{currentValue}</span>
                                            </div>
                                            
                                            {/* SLIDER NATIVO LIMPO */}
                                            <input 
                                                type="range" min="0" max="6" step="1"
                                                className="tech-range"
                                                value={currentValue} 
                                                onChange={e => handleStatChange(statKey as any, Number(e.target.value))} 
                                            />

                                            {isResourceStat ? (
                                                <div style={{marginTop: '15px', background: 'rgba(0,0,0,0.2)', padding:'10px', borderRadius:'4px'}}>
                                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px', fontSize:'0.8rem', color:'#aaa'}}>
                                                        <span>Recursos em Abundância</span>
                                                        <span style={{color: formData.details.resource_types_found.length > currentValue ? '#ff6666' : '#88ff88'}}>
                                                            {formData.details.resource_types_found.length} / {currentValue === 0 ? 'Escasso' : currentValue} slots ocupados
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="im-toolbar" style={{padding: '0', background: 'transparent', marginBottom:'10px'}}>
                                                        <input 
                                                            className="input-dark-sheet" 
                                                            placeholder="Adicionar recurso (Ex: Sucata Tecnológica)..." 
                                                            value={newResource} 
                                                            onChange={e => setNewResource(e.target.value)} 
                                                            onKeyDown={e => e.key === 'Enter' && addResource()}
                                                        />
                                                        <button className="btn-action-primary" onClick={addResource} disabled={currentValue === 0 || formData.details.resource_types_found.length >= currentValue}>+</button>
                                                    </div>

                                                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                                                        {formData.details.resource_types_found.map((res, idx) => (
                                                            <span key={idx} style={{padding: '5px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'}}>
                                                                {res}
                                                                <span style={{cursor: 'pointer', color: '#ff6666', fontWeight:'bold'}} onClick={() => removeResource(idx)}>×</span>
                                                            </span>
                                                        ))}
                                                        {formData.details.resource_types_found.length === 0 && <span style={{color: '#666', fontSize: '0.8rem', fontStyle:'italic'}}>Nenhum recurso definido.</span>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <textarea 
                                                    className="input-dark-sheet" 
                                                    rows={2} 
                                                    placeholder={`Descreva narrativamente o motivo do ${STAT_LABELS[statKey]} ser ${currentValue}...`}
                                                    value={(formData.descriptions as any)[statKey]}
                                                    onChange={e => handleDescChange(statKey, e.target.value)}
                                                    style={{marginTop: '10px', fontSize: '0.9rem'}}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB MARCOS */}
                    {tab === 'marcos' && (
                        <div>
                            <div className="mb-2">
                                <label className="input-label">NOVO MARCO</label>
                                {/* Classe CSS responsiva */}
                                <div className="wm-landmark-grid landmark-input-group" style={{padding:0}}>
                                    <input 
                                        className="input-dark-sheet" 
                                        placeholder="Nome (Ex: A Torre)" 
                                        value={newLandmark.name} 
                                        onChange={e => setNewLandmark({...newLandmark, name: e.target.value})} 
                                    />
                                    <input 
                                        className="input-dark-sheet" 
                                        placeholder="Descrição..." 
                                        value={newLandmark.description} 
                                        onChange={e => setNewLandmark({...newLandmark, description: e.target.value})} 
                                    />
                                    <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                        <span style={{fontSize:'0.6rem', color:'#aaa', marginBottom:'2px'}}>VISÍVEL?</span>
                                        <label className="tech-switch">
                                            <input type="checkbox" checked={newLandmark.is_visible} onChange={e => setNewLandmark({...newLandmark, is_visible: e.target.checked})} />
                                            <span className="tech-slider"></span>
                                        </label>
                                    </div>
                                    <button className="btn-action-primary" onClick={addLandmark}>+</button>
                                </div>
                            </div>

                            <hr style={{borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0'}} />

                            <label className="input-label">MARCOS EXISTENTES</label>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                {/* Header da Tabela */}
                                <div className="wm-landmark-grid" style={{color:'#888', textTransform:'uppercase', fontWeight:'bold', fontSize:'0.7rem'}}>
                                    <span>Nome</span>
                                    <span>Descrição</span>
                                    <span style={{textAlign:'center'}}>Visível</span>
                                    <span></span>
                                </div>

                                {formData.details.landmarks.map((lm, idx) => (
                                    <div key={idx} className="wm-landmark-item">
                                        <div style={{fontWeight:'bold', color: '#ffd700'}}>{lm.name}</div>
                                        <div style={{color: '#ccc', fontSize:'0.9rem'}}>{lm.description}</div>
                                        
                                        <div style={{display:'flex', justifyContent:'center'}}>
                                            <label className="tech-switch">
                                                {/* @ts-ignore */}
                                                <input type="checkbox" checked={lm.is_visible !== false} onChange={() => toggleLandmarkVisibility(idx)} />
                                                <span className="tech-slider"></span>
                                            </label>
                                        </div>

                                        <button className="btn-icon danger" onClick={() => removeLandmark(idx)}>✕</button>
                                    </div>
                                ))}
                                {formData.details.landmarks.length === 0 && <div className="empty-state-mini">Nenhum marco geográfico adicionado.</div>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary-action" onClick={onClose}>CANCELAR</button>
                    <button className="btn-primary-action" onClick={handleSave}>SALVAR REGIÃO</button>
                </div>
            </div>
        </div>
    );
};