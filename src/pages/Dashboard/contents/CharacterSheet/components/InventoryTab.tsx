/** ========================================================================================
 * ARQUIVO: src/pages/Dashboard/components/CharacterSheet/components/InventoryTab.tsx
 * DESCRIÇÃO: Componente da seção de inventário da ficha de personagem.
 * ========================================================================================= */

import { useEffect, useState } from 'react';
import { characterService } from '../../../../../services/characterService';

export type ItemLocation = 'EQUIPPED' | 'BACKPACK' | 'REFUGE';

export interface InventoryEntry {
    inventory_id: string; 
    location: ItemLocation;
    quantity: number;
    notes?: string;
    is_dropped?: boolean; // Novo campo DB
    is_visible?: boolean; // Novo campo DB

    // Item Join
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
    const [selectedItem, setSelectedItem] = useState<InventoryEntry | null>(null);

    // --- CARREGAR DADOS ---
    useEffect(() => {
        loadInventory();
    }, [characterId]);

    const loadInventory = async () => {
        try {
            const data = await characterService.getCharacterInventory(characterId);
            // Filtra apenas itens visíveis
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

    const translateSlots = (slots: number) => slots === 1 ? '1 Espaço' : `${slots} Espaços`;

    // --- CÁLCULOS ---
    const equippedItems = inventory.filter(i => i.location === 'EQUIPPED');
    
    // Procura mochila equipada que NÃO esteja largada
    const activeBackpack = equippedItems.find(i => i.traits && i.traits.backpack_capacity && !i.is_dropped);
    // Se não tiver mochila ativa, capacidade é 0
    const backpackCapacity = activeBackpack?.traits.backpack_capacity || 0; 
    
    // Verifica se existe ALGUMA mochila equipada que está largada (para bloquear acesso)
    const droppedBackpack = equippedItems.find(i => i.traits && i.traits.backpack_capacity && i.is_dropped);

    const backpackItems = inventory.filter(i => i.location === 'BACKPACK');
    const backpackUsed = backpackItems.reduce((total, item) => total + (item.slots * item.quantity), 0);
    const refugeItems = inventory.filter(i => i.location === 'REFUGE');

    // --- AÇÕES ---

    const updateLocalInventory = (id: string, updates: Partial<InventoryEntry>) => {
        setInventory(prev => prev.map(i => i.inventory_id === id ? { ...i, ...updates } : i));
    };

    // Mover Item (Equipar/Guardar/Refugio)
    const moveItem = async (item: InventoryEntry, target: ItemLocation) => {
        const slotsNeeded = item.slots * item.quantity;

        // Regra Especial: Mochila indo para Mochila
        // Se eu tenho 2 mochilas equipadas, posso guardar uma na outra?
        // Sim, se tiver espaço na mochila ativa.
        
        if (target === 'EQUIPPED' && equippedItems.length >= 4) {
            alert("Slots de equipamento cheios."); return;
        }
        if (target === 'BACKPACK') {
            if (droppedBackpack) {
                alert("Você largou sua mochila! Recupere-a antes de guardar itens."); return;
            }
            if (item.location !== 'BACKPACK' && (backpackUsed + slotsNeeded) > backpackCapacity) {
                alert(`Mochila cheia! Requer: ${slotsNeeded} | Livre: ${backpackCapacity - backpackUsed}`); return;
            }
        }

        updateLocalInventory(item.inventory_id, { location: target });
        
        try {
            await characterService.updateItemLocation(item.inventory_id, target);
        } catch (err) { console.error(err); loadInventory(); }
    };

    // Largar Mochila (Drop)
    const dropBackpack = async (item: InventoryEntry) => {
        if (!confirm("Largar a mochila no chão? Você perderá acesso aos itens nela temporariamente.")) return;
        
        updateLocalInventory(item.inventory_id, { is_dropped: true });
        // Aqui chamaria um método específico no service para setar is_dropped=true
        // Vou simular com updateItemLocation se você tiver criado um update genérico, 
        // ou precisará criar updateItemStatus(id, {is_dropped: true})
        try {
           // Exemplo: await characterService.updateItemStatus(item.inventory_id, { is_dropped: true });
           // Como não criamos esse método ainda, assumindo logica similar:
           await characterService.updateGenericInventory(item.inventory_id, { is_dropped: true });
        } catch(e) { console.error(e); }
    };

    // Recuperar Mochila
    const recoverBackpack = async (item: InventoryEntry) => {
        updateLocalInventory(item.inventory_id, { is_dropped: false });
        try {
           await characterService.updateGenericInventory(item.inventory_id, { is_dropped: false });
        } catch(e) { console.error(e); }
    };

    // Perder Mochila (Lost)
    const loseBackpack = async (backpackItem: InventoryEntry) => {
        if (!confirm("Declarar como PERDIDA? A mochila e TODOS os itens dentro dela sumirão da ficha.")) return;

        // 1. Esconder a mochila
        // 2. Esconder todos os itens que estão 'BACKPACK'
        
        const itemsToLose = backpackItems.map(i => i.inventory_id);
        itemsToLose.push(backpackItem.inventory_id);

        // Atualização Otimista: Remove da lista local
        setInventory(prev => prev.filter(i => !itemsToLose.includes(i.inventory_id)));

        try {
            // Service deve suportar bulk update ou loop
            for (const id of itemsToLose) {
                await characterService.updateGenericInventory(id, { is_visible: false, is_dropped: false });
            }
        } catch(e) { console.error(e); loadInventory(); }
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
                                        <span className="inv-item-name">{item.name}</span>
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
                                        {/* LÓGICA DE BOTÕES DA MOCHILA */}
                                        {isBackpack ? (
                                            isDropped ? (
                                                <>
                                                    <button className="btn-success" onClick={() => recoverBackpack(item)}>Recuperar</button>
                                                    <button className="btn-danger" onClick={() => loseBackpack(item)}>Perdida</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn-danger" onClick={() => dropBackpack(item)} title="Largar para fugir">Largar</button>
                                                    <button onClick={() => moveItem(item, 'REFUGE')}>→ Refúgio</button>
                                                    {/* Se tiver outra mochila equipada ou espaço sobrando, permite guardar */}
                                                    {/* <button onClick={() => moveItem(item, 'BACKPACK')}>↓ Guardar</button> */}
                                                </>
                                            )
                                        ) : (
                                            /* LÓGICA DE ITEM COMUM */
                                            <>
                                                <button onClick={() => moveItem(item, 'BACKPACK')}>↓ Mochila</button>
                                                <button onClick={() => moveItem(item, 'REFUGE')}>→ Refúgio</button>
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
                    {/* Overlay de Bloqueio se Mochila estiver Largada */}
                    {droppedBackpack && (
                        <div className="inv-backpack-overlay">
                            <strong>MOCHILA LARGADA</strong>
                            <p style={{fontSize:'0.8rem', marginTop:'10px'}}>Você largou sua mochila para agir mais rápido. Recupere-a para acessar os itens.</p>
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
                                    
                                    {/* COLUNA 1: INFO */}
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

                                    {/* COLUNA 2: DESCRIÇÃO */}
                                    <div className="inv-col-desc">
                                        {item.description}
                                    </div>

                                    {/* COLUNA 3: AÇÕES (GRID) */}
                                    <div className="inv-col-actions">
                                        <div className="inv-actions-top-row">
                                            <button className="btn-bp-action" title="Detalhes" onClick={() => setSelectedItem(item)}>🔍</button>
                                            <button className="btn-bp-action" title="Equipar Item" onClick={() => moveItem(item, 'EQUIPPED')}>Equipar</button>
                                        </div>
                                        <button className="btn-bp-action btn-bp-refuge" onClick={() => moveItem(item, 'REFUGE')}>Refúgio</button>
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
                                    <button className="btn-ref-action" onClick={() => moveItem(item, 'BACKPACK')}>Pegar</button>
                                    <button className="btn-ref-action" onClick={() => moveItem(item, 'EQUIPPED')}>Usar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* MODAL (Mantido igual) */}
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
                            {/* Traits e Notes aqui... */}
                        </div>
                        <button className="btn-close-modal-wide" style={{marginTop:'20px'}} onClick={() => setSelectedItem(null)}>Fechar</button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default InventoryTab;