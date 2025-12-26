/** =========================================================================
 * ARQUIVO: src/pages/Dashboard/contents/components/DiceMonitor.tsx
 * DESCRIÇÃO: Monitor de Dados - Câmera Wide Ajustada
 * ========================================================================= */

import { Physics } from '@react-three/cannon';
import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useRef, useState } from 'react';

import { InvisibleWalls, Scene } from '../../../../../components/AssimilationDices/DiceSceneElements';
import PhysicsD10 from '../../../../../components/AssimilationDices/PhysicsD10';
import PhysicsD12 from '../../../../../components/AssimilationDices/PhysicsD12';
import PhysicsD6 from '../../../../../components/AssimilationDices/PhysicsD6';

interface Props {
    selectedInstincts: { key: string, value: number }[];
    selectedAptitudes: { key: string, value: number }[];
    isAssimilatedMode: boolean;
}

const DiceMonitor: React.FC<Props> = ({ selectedInstincts, selectedAptitudes, isAssimilatedMode }) => {
    const [diceList, setDiceList] = useState<any[]>([]);
    const orbitRef = useRef<any>(null);

    // ESTADOS
    const [showWarning, setShowWarning] = useState(false);
    const [isIndependentMode, setIsIndependentMode] = useState(false);
    
    // Contadores para o modo independente
    const [manualCounts, setManualCounts] = useState({ d6: 0, d10: 0, d12: 0 });

    const adjustCount = (type: 'd6' | 'd10' | 'd12', delta: number) => {
        setManualCounts(prev => ({
            ...prev,
            [type]: Math.max(0, prev[type] + delta)
        }));
    };

    const handleThrow = () => {
        // Reset da Câmera para a posição Wide Padrão
        if (orbitRef.current) {
            orbitRef.current.target.set(0, 0, 0);
            orbitRef.current.object.position.set(0, 20, 0); // Posição Top-Down ajustada
            orbitRef.current.update();
        }

        const newPool: any[] = [];
        const timestamp = Date.now();

        // --- LÓGICA: MODO INDEPENDENTE ---
        if (isIndependentMode) {
            if (manualCounts.d6 === 0 && manualCounts.d10 === 0 && manualCounts.d12 === 0) {
                setShowWarning(true);
                return;
            }
            for (let i = 0; i < manualCounts.d6; i++) {
                newPool.push({ id: `Manual-D6-${timestamp}-${i}`, type: 'D6', pos: [(Math.random() - 0.5) * 4, 2 + i * 0.5, 6 + Math.random()] });
            }
            for (let i = 0; i < manualCounts.d10; i++) {
                newPool.push({ id: `Manual-D10-${timestamp}-${i}`, type: 'D10', pos: [(Math.random() - 0.5) * 4, 2 + i * 0.5, 6 + Math.random()] });
            }
            for (let i = 0; i < manualCounts.d12; i++) {
                newPool.push({ id: `Manual-D12-${timestamp}-${i}`, type: 'D12', pos: [(Math.random() - 0.5) * 4, 2 + i * 0.5, 6 + Math.random()] });
            }
        } 
        // --- LÓGICA: MODO FICHA ---
        else {
            const instinctCount = selectedInstincts.reduce((acc, curr) => acc + curr.value, 0);
            const aptitudeCount = selectedAptitudes.reduce((acc, curr) => acc + curr.value, 0);

            if (instinctCount === 0 && aptitudeCount === 0) {
                setShowWarning(true);
                return;
            }

            const instinctType = isAssimilatedMode ? 'D12' : 'D6';

            for (let i = 0; i < instinctCount; i++) {
                newPool.push({ id: `${instinctType}-${timestamp}-${i}`, type: instinctType, pos: [(Math.random() - 0.5) * 4, 2 + i * 0.5, 6 + Math.random() * 2] });
            }
            for (let i = 0; i < aptitudeCount; i++) {
                newPool.push({ id: `D10-${timestamp}-${i}`, type: 'D10', pos: [(Math.random() - 0.5) * 4, 2 + i * 0.5, 6 + Math.random() * 2] });
            }
        }
        setDiceList(newPool);
    };

    // Estilo dos botões principais
    const actionButtonStyle: React.CSSProperties = {
        padding: '10px 25px', 
        fontSize: '0.9rem', 
        fontWeight: 'bold',
        letterSpacing: '1px',
        background: 'rgba(0, 0, 0, 0.4)', 
        border: '1px solid var(--cor-tema)',
        color: 'var(--cor-tema)',
        textShadow: '0 0 5px rgba(0,0,0,0.5)',
        boxShadow: '0 0 15px rgba(0,0,0,0.2)',
        borderRadius: '4px',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.2s ease',
        textTransform: 'uppercase',
        minWidth: '150px',
        textAlign: 'center'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>
            
            {/* ÁREA SUPERIOR: CANVAS 3D + HUDs */}
            <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: 0 }}>
                
                {/* SELETOR MANUAL (HUD CENTRALIZADO NA BORDA INFERIOR DO 3D) */}
                {isIndependentMode && (
                    <div style={{ 
                        position: 'absolute', 
                        bottom: 15, 
                        left: '50%',
                        transform: 'translateX(-50%)', 
                        zIndex: 20,
                        display: 'flex', 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        gap: '25px',
                        background: 'rgba(0, 0, 0, 0.7)', 
                        padding: '10px 30px', 
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <CounterControl 
                            label="D6" 
                            value={manualCounts.d6} 
                            onDec={() => adjustCount('d6', -1)} 
                            onInc={() => adjustCount('d6', 1)} 
                        />
                        <div style={{width: 1, height: '40px', background: 'rgba(255,255,255,0.1)'}}></div>
                        <CounterControl 
                            label="D10" 
                            value={manualCounts.d10} 
                            onDec={() => adjustCount('d10', -1)} 
                            onInc={() => adjustCount('d10', 1)} 
                        />
                        <div style={{width: 1, height: '40px', background: 'rgba(255,255,255,0.1)'}}></div>
                        <CounterControl 
                            label="D12" 
                            value={manualCounts.d12} 
                            onDec={() => adjustCount('d12', -1)} 
                            onInc={() => adjustCount('d12', 1)} 
                        />
                    </div>
                )}

                {/* MODAL DE AVISO (SOBRE O CANVAS) */}
                {showWarning && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.85)', zIndex: 50,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <div style={{
                            background: '#1a1a1a', border: '1px solid var(--cor-tema)',
                            padding: '30px', borderRadius: '8px', textAlign: 'center', maxWidth: '80%',
                            boxShadow: '0 0 30px var(--cor-tema-glow)'
                        }}>
                            <h3 style={{ color: 'var(--cor-tema)', margin: '0 0 15px 0', textTransform: 'uppercase' }}>
                                {isIndependentMode ? 'Nenhum Dado Selecionado' : 'Ação Inválida'}
                            </h3>
                            <p style={{ color: '#ccc', marginBottom: '25px', lineHeight: '1.5' }}>
                                {isIndependentMode 
                                    ? "Selecione a quantidade de dados no painel abaixo."
                                    : "Nenhum atributo selecionado na ficha. Selecione Instintos/Aptidões ou use o MODO MANUAL."
                                }
                            </p>
                            <button 
                                onClick={() => setShowWarning(false)}
                                style={{
                                    background: 'transparent', color: 'var(--cor-tema)', border: '1px solid var(--cor-tema)',
                                    padding: '8px 25px', cursor: 'pointer', borderRadius: '4px',
                                    textTransform: 'uppercase', fontWeight: 'bold'
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {/* AJUSTE AQUI: Camera Wide Top-Down */}
                <Canvas shadows camera={{ position: [0, 17, 0], fov: 40, rotation: [-Math.PI / 2, 0, 0] }}>
                    <color attach="background" args={['#0a0a0a']} />
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
                    <Environment preset="city" />
                    <OrbitControls ref={orbitRef} maxPolarAngle={Math.PI / 2.1} />

                    <Physics gravity={[0, -50, 0]} defaultContactMaterial={{ friction: 0.4, restitution: 0.3 }}>
                        <Suspense fallback={null}>
                            <Scene />
                            <InvisibleWalls />
                            {diceList.map((die) => {
                                if (die.type === 'D6') return <PhysicsD6 key={die.id} position={die.pos} />;
                                if (die.type === 'D10') return <PhysicsD10 key={die.id} position={die.pos} />;
                                if (die.type === 'D12') return <PhysicsD12 key={die.id} position={die.pos} />;
                                return null;
                            })}
                        </Suspense>
                    </Physics>
                </Canvas>
            </div>

            {/* ÁREA INFERIOR: BOTÕES (FORA DO CANVAS) */}
            <div style={{ 
                flexShrink: 0,
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                padding: '12px',
                background: 'rgba(0,0,0,0.3)', 
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <button 
                    className="dice-trigger" 
                    onClick={handleThrow}
                    style={actionButtonStyle}
                    onMouseOver={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 15px var(--cor-tema-glow)';
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                    }}
                >
                    LANÇAR DADOS
                </button>

                <button 
                    onClick={() => setIsIndependentMode(!isIndependentMode)}
                    style={actionButtonStyle}
                    onMouseOver={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 15px var(--cor-tema-glow)';
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                    }}
                >
                    {isIndependentMode ? 'VOLTAR' : 'MODO MANUAL'}
                </button>
            </div>

        </div>
    );
};

// --- SUB-COMPONENTE: CONTADOR MANUAL ---
const CounterControl = ({ label, value, onInc, onDec }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: '#888', marginBottom: '2px' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
                onClick={onDec}
                style={{
                    width: '24px', height: '24px', 
                    background: '#222', border: '1px solid #444', 
                    color: 'white', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >-</button>
            
            <span style={{ width: '20px', textAlign: 'center', fontWeight: 'bold', color: 'white' }}>
                {value}
            </span>

            <button 
                onClick={onInc}
                style={{
                    width: '24px', height: '24px', 
                    background: '#222', border: '1px solid #444', 
                    color: 'white', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >+</button>
        </div>
    </div>
);

export default DiceMonitor;