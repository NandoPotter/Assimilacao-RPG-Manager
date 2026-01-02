/** ============================================================
 * ARQUIVO: src/pages/Dashboard/contentsAssimilator/ItemManager/index.tsx
 * DESCRIÇÃO: Gestão de Itens e Kits
 * ============================================================ */

import { useEffect, useState } from 'react';
import { itemLibraryService, type ItemLibrary, type Item, type ItemTrait, type ItemKit } from '../../../../services/itemLibraryService';
import './Styles.css';
import '../../../../styles/Libraries.css';

// Componentes
import { TraitModal } from './components/ItemTraitModal'; // Verifique se o nome do arquivo é este ou TraitModal.tsx
import { ItemModal } from './components/ItemModal';
import { LibraryModal } from './components/ItemLibraryModal'; // Verifique se o nome do arquivo é este ou LibraryModal.tsx
import { CommunityModal } from './components/ItemCommunityModal'; // Verifique se o nome do arquivo é este ou CommunityModal.tsx
import { KitModal } from './components/ItemKitModal'; // Ou KitModal.tsx, dependendo de como você salvou

function ItemManager() {
    const [viewMode, setViewMode] = useState<'libraries' | 'items'>('libraries');
    const [myLibraries, setMyLibraries] = useState<ItemLibrary[]>([]);
    const [favLibraries, setFavLibraries] = useState<ItemLibrary[]>([]);
    const [selectedLib, setSelectedLib] = useState<ItemLibrary | null>(null);
    const [innerTab, setInnerTab] = useState<'items' | 'traits' | 'kits'>('items');
    
    const [items, setItems] = useState<Item[]>([]);
    const [traits, setTraits] = useState<ItemTrait[]>([]);
    const [kits, setKits] = useState<ItemKit[]>([]); 
    
    // Modais
    const [showLibModal, setShowLibModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [showTraitModal, setShowTraitModal] = useState(false);
    const [showKitModal, setShowKitModal] = useState(false);
    const [showCommunityModal, setShowCommunityModal] = useState(false);
    
    // Objeto genérico de edição (pode ser Item, Library, Trait ou Kit)
    const [editingObj, setEditingObj] = useState<any>(null);

    // Initial Load
    useEffect(() => { if (viewMode === 'libraries') loadAllLists(); }, [viewMode]);

    // Detail Load
    useEffect(() => {
        if (viewMode === 'items' && selectedLib) {
            // Sempre carregamos traits e items pois Kits dependem de Itens para serem montados
            loadTraits(selectedLib.id); 
            loadItems(selectedLib.id);
            
            if (innerTab === 'kits') loadKits(selectedLib.id);
        }
    }, [viewMode, selectedLib, innerTab]);

    const loadAllLists = async () => {
        try {
            const [mine, favs] = await Promise.all([itemLibraryService.getMyLibraries(), itemLibraryService.getMyFavorites()]);
            
            // ORDENAÇÃO: Oficiais primeiro
            const sortFunc = (a: ItemLibrary, b: ItemLibrary) => (a.is_official === b.is_official ? 0 : a.is_official ? -1 : 1);
            
            setMyLibraries(mine.sort(sortFunc)); 
            setFavLibraries(favs.sort(sortFunc));
        } catch (error) { console.error(error); }
    };

    const loadItems = async (libId: string) => {
        try { const data = await itemLibraryService.getItemsByLibrary(libId); setItems(data); } catch (error) { console.error(error); }
    };

    const loadTraits = async (libId: string) => {
        try { const data = await itemLibraryService.getTraitsByLibrary(libId); setTraits(data); } catch (error) { console.error(error); }
    };

    // --- LOAD KITS ---
    const loadKits = async (libId: string) => {
        try { 
            const data = await itemLibraryService.getKitsByLibrary(libId); 
            setKits(data); 
        } catch (error) { 
            console.error("Erro ao carregar kits", error); 
        }
    };

    // --- HANDLERS ---
    const handleSaveLib = async (data: any) => {
        try {
            if (editingObj) await itemLibraryService.updateLibrary(editingObj.id, data);
            else await itemLibraryService.createLibrary(data);
            setShowLibModal(false); loadAllLists();
        } catch (e) { alert("Erro ao salvar."); }
    };

    const handleDeleteLib = async (id: string) => {
        if(!confirm("Tem certeza?")) return;
        await itemLibraryService.deleteLibrary(id); loadAllLists();
    };

    const handleSaveItem = async (data: Item) => {
        try {
            if (editingObj && editingObj.id) { 
                await itemLibraryService.updateItem(editingObj.id, data);
            } else {
                await itemLibraryService.createItem({ ...data, library_id: selectedLib!.id });
            }
            setShowItemModal(false); 
            loadItems(selectedLib!.id);
        } catch (e) { 
            console.error(e);
            alert("Erro ao salvar item."); 
        }
    };

    const handleDeleteItem = async (id: string) => {
        if(!confirm("Apagar item?")) return;
        await itemLibraryService.deleteItem(id); loadItems(selectedLib!.id);
    };

    const handleSaveTrait = async (data: ItemTrait) => {
        try {
            await itemLibraryService.saveTrait({ ...data, library_id: selectedLib!.id });
            setShowTraitModal(false); loadTraits(selectedLib!.id);
        } catch (e) { alert("Erro ao salvar característica."); }
    };

    const handleDeleteTrait = async (id: string) => {
        if(!confirm("Apagar característica?")) return;
        await itemLibraryService.deleteTrait(id); loadTraits(selectedLib!.id);
    };

    // --- HANDLERS DE KITS ---
    const handleSaveKit = async (data: ItemKit) => {
        try {
            await itemLibraryService.saveKit({ ...data, library_id: selectedLib!.id });
            setShowKitModal(false); loadKits(selectedLib!.id);
        } catch (e) { alert("Erro ao salvar kit."); }
    };

    const handleDeleteKit = async (id: string) => {
        if(!confirm("Apagar kit?")) return;
        await itemLibraryService.deleteKit(id); loadKits(selectedLib!.id);
    };

    const openTraitCreatorFromItem = () => {
        setShowItemModal(false); 
        setEditingObj(null);     
        setShowTraitModal(true); 
        setInnerTab('traits');   
    };

    const renderLibCard = (lib: ItemLibrary, isMine: boolean) => (
        <div key={lib.id} className={`bib-card ${lib.is_official ? 'official' : ''}`}>
            
            <div className="bib-card-header">
                <span className="bib-card-title">{lib.name}</span>
                
                {(lib.is_public || lib.is_official) && (
                    <div>
                        {lib.is_public && <span className="bib-badge-public">PÚBLICO</span>}
                        {lib.is_official && <span className="bib-badge-official">SISTEMA</span>}
                    </div>
                )}
            </div>

            <div className="bib-card-body">
                {lib.description || "Sem descrição."}
            </div>

            <div className="bib-card-footer">
                <button className="btn-open-lib" onClick={() => { setSelectedLib(lib); setViewMode('items'); setInnerTab('items'); }}>ABRIR</button>
                
                {isMine && (
                    <div className="bib-card-actions">
                        <button className="btn-icon" onClick={() => { setEditingObj(lib); setShowLibModal(true); }}>✎</button>
                        {!lib.is_official && (
                            <button className="btn-icon danger" onClick={() => handleDeleteLib(lib.id)}>🗑</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <div className="im-header">
                {viewMode === 'libraries' ? (
                    <>
                        <h1 className="chars-title">Depósitos de Itens</h1>
                        <div className="im-actions-top">
                            <button className="btn-action-outline" onClick={() => setShowCommunityModal(true)}>EXPLORAR COMUNIDADE</button>
                            <button className="btn-action-primary" onClick={() => { setEditingObj(null); setShowLibModal(true); }}>+ NOVO</button>
                        </div>
                    </>
                ) : (
                    <div className="im-breadcrumbs">
                        <button className="btn-back-text" onClick={() => setViewMode('libraries')}>← VOLTAR</button>
                        <span className="im-separator">/</span>
                        <span className="im-current-lib">{selectedLib?.name}</span>
                    </div>
                )}
            </div>

            <div className="im-content">
                {viewMode === 'libraries' && (
                    <>
                        <div className="im-section">
                            <h3 className="im-section-title">MEUS DEPÓSITOS</h3>
                            <div className="bib-card-grid">
                                {myLibraries.map(lib => renderLibCard(lib, true))}
                                {myLibraries.length===0 && <div className="empty-state-mini">Sem depósitos.</div>}
                            </div>
                        </div>
                        <div className="im-section">
                            <h3 className="im-section-title">MEUS FAVORITOS</h3>
                            <div className="bib-card-grid">{favLibraries.map(lib => renderLibCard(lib, false))}</div>
                        </div>
                    </>
                )}

                {viewMode === 'items' && selectedLib && (
                    <>
                        <div className="im-tabs-inner" style={{ marginBottom: '20px', display: 'flex', gap: '5px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            {['items', 'traits', 'kits'].map(t => (
                                <button key={t} onClick={() => setInnerTab(t as any)}
                                    style={{ background: innerTab === t ? 'var(--cor-tema)' : 'transparent', color: innerTab === t ? '#000' : '#888', border: 'none', padding: '10px 20px', fontWeight: '800', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '4px 4px 0 0' }}>
                                    {t === 'items' ? 'Itens' : t === 'traits' ? 'Características' : 'Kits'}
                                </button>
                            ))}
                        </div>

                        {innerTab === 'items' && (
                            <>
                                <div className="im-toolbar">
                                    <span className="im-counter">{items.length} ITENS</span>
                                    {myLibraries.some(my => my.id === selectedLib.id) && <button className="btn-action-primary" onClick={() => { setEditingObj(null); setShowItemModal(true); }}>+ NOVO ITEM</button>}
                                </div>
                                <div className="items-list-container">
                                    {items.map(item => (
                                        <div key={item.id} className="item-row">
                                            <div className="item-info">
                                                <div className="item-main"><span className="item-name">{item.name}</span><span className="item-cat">{item.category}</span></div>
                                                <p className="item-desc">{item.description}</p>
                                                <div style={{display:'flex', gap:'5px', marginTop:'5px'}}>
                                                    {item.traits && item.traits.map((t: any) => (
                                                        <span key={t.id} style={{fontSize:'0.65rem', padding:'2px 6px', background:'rgba(255,255,255,0.1)', borderRadius:'3px', color:'#aaa'}}>{t.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="item-meta">
                                                <span className="item-slots">{item.slots} SLOT(S)</span>
                                                {myLibraries.some(my => my.id === selectedLib.id) && <div className="item-actions"><button className="btn-icon-small" onClick={() => { setEditingObj(item); setShowItemModal(true); }}>✎</button><button className="btn-icon-small danger" onClick={() => handleDeleteItem(item.id!)}>✕</button></div>}
                                            </div>
                                        </div>
                                    ))}
                                    {items.length === 0 && <div className="empty-state">Depósito vazio.</div>}
                                </div>
                            </>
                        )}

                        {innerTab === 'traits' && (
                            <>
                                <div className="im-toolbar">
                                    <span className="im-counter">{traits.length} CARACTERÍSTICAS</span>
                                    {myLibraries.some(my => my.id === selectedLib.id) && <button className="btn-action-primary" onClick={() => { setEditingObj(null); setShowTraitModal(true); }}>+ NOVA CARAC.</button>}
                                </div>
                                <div className="items-list-container">
                                    {traits.map(trait => (
                                        <div key={trait.id} className="item-row">
                                            <div className="item-info">
                                                <div className="item-main">
                                                    <span className="item-name" style={{color: '#ffd700'}}>{trait.name}</span>
                                                    {trait.cost !== 0 && <span style={{fontSize:'0.7rem', color:'#888', marginLeft: '8px'}}>Custo: {trait.cost}</span>}
                                                </div>
                                                <p className="item-desc">{trait.description}</p>
                                            </div>
                                            {myLibraries.some(my => my.id === selectedLib.id) && <div className="item-actions"><button className="btn-icon-small" onClick={() => { setEditingObj(trait); setShowTraitModal(true); }}>✎</button><button className="btn-icon-small danger" onClick={() => handleDeleteTrait(trait.id!)}>✕</button></div>}
                                        </div>
                                    ))}
                                    {traits.length === 0 && <div className="empty-state">Nenhuma característica.</div>}
                                </div>
                            </>
                        )}
                        
                        {/* --- IMPLEMENTAÇÃO DA ABA DE KITS (CORRIGIDA) --- */}
                        {innerTab === 'kits' && (
                            <>
                                <div className="im-toolbar">
                                    <span className="im-counter">{kits.length} KITS</span>
                                    {myLibraries.some(my => my.id === selectedLib.id) && <button className="btn-action-primary" onClick={() => { setEditingObj(null); setShowKitModal(true); }}>+ NOVO KIT</button>}
                                </div>
                                <div className="items-list-container">
                                    {kits.map(kit => (
                                        <div key={kit.id} className="item-row">
                                            <div className="item-info">
                                                <div className="item-main">
                                                    <span className="item-name" style={{color: '#aaffaa'}}>📦 {kit.name}</span>
                                                    {/* REMOVIDO O SPAN DE CUSTO QUE ESTAVA AQUI */}
                                                </div>
                                                <p className="item-desc">{kit.description}</p>
                                                {/* Lista resumida de itens dentro do kit */}
                                                <div style={{display:'flex', gap:'5px', flexWrap:'wrap', marginTop:'5px'}}>
                                                    {kit.items && kit.items.length > 0 ? (
                                                        kit.items.map(itemId => {
                                                            const item = items.find(i => i.id === itemId);
                                                            return item ? (
                                                                <span key={itemId} style={{fontSize:'0.65rem', padding:'2px 6px', background:'rgba(100,255,100,0.1)', borderRadius:'3px', color:'#afa'}}>{item.name}</span>
                                                            ) : null;
                                                        })
                                                    ) : <span style={{fontSize:'0.7rem', color:'#555'}}>Kit vazio</span>}
                                                </div>
                                            </div>
                                            {myLibraries.some(my => my.id === selectedLib.id) && <div className="item-actions"><button className="btn-icon-small" onClick={() => { setEditingObj(kit); setShowKitModal(true); }}>✎</button><button className="btn-icon-small danger" onClick={() => handleDeleteKit(kit.id!)}>✕</button></div>}
                                        </div>
                                    ))}
                                    {kits.length === 0 && <div className="empty-state">Nenhum kit criado.</div>}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* MODAIS */}
            <LibraryModal 
                isOpen={showLibModal} 
                onClose={() => setShowLibModal(false)} 
                onSave={handleSaveLib} 
                initialData={editingObj} 
            />
            
            <ItemModal 
                isOpen={showItemModal} 
                onClose={() => setShowItemModal(false)} 
                onSave={handleSaveItem}
                initialData={editingObj} 
                availableTraits={traits}
                onCreateTrait={openTraitCreatorFromItem} 
                currentLibraryId={selectedLib?.id} 
            />
            
            <TraitModal 
                isOpen={showTraitModal} 
                onClose={() => setShowTraitModal(false)} 
                onSave={handleSaveTrait} 
                initialData={editingObj} 
            />

            <KitModal 
                isOpen={showKitModal} 
                onClose={() => setShowKitModal(false)} 
                onSave={handleSaveKit} 
                initialData={editingObj}
                availableItems={items} 
            />
            
            <CommunityModal 
                isOpen={showCommunityModal} 
                onClose={() => setShowCommunityModal(false)} 
                onClone={loadAllLists} 
            />
        </div>
    );
}

export default ItemManager;