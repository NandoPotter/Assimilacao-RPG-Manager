/** ==================================================================
 * ARQUIVO: src/pages/Dashboard/components/CharacterSheet/index.tsx
 * DESCRIÇÃO: Layout Principal da Ficha Interativa
 * =================================================================== */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { characterService } from '../../../../services/characterService';
import { type Character, type CharacterStatus, type Instincts, type Aptitudes } from '../../../../interfaces/Gameplay';
import './styles.css';

// Componentes
import SheetHeader from './components/SheetHeader';
import ControlTrack from './components/ControlTrack'; 
import HealthMonitor from './components/HealthMonitor';
import OriginsTab from './components/OriginsTab';
import AttributesTab from './components/AttributesTab';
import AssimilationsTab from './components/AssimilationsTab';
import CharacteristicsTab from './components/CharacteristicsTab';
import InventoryTab from './components/InventoryTab';
import DiceMonitor from './components/DiceMonitor';

function CharacterSheetBoard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [char, setChar] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Estado que conecta a Seleção de Atributos com a Mesa de Dados
    const [selectedPool, setSelectedPool] = useState({
        instincts: [] as { key: string, value: number }[],
        aptitudes: [] as { key: string, value: number }[],
        isAssimilated: false
    });

    // Carregar Dados
    useEffect(() => {
        if (!id) return;
        const load = async () => {
            try {
                const data = await characterService.getCharacterById(id);
                if (!data) throw new Error("Personagem não encontrado");
                setChar(data);
            } catch (error) {
                console.error(error);
                navigate('/dashboard/infectados');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id, navigate]);

    const handleUpdate = async (updates: Partial<Character>) => {
        if (!char) return;
        setChar(prev => prev ? { ...prev, ...updates } : null);
        try {
            await characterService.updateCharacter(char.id, updates);
        } catch (err) {
            console.error("Erro ao salvar progresso:", err);
        }
    };

    const handleBackgroundSave = async (newBg: any) => {
        if (!char) return;
        setChar(prev => prev ? { ...prev, background: newBg } : null);
        try {
            await characterService.updateCharacter(char.id, { background: newBg });
        } catch (err) {
            console.error("Erro ao salvar origens:", err);
        }
    };

    const handleBackgroundChange = (field: string, value: string) => {
        setChar(prev => {
            if (!prev) return null;
            return {
                ...prev,
                background: { ...prev.background, [field]: value }
            };
        });
    };

    const saveSheet = async () => {
        if (!char) return;
        try {
            await characterService.updateCharacter(char.id, { background: char.background });
        } catch (err) {
            console.error("Erro ao salvar dados de texto:", err);
        }
    };

    const handleImageClick = () => { if (fileInputRef.current) fileInputRef.current.click(); };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && char) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { alert("Imagem muito grande (Max 2MB)"); return; }
            try {
                const publicUrl = await characterService.uploadAvatar(file, char.user_id);
                await handleUpdate({ avatar_url: publicUrl });
            } catch (error) { console.error(error); alert("Falha ao atualizar imagem."); }
        }
    };

    if (isLoading || !char) return <div className="sheet-container">Carregando Ficha...</div>;

    return (
        <div className="sheet-container">
            <SheetHeader 
                name={char.name}
                generation={char.generation}
                occupation={char.background.occupation}
                onBack={() => navigate('/dashboard/infectados')}
            />

            <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*" onChange={handleFileChange} />

            <div className="sheet-scrollable-area">
                <div className="sheet-grid">
                    
                    <main className="sheet-content">

                        {/* SEÇÃO 1: ORIGENS */}
                        <div className="snap-section">
                            <OriginsTab background={char.background} onSave={handleBackgroundSave} />
                        </div>

                        <hr style={{borderColor:'rgba(255,255,255,0.05)', margin:'5px 0 15px 0'}} />

                        {/* SEÇÃO 2: ATRIBUTOS E DADOS INTEGRADOS */}
                        <div className="snap-section">
                            <div className="sheet-content-top">
                                <AttributesTab 
                                    instincts={char.instincts}
                                    aptitudes={char.aptitudes}
                                    currentAssimilation={char.vitals.assimilation.current}
                                    currentDetermination={char.vitals.determination.current}
                                    onSpendAssimilation={() => {
                                        const newVal = Math.max(0, char.vitals.assimilation.current - 1);
                                        handleUpdate({ vitals: { ...char.vitals, assimilation: { ...char.vitals.assimilation, current: newVal } } });
                                    }}
                                    onSpendDetermination={(amount) => {
                                        const newVal = Math.max(0, char.vitals.determination.current - amount);
                                        handleUpdate({ vitals: { ...char.vitals, determination: { ...char.vitals.determination, current: newVal } } });
                                    }}
                                    onUpdate={(updates) => handleUpdate({ instincts: updates.instincts, aptitudes: updates.aptitudes })}
                                    onSelectionChange={(instinctKeys, aptitudeKeys, isBlue) => {
                                        let poolI: { key: string, value: number }[] = [];

                                        // Lógica Especial para Agir por Instinto (Modo Azul)
                                        if (isBlue && instinctKeys.length > 0) {
                                            if (instinctKeys.length === 1) {
                                                // Se selecionou apenas 1, duplica o valor (Instinto x 2)
                                                const val = char.instincts[instinctKeys[0] as keyof Instincts];
                                                poolI = [
                                                    { key: instinctKeys[0], value: val },
                                                    { key: `${instinctKeys[0]}_clone`, value: val }
                                                ];
                                            } else {
                                                // Se selecionou 2 diferentes, pega o valor de cada um
                                                poolI = instinctKeys.map(k => ({ 
                                                    key: k, 
                                                    value: char.instincts[k as keyof Instincts] 
                                                }));
                                            }
                                        } else {
                                            // Modo Normal: Mapeamento simples 1 para 1
                                            poolI = instinctKeys.map(k => ({ 
                                                key: k, 
                                                value: char.instincts[k as keyof Instincts] 
                                            }));
                                        }

                                        const poolA = aptitudeKeys.map(k => ({ 
                                            key: k, 
                                            value: char.aptitudes[k as keyof Aptitudes] 
                                        }));

                                        setSelectedPool({ instincts: poolI, aptitudes: poolA, isAssimilated: isBlue });
                                    }}
                                />
                                
                                {/* MESA DE DADOS 3D (COM TÍTULO) */}
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <span className="section-title">Monitor de Dados</span>
                                    <div className="dice-stage-container">
                                        <DiceMonitor 
                                            selectedInstincts={selectedPool.instincts}
                                            selectedAptitudes={selectedPool.aptitudes}
                                            isAssimilatedMode={selectedPool.isAssimilated}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEÇÃO 3: CARACTERÍSTICAS E ASSIMILAÇÕES */}
                        <div className="snap-section">
                            <hr style={{borderColor:'rgba(255,255,255,0.05)', margin:'5px 0 15px 0'}} />
                            <div className="split-50-50">
                                <CharacteristicsTab 
                                    ids={char.characteristics_ids} 
                                    instincts={char.instincts} 
                                    aptitudes={char.aptitudes}
                                    onUpdate={(newIds) => handleUpdate({ characteristics_ids: newIds })}
                                />
                                <AssimilationsTab characterId={char.id} />
                            </div>
                        </div>
                        
                        {/* SEÇÃO 4: INVENTÁRIO */}
                        <div className="snap-section">
                            <hr style={{borderColor:'rgba(255,255,255,0.05)', margin:'5px 0 5px 0'}} />
                            <InventoryTab characterId={char.id} />
                        </div>

                        {/* SEÇÃO 5: DESCRIÇÃO E ANOTAÇÕES */}
                        <div className="snap-section">
                            <hr style={{borderColor:'rgba(255,255,255,0.05)', margin:'5px 0 15px 0'}} />
                            <div className="split-50-50" style={{alignItems: 'stretch'}}>
                                <div className="desc-box-container" style={{height: '100%', background: 'rgba(0,0,0,0.2)'}}>
                                    <span className="section-title">Descrição Visual</span>
                                    <textarea 
                                        className="desc-textarea"
                                        value={char.background.description || ''}
                                        onChange={(e) => handleBackgroundChange('description', e.target.value)}
                                        onBlur={saveSheet}
                                        placeholder="Aparência física, vestimentas e traços visíveis..."
                                    />
                                </div>
                                <div className="desc-box-container" style={{height: '100%', background: 'rgba(0,0,0,0.2)'}}>
                                    <span className="section-title">Anotações / Diário</span>
                                    <textarea 
                                        className="desc-textarea"
                                        value={char.background.notes || ''}
                                        onChange={(e) => handleBackgroundChange('notes', e.target.value)}
                                        onBlur={saveSheet}
                                        placeholder="Lembretes, pistas, nomes de NPCs ou objetivos..."
                                    />
                                </div>
                            </div>
                        </div>

                    </main>

                    <aside className="sheet-sidebar">
                        <div className="char-avatar-box" onClick={handleImageClick}>
                            {char.avatar_url ? (
                                <img src={char.avatar_url} alt="Avatar" className="char-avatar-img" />
                            ) : (
                                <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', color:'#333'}}>?</div>
                            )}
                            <div className="char-avatar-overlay">Alterar</div>
                        </div>

                        <HealthMonitor 
                            health={char.vitals.health}
                            instincts={char.instincts} 
                            onUpdate={(newHealth) => handleUpdate({ vitals: { ...char.vitals, health: newHealth } })}
                            onStatusChange={(newStatus) => {
                                if (char.status !== newStatus) {
                                    handleUpdate({ status: newStatus as CharacterStatus }); 
                                }
                            }}
                        />

                        <ControlTrack 
                            determination={char.vitals.determination}
                            assimilation={char.vitals.assimilation}
                            onUpdate={(newVitals) => handleUpdate({ vitals: { ...char.vitals, ...newVitals } })}
                        />
                    </aside>

                </div>
            </div>
        </div>
    );
}

export default CharacterSheetBoard;