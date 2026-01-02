/** ============================================================
 * ARQUIVO: src/pages/Dashboard/contentsAssimilator/WorldManager/index.tsx
 * DESCRIÇÃO: Assimilador de Mundos (Regiões e Refúgios)
 * ============================================================ */

import { useEffect, useState } from 'react';
import { worldLibraryService } from '../../../../services/worldLibraryService';
import type { WorldLibrary, Region, Refuge } from '../../../../interfaces/World'; 
import './Styles.css';
import '../../../../styles/Libraries.css';

// Componentes
import { WorldLibraryModal } from './components/WorldLibraryModal';
import { WorldSettingsManager } from './components/WorldSettingsManager';
import { RegionModal } from './components/RegionModal'; 
import { RefugeModal } from './components/RefugeModal';
import { WorldCommunityModal } from './components/WorldCommunityModal';

function WorldManager() {
    const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
    
    // Listas
    const [myLibraries, setMyLibraries] = useState<WorldLibrary[]>([]);
    const [favLibraries, setFavLibraries] = useState<WorldLibrary[]>([]);
    
    const [selectedLib, setSelectedLib] = useState<WorldLibrary | null>(null);
    const [innerTab, setInnerTab] = useState<'regions' | 'refuges' | 'settings'>('regions');

    // Dados Carregados
    const [regions, setRegions] = useState<Region[]>([]);
    const [refuges, setRefuges] = useState<Refuge[]>([]);

    // Modais
    const [showLibModal, setShowLibModal] = useState(false);
    const [showCommunityModal, setShowCommunityModal] = useState(false);
    const [editingLib, setEditingLib] = useState<WorldLibrary | null>(null);
    
    // Sub-modais
    const [showRegionModal, setShowRegionModal] = useState(false);
    const [editingRegion, setEditingRegion] = useState<Region | null>(null);
    const [showRefugeModal, setShowRefugeModal] = useState(false);
    const [editingRefuge, setEditingRefuge] = useState<Refuge | null>(null);

    // --- SEGURANÇA VISUAL ---
    // Verifica se o mundo selecionado está na lista dos "Meus Mundos"
    const isOwner = selectedLib ? myLibraries.some(lib => lib.id === selectedLib.id) : false;

    // Initial Load
    useEffect(() => {
        if (viewMode === 'list') loadAllLists();
    }, [viewMode]);

    // Detail Load
    useEffect(() => {
        if (viewMode === 'details' && selectedLib) {
            if (innerTab === 'regions') loadRegions();
            if (innerTab === 'refuges') loadRefuges();
        }
    }, [viewMode, selectedLib, innerTab]);

    const loadAllLists = async () => {
        try {
            const [mine, favs] = await Promise.all([
                worldLibraryService.getMyLibraries(),
                worldLibraryService.getMyFavorites()
            ]);

            // Ordenação: Oficiais primeiro
            const sortFunc = (a: WorldLibrary, b: WorldLibrary) => (a.is_official === b.is_official ? 0 : a.is_official ? -1 : 1);

            setMyLibraries(mine.sort(sortFunc));
            setFavLibraries(favs.sort(sortFunc));
        } catch (error) { console.error(error); }
    };

    const loadRegions = async () => {
        if (!selectedLib) return;
        try {
            const data = await worldLibraryService.getRegions(selectedLib.id);
            setRegions(data);
        } catch (error) { console.error(error); }
    };

    const loadRefuges = async () => {
        if (!selectedLib) return;
        try {
            const data = await worldLibraryService.getRefuges(selectedLib.id);
            setRefuges(data);
        } catch (error) { console.error(error); }
    };

    // --- HANDLERS ---

    const handleSaveLibrary = async (data: any) => {
        try {
            if (editingLib) {
                await worldLibraryService.updateLibrary(editingLib.id, data);
            } else {
                await worldLibraryService.createLibrary(data); 
            }
            setShowLibModal(false);
            loadAllLists();
        } catch (error) { alert("Erro ao salvar mundo."); }
    };

    const handleDeleteLibrary = async (id: string) => {
        if (!confirm("Tem certeza? Isso apagará todas as regiões e refúgios deste mundo.")) return;
        try {
            await worldLibraryService.deleteLibrary(id);
            loadAllLists();
        } catch (error) { alert("Erro ao apagar."); }
    };

    const handleUpdateSettings = async (newSettings: any) => {
        if (!selectedLib) return;

        // --- SEGURANÇA: Bloqueia a ação se não for o dono ---
        if (!isOwner) {
            alert("Modo Visualização: Você não tem permissão para alterar as configurações deste mundo.");
            return;
        }

        try {
            await worldLibraryService.updateLibrarySettings(selectedLib.id, newSettings);
            setSelectedLib({ ...selectedLib, settings: newSettings });
        } catch (error) { alert("Erro ao salvar configurações."); }
    };

    const handleSaveRegion = async (data: Region) => {
        try {
            await worldLibraryService.saveRegion(data);
            setShowRegionModal(false);
            loadRegions();
        } catch (error) { console.error(error); alert("Erro ao salvar região."); }
    };

    const handleDeleteRegion = async (id: string) => {
        if(!confirm("Apagar região?")) return;
        try {
            await worldLibraryService.deleteRegion(id);
            loadRegions();
        } catch (error) { alert("Erro ao apagar."); }
    };

    const handleSaveRefuge = async (data: Refuge) => {
        try {
            await worldLibraryService.saveRefuge(data);
            setShowRefugeModal(false);
            loadRefuges();
        } catch (error) { console.error(error); alert("Erro ao salvar refúgio."); }
    };

    const handleDeleteRefuge = async (id: string) => {
        if(!confirm("Apagar refúgio?")) return;
        try {
            await worldLibraryService.deleteRefuge(id);
            loadRefuges();
        } catch (error) { alert("Erro ao apagar."); }
    };

    // --- RENDERIZADORES ---

    const renderLibraryCard = (lib: WorldLibrary, isMine: boolean) => (
        <div key={lib.id} className={`bib-card ${lib.is_official ? 'official' : ''}`}>
            <div className="bib-card-header">
                <span className="bib-card-title">{lib.name}</span>
                {(lib.is_public || lib.is_official) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {lib.is_public && <span className="bib-badge-public">PÚBLICO</span>}
                        {lib.is_official && <span className="bib-badge-official">SISTEMA</span>}
                    </div>
                )}
            </div>
            <div className="bib-card-body">{lib.description || "Sem descrição."}</div>
            <div className="bib-card-footer">
                <button className="btn-open-lib" onClick={() => { setSelectedLib(lib); setViewMode('details'); setInnerTab('regions'); }}>ABRIR</button>
                {/* Se for MEU, posso editar. Se não for oficial, posso apagar. */}
                {isMine && (
                    <div className="bib-card-actions">
                        <button className="btn-icon" onClick={() => { setEditingLib(lib); setShowLibModal(true); }}>✎</button>
                        {!lib.is_official && <button className="btn-icon danger" onClick={() => handleDeleteLibrary(lib.id)}>🗑</button>}
                    </div>
                )}
            </div>
        </div>
    );

    const renderRegionStatCard = (reg: Region) => {
        const resourcesListText = reg.details.resource_types_found.length > 0 ? reg.details.resource_types_found.join(", ") : "Nenhum recurso.";
        const landmarksText = reg.details.landmarks.length > 0
            ? reg.details.landmarks.map(l => `${l.name}${(l as any).is_visible === false ? ' (inv)' : ''}`).join(', ')
            : 'Nenhum marco.';

        return (
            <div key={reg.id} className="wm-stat-card">
                <div className="stat-card-header">
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{reg.name}</span>
                        <span style={{ opacity: 0.7, fontSize:'0.8em', fontWeight:'normal' }}>
                            (BIOMA: {reg.biome})
                        </span>
                    </div>
                    
                    {/* Botões EMPILHADOS verticalmente no canto direito */}
                    {isOwner && (
                        <div className="bib-card-mini-actions">
                            <button className="btn-mini-action" onClick={() => { setEditingRegion(reg); setShowRegionModal(true); }} style={{margin:0}}>✎</button>
                            <button className="btn-mini-action danger" onClick={() => handleDeleteRegion(reg.id!)} style={{margin:0}}>🗑️</button>
                        </div>
                    )}
                </div>

                <div className="stat-row-grid cols-3">
                    <div className="stat-cell"><span className="stat-label">Tamanho</span><span className="stat-value">{reg.stats.size}</span></div>
                    <div className="stat-cell"><span className="stat-label">Perigo</span><span className="stat-value" style={{color: '#ff6666'}}>{reg.stats.danger}</span></div>
                    <div className="stat-cell"><span className="stat-label">Habitação</span><span className="stat-value">{reg.stats.habitation}</span></div>
                </div>
                <div className="stat-section-wide">
                    <div className="stat-header-inline"><span className="stat-label" style={{color:'#fff', marginBottom:0}}>Recursos</span><span className="stat-value" style={{fontSize:'1.2rem'}}>{reg.stats.resources_level}</span></div>
                    <span className="stat-resources-text">{resourcesListText}</span>
                </div>
                <div className="stat-row-grid cols-2">
                    <div className="stat-cell"><span className="stat-label">Contaminação</span><span className="stat-value" style={{color: '#adff2f'}}>{reg.stats.contamination}</span></div>
                    <div className="stat-cell"><span className="stat-label">Deslocamento</span><span className="stat-value">{reg.stats.displacement}</span></div>
                </div>
                <div className="stat-footer"><b style={{color:'#fff', fontSize:'0.75rem'}}>Marcos:</b> {landmarksText}</div>
            </div>
        );
    };

    const renderRefugeStatCard = (ref: Refuge) => {
        const typeIcon = ref.type === 'community' ? '🏠' : '👣';
        const constructionsText = ref.assets.constructions.length > 0 ? ref.assets.constructions.map(c => c.name).join(", ") : "Nenhuma.";

        return (
            <div key={ref.id} className="wm-stat-card">
                <div className="stat-card-header">
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {typeIcon} {ref.name}
                        </span>
                        <span style={{ opacity: 0.7, fontSize:'0.8em', fontWeight:'normal' }}>
                            ({ref.archetype})
                        </span>
                    </div>

                    {/* Botões EMPILHADOS verticalmente no canto direito */}
                    {isOwner && (
                        <div className="bib-card-mini-actions">
                            <button className="btn-mini-action" onClick={() => { setEditingRefuge(ref); setShowRefugeModal(true); }} style={{margin:0}}>✎</button>
                            <button className="btn-mini-action danger" onClick={() => handleDeleteRefuge(ref.id!)} style={{margin:0}}>🗑️</button>
                        </div>
                    )}
                </div>

                <div className="stat-row-grid cols-2">
                    <div className="stat-cell"><span className="stat-label">População</span><div style={{display:'flex', alignItems:'baseline', gap:'3px'}}><span className="stat-value">{ref.stats.population.current}</span><span style={{fontSize:'0.8rem', color:'#888'}}>/ {ref.stats.population.max}</span></div></div>
                    <div className="stat-cell"><span className="stat-label">Reservas</span><div style={{display:'flex', alignItems:'baseline', gap:'3px'}}><span className="stat-value" style={{color: '#88ff88'}}>{ref.stats.reserves.current}</span><span style={{fontSize:'0.8rem', color:'#888'}}>/ {ref.stats.reserves.max}</span></div></div>
                </div>
                <div className="stat-row-grid" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr'}}>
                    <div className="stat-cell"><span className="stat-label">Mob.</span><span className="stat-value" style={{fontSize:'1rem'}}>{ref.stats.mobility}</span></div>
                    <div className="stat-cell"><span className="stat-label">Def.</span><span className="stat-value" style={{fontSize:'1rem'}}>{ref.stats.defense}</span></div>
                    <div className="stat-cell"><span className="stat-label">Moral</span><span className="stat-value" style={{fontSize:'1rem'}}>{ref.stats.morale}</span></div>
                    <div className="stat-cell"><span className="stat-label">Belig.</span><span className="stat-value" style={{fontSize:'1rem'}}>{ref.stats.belligerence}</span></div>
                </div>
                <div className="stat-footer"><b style={{color:'#fff', fontSize:'0.75rem'}}>Construções:</b> {constructionsText}</div>
            </div>
        );
    };

    return (
        <div className="wm-container">
            <div className="wm-header">
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <h1 className="chars-title">Assimilador de Mundos</h1>
                    {viewMode === 'details' && selectedLib && (
                        <div className="wm-breadcrumbs">
                            <button className="btn-back-text" onClick={() => setViewMode('list')}>← VOLTAR</button>
                            <span style={{margin: '0 5px'}}> / </span>
                            <span className="wm-current-lib">{selectedLib.name}</span>
                        </div>
                    )}
                </div>
                <div className="wm-actions-top">
                    {viewMode === 'list' && (
                        <>
                            <button className="bib-btn-explore" onClick={() => setShowCommunityModal(true)}>EXPLORAR COMUNIDADE</button>
                            <button className="bib-btn-action" onClick={() => { setEditingLib(null); setShowLibModal(true); }}>+ NOVO</button>
                        </>
                    )}
                </div>
            </div>

            {viewMode === 'list' && (
                <>
                    <div className="im-section" style={{marginBottom: '40px'}}>
                        <h3 className="im-section-title" style={{color: '#888', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '15px', textTransform: 'uppercase', borderLeft: '3px solid var(--cor-tema)', paddingLeft: '10px'}}>MEUS MUNDOS</h3>
                        <div className="bib-card-grid">
                            {myLibraries.map(lib => renderLibraryCard(lib, true))}
                            {myLibraries.length === 0 && <div className="empty-state">Nenhum mundo criado.</div>}
                        </div>
                    </div>
                    <div className="im-section">
                        <h3 className="im-section-title" style={{color: '#888', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '15px', textTransform: 'uppercase', borderLeft: '3px solid gold', paddingLeft: '10px'}}>MUNDOS FAVORITOS</h3>
                        <div className="bib-card-grid">
                            {favLibraries.map(lib => renderLibraryCard(lib, false))}
                            {favLibraries.length === 0 && <div className="empty-state-mini">Nenhum mundo favorito.</div>}
                        </div>
                    </div>
                </>
            )}

            {viewMode === 'details' && selectedLib && (
                <div>
                    <div className="wm-tabs">
                        <button className={`wm-tab ${innerTab === 'regions' ? 'active' : ''}`} onClick={() => setInnerTab('regions')}>REGIÕES</button>
                        <button className={`wm-tab ${innerTab === 'refuges' ? 'active' : ''}`} onClick={() => setInnerTab('refuges')}>REFÚGIOS</button>
                        
                        {/* A ABA DE CONFIGURAÇÕES AGORA APARECE PARA TODOS */}
                        <button className={`wm-tab ${innerTab === 'settings' ? 'active' : ''}`} onClick={() => setInnerTab('settings')}>CONFIGURAÇÕES</button>
                    </div>

                    {innerTab === 'regions' && (
                        <div>
                            <div className="wm-toolbar">
                                <span>{regions.length} Regiões cadastradas</span>
                                {/* SÓ MOSTRA BOTÃO DE CRIAR SE FOR O DONO */}
                                {isOwner && (
                                    <button className="bib-btn-action" onClick={() => { setEditingRegion(null); setShowRegionModal(true); }}>+ NOVA REGIÃO</button>
                                )}
                            </div>
                            <div className="bib-card-grid">
                                {regions.map(reg => renderRegionStatCard(reg))}
                                {regions.length === 0 && <div className="empty-state">Nenhuma região criada.</div>}
                            </div>
                        </div>
                    )}

                    {innerTab === 'refuges' && (
                        <div>
                            <div className="wm-toolbar">
                                <span>{refuges.length} Refúgios cadastrados</span>
                                {/* SÓ MOSTRA BOTÃO DE CRIAR SE FOR O DONO */}
                                {isOwner && (
                                    <button className="bib-btn-action" onClick={() => { setEditingRefuge(null); setShowRefugeModal(true); }}>+ NOVO REFÚGIO</button>
                                )}
                            </div>
                            <div className="bib-card-grid">
                                {refuges.map(ref => renderRefugeStatCard(ref))}
                                {refuges.length === 0 && <div className="empty-state">Nenhum refúgio cadastrado.</div>}
                            </div>
                        </div>
                    )}
                    
                    {innerTab === 'settings' && (
                        <WorldSettingsManager 
                            library={selectedLib} 
                            onUpdateSettings={handleUpdateSettings}
                            // @ts-ignore
                            readOnly={!isOwner} 
                        />
                    )}
                </div>
            )}

            <WorldLibraryModal isOpen={showLibModal} onClose={() => setShowLibModal(false)} onSave={handleSaveLibrary} initialData={editingLib} />
            {selectedLib && <RegionModal isOpen={showRegionModal} onClose={() => setShowRegionModal(false)} onSave={handleSaveRegion} library={selectedLib} initialData={editingRegion} />}
            {selectedLib && <RefugeModal isOpen={showRefugeModal} onClose={() => setShowRefugeModal(false)} onSave={handleSaveRefuge} library={selectedLib} initialData={editingRefuge} />}
            <WorldCommunityModal isOpen={showCommunityModal} onClose={() => setShowCommunityModal(false)} onClone={loadAllLists} />
        </div>
    );
}

export default WorldManager;