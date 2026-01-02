/** ============================================================
 * ARQUIVO: src/pages/Dashboard/contentsAssimilator/WorldManager/index.tsx
 * DESCRIÇÃO: Assimilador de Mundos (Regiões e Refúgios)
 * ============================================================ */

import { useEffect, useState } from 'react';
import { worldLibraryService } from '../../../../services/worldLibraryService';
import type { WorldLibrary, Region, Refuge } from '../../../../interfaces/World'; 
import './Styles.css';

// Componentes
import { WorldLibraryModal } from './components/WorldLibraryModal';
import { WorldSettingsManager } from './components/WorldSettingsManager';
import { RegionModal } from './components/RegionModal'; 
import { RefugeModal } from './components/RefugeModal';
import { WorldCommunityModal } from './components/WorldCommunityModal'; // NOVO IMPORT

function WorldManager() {
    const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
    
    // Listas de Mundos
    const [myLibraries, setMyLibraries] = useState<WorldLibrary[]>([]);
    const [favLibraries, setFavLibraries] = useState<WorldLibrary[]>([]);
    
    const [selectedLib, setSelectedLib] = useState<WorldLibrary | null>(null);
    const [innerTab, setInnerTab] = useState<'regions' | 'refuges' | 'settings'>('regions');

    // Dados Carregados (Detalhes)
    const [regions, setRegions] = useState<Region[]>([]);
    const [refuges, setRefuges] = useState<Refuge[]>([]);

    // Modais
    const [showLibModal, setShowLibModal] = useState(false);
    const [showCommunityModal, setShowCommunityModal] = useState(false); // NOVO STATE
    const [editingLib, setEditingLib] = useState<WorldLibrary | null>(null);
    
    // Estados para Região
    const [showRegionModal, setShowRegionModal] = useState(false);
    const [editingRegion, setEditingRegion] = useState<Region | null>(null);

    // Estados para Refúgio
    const [showRefugeModal, setShowRefugeModal] = useState(false);
    const [editingRefuge, setEditingRefuge] = useState<Refuge | null>(null);

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
            // Busca Meus Mundos e Favoritos em paralelo
            // IMPORTANTE: Certifique-se que worldLibraryService tenha getMyFavorites(), senão remova a chamada
            const [mine, favs] = await Promise.all([
                worldLibraryService.getMyLibraries(),
                worldLibraryService.getMyFavorites ? worldLibraryService.getMyFavorites() : Promise.resolve([]) 
            ]);

            // Função de ordenação: Oficiais primeiro
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

    // --- HANDLERS (LIBRARY) ---

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
        try {
            await worldLibraryService.updateLibrarySettings(selectedLib.id, newSettings);
            setSelectedLib({ ...selectedLib, settings: newSettings });
        } catch (error) { alert("Erro ao salvar configurações do mundo."); }
    };

    // --- HANDLERS (REGION) ---

    const handleSaveRegion = async (data: Region) => {
        try {
            await worldLibraryService.saveRegion(data);
            setShowRegionModal(false);
            loadRegions();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar região.");
        }
    };

    const handleDeleteRegion = async (id: string) => {
        if(!confirm("Apagar região?")) return;
        try {
            await worldLibraryService.deleteRegion(id);
            loadRegions();
        } catch (error) { alert("Erro ao apagar região."); }
    };

    // --- HANDLERS (REFUGE) ---

    const handleSaveRefuge = async (data: Refuge) => {
        try {
            await worldLibraryService.saveRefuge(data);
            setShowRefugeModal(false);
            loadRefuges();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar refúgio.");
        }
    };

    const handleDeleteRefuge = async (id: string) => {
        if(!confirm("Apagar refúgio?")) return;
        try {
            await worldLibraryService.deleteRefuge(id);
            loadRefuges();
        } catch (error) { alert("Erro ao apagar refúgio."); }
    };

    // --- RENDERIZADORES ---

    const renderLibraryCard = (lib: WorldLibrary, isMine: boolean) => (
        <div key={lib.id} className={`sys-card ${lib.is_official ? 'official' : ''}`}>
            {/* Título */}
            <div className="sys-card-header">
                <span className="sys-card-title">{lib.name}</span>
                {(lib.is_public || lib.is_official) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {lib.is_public && <span className="badge-public">PÚBLICO</span>}
                        {lib.is_official && <span className="badge-official">SISTEMA</span>}
                    </div>
                )}
            </div>
            
            {/* Descrição */}
            <div className="sys-card-body">
                {lib.description || "Sem descrição."}
            </div>
            
            {/* Footer */}
            <div className="sys-card-footer">
                <button className="btn-open-lib" onClick={() => { setSelectedLib(lib); setViewMode('details'); setInnerTab('regions'); }}>ABRIR</button>
                
                {/* Permissões: Editar (sempre se for meu), Apagar (apenas se não for oficial) */}
                {isMine && (
                    <div className="sys-card-actions">
                        <button className="btn-icon" onClick={() => { setEditingLib(lib); setShowLibModal(true); }}>✎</button>
                        
                        {!lib.is_official && (
                            <button className="btn-icon danger" onClick={() => handleDeleteLibrary(lib.id)}>🗑</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // ... (renderRegionStatCard e renderRefugeStatCard permanecem iguais ao código anterior)
    const renderRegionStatCard = (reg: Region) => {
        const resourcesListText = reg.details.resource_types_found.length > 0 
            ? reg.details.resource_types_found.join(", ") 
            : "Nenhum recurso identificado.";
        
        const landmarksText = reg.details.landmarks.length > 0
            ? reg.details.landmarks.map(l => {
                const visibilityTag = (l as any).is_visible === false ? ' (inv)' : '';
                return `${l.name}${visibilityTag}`;
              }).join(', ')
            : 'Nenhum marco registrado.';

        return (
            <div key={reg.id} className="wm-stat-card">
                <div className="stat-card-header">
                    {reg.name} <span style={{opacity: 0.7, fontSize:'0.8em', fontWeight:'normal'}}>(REGIÃO: {reg.biome})</span>
                </div>
                <div className="stat-row-grid cols-3">
                    <div className="stat-cell"><span className="stat-label">Tamanho</span><span className="stat-value">{reg.stats.size}</span></div>
                    <div className="stat-cell"><span className="stat-label">Perigo</span><span className="stat-value" style={{color: '#ff6666'}}>{reg.stats.danger}</span></div>
                    <div className="stat-cell"><span className="stat-label">Habitação</span><span className="stat-value">{reg.stats.habitation}</span></div>
                </div>
                <div className="stat-section-wide">
                    <div className="stat-header-inline">
                        <span className="stat-label" style={{color:'#fff', marginBottom:0}}>Recursos Naturais</span>
                        <span className="stat-value" style={{fontSize:'1.2rem'}}>{reg.stats.resources_level}</span>
                    </div>
                    <span className="stat-resources-text">{resourcesListText}</span>
                </div>
                <div className="stat-row-grid cols-2">
                    <div className="stat-cell"><span className="stat-label">Contaminação</span><span className="stat-value" style={{color: '#adff2f'}}>{reg.stats.contamination}</span></div>
                    <div className="stat-cell"><span className="stat-label">Deslocamento</span><span className="stat-value">{reg.stats.displacement}</span></div>
                </div>
                <div className="stat-footer">
                    <b style={{color:'#fff', textTransform:'uppercase', fontSize:'0.75rem', marginRight:'5px'}}>Marcos:</b> {landmarksText}
                </div>
                <div className="stat-card-actions">
                    <button className="btn-mini-action" title="Editar" onClick={() => { setEditingRegion(reg); setShowRegionModal(true); }}>✎</button>
                    <button className="btn-mini-action danger" title="Apagar" onClick={() => handleDeleteRegion(reg.id!)}>🗑️</button>
                </div>
            </div>
        );
    };

    const renderRefugeStatCard = (ref: Refuge) => {
        const typeIcon = ref.type === 'community' ? '🏠' : '👣';
        const constructionsText = ref.assets.constructions.length > 0 
            ? ref.assets.constructions.map(c => c.name).join(", ") 
            : "Nenhuma.";

        return (
            <div key={ref.id} className="wm-stat-card">
                <div className="stat-card-header">
                    {typeIcon} {ref.name} <span style={{opacity: 0.7, fontSize:'0.8em', fontWeight:'normal'}}>({ref.archetype})</span>
                </div>
                <div className="stat-row-grid cols-2">
                    <div className="stat-cell">
                        <span className="stat-label">População</span>
                        <div style={{display:'flex', alignItems:'baseline', gap:'3px'}}>
                            <span className="stat-value">{ref.stats.population.current}</span>
                            <span style={{fontSize:'0.8rem', color:'#888'}}>/ {ref.stats.population.max}</span>
                        </div>
                    </div>
                    <div className="stat-cell">
                        <span className="stat-label">Reservas</span>
                        <div style={{display:'flex', alignItems:'baseline', gap:'3px'}}>
                            <span className="stat-value" style={{color: '#88ff88'}}>{ref.stats.reserves.current}</span>
                            <span style={{fontSize:'0.8rem', color:'#888'}}>/ {ref.stats.reserves.max}</span>
                        </div>
                    </div>
                </div>
                <div className="stat-row-grid" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr'}}>
                    <div className="stat-cell"><span className="stat-label">Mob.</span><span className="stat-value" style={{fontSize:'1rem'}}>{ref.stats.mobility}</span></div>
                    <div className="stat-cell"><span className="stat-label">Def.</span><span className="stat-value" style={{fontSize:'1rem'}}>{ref.stats.defense}</span></div>
                    <div className="stat-cell"><span className="stat-label">Moral</span><span className="stat-value" style={{fontSize:'1rem'}}>{ref.stats.morale}</span></div>
                    <div className="stat-cell"><span className="stat-label">Belig.</span><span className="stat-value" style={{fontSize:'1rem'}}>{ref.stats.belligerence}</span></div>
                </div>
                <div className="stat-footer">
                    <b style={{color:'#fff', textTransform:'uppercase', fontSize:'0.75rem', marginRight:'5px'}}>Construções:</b> {constructionsText}
                </div>
                <div className="stat-card-actions">
                    <button className="btn-mini-action" title="Editar" onClick={() => { setEditingRefuge(ref); setShowRefugeModal(true); }}>✎</button>
                    <button className="btn-mini-action danger" title="Apagar" onClick={() => handleDeleteRefuge(ref.id!)}>🗑️</button>
                </div>
            </div>
        );
    };

    return (
        <div className="wm-container">
            {/* HEADER */}
            <div className="wm-header">
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <h1 className="chars-title">Assimilador de Mundos</h1>
                    {viewMode === 'details' && selectedLib ? (
                        <div className="wm-breadcrumbs">
                            <button className="btn-back-text" onClick={() => setViewMode('list')}>← VOLTAR</button>
                            <span style={{margin: '0 5px'}}> / </span>
                            <span className="wm-current-lib">{selectedLib.name}</span>
                        </div>
                    ) : (
                        // Título normal quando na lista
                        <></>
                    )}
                </div>

                <div className="wm-actions-top">
                    {viewMode === 'list' && (
                        <>
                            {/* BOTÃO DA COMUNIDADE */}
                            <button className="btn-action-outline" onClick={() => setShowCommunityModal(true)}>EXPLORAR COMUNIDADE</button>
                            <button className="btn-action-primary" onClick={() => { setEditingLib(null); setShowLibModal(true); }}>+ NOVO</button>
                        </>
                    )}
                </div>
            </div>

            {/* LISTAGEM DE MUNDOS */}
            {viewMode === 'list' && (
                <>
                    {/* SEÇÃO MEUS MUNDOS */}
                    <div className="im-section" style={{marginBottom: '40px'}}>
                        <h3 className="im-section-title" style={{color: '#888', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '15px', textTransform: 'uppercase', borderLeft: '3px solid var(--cor-tema)', paddingLeft: '10px'}}>
                            MEUS MUNDOS
                        </h3>
                        <div className="sys-card-grid">
                            {myLibraries.map(lib => renderLibraryCard(lib, true))}
                            {myLibraries.length === 0 && <div className="empty-state">Nenhum mundo criado.</div>}
                        </div>
                    </div>

                    {/* SEÇÃO MUNDOS FAVORITOS */}
                    <div className="im-section">
                        <h3 className="im-section-title" style={{color: '#888', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '15px', textTransform: 'uppercase', borderLeft: '3px solid gold', paddingLeft: '10px'}}>
                            MUNDOS FAVORITOS
                        </h3>
                        <div className="sys-card-grid">
                            {favLibraries.map(lib => renderLibraryCard(lib, false))}
                            {favLibraries.length === 0 && <div className="empty-state-mini">Nenhum mundo favorito.</div>}
                        </div>
                    </div>
                </>
            )}

            {/* DETALHES DO MUNDO */}
            {viewMode === 'details' && selectedLib && (
                <div>
                    <div className="wm-tabs">
                        <button className={`wm-tab ${innerTab === 'regions' ? 'active' : ''}`} onClick={() => setInnerTab('regions')}>REGIÕES</button>
                        <button className={`wm-tab ${innerTab === 'refuges' ? 'active' : ''}`} onClick={() => setInnerTab('refuges')}>REFÚGIOS</button>
                        <button className={`wm-tab ${innerTab === 'settings' ? 'active' : ''}`} onClick={() => setInnerTab('settings')}>CONFIGURAÇÕES</button>
                    </div>

                    {innerTab === 'regions' && (
                        <div>
                            <div className="wm-toolbar">
                                <span>{regions.length} Regiões cadastradas</span>
                                <button className="btn-action-primary" onClick={() => { setEditingRegion(null); setShowRegionModal(true); }}>+ NOVA REGIÃO</button>
                            </div>
                            <div className="sys-card-grid">
                                {regions.map(reg => renderRegionStatCard(reg))}
                                {regions.length === 0 && <div className="empty-state">Nenhuma região criada neste mundo.</div>}
                            </div>
                        </div>
                    )}

                    {innerTab === 'refuges' && (
                        <div>
                            <div className="wm-toolbar">
                                <span>{refuges.length} Refúgios cadastrados</span>
                                <button className="btn-action-primary" onClick={() => { setEditingRefuge(null); setShowRefugeModal(true); }}>+ NOVO REFÚGIO</button>
                            </div>
                            <div className="sys-card-grid">
                                {refuges.map(ref => renderRefugeStatCard(ref))}
                                {refuges.length === 0 && <div className="empty-state">Nenhum refúgio cadastrado.</div>}
                            </div>
                        </div>
                    )}

                    {innerTab === 'settings' && (
                        <WorldSettingsManager 
                            library={selectedLib} 
                            onUpdateSettings={handleUpdateSettings} 
                        />
                    )}
                </div>
            )}

            {/* MODAIS */}
            <WorldLibraryModal isOpen={showLibModal} onClose={() => setShowLibModal(false)} onSave={handleSaveLibrary} initialData={editingLib} />
            {selectedLib && <RegionModal isOpen={showRegionModal} onClose={() => setShowRegionModal(false)} onSave={handleSaveRegion} library={selectedLib} initialData={editingRegion} />}
            {selectedLib && <RefugeModal isOpen={showRefugeModal} onClose={() => setShowRefugeModal(false)} onSave={handleSaveRefuge} library={selectedLib} initialData={editingRefuge} />}
            
            {/* NOVO MODAL DE COMUNIDADE */}
            <WorldCommunityModal 
                isOpen={showCommunityModal} 
                onClose={() => setShowCommunityModal(false)} 
                onClone={loadAllLists} 
            />
        </div>
    );
}

export default WorldManager;