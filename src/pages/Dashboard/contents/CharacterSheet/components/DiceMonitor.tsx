import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Environment, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

import PhysicsD6 from '../../../../../components/AssimilationDices/PhysicsD6';
import PhysicsD10 from '../../../../../components/AssimilationDices/PhysicsD10';
import PhysicsD12 from '../../../../../components/AssimilationDices/PhysicsD12';
import { Scene, InvisibleWalls } from '../../../../../components/AssimilationDices/DiceSceneElements';

// Props para receber o que está selecionado na AttributesTab
interface Props {
    selectedInstincts: { key: string, value: number }[];
    selectedAptitudes: { key: string, value: number }[];
    isAssimilatedMode: boolean;
}

const DiceMonitor: React.FC<Props> = ({ selectedInstincts, selectedAptitudes, isAssimilatedMode }) => {
    const [diceList, setDiceList] = useState<any[]>([]);
    const orbitRef = useRef<any>(null);

    const handleThrow = () => {
        if (orbitRef.current) {
            orbitRef.current.target.set(0, 0, -2);
            orbitRef.current.object.position.set(0, 18, 12);
            orbitRef.current.update();
        }

        const newPool: any[] = [];
        const timestamp = Date.now();

        // 1. Calcula D6 ou D12 (Instintos)
        const instinctCount = selectedInstincts.reduce((acc, curr) => acc + curr.value, 0);
        const instinctType = isAssimilatedMode ? 'D12' : 'D6';

        for (let i = 0; i < instinctCount; i++) {
            newPool.push({
                id: `${instinctType}-${timestamp}-${i}`,
                type: instinctType,
                pos: [(Math.random() - 0.5) * 4, 2, 6 + Math.random() * 2]
            });
        }

        // 2. Calcula D10 (Aptidões)
        const aptitudeCount = selectedAptitudes.reduce((acc, curr) => acc + curr.value, 0);
        for (let i = 0; i < aptitudeCount; i++) {
            newPool.push({
                id: `D10-${timestamp}-${i}`,
                type: 'D10',
                pos: [(Math.random() - 0.5) * 4, 2, 6 + Math.random() * 2]
            });
        }

        if (newPool.length > 0) setDiceList(newPool);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* UI DE LANÇAMENTO */}
            <div style={{ position: 'absolute', bottom: 15, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                <button 
                    className="dice-trigger" 
                    onClick={handleThrow}
                    style={{ 
                        padding: '10px 30px', 
                        fontSize: '0.9rem', 
                        background: isAssimilatedMode ? 'rgba(0, 100, 255, 0.4)' : 'rgba(0, 243, 255, 0.2)',
                        borderColor: isAssimilatedMode ? '#0064ff' : '#00f3ff',
                        color: '#fff',
                        textShadow: '0 0 5px #000'
                    }}
                >
                    {isAssimilatedMode ? 'LANÇAR INSTINTO' : 'LANÇAR DADOS'}
                </button>
            </div>

            <Canvas shadows camera={{ position: [0, 18, 12], fov: 45 }}>
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
    );
};

export default DiceMonitor;