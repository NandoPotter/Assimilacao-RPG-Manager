/** ============================================================
 * ARQUIVO: src/pages/Dashboard/contentsAssimilator/ItemManager/components/KitModal.tsx
 * DESCRIÇÃO: Modal para criar/editar Kits de Itens
 * ============================================================ */
import { useState, useEffect } from 'react';
import type { ItemKit, Item } from '../../../../../services/itemLibraryService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData: ItemKit | null;
    availableItems: Item[]; // Lista de todos os itens da biblioteca para escolher
}

export const KitModal = ({ isOpen, onClose, onSave, initialData, availableItems }: Props) => {
    const [name, setName] = useState('');
    
    // IDs dos itens selecionados
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                // Carrega os itens salvos ou inicia vazio
                setSelectedItemIds(initialData.items || []);
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData]);

    const resetForm = () => {
        setName('');
        setSelectedItemIds([]);
    };

    const handleSave = () => {
        if (!name.trim()) return alert("Nome é obrigatório");

        onSave({
            id: initialData?.id,
            name,
            items: selectedItemIds
        });
    };

    const toggleItem = (itemId: string) => {
        if (selectedItemIds.includes(itemId)) {
            setSelectedItemIds(selectedItemIds.filter(id => id !== itemId));
        } else {
            setSelectedItemIds([...selectedItemIds, itemId]);
        }
    };

    if (!isOpen) return null;

    // Filtros visuais
    const itemsInKit = availableItems.filter(i => selectedItemIds.includes(i.id!));
    const itemsAvailable = availableItems.filter(i => !selectedItemIds.includes(i.id!));

    return (
        <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '700px' }}>
                <h3 className="modal-title">{initialData ? 'Editar Kit' : 'Novo Kit'}</h3>
                
                <div className="mb-2">
                    <label className="input-label">Nome do Kit</label>
                    <input 
                        className="input-dark-sheet" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Ex: Kit de Sobrevivência" 
                        autoFocus 
                    />
                </div>

                {/* SELEÇÃO DE ITENS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', height: '300px' }}>
                    
                    {/* COLUNA ESQUERDA: DISPONÍVEIS */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="input-label" style={{ color: '#888' }}>Itens Disponíveis</label>
                        <div className="input-dark-sheet" style={{ flex: 1, overflowY: 'auto', padding: '5px' }}>
                            {itemsAvailable.length === 0 && <div style={{ padding: '10px', color: '#666', fontSize: '0.8rem' }}>Sem itens disponíveis.</div>}
                            {itemsAvailable.map(item => (
                                <div key={item.id} onClick={() => toggleItem(item.id!)} 
                                     style={{ padding: '8px', borderBottom: '1px solid #333', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                     onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
                                     onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ fontSize: '0.85rem' }}>{item.name}</span>
                                    <span style={{ color: 'var(--cor-tema)', fontWeight: 'bold' }}>+</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* COLUNA DIREITA: SELECIONADOS */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="input-label" style={{ color: '#aaffaa' }}>Itens no Kit ({itemsInKit.length})</label>
                        <div className="input-dark-sheet" style={{ flex: 1, overflowY: 'auto', padding: '5px', borderColor: 'rgba(100,255,100,0.3)' }}>
                            {itemsInKit.length === 0 && <div style={{ padding: '10px', color: '#666', fontSize: '0.8rem' }}>Nenhum item selecionado.</div>}
                            {itemsInKit.map(item => (
                                <div key={item.id} onClick={() => toggleItem(item.id!)} 
                                     style={{ padding: '8px', borderBottom: '1px solid #333', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                     onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,0,0,0.1)'}
                                     onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ fontSize: '0.85rem' }}>{item.name}</span>
                                    <span style={{ color: '#ff6666', fontWeight: 'bold' }}>✕</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary-action" onClick={onClose}>Cancelar</button>
                    <button className="btn-primary-action" onClick={handleSave}>Salvar Kit</button>
                </div>
            </div>
        </div>
    );
};