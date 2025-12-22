/** ========================================================================================
 * ARQUIVO: src/pages/Dashboard/components/CharacterSheet/components/PaginatedSection.tsx
 * DESCRIÇÃO: Componente de Seção com Paginação para Ficha Interativa
 * ========================================================================================= */

import React, { useState } from 'react';

export interface ItemData {
    id: number | string;
    name: string;
    description: string;
    type?: 'evolutiva' | 'adaptativa' | 'inoportuna' | 'singular'; 
}

interface Props {
    title: string;
    items: ItemData[];
}

function PaginatedSection({ title, items }: Props) {
    const [page, setPage] = useState(0);
    const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
    
    const itemsPerPage = 6;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const hasNext = page < totalPages - 1;
    const hasPrev = page > 0;
    const showControls = items.length > itemsPerPage;

    const visibleItems = items.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    // Helper: Classe de cor do TEXTO
    const getTitleClass = (item: ItemData) => {
        if (item.type) return `card-title-${item.type}`;
        return 'card-title-standard';
    };

    // NOVO Helper: Classe de GLOW do MODAL
    const getModalGlowClass = (item: ItemData) => {
        if (item.type) return `modal-glow-${item.type}`;
        return 'modal-glow-standard'; // Glow branco para características
    };

    return (
        <div className="paginated-wrapper">
            {/* ... (Header e Body permanecem iguais) ... */}
            <div className="paginated-header">
                <span className="group-title" style={{marginBottom:0, borderBottom:'none'}}>
                    {title} <span className="counter-badge">{items.length}</span>
                </span>
                {showControls && (
                    <span className="page-indicator-text">{page + 1} / {totalPages}</span>
                )}
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
                                    <span className={`simple-card-text ${getTitleClass(item)}`}>
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

            {/* --- MODAL ATUALIZADO --- */}
            {selectedItem && (
                <div 
                    className="detail-overlay-backdrop"
                    onClick={() => setSelectedItem(null)} 
                >
                    {/* Adicionamos a classe de GLOW dinamicamente aqui */}
                    <div 
                        className={`detail-card-expanded ${getModalGlowClass(selectedItem)}`} 
                        onClick={(e) => e.stopPropagation()}
                    >
                        
                        {/* Cabeçalho */}
                        <div className="expanded-header-area">
                            <span className={`expanded-title ${getTitleClass(selectedItem)}`}>
                                {selectedItem.name}
                            </span>
                            {selectedItem.type && (
                                <span className="expanded-type">Isso é uma Assimilação {selectedItem.type}</span>
                            )}
                             {!selectedItem.type && (
                                <span className="expanded-type">Característica Padrão</span>
                            )}
                        </div>
                        
                        {/* Descrição */}
                        <p className="expanded-desc">
                            {selectedItem.description}
                        </p>

                        {/* Botão Fechar Largo na parte inferior */}
                        <button 
                            className="btn-close-modal-wide"
                            onClick={() => setSelectedItem(null)}
                        >
                            Fechar
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}

export default PaginatedSection;