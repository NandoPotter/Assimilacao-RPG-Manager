import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useBox } from '@react-three/cannon'; // <--- USAMOS useBox AGORA
import { Edges, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { createD6Data } from '../../utils/d6Geometry';
import { getResult } from '../../interfaces/DicePoints';

interface Props {
  position?: [number, number, number];
  onStop?: (resultValue: number) => void;
}

const getFacePath = (value: number) => {
  const base = '/assets/facesD6'; // <--- Pasta do D6
  switch (value) {
    case 1: return `${base}/face_1-2.svg`;
    case 2: return `${base}/face_1-2.svg`;
    case 3: return `${base}/face_3-4.svg`;
    case 4: return `${base}/face_3-4.svg`;
    case 5: return `${base}/face_5.svg`;
    case 6: return `${base}/face_6.svg`;
    default: return `${base}/face_1-2.svg`;
  }
};

useTexture.preload('/assets/facesD6/face_1-2.svg');

// --- COMPONENTE DO ADESIVO ---
const FaceSticker = ({ 
    value, 
    detectedValue, 
    position, 
    rotation 
}: { 
    value: number, 
    detectedValue: number | null, 
    position: [number, number, number], 
    rotation: [number, number, number] 
}) => {
    const texturePath = getFacePath(value);
    const texture = useTexture(texturePath);
    
    texture.center.set(0.5, 0.5);
    texture.repeat.set(1, 1);

    const isWinner = detectedValue === value;
    const color = isWinner ? '#39ff14' : '#ffffffff';

    // Flutuação
    const offsetPosition = new THREE.Vector3(...position).multiplyScalar(1.02);

    return (
        <mesh 
            position={offsetPosition} 
            rotation={new THREE.Euler(...rotation)}
        >
            <planeGeometry args={[1.5, 1.5]} /> 
            
            <meshStandardMaterial 
                map={texture}
                transparent={true} 
                side={THREE.FrontSide} 
                color={color} 
                emissive={color}
                emissiveIntensity={isWinner ? 3 : 1}
                toneMapped={false}
                roughness={0.1}
                depthTest={true}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={-4}
            />
        </mesh>
    );
};

const PhysicsD6: React.FC<Props> = ({ position = [0, 5, 0], onStop }) => {
  // Mantemos createD6Data APENAS para saber onde colocar os adesivos (Visual)
  const { vertices, indices, faceData } = useMemo(() => createD6Data(2.0), []);

  // --- FÍSICA: USEBOX (Caixa Perfeita) ---
  // args: [1, 1, 1] corresponde a um cubo de tamanho total 2x2x2
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [2, 2, 2], 
    material: { friction: 0.1, restitution: 0.5 },
    linearDamping: 0.2, 
    angularDamping: 0.2,
  }));

  const velocity = useRef([0, 0, 0]);
  const isRolling = useRef(false);
  const faceRefs = useRef<(THREE.Object3D | null)[]>([]);
  if (faceRefs.current.length !== 6) faceRefs.current = Array(6).fill(null);
  
  const [detectedValue, setDetectedValue] = useState<number | null>(null);

  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  useEffect(() => {
    const tempVec = new THREE.Vector3();
    const interval = setInterval(() => {
      if (!isRolling.current) return;
      const v = velocity.current;
      if (Math.abs(v[0]) < 0.05 && Math.abs(v[1]) < 0.05 && Math.abs(v[2]) < 0.05) {
        
        isRolling.current = false; 
        
        if (ref.current) {
            let highestY = -Infinity;
            let winnerValue = 0;
            faceRefs.current.forEach((obj, index) => {
                if (obj) {
                    obj.getWorldPosition(tempVec);
                    if (tempVec.y > highestY) {
                        highestY = tempVec.y;
                        winnerValue = faceData[index].value;
                    }
                }
            });
            const rpgResult = getResult(winnerValue);
            console.log(`D6 Face: ${winnerValue} | Resultado: ${rpgResult.label}`);
            setDetectedValue(winnerValue);
            if (onStop) onStop(winnerValue);
        }
      }
    }, 200); 
    return () => clearInterval(interval);
  }, [faceData, onStop]);

  const roll = () => {
    setDetectedValue(null); 
    isRolling.current = true;
    if (onStop) onStop(0); 
    api.wakeUp(); 
    const x = position[0];
    const z = position[2];
    api.applyImpulse([-x * 3 + (Math.random()-0.5)*5, 10, -z * 3 + (Math.random()-0.5)*5], [0, -1, 0]);
    api.applyTorque([(Math.random()-0.5)*20, (Math.random()-0.5)*20, (Math.random()-0.5)*20]);
  };

  return (
    <mesh ref={ref as any} onClick={roll} castShadow receiveShadow>
      {/* Geometria Visual */}
      <bufferGeometry onUpdate={(self) => self.computeVertexNormals()}>
        <bufferAttribute attach="attributes-position" count={vertices.length / 3} itemSize={3} array={vertices} args={[vertices, 3]} />
        <bufferAttribute attach="index" count={indices.length} itemSize={1} array={new Uint16Array(indices)} args={[new Uint16Array(indices), 1]} />
      </bufferGeometry>

      {/* Material Pedra Galvanizada Azul */}
      <meshPhysicalMaterial 
                color="#1a1a3a"
                metalness={1.0} 
                roughness={0.3}
          
                clearcoat={1.0} 
                clearcoatRoughness={0.7}
      
                envMapIntensity={1.5}
                side={THREE.DoubleSide}
                flatShading={true}
            />
      
      <Edges threshold={30} color="#ffffffff" />

      {faceData.map((face, i) => (
        <React.Fragment key={i}>
            <FaceSticker 
                value={face.value} 
                detectedValue={detectedValue} 
                position={face.position as [number, number, number]}
                rotation={face.rotation as [number, number, number]}
            />
            <group 
                position={face.position as [number, number, number]} 
                rotation={face.rotation as [number, number, number]}
                ref={(el) => (faceRefs.current[i] = el)}
            >
                <Text visible={false} fontSize={0.5}>{face.value.toString()}</Text>
            </group>
        </React.Fragment>
      ))}

    </mesh>
  );
};

export default PhysicsD6;