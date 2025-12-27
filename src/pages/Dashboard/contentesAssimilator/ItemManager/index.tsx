/** ============================================================
 * ARQUIVO: src/pages/Dashboard/contentsAssimilator/ItemManager/index.tsx
 * DESCRIÇÃO: Gestão de Itens
 * ============================================================ */

import { useEffect, useState } from 'react';
import { itemLibraryService, type ItemLibrary, type Item } from '../../../../services/itemLibraryService';
import './styles.css';

// Componente simples de Modal para criar/editar Biblioteca
const LibraryModal = ({ isOpen, onClose, onSave, initialData }: any) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDesc(initialData.description || '');
            setIsPublic(initialData.is_public);
        } else {
            setName(''); setDesc(''); setIsPublic(false);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3 className="modal-title">{initialData ? 'EDITAR ARSENAL' : 'NOVO ARSENAL'}</h3>
                <input className="input-dark-sheet mb-2" placeholder="Nome da Coleção" value={name} onChange={e => setName(e.target.value)} autoFocus />
                <textarea className="input-dark-sheet mb-2" placeholder="Descrição" rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
                
                <div className="checkbox-row">
                    <input type="checkbox" id="chk-public" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                    <label htmlFor="chk-public">Disponibilizar para a Comunidade</label>
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary-action" onClick={onClose}>CANCELAR</button>
                    <button className="btn-primary-action" onClick={() => onSave({ name, description: desc, is_public: isPublic })}>SALVAR</button>
                </div>
            </div>
        </div>
    );
};

// Componente simples de Modal para criar/editar Item
const ItemModal = ({ isOpen, onClose, onSave, initialData }: any) => {
    const [formData, setFormData] = useState<Item>({
        name: '', description: '', slots: 1, category: 'Geral', traits: {}, library_id: ''
    });

    useEffect(() => {
        if (initialData) setFormData(initialData);
        else setFormData({ name: '', description: '', slots: 1, category: 'Geral', traits: {}, library_id: '' });
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3 className="modal-title">{initialData ? 'EDITAR ITEM' : 'NOVO ITEM'}</h3>
                <input className="input-dark-sheet mb-2" placeholder="Nome do Item" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <div className="grid-2col mb-2">
                    <input type="number" className="input-dark-sheet" placeholder="Espaços (Slots)" value={formData.slots} onChange={e => setFormData({...formData, slots: Number(e.target.value)})} />
                    <select className="input-dark-sheet" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option>Geral</option>
                        <option>Arma</option>
                        <option>Proteção</option>
                        <option>Consumível</option>
                        <option>Ferramenta</option>
                    </select>
                </div>
                <textarea className="input-dark-sheet mb-2" placeholder="Descrição e Efeitos" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                
                <div className="modal-actions">
                    <button className="btn-secondary-action" onClick={onClose}>CANCELAR</button>
                    <button className="btn-primary-action" onClick={() => onSave(formData)}>SALVAR</button>
                </div>
            </div>
        </div>
    );
};

function ItemManager() {
    const [viewMode, setViewMode] = useState<'libraries' | 'items'>('libraries');
    const [activeTab, setActiveTab] = useState<'mine' | 'public'>('mine');
    
    const [libraries, setLibraries] = useState<ItemLibrary[]>([]);
    const [selectedLib, setSelectedLib] = useState<ItemLibrary | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    
    // Modais
    const [showLibModal, setShowLibModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingObj, setEditingObj] = useState<any>(null);

    useEffect(() => {
        if (viewMode === 'libraries') loadLibraries();
    }, [activeTab, viewMode]);

    useEffect(() => {
        if (viewMode === 'items' && selectedLib) loadItems(selectedLib.id);
    }, [viewMode, selectedLib]);

    const loadLibraries = async () => {
        try {
            const data = activeTab === 'mine' 
                ? await itemLibraryService.getMyLibraries()
                : await itemLibraryService.getPublicLibraries();
            setLibraries(data as ItemLibrary[]);
        } catch (error) { console.error(error); }
    };

    const loadItems = async (libId: string) => {
        try {
            const data = await itemLibraryService.getItemsByLibrary(libId);
            setItems(data);
        } catch (error) { console.error(error); }
    };

    // --- HANDLERS LIBRARIES ---
    const handleSaveLib = async (data: any) => {
        try {
            if (editingObj) await itemLibraryService.updateLibrary(editingObj.id, data);
            else await itemLibraryService.createLibrary(data);
            setShowLibModal(false);
            loadLibraries();
        } catch (e) { alert("Erro ao salvar arsenal."); }
    };

    const handleDeleteLib = async (id: string) => {
        if(!confirm("Tem certeza? Todos os itens deste arsenal serão apagados.")) return;
        await itemLibraryService.deleteLibrary(id);
        loadLibraries();
    };

    // --- HANDLERS ITEMS ---
    const handleEnterLibrary = (lib: ItemLibrary) => {
        setSelectedLib(lib);
        setViewMode('items');
    };

    const handleSaveItem = async (data: Item) => {
        try {
            if (editingObj) await itemLibraryService.updateItem(editingObj.id, data);
            else await itemLibraryService.createItem({ ...data, library_id: selectedLib!.id });
            setShowItemModal(false);
            loadItems(selectedLib!.id);
        } catch (e) { alert("Erro ao salvar item."); }
    };

    const handleDeleteItem = async (id: string) => {
        if(!confirm("Apagar item?")) return;
        await itemLibraryService.deleteItem(id);
        loadItems(selectedLib!.id);
    };

    return (
        <div className="im-container">
            {/* HEADER DA PÁGINA */}
            <div className="im-header">
                {viewMode === 'libraries' ? (
                    <>
                        <h2 className="im-title">DEPÓSITOS DE ITENS</h2>
                        <div className="im-tabs">
                            <button className={`im-tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>MEUS ARSENAIS</button>
                            <button className={`im-tab ${activeTab === 'public' ? 'active' : ''}`} onClick={() => setActiveTab('public')}>REDE COMUNITÁRIA</button>
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

            {/* CONTEÚDO PRINCIPAL */}
            <div className="im-content">
                
                {/* VISTA 1: LISTA DE BIBLIOTECAS */}
                {viewMode === 'libraries' && (
                    <>
                        {activeTab === 'mine' && (
                            <div className="im-toolbar">
                                <button className="btn-primary-action" onClick={() => { setEditingObj(null); setShowLibModal(true); }}>
                                    + NOVO ARSENAL
                                </button>
                            </div>
                        )}

                        <div className="im-grid">
                            {libraries.map(lib => (
                                <div key={lib.id} className={`im-card ${lib.is_official ? 'official' : ''}`}>
                                    <div className="im-card-header">
                                        <span className="im-card-title">{lib.name}</span>
                                        {lib.is_public && <span className="badge-public">PÚBLICO</span>}
                                        {lib.is_official && <span className="badge-official">SISTEMA</span>}
                                    </div>
                                    <div className="im-card-body">
                                        <p>{lib.description || "Sem descrição."}</p>
                                    </div>
                                    <div className="im-card-footer">
                                        <button className="btn-open-lib" onClick={() => handleEnterLibrary(lib)}>ABRIR</button>
                                        
                                        {activeTab === 'mine' && (
                                            <div className="im-card-actions">
                                                <button className="btn-icon" onClick={() => { setEditingObj(lib); setShowLibModal(true); }}>✎</button>
                                                <button className="btn-icon danger" onClick={() => handleDeleteLib(lib.id)}>🗑</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* VISTA 2: ITENS DA BIBLIOTECA */}
                {viewMode === 'items' && selectedLib && (
                    <>
                        <div className="im-toolbar">
                            <span className="im-counter">{items.length} Itens cadastrados</span>
                            {/* Só permite criar se for dono da lib (assumindo que só entra aqui se for dono ou public view) */}
                            {/* Verificação simples: se veio da tab 'mine', pode editar. Se veio da 'public', é read-only (a menos que seja admin) */}
                            {activeTab === 'mine' && (
                                <button className="btn-primary-action" onClick={() => { setEditingObj(null); setShowItemModal(true); }}>
                                    + NOVO ITEM
                                </button>
                            )}
                        </div>

                        <div className="items-list-container">
                            {items.map(item => (
                                <div key={item.id} className="item-row">
                                    <div className="item-info">
                                        <div className="item-main">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-cat">{item.category}</span>
                                        </div>
                                        <p className="item-desc">{item.description}</p>
                                    </div>
                                    <div className="item-meta">
                                        <span className="item-slots">{item.slots} SLOT(S)</span>
                                        {activeTab === 'mine' && (
                                            <div className="item-actions">
                                                <button className="btn-icon-small" onClick={() => { setEditingObj(item); setShowItemModal(true); }}>✎</button>
                                                <button className="btn-icon-small danger" onClick={() => handleDeleteItem(item.id!)}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && <div className="empty-state">Nenhum item neste arsenal.</div>}
                        </div>
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
            />
        </div>
    );
}

export default ItemManager;