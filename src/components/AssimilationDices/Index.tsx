import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
// 1. ADICIONE O IMPORT DO Debug AQUI
import { Physics, usePlane, Debug } from '@react-three/cannon';
import { OrbitControls, Environment, Html } from '@react-three/drei';

import PhysicsD6 from './PhysicsD6';
import PhysicsD10 from './PhysicsD10';
import PhysicsD12 from './PhysicsD12';

function Floor() {
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, 0, 0],
    material: { friction: 0.1, restitution: 0.7 } 
  }));
  
  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <shadowMaterial color="#171717" transparent opacity={0.4} />
    </mesh>
  );
}

function Walls() {
  usePlane(() => ({ position: [0, 0, -10], rotation: [0, 0, 0] })); 
  usePlane(() => ({ position: [0, 0, 10], rotation: [0, -Math.PI, 0] })); 
  usePlane(() => ({ position: [-10, 0, 0], rotation: [0, Math.PI / 2, 0] })); 
  usePlane(() => ({ position: [10, 0, 0], rotation: [0, -Math.PI / 2, 0] })); 
  return null;
}

function Loader() {
  return <Html center><div style={{ color: 'white' }}>Carregando Texturas...</div></Html>
}

function AssimilationDiceD10({ children }: { children?: React.ReactNode }) {
  
  const handleStop = (diceType: string, value: number) => {
    console.log(`🎲 ${diceType} parou no: ${value}`);
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px', background: '#111' }}>
      <Canvas shadows camera={{ position: [0, 12, 8], fov: 45 }}>
        
        <ambientLight intensity={0.3} />
        <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
        <Environment preset="city" />
        
        <Physics 
          gravity={[0, -20, 0]}
          iterations={20}
          tolerance={0.001}
          broadphase="Naive"
          defaultContactMaterial={{
            friction: 0.3, 
            restitution: 0.5, 
            contactEquationStiffness: 1e7,
            contactEquationRelaxation: 4,
          }}
        >
          <Suspense fallback={<Loader />}>
            {/* 2. USE O COMPONENTE Debug (Maiúsculo) */}
            {/* color="red" deixa as linhas vermelhas */}
            {/* scale={1.1} faz a linha ser desenhada um pouco maior que o colisor real para você ver melhor */}
            <Debug color="red" scale={1.1}>
                
                <Floor />
                <Walls />
                
                <PhysicsD10 
                    position={[-2, 6, 0]} 
                    onStop={(val) => handleStop('D10', val)} 
                />

                <PhysicsD6 
                    position={[2, 6, 0]} 
                    onStop={(val) => handleStop('D6', val)} 
                />

                <PhysicsD12
                    position={[0, 6, 0]}
                    onStop={(val) => handleStop('D12', val)}
                />

                {children}
            </Debug>
          </Suspense>

        </Physics>
        
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default AssimilationDiceD10;