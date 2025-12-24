import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Physics, usePlane } from '@react-three/cannon';
import { Environment, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import PhysicsD6 from './PhysicsD6';
import PhysicsD10 from './PhysicsD10';
import PhysicsD12 from './PhysicsD12';

// --- AMBIENTE ---
function Scene() {
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, 0, 0],
    material: { friction: 0.3, restitution: 0.1 } 
  }));

  return (
    <group>
      <mesh ref={ref as any} visible={false}><planeGeometry args={[100, 100]} /></mesh>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function InvisibleWalls() {
  usePlane(() => ({ position: [0, 0, -2], rotation: [0, 0, 0] }));       
  usePlane(() => ({ position: [0, 0, 8], rotation: [0, -Math.PI, 0] })); 
  usePlane(() => ({ position: [-8, 0, 0], rotation: [0, Math.PI / 2, 0] }));  
  usePlane(() => ({ position: [8, 0, 0], rotation: [0, -Math.PI / 2, 0] }));  
  return null;
}

// --- COMPONENTE PRINCIPAL ---
function AssimilationDiceD10() {
  const [counts, setCounts] = useState({ D6: 1, D10: 1, D12: 1 });
  const [diceList, setDiceList] = useState<{id: string, type: string, pos: [number, number, number]}[]>([]);
  
  // Referência para os controles da câmera
  const orbitRef = useRef<any>(null);

  // Configuração inicial da câmera
  const initialCamPos = { x: 0, y: 18, z: 12 };
  const initialTarget = { x: 0, y: 0, z: -1 };

  const handleThrow = () => {
    // 1. Resetar Câmera
    if (orbitRef.current) {
        const controls = orbitRef.current;
        // Reseta o alvo para o centro
        controls.target.set(initialTarget.x, initialTarget.y, initialTarget.z);
        // Move a câmera de volta para a posição inclinada original
        controls.object.position.set(initialCamPos.x, initialCamPos.y, initialCamPos.z);
        controls.update();
    }

    // 2. Gerar Dados
    const newDice: any[] = [];
    const getRandomPos = (): [number, number, number] => [
      (Math.random() - 0.5) * 6, // Espalhamento lateral (X)
      2,                         // Nascem mais baixo (Y), já que vão ser lançados
      6 + Math.random() * 2      // Nascem entre Z=6 e Z=8 (perto da câmera)
    ];

    Object.entries(counts).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        newDice.push({ id: `${type}-${Date.now()}-${i}`, type, pos: getRandomPos() });
      }
    });
    setDiceList(newDice);
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0a0a' }}>
      
      {/* UI */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, color: 'white', fontFamily: 'sans-serif' }}>
        {['D6', 'D10', 'D12'].map(t => (
          <div key={t} style={{marginBottom: 10}}>
            <span style={{display: 'inline-block', width: '40px'}}>{t}</span>
            <button onClick={() => setCounts({...counts, [t]: Math.max(0, (counts as any)[t]-1)})}>-</button>
            <span style={{margin: '0 10px'}}>{(counts as any)[t]}</span>
            <button onClick={() => setCounts({...counts, [t]: (counts as any)[t]+1})}>+</button>
          </div>
        ))}
        <button 
            onClick={handleThrow} 
            style={{ 
                padding: '10px 20px', 
                cursor: 'pointer', 
                background: '#00f3ff', 
                color: 'black', 
                border: 'none', 
                borderRadius: '5px', 
                fontWeight: 'bold', 
                marginTop: '10px' 
            }}
        >
            LANÇAR E RESETAR CÂMERA
        </button>
      </div>

      <Canvas 
        shadows 
        camera={{ position: [initialCamPos.x, initialCamPos.y, initialCamPos.z], fov: 45 }}
      >
        <color attach="background" args={['#0a0a0a']} />

        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 20, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} color="#ffffff" />

        <Environment preset="city" />

        {/* Permite mover a câmera livremente */}
        <OrbitControls 
            ref={orbitRef} 
            makeDefault 
            maxPolarAngle={Math.PI / 2.1} // Evita olhar por baixo do chão
            minDistance={5}
            maxDistance={40}
        />

        <Physics 
          gravity={[0, -50, 0]} // Gravidade forte para peso
          iterations={20}       // Mais cálculos por frame = colisões mais precisas
          tolerance={0.001}
          defaultContactMaterial={{
            friction: 0.4,            // Atrito entre dados e entre dado/chão
            restitution: 0.3,         // Elasticidade (quique). 0.3 é um valor "pesado"
            contactEquationStiffness: 1e7,   // Rigidez da colisão (evita que um entre no outro)
            contactEquationRelaxation: 3,    // Estabilidade da colisão
          }}
        >
          <Suspense fallback={null}>
            <Scene />
            <InvisibleWalls />
            
            {diceList.map((die) => {
              const common = { key: die.id, position: die.pos };
              if (die.type === 'D6') return <PhysicsD6 {...common} />;
              if (die.type === 'D10') return <PhysicsD10 {...common} />;
              if (die.type === 'D12') return <PhysicsD12 {...common} />;
              return null;
            })}
          </Suspense>
        </Physics>
      </Canvas>
    </div>
  );
}

export default AssimilationDiceD10;