/** ========================================================================================
 * ARQUIVO: src/pages/Dashboard/components/CharacterSheet/components/PaginatedSection.tsx
 * DESCRIÇÃO: Componente de Seção com Paginação (Atualizado para Editor)
 * ========================================================================================= */

import React, { useState } from 'react';

// Atualizado para refletir o DB real
export interface ItemData {
    id: number; 
    name: string;
    description: string;
    cost: number;
    requirements: any; // JSONB do banco
    type?: string; 
}

interface Props {
    title: string;
    items: ItemData[];
    onEdit?: () => void; // Função para abrir o modal de edição
}

function PaginatedSection({ title, items, onEdit }: Props) {
    const [page, setPage] = useState(0);
    const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
    
    const itemsPerPage = 6;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const hasNext = page < totalPages - 1;
    const hasPrev = page > 0;
    const showControls = items.length > itemsPerPage;

    const visibleItems = items.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    // Helper simples para texto de requisitos no modal de leitura
    const formatReqText = (reqs: any) => {
        if (!reqs || (Array.isArray(reqs) && reqs.length === 0)) return "Nenhum";
        return JSON.stringify(reqs).substring(0, 50) + "..."; 
        // Nota: O modal de edição terá um renderizador mais bonito.
    };

    return (
        <div className="paginated-wrapper">
            
            {/* HEADER COM BOTÃO EDITAR */}
            <div className="paginated-header" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <span className="group-title" style={{marginBottom:0, borderBottom:'none'}}>
                        {title} <span className="counter-badge">{items.length}</span>
                    </span>
                </div>

                {/* Controles à Direita: Paginação + Botão Editar */}
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    
                    {showControls && (
                        <span className="page-indicator-text" style={{marginRight:'5px'}}>{page + 1} / {totalPages}</span>
                    )}

                    {/* Botão Editar: Reusando classe do AttributesTab para consistência */}
                    {onEdit && (
                        <button className="btn-edit-small" onClick={onEdit}>
                            EDITAR
                        </button>
                    )}
                </div>
            </div>

            <div className="paginated-body">
                <button 
                    className="side-nav-btn" disabled={!hasPrev} onClick={() => setPage(p => p - 1)}
                    style={{visibility: showControls ? 'visible' : 'hidden'}}
                >
                    ‹
                </button>
                <div className="paginated-content-area">
                    {items.length === 0 ? (
                        <div className="empty-paginated-state">Nenhum registro.</div>
                    ) : (
                        <div className="paginated-grid-3x2">
                            {visibleItems.map(item => (
                                <div key={item.id} className="simple-card" onClick={() => setSelectedItem(item)}>
                                    <span className="simple-card-text card-title-standard">
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button 
                    className="side-nav-btn" disabled={!hasNext} onClick={() => setPage(p => p + 1)}
                    style={{visibility: showControls ? 'visible' : 'hidden'}}
                >
                    ›
                </button>
            </div>

            {/* MODAL DE LEITURA (SIMPLES) */}
            {selectedItem && (
                <div className="detail-overlay-backdrop" onClick={() => setSelectedItem(null)}>
                    <div className="detail-card-expanded modal-glow-standard" onClick={(e) => e.stopPropagation()}>
                        <div className="expanded-header-area">
                            <span className="expanded-title card-title-standard">{selectedItem.name}</span>
                            <span className="expanded-type">Custo: {selectedItem.cost} XP</span>
                        </div>
                        <p className="expanded-desc">{selectedItem.description}</p>
                        <button className="btn-close-modal-wide" onClick={() => setSelectedItem(null)}>Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaginatedSection;