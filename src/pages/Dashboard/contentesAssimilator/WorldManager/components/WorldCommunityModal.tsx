import { useEffect, useState } from 'react';
import { worldLibraryService } from '../../../../../services/worldLibraryService';
import type { WorldLibrary } from '../../../../../interfaces/World';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onClone: () => void; // Callback para recarregar a lista principal após clonar
}

export const WorldCommunityModal = ({ isOpen, onClose, onClone }: Props) => {
    const [publicLibs, setPublicLibs] = useState<WorldLibrary[]>([]);
    const [loading, setLoading] = useState(false);
    const [cloningId, setCloningId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadPublicLibraries();
        }
    }, [isOpen]);

    const loadPublicLibraries = async () => {
        setLoading(true);
        try {
            // Assume que o service tem este método (igual ao itemLibraryService)
            const data = await worldLibraryService.getPublicLibraries();
            setPublicLibs(data);
        } catch (error) {
            console.error("Erro ao carregar comunidade", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClone = async (lib: WorldLibrary) => {
        if (!confirm(`Deseja importar o mundo "${lib.name}" para sua lista?`)) return;
        
        setCloningId(lib.id);
        try {
            // Assume método de clonagem no service
            await worldLibraryService.cloneLibrary(lib.id);
            alert("Mundo importado com sucesso!");
            onClone(); // Atualiza a lista pai
            onClose(); // Fecha o modal
        } catch (error) {
            console.error(error);
            alert("Erro ao importar mundo.");
        } finally {
            setCloningId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{zIndex: 2200}}>
            <div className="modal-box large-modal">
                <div className="modal-header-row">
                    <h3 className="modal-title">COMUNIDADE DE MUNDOS</h3>
                    <button className="btn-close-x" onClick={onClose}>✕</button>
                </div>

                <div className="community-list-scroll">
                    {loading && <div className="loading-text">Carregando mundos...</div>}
                    
                    {!loading && publicLibs.map(lib => (
                        <div key={lib.id} className={`sys-card ${lib.is_official ? 'official' : ''}`} style={{minHeight:'auto'}}>
                            <div className="sys-card-header">
                                <span className="sys-card-title">{lib.name}</span>
                                {lib.is_official && <span className="badge-official">SISTEMA</span>}
                            </div>
                            <div className="sys-card-body" style={{fontSize:'0.85rem', marginBottom:'15px'}}>
                                {lib.description || "Sem descrição."}
                            </div>
                            <div className="sys-card-footer" style={{paddingTop:'10px'}}>
                                <button 
                                    className="btn-action-primary" 
                                    style={{width:'100%', fontSize:'0.8rem'}}
                                    onClick={() => handleClone(lib)}
                                    disabled={cloningId === lib.id}
                                >
                                    {cloningId === lib.id ? 'IMPORTANDO...' : '📥 IMPORTAR'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {!loading && publicLibs.length === 0 && (
                        <div className="empty-state">Nenhum mundo público encontrado.</div>
                    )}
                </div>
            </div>
        </div>
    );
};