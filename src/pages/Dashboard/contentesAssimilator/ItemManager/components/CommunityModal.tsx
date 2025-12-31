import { useEffect, useState } from 'react';
import { itemLibraryService } from '../../../../../services/itemLibraryService';

export const CommunityModal = ({ isOpen, onClose, onClone }: any) => {
    const [publicLibs, setPublicLibs] = useState<any[]>([]);
    const [favIds, setFavIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (isOpen) loadCommunity(); }, [isOpen]);

    const loadCommunity = async () => {
        setLoading(true);
        try {
            const [libs, ids] = await Promise.all([itemLibraryService.getPublicLibraries(), itemLibraryService.getFavoriteIds()]);
            setPublicLibs(libs || []); setFavIds(ids || []);
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const handleToggleFav = async (libId: string) => {
        try {
            const isNowFav = await itemLibraryService.toggleFavorite(libId);
            setFavIds(prev => isNowFav ? [...prev, libId] : prev.filter(id => id !== libId));
            onClone();
        } catch (e) { alert("Erro ao favoritar"); }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box large-modal">
                <div className="modal-header-row">
                    <h3 className="modal-title">REDE COMUNITÁRIA</h3>
                    <button className="btn-close-x" onClick={onClose}>✕</button>
                </div>
                <div className="community-list-scroll">
                    {loading ? <p className="loading-text">Buscando sinais na rede...</p> : 
                     publicLibs.map(lib => {
                        const isFav = favIds.includes(lib.id);
                        return (
                            <div key={lib.id} className="im-card">
                                <div className="im-card-header"><span className="im-card-title">{lib.name}</span><span className="author-tag">por {lib.profiles?.username || 'Desconhecido'}</span></div>
                                <div className="im-card-body"><p>{lib.description || "Sem descrição."}</p></div>
                                <div className="im-card-footer"><button className={`btn-fav ${isFav ? 'active' : ''}`} onClick={() => handleToggleFav(lib.id)}>{isFav ? '★ FAVORITO' : '☆ FAVORITAR'}</button></div>
                            </div>
                        );
                     })}
                     {publicLibs.length === 0 && !loading && <p className="empty-state">Nenhum depósito público encontrado.</p>}
                </div>
            </div>
        </div>
    );
};