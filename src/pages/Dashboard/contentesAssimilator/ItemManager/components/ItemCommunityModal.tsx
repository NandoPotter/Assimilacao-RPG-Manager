/** ============================================================
 * ARQUIVO: src/pages/Dashboard/contentsAssimilator/ItemManager/components/CommunityModal.tsx
 * DESCRIÇÃO: Modal de Comunidade para Itens
 * ============================================================ */

import { useEffect, useState } from 'react';
import { itemLibraryService, type ItemLibrary } from '../../../../../services/itemLibraryService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onClone: () => void;
}

export const CommunityModal = ({ isOpen, onClose, onClone }: Props) => {
    const [publicLibs, setPublicLibs] = useState<ItemLibrary[]>([]);
    const [favIds, setFavIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadCommunity();
        }
    }, [isOpen]);

    const loadCommunity = async () => {
        setLoading(true);
        try {
            // Busca depósitos públicos e IDs favoritados
            // O getPublicLibraries já deve retornar o tipo correto (ItemLibrary[])
            const [libs, ids] = await Promise.all([
                itemLibraryService.getPublicLibraries(),
                itemLibraryService.getFavoriteIds()
            ]);
            
            // Casting explícito se necessário, dependendo do retorno do seu service
            setPublicLibs((libs as unknown as ItemLibrary[]) || []); 
            setFavIds(ids || []);
        } catch (error) {
            console.error("Erro ao carregar comunidade de itens", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFav = async (libId: string) => {
        try {
            const isNowFav = await itemLibraryService.toggleFavorite(libId);
            if (isNowFav) {
                setFavIds([...favIds, libId]);
            } else {
                setFavIds(favIds.filter(id => id !== libId));
            }
            onClone(); // Atualiza a lista principal em tempo real
        } catch (e) {
            console.error(e);
            alert("Erro ao favoritar");
        }
    };

    const handleClone = async (lib: ItemLibrary) => {
        if (!confirm(`Clonar "${lib.name}" para seus depósitos?`)) return;

        setActionLoading(lib.id);
        try {
            await itemLibraryService.createLibrary(lib); // Assume que createLibrary aceita Partial<ItemLibrary> para clonar
            alert("Depósito clonado com sucesso!");
            onClone();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erro ao clonar depósito.");
        } finally {
            setActionLoading(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{zIndex: 2200}}>
            <div className="modal-box large-modal" style={{maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column'}}>
                
                {/* Header */}
                <div className="modal-header-row">
                    <h3 className="modal-title">COMUNIDADE DE ITENS</h3>
                    <button className="btn-close-x" onClick={onClose} style={{fontSize:'1.5rem', background:'none', border:'none', color:'#fff', cursor:'pointer'}}>✕</button>
                </div>

                {/* Lista Scrollável */}
                <div className="community-list-scroll" style={{flex: 1, overflowY: 'auto', padding: '10px'}}>
                    {loading && <div className="loading-text">Buscando sinais na rede...</div>}
                    
                    {!loading && (
                        <div className="bib-card-grid">
                            {publicLibs.map(lib => {
                                const isFav = favIds.includes(lib.id);
                                return (
                                    <div key={lib.id} className={`bib-card ${lib.is_official ? 'official' : ''}`} style={{minHeight:'auto'}}>
                                        
                                        {/* Card Header */}
                                        <div className="bib-card-header">
                                            <span className="bib-card-title">{lib.name}</span>
                                            
                                            {/* Badges e Autor */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                                                {lib.is_public && <span className="badge-public">PÚBLICO</span>}
                                                {lib.is_official && <span className="badge-official">SISTEMA</span>}                                                
                                            </div>
                                            <span className="bib-car-author">
                                                Criado por: {lib.profiles?.username || 'Desconhecido'}
                                            </span>
                                        </div>

                                        {/* Card Body */}
                                        <div className="bib-card-body" style={{fontSize:'0.85rem', marginBottom:'15px'}}>
                                            {lib.description || "Sem descrição."}
                                        </div>
                                        
                                        {/* Card Footer (Ações) */}
                                        <div className="bib-card-footer" style={{paddingTop:'10px', gap:'10px'}}>
                                            {/* BOTÃO FAVORITAR */}
                                            <button 
                                                className="bib-btn-explore"
                                                onClick={() => handleToggleFav(lib.id)}
                                                title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                                style={{
                                                    flex: 1, 
                                                    height: '32px',
                                                    padding: 0,

                                                    '--cor-tema': isFav ? 'gold' : '#888',
                                                    '--cor-tema-rgb': isFav ? '255, 215, 0' : '136, 136, 136',
                                                    '--cor-tema-glow': isFav ? 'gold' : 'rgba(136,136,136,0.5)',

                                                    borderColor: isFav ? 'gold' : '#444' 
                                                } as React.CSSProperties}
                                            >
                                                <span style={{ fontSize: '1.2rem', lineHeight: 0 }}>
                                                    {isFav ? '★' : '☆'}
                                                </span>
                                            </button>

                                            {/* Botão Importar/Clonar */}
                                            <button 
                                                className="btn-action-primary" 
                                                style={{flex: 3, fontSize:'0.75rem'}}
                                                onClick={() => handleClone(lib)}
                                                disabled={actionLoading === lib.id}
                                            >
                                                {actionLoading === lib.id ? '...' : 'CLONAR'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && publicLibs.length === 0 && (
                        <div className="empty-state">Nenhum depósito público encontrado.</div>
                    )}
                </div>
            </div>
        </div>
    );
};