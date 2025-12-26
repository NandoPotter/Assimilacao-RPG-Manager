/** ========================================================================================
 * ARQUIVO: src/pages/Dashboard/components/CharacterSheet/components/InventoryTab.tsx
 * DESCRIÇÃO: Componente de inventário (Atualizado para usar transferItem)
 * ========================================================================================= */

import { useEffect, useState } from 'react';
import { characterService } from '../../../../../services/characterService';

export type ItemLocation = 'EQUIPPED' | 'BACKPACK' | 'REFUGE';

export interface InventoryEntry {
    inventory_id: string; 
    location: ItemLocation;
    quantity: number;
    notes?: string;
    is_dropped?: boolean;
    is_visible?: boolean;

    item_id: string;
    name: string;
    description: string;
    category: string;
    slots: number; 
    traits: {
        backpack_capacity?: number;
        [key: string]: any;
    };
}

interface Props {
    characterId: string;
}

function InventoryTab({ characterId }: Props) {
    const [inventory, setInventory] = useState<InventoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    
    // --- ESTADOS DE MODAL ---
    const [selectedItem, setSelectedItem] = useState<InventoryEntry | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState<{ msg: string, action: () => void } | null>(null);
    
    const [splitModal, setSplitModal] = useState<{ 
        item: InventoryEntry, 
        target: ItemLocation, 
        max: number 
    } | null>(null);
    const [splitQtyInput, setSplitQtyInput] = useState(1);

    // --- CARREGAR DADOS ---
    useEffect(() => {
        loadInventory();
    }, [characterId]);

    const loadInventory = async () => {
        try {
            const data = await characterService.getCharacterInventory(characterId);
            const visibleData = (data as InventoryEntry[]).filter(i => i.is_visible !== false);
            setInventory(visibleData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- HELPERS ---
    const translateCategory = (cat: string) => {
        const map: Record<string, string> = {
            'WEAPON': 'Arma', 'weapon': 'Arma',
            'EQUIPMENT': 'Equipamento', 'equipment': 'Equipamento',
            'CONSUMABLE': 'Consumível', 'consumable': 'Consumível',
            'MATERIAL': 'Material', 'material': 'Material',
            'MISC': 'Diversos', 'misc': 'Diversos',
            'AMMO': 'Munição', 'ammo': 'Munição'
        };
        return map[cat] || cat;
    };

    const translateTarget = (t: ItemLocation) => {
        if (t === 'BACKPACK') return 'a Mochila';
        if (t === 'EQUIPPED') return 'os Equipados';
        if (t === 'REFUGE') return 'o Refúgio';
        return t;
    };

    const translateSlots = (slots: number) => slots === 1 ? '1 Espaço' : `${slots} Espaços`;

    // --- CÁLCULOS ---
    const equippedItems = inventory.filter(i => i.location === 'EQUIPPED');
    const activeBackpack = equippedItems.find(i => i.traits && i.traits.backpack_capacity && !i.is_dropped);
    const backpackCapacity = activeBackpack?.traits.backpack_capacity || 0; 
    const droppedBackpack = equippedItems.find(i => i.traits && i.traits.backpack_capacity && i.is_dropped);
    const backpackItems = inventory.filter(i => i.location === 'BACKPACK');
    const backpackUsed = backpackItems.reduce((total, item) => total + (item.slots * item.quantity), 0);
    const refugeItems = inventory.filter(i => i.location === 'REFUGE');

    // --- AÇÕES ---

    const updateLocalInventory = (id: string, updates: Partial<InventoryEntry>) => {
        setInventory(prev => prev.map(i => i.inventory_id === id ? { ...i, ...updates } : i));
    };

    // 1. INÍCIO DO PROCESSO DE MOVER (Verificações iniciais)
    const handleMoveRequest = (item: InventoryEntry, target: ItemLocation) => {
        // Bloqueios de Mochila Largada
        if (droppedBackpack) {
            if (target === 'BACKPACK') {
                setWarning("Você largou sua mochila! Recupere-a antes de guardar itens."); 
                return;
            }
            if (item.location === 'BACKPACK') {
                setWarning("Este item está na mochila que você largou no chão!"); 
                return;
            }
        }

        // Se tiver mais de 1, abre o modal de Split. Se não, move direto (1 unidade ou tudo se for 1).
        if (item.quantity > 1) {
            setSplitQtyInput(1); 
            setSplitModal({ item, target, max: item.quantity });
        } else {
            // Move tudo (1 unidade)
            executeTransfer(item, target, 1);
        }
    };

    // 2. EXECUTAR TRANSFERÊNCIA (Move, Divide ou Empilha)
    const executeTransfer = async (item: InventoryEntry, target: ItemLocation, qty: number) => {
        const slotsNeeded = item.slots * qty;

        // Validações de Capacidade (Front-end)
        if (target === 'EQUIPPED') {
            const isStackable = equippedItems.some(i => i.item_id === item.item_id);
            if (equippedItems.length >= 4 && !isStackable) {
                setWarning("Slots de equipamento cheios (Máx 4)."); return;
            }
        }
        
        if (target === 'BACKPACK') {
            if (item.location !== 'BACKPACK') {
                if ((backpackUsed + slotsNeeded) > backpackCapacity) {
                    setWarning(`Mochila cheia! Requer: ${slotsNeeded} | Livre: ${backpackCapacity - backpackUsed}`); return;
                }
            }
        }

        // Chamada ao serviço inteligente (Nova função)
        try {
            await characterService.transferItem(item.inventory_id, qty, target);
            loadInventory(); // Recarrega para refletir empilhamento/divisão corretamente
        } catch (err: any) {
            console.error(err);
            setWarning("Erro ao mover item: " + (err.message || "Erro desconhecido"));
        }
    };

    // Largar Mochila
    const dropBackpack = (item: InventoryEntry) => {
        setConfirmation({
            msg: "Largar a mochila no chão? Você perderá acesso aos itens nela temporariamente.",
            action: async () => {
                updateLocalInventory(item.inventory_id, { is_dropped: true });
                try {
                    if (characterService.updateGenericInventory) {
                        await characterService.updateGenericInventory(item.inventory_id, { is_dropped: true });
                    }
                } catch(e) { console.error(e); }
            }
        });
    };

    // Recuperar Mochila
    const recoverBackpack = async (item: InventoryEntry) => {
        updateLocalInventory(item.inventory_id, { is_dropped: false });
        try {
           if (characterService.updateGenericInventory) {
               await characterService.updateGenericInventory(item.inventory_id, { is_dropped: false });
           }
        } catch(e) { console.error(e); }
    };

    // Perder Mochila
    const loseBackpack = (backpackItem: InventoryEntry) => {
        setConfirmation({
            msg: "Declarar como PERDIDA? A mochila e TODOS os itens dentro dela sumirão da ficha para sempre.",
            action: async () => {
                const itemsToLose = backpackItems.map(i => i.inventory_id);
                itemsToLose.push(backpackItem.inventory_id);
                setInventory(prev => prev.filter(i => !itemsToLose.includes(i.inventory_id)));
                try {
                    if (characterService.updateGenericInventory) {
                        for (const id of itemsToLose) {
                            await characterService.updateGenericInventory(id, { is_visible: false, is_dropped: false });
                        }
                    }
                } catch(e) { console.error(e); loadInventory(); }
            }
        });
    };

    if (loading) return <div style={{padding:'20px', color:'#888'}}>Carregando...</div>;

    return (
        <div className="inv-container">
            
            {/* --- 1. EQUIPADOS --- */}
            <div className="inv-section-header">
                <span className="group-title">Equipados</span>
                <span className="inv-capacity-indicator">{equippedItems.length} / 4</span>
            </div>
            
            <div className="inv-equipped-grid">
                {Array.from({ length: 4 }).map((_, index) => {
                    const item = equippedItems[index];
                    const isBackpack = item && item.traits.backpack_capacity;
                    const isDropped = item?.is_dropped;

                    return (
                        <div key={index} className={`inv-slot-card ${!item ? 'empty' : ''} ${isDropped ? 'dropped' : ''}`}>
                            {item ? (
                                <>
                                    <div className="inv-slot-top">
                                        <span className="inv-item-name">
                                            {item.name}
                                            {item.quantity > 1 && <span style={{color:'var(--cor-tema)', marginLeft:'4px'}}>x{item.quantity}</span>}
                                        </span>
                                        <button className="btn-inspect-icon" onClick={() => setSelectedItem(item)}>🔍</button>
                                    </div>
                                    <span className="inv-item-type">{translateCategory(item.category)}</span>
                                    
                                    {isBackpack && (
                                        <span style={{fontSize:'0.6rem', color: isDropped ? '#ff5555' : '#4caf50', margin:'2px 0'}}>
                                            {isDropped ? 'LARGADA NO CHÃO' : `+ ${item.traits.backpack_capacity} Espaços`}
                                        </span>
                                    )}
                                    
                                    <p className="inv-item-desc">{item.description}</p>

                                    <div className="inv-actions">
                                        {isBackpack ? (
                                            isDropped ? (
                                                <>
                                                    <button className="btn-success" onClick={() => recoverBackpack(item)}>Recuperar</button>
                                                    <button className="btn-danger" onClick={() => loseBackpack(item)}>Perdida</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn-danger" onClick={() => dropBackpack(item)} title="Largar para fugir">Largar</button>
                                                    <button onClick={() => handleMoveRequest(item, 'REFUGE')}>→ Refúgio</button>
                                                </>
                                            )
                                        ) : (
                                            <>
                                                <button onClick={() => handleMoveRequest(item, 'BACKPACK')}>↓ Mochila</button>
                                                <button onClick={() => handleMoveRequest(item, 'REFUGE')}>→ Refúgio</button>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <span className="inv-empty-text">Vazio</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- 2. DIVISÃO MOCHILA / REFÚGIO --- */}
            <div className="inv-split-area">
                
                {/* MOCHILA */}
                <div className="inv-column backpack-col">
                    {droppedBackpack && (
                        <div className="inv-backpack-overlay" style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.85)', zIndex: 10, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px'
                        }}>
                            <strong style={{color:'#ff5555', fontSize:'1.2rem'}}>MOCHILA LARGADA</strong>
                            <p style={{fontSize:'0.8rem', marginTop:'10px', color:'#ccc'}}>
                                Você largou sua mochila. <br/>
                                <strong>Recupere-a</strong> na área de equipamentos para acessar.
                            </p>
                        </div>
                    )}

                    <div className="inv-section-header">
                        <span className="group-title">Mochila</span>
                        <span className={`inv-capacity-indicator ${backpackUsed > backpackCapacity ? 'overload' : ''}`}>
                            {backpackUsed} / {backpackCapacity} Espaços
                        </span>
                    </div>

                    <div className="inv-list-scroll">
                        {backpackItems.length === 0 && <div className="inv-empty-state">Vazia ({backpackCapacity} slots).</div>}
                        
                        {backpackItems.map(item => {
                            const totalSlots = item.slots * item.quantity;
                            return (
                                <div key={item.inventory_id} className="inv-backpack-card">
                                    <div className="inv-col-info">
                                        <span className="inv-item-name">
                                            {item.name} 
                                            {item.quantity > 1 && <span className="inv-qty">x{item.quantity}</span>}
                                        </span>
                                        <span className="inv-item-cat-small">{translateCategory(item.category)}</span>
                                        <span className="inv-slots-badge" style={{marginTop:'auto'}}>
                                            {translateSlots(totalSlots)}
                                        </span>
                                    </div>
                                    <div className="inv-col-desc">{item.description}</div>
                                    <div className="inv-col-actions">
                                        <div className="inv-actions-top-row">
                                            <button className="btn-bp-action" title="Detalhes" onClick={() => setSelectedItem(item)}>🔍</button>
                                            <button className="btn-bp-action" title="Equipar Item" onClick={() => handleMoveRequest(item, 'EQUIPPED')}>Equipar</button>
                                        </div>
                                        <button className="btn-bp-action btn-bp-refuge" onClick={() => handleMoveRequest(item, 'REFUGE')}>Refúgio</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* REFÚGIO */}
                <div className="inv-column refuge-col">
                    <div className="inv-section-header">
                        <span className="group-title">Refúgio</span>
                        <span className="inv-capacity-indicator">∞</span>
                    </div>

                    <div className="inv-list-scroll">
                        {refugeItems.length === 0 && <div className="inv-empty-state">Nada no refúgio.</div>}
                        
                        {refugeItems.map(item => (
                            <div key={item.inventory_id} className="inv-refuge-item">
                                <div className="inv-refuge-info">
                                    <span className="inv-refuge-name">{item.name}</span>
                                    <span className="inv-qty-badge">{item.quantity}</span>
                                </div>
                                <div className="inv-refuge-actions">
                                    <button className="btn-ref-action" onClick={() => setSelectedItem(item)}>🔍</button>
                                    <button className="btn-ref-action" onClick={() => handleMoveRequest(item, 'BACKPACK')}>Pegar</button>
                                    <button className="btn-ref-action" onClick={() => handleMoveRequest(item, 'EQUIPPED')}>Usar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ================= MODAIS DE SISTEMA ================= */}

            {/* 1. MODAL DE AVISO (WARNING) */}
            {warning && (
                <div className="detail-overlay-backdrop" style={{zIndex: 9999}} onClick={() => setWarning(null)}>
                    <div className="dramatic-box error-mode" onClick={(e) => e.stopPropagation()}>
                        <span className="dramatic-title error">Atenção</span>
                        <p className="dramatic-text">{warning}</p>
                        <button className="btn-dramatic-cancel" onClick={() => setWarning(null)} style={{width:'100%', border:'1px solid #ff5555', padding:'10px', color:'#fff', background:'rgba(255,0,0,0.1)'}}>
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {/* 2. MODAL DE CONFIRMAÇÃO */}
            {confirmation && (
                <div className="detail-overlay-backdrop" style={{zIndex: 9999}}>
                    <div className="dramatic-box" onClick={(e) => e.stopPropagation()}>
                        <span className="dramatic-title">Confirmação</span>
                        <p className="dramatic-text">{confirmation.msg}</p>
                        <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                            <button className="btn-choice" style={{flex:1, justifyContent:'center'}} onClick={() => setConfirmation(null)}>
                                Cancelar
                            </button>
                            <button className="btn-choice cost-determination" style={{flex:1, justifyContent:'center'}} onClick={() => {
                                confirmation.action();
                                setConfirmation(null);
                            }}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. MODAL DE QUANTIDADE (SPLIT) */}
            {splitModal && (
                <div className="detail-overlay-backdrop" style={{zIndex: 9999}} onClick={() => setSplitModal(null)}>
                    <div className="detail-card-expanded" style={{width:'300px', minHeight:'auto'}} onClick={(e) => e.stopPropagation()}>
                        <div className="expanded-header-area">
                            <span className="expanded-title" style={{color:'#fff', fontSize:'1.2rem'}}>Mover Item</span>
                            <span className="expanded-type">{splitModal.item.name}</span>
                        </div>
                        
                        <div style={{display:'flex', flexDirection:'column', gap:'15px', alignItems:'center'}}>
                            <p style={{color:'#ccc', fontSize:'0.9rem', textAlign:'center'}}>
                                Quantas unidades deseja mover para <strong>{translateTarget(splitModal.target)}</strong>?
                            </p>
                            
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <button className="btn-attr-tiny" style={{width:'30px', height:'30px', fontSize:'1.2rem'}} onClick={() => setSplitQtyInput(Math.max(1, splitQtyInput - 1))}>-</button>
                                <input 
                                    type="number" 
                                    className="input-dark-sheet" 
                                    style={{width:'60px', textAlign:'center', fontSize:'1.2rem', fontWeight:'bold'}}
                                    value={splitQtyInput}
                                    onChange={(e) => setSplitQtyInput(Math.min(splitModal.max, Math.max(1, parseInt(e.target.value) || 1)))}
                                />
                                <button className="btn-attr-tiny" style={{width:'30px', height:'30px', fontSize:'1.2rem'}} onClick={() => setSplitQtyInput(Math.min(splitModal.max, splitQtyInput + 1))}>+</button>
                            </div>
                            
                            <span style={{fontSize:'0.7rem', color:'#666'}}>Máximo disponível: {splitModal.max}</span>

                            <div style={{display:'flex', gap:'10px', width:'100%', marginTop:'10px'}}>
                                <button className="btn-close-modal-wide" style={{background:'#333', boxShadow:'none'}} onClick={() => setSplitModal(null)}>Cancelar</button>
                                <button className="btn-close-modal-wide" style={{background:'var(--cor-tema)', color:'#000'}} onClick={() => {
                                    // CHAMA A NOVA FUNÇÃO ÚNICA: TRANSFER
                                    executeTransfer(splitModal.item, splitModal.target, splitQtyInput);
                                    setSplitModal(null);
                                }}>
                                    Mover
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. MODAL DETALHES (Mantido) */}
            {selectedItem && (
                <div className="detail-overlay-backdrop" onClick={() => setSelectedItem(null)}>
                    <div className="detail-card-expanded" onClick={(e) => e.stopPropagation()}>
                        <div className="expanded-header-area">
                            <span className="expanded-title" style={{color:'#fff'}}>{selectedItem.name}</span>
                            <span className="expanded-type">{translateCategory(selectedItem.category)}</span>
                        </div>
                        <div style={{flex:1, overflowY:'auto'}}>
                            <p className="expanded-desc">{selectedItem.description}</p>
                            <div style={{marginTop:'15px', display:'flex', gap:'10px', flexWrap:'wrap'}}>
                                <span className="inv-slots-badge" style={{fontSize:'0.8rem'}}>Ocupa: {translateSlots(selectedItem.slots)}</span>
                                {selectedItem.quantity > 1 && (
                                    <span className="inv-slots-badge" style={{fontSize:'0.8rem', borderColor:'var(--cor-tema)', color:'var(--cor-tema)'}}>Qtd: {selectedItem.quantity}</span>
                                )}
                            </div>
                        </div>
                        <button className="btn-close-modal-wide" style={{marginTop:'20px'}} onClick={() => setSelectedItem(null)}>Fechar</button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default InventoryTab;