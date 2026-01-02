import { useState } from 'react';
import type { WorldLibrary, WorldSettings } from '../../../../../interfaces/World';

interface Props {
    library: WorldLibrary;
    onUpdateSettings: (newSettings: any) => void;
}

export const WorldSettingsManager = ({ library, onUpdateSettings }: Props) => {
    const [activeTab, setActiveTab] = useState<'biomes' | 'archetypes' | 'constructions'>('biomes');
    const [settings, setSettings] = useState<WorldSettings>(library.settings);
    
    // --- ESTADOS DE CRIAÇÃO ---
    const [newItemName, setNewItemName] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemType, setNewItemType] = useState<'community' | 'group'>('community');
    // Novos estados para Construções
    const [newItemEffect, setNewItemEffect] = useState('');
    const [newItemCost, setNewItemCost] = useState('');

    // --- ESTADOS DE EDIÇÃO ---
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editItemName, setEditItemName] = useState('');
    const [editItemDesc, setEditItemDesc] = useState('');
    const [editItemType, setEditItemType] = useState<'community' | 'group'>('community');
    const [editItemEffect, setEditItemEffect] = useState('');
    const [editItemCost, setEditItemCost] = useState('');

    // Função genérica para persistir
    const persistChanges = (updatedSettings: WorldSettings) => {
        setSettings(updatedSettings);
        onUpdateSettings(updatedSettings);
    };

    // --- LÓGICA DE EDIÇÃO GENÉRICA ---
    const startEdit = (index: number, item: any, type: 'biome' | 'archetype' | 'construction') => {
        setEditingIndex(index);
        setEditItemName(item.name);
        
        if (type === 'biome') {
            setEditItemDesc(item.description);
        } else if (type === 'archetype') {
            setEditItemDesc(item.description);
            setEditItemType(item.type);
        } else if (type === 'construction') {
            setEditItemEffect(item.effect);
            setEditItemCost(item.cost || '');
        }
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditItemName('');
        setEditItemDesc('');
        setEditItemEffect('');
        setEditItemCost('');
    };

    // --- BIOMAS ---
    
    const addBiome = () => {
        if (!newItemName) return;
        const newSettings = {
            ...settings,
            biomes: [...(settings.biomes || []), { name: newItemName, description: newItemDesc }]
        };
        persistChanges(newSettings);
        setNewItemName(''); setNewItemDesc('');
    };

    const saveEditBiome = () => {
        if (editingIndex === null || !editItemName) return;
        const newBiomes = [...settings.biomes];
        newBiomes[editingIndex] = { name: editItemName, description: editItemDesc };
        persistChanges({ ...settings, biomes: newBiomes });
        cancelEdit();
    };

    const removeBiome = (index: number) => {
        if (!confirm("Remover este bioma?")) return;
        const newBiomes = [...settings.biomes];
        newBiomes.splice(index, 1);
        persistChanges({ ...settings, biomes: newBiomes });
    };

    // --- ARQUÉTIPOS ---
    
    const addArchetype = () => {
        if (!newItemName) return;
        const newSettings = {
            ...settings,
            archetypes: [...(settings.archetypes || []), { name: newItemName, description: newItemDesc, type: newItemType }]
        };
        persistChanges(newSettings);
        setNewItemName(''); setNewItemDesc('');
    };

    const saveEditArchetype = () => {
        if (editingIndex === null || !editItemName) return;
        const newArchs = [...(settings.archetypes || [])];
        newArchs[editingIndex] = { name: editItemName, description: editItemDesc, type: editItemType };
        persistChanges({ ...settings, archetypes: newArchs });
        cancelEdit();
    };

    const removeArchetype = (index: number) => {
        if (!confirm("Remover arquétipo?")) return;
        const newArch = [...(settings.archetypes || [])];
        newArch.splice(index, 1);
        persistChanges({ ...settings, archetypes: newArch });
    };

    // --- CONSTRUÇÕES ---

    const addConstruction = () => {
        if (!newItemName) return;
        const newSettings = {
            ...settings,
            constructions: [...(settings.constructions || []), { name: newItemName, effect: newItemEffect, cost: newItemCost }]
        };
        persistChanges(newSettings);
        setNewItemName(''); setNewItemEffect(''); setNewItemCost('');
    };

    const saveEditConstruction = () => {
        if (editingIndex === null || !editItemName) return;
        const newConstrs = [...(settings.constructions || [])];
        newConstrs[editingIndex] = { name: editItemName, effect: editItemEffect, cost: editItemCost };
        persistChanges({ ...settings, constructions: newConstrs });
        cancelEdit();
    };

    const removeConstruction = (index: number) => {
        if (!confirm("Remover construção?")) return;
        const newConstrs = [...(settings.constructions || [])];
        newConstrs.splice(index, 1);
        persistChanges({ ...settings, constructions: newConstrs });
    };

    // --- RENDERIZADORES ---

    const renderBiomes = () => (
        <div className="settings-panel">
            <div className="im-toolbar" style={{background: 'rgba(0,0,0,0.3)', marginBottom:'10px'}}>
                <input className="input-dark-sheet" placeholder="Novo Bioma (Ex: Selva Tóxica)" value={newItemName} onChange={e => setNewItemName(e.target.value)} style={{flex:1}} />
                <input className="input-dark-sheet" placeholder="Descrição rápida..." value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} style={{flex:2}} />
                <button className="btn-action-primary" onClick={addBiome}>+ ADICIONAR</button>
            </div>

            <div className="settings-list">
                {settings.biomes?.map((biome, idx) => {
                    const isEditing = editingIndex === idx;
                    return (
                        <div key={idx} className="setting-item" style={{background: isEditing ? 'rgba(var(--cor-tema-rgb), 0.1)' : undefined, borderLeftColor: isEditing ? 'var(--cor-tema)' : 'transparent'}}>
                            {isEditing ? (
                                <div style={{display:'flex', gap:'10px', width:'100%', alignItems:'center'}}>
                                    <div style={{flex:1, display:'flex', flexDirection:'column', gap:'5px'}}>
                                        <input className="input-dark-sheet" value={editItemName} onChange={e => setEditItemName(e.target.value)} autoFocus />
                                        <textarea className="input-dark-sheet" value={editItemDesc} onChange={e => setEditItemDesc(e.target.value)} rows={2} />
                                    </div>
                                    <div style={{display:'flex', gap:'5px'}}>
                                        <button className="btn-icon" style={{color: '#88ff88'}} onClick={saveEditBiome}>✔</button>
                                        <button className="btn-icon danger" onClick={cancelEdit}>✕</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <div style={{fontWeight:'bold', color:'var(--cor-tema)'}}>{biome.name}</div>
                                        <div style={{fontSize:'0.8rem', color:'#aaa'}}>{biome.description}</div>
                                    </div>
                                    <div style={{display:'flex', gap:'5px'}}>
                                        <button className="btn-icon" onClick={() => startEdit(idx, biome, 'biome')}>✎</button>
                                        <button className="btn-icon danger" onClick={() => removeBiome(idx)}>✕</button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderArchetypes = () => (
        <div className="settings-panel">
            <div className="im-toolbar" style={{background: 'rgba(0,0,0,0.3)', marginBottom:'10px', gap:'10px'}}>
                <select className="input-dark-sheet" value={newItemType} onChange={e => setNewItemType(e.target.value as any)} style={{width:'120px'}}>
                    <option value="community">Comunidade</option>
                    <option value="group">Grupo</option>
                </select>
                <input className="input-dark-sheet" placeholder="Nome (Ex: Culto Solar)" value={newItemName} onChange={e => setNewItemName(e.target.value)} style={{flex:1}} />
                <input className="input-dark-sheet" placeholder="Descrição..." value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} style={{flex:2}} />
                <button className="btn-action-primary" onClick={addArchetype}>+ ADICIONAR</button>
            </div>
            <div className="settings-list">
                {settings.archetypes?.map((arch, idx) => {
                    const isEditing = editingIndex === idx;
                    return (
                        <div key={idx} className="setting-item" style={{background: isEditing ? 'rgba(var(--cor-tema-rgb), 0.1)' : undefined, borderLeftColor: isEditing ? 'var(--cor-tema)' : 'transparent'}}>
                            {isEditing ? (
                                <div style={{display:'flex', gap:'10px', width:'100%', alignItems:'center'}}>
                                    <div style={{flex:1, display:'flex', flexDirection:'column', gap:'5px'}}>
                                        <div style={{display:'flex', gap:'5px'}}>
                                            <select className="input-dark-sheet" value={editItemType} onChange={e => setEditItemType(e.target.value as any)} style={{width:'120px'}}>
                                                <option value="community">Comunidade</option>
                                                <option value="group">Grupo</option>
                                            </select>
                                            <input className="input-dark-sheet" value={editItemName} onChange={e => setEditItemName(e.target.value)} style={{flex:1}} autoFocus />
                                        </div>
                                        <textarea className="input-dark-sheet" value={editItemDesc} onChange={e => setEditItemDesc(e.target.value)} rows={2} />
                                    </div>
                                    <div style={{display:'flex', gap:'5px'}}>
                                        <button className="btn-icon" style={{color: '#88ff88'}} onClick={saveEditArchetype}>✔</button>
                                        <button className="btn-icon danger" onClick={cancelEdit}>✕</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                            <span style={{fontWeight:'bold', color: arch.type === 'community' ? '#aaffaa' : '#aaaaff'}}>
                                                {arch.type === 'community' ? '🏠' : '👣'} {arch.name}
                                            </span>
                                            <span style={{fontSize:'0.6rem', padding:'2px 5px', background:'rgba(255,255,255,0.1)', borderRadius:'3px'}}>
                                                {arch.type === 'community' ? 'FIXO' : 'MÓVEL'}
                                            </span>
                                        </div>
                                        <div style={{fontSize:'0.8rem', color:'#aaa'}}>{arch.description}</div>
                                    </div>
                                    <div style={{display:'flex', gap:'5px'}}>
                                        <button className="btn-icon" onClick={() => startEdit(idx, arch, 'archetype')}>✎</button>
                                        <button className="btn-icon danger" onClick={() => removeArchetype(idx)}>✕</button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderConstructions = () => (
        <div className="settings-panel">
            <div className="im-toolbar" style={{background: 'rgba(0,0,0,0.3)', marginBottom:'10px', display:'grid', gridTemplateColumns:'1fr 2fr 1fr 120px', gap:'10px'}}>
                <input className="input-dark-sheet" placeholder="Nome (Ex: Enfermaria)" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
                <input className="input-dark-sheet" placeholder="Efeito / Regra" value={newItemEffect} onChange={e => setNewItemEffect(e.target.value)} />
                <input className="input-dark-sheet" placeholder="Custo (Opcional)" value={newItemCost} onChange={e => setNewItemCost(e.target.value)} />
                <button className="btn-action-primary" onClick={addConstruction}>+ ADD</button>
            </div>

            <div className="settings-list">
                {/* Header Tabela */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 2fr 1fr 60px', padding:'0 10px', color:'#888', fontSize:'0.7rem', fontWeight:'bold', gap:'10px'}}>
                    <span>NOME</span>
                    <span>EFEITO</span>
                    <span>CUSTO</span>
                    <span></span>
                </div>

                {settings.constructions?.map((cons, idx) => {
                    const isEditing = editingIndex === idx;
                    return (
                        <div key={idx} className="setting-item" style={{display:'block', padding: isEditing ? '10px' : '12px'}}>
                            {isEditing ? (
                                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                    <div style={{display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:'10px', flex:1}}>
                                        <input className="input-dark-sheet" value={editItemName} onChange={e => setEditItemName(e.target.value)} autoFocus />
                                        <input className="input-dark-sheet" value={editItemEffect} onChange={e => setEditItemEffect(e.target.value)} />
                                        <input className="input-dark-sheet" value={editItemCost} onChange={e => setEditItemCost(e.target.value)} />
                                    </div>
                                    <div style={{display:'flex', gap:'5px'}}>
                                        <button className="btn-icon" style={{color: '#88ff88'}} onClick={saveEditConstruction}>✔</button>
                                        <button className="btn-icon danger" onClick={cancelEdit}>✕</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{display:'grid', gridTemplateColumns:'1fr 2fr 1fr 60px', gap:'10px', alignItems:'center'}}>
                                    <div style={{fontWeight:'bold', color:'var(--cor-tema)'}}>{cons.name}</div>
                                    <div style={{fontSize:'0.85rem', color:'#ccc'}}>{cons.effect}</div>
                                    <div style={{fontSize:'0.8rem', color:'#88ff88'}}>{cons.cost || '-'}</div>
                                    <div style={{display:'flex', gap:'5px', justifyContent:'flex-end'}}>
                                        <button className="btn-icon" onClick={() => startEdit(idx, cons, 'construction')}>✎</button>
                                        <button className="btn-icon danger" onClick={() => removeConstruction(idx)}>✕</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {(!settings.constructions || settings.constructions.length === 0) && (
                    <div className="empty-state-mini" style={{textAlign:'center', marginTop:'20px'}}>Nenhuma construção cadastrada.</div>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <div style={{display:'flex', gap:'10px', marginBottom:'15px', flexWrap:'wrap'}}>
                <button className={`btn-action-outline ${activeTab==='biomes'?'active':''}`} onClick={() => setActiveTab('biomes')}>BIOMAS</button>
                <button className={`btn-action-outline ${activeTab==='archetypes'?'active':''}`} onClick={() => setActiveTab('archetypes')}>ARQUÉTIPOS</button>
                <button className={`btn-action-outline ${activeTab==='constructions'?'active':''}`} onClick={() => setActiveTab('constructions')}>CONSTRUÇÕES</button>
            </div>

            {activeTab === 'biomes' && renderBiomes()}
            {activeTab === 'archetypes' && renderArchetypes()}
            {activeTab === 'constructions' && renderConstructions()}
        </div>
    );
};