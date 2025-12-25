/** ============================================================
 * ARQUIVO: src/components/AssimilationDices/PhysicsD12.tsx
 * DESCRIÇÃO: Configurações D12 - Com detecção de dado truncado
 * ============================================================ */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useConvexPolyhedron } from '@react-three/cannon';
import { Edges, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { createD12Data } from '../../utils/d12Geometry';
import { getResult } from '../../interfaces/DicePoints';

interface Props {
  position?: [number, number, number];
  onStop?: (resultValue: number) => void;
}

const getFacePath = (value: number) => {
  const base = './assets/facesD12'; 
 
  switch (value) {
    case 1: return `${base}/face_1-2.svg`;
    case 2: return `${base}/face_1-2.svg`;
    case 3: return `${base}/face_3-4.svg`;
    case 4: return `${base}/face_3-4.svg`;
    case 5: return `${base}/face_5.svg`;
    case 6: return `${base}/face_6.svg`;
    case 7: return `${base}/face_7.svg`;
    case 8: return `${base}/face_8.svg`;
    case 9: return `${base}/face_9.svg`;
    case 10: return `${base}/face_10.svg`;
    case 11: return `${base}/face_11.svg`;
    case 12: return `${base}/face_12.svg`;
    default: return `${base}/face_1-2.svg`;
  }
};

useTexture.preload(`./assets/facesD12/face_1-2.svg`);

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

    const offsetPosition = new THREE.Vector3(...position).multiplyScalar(0.96);

    return (
        <mesh 
            position={offsetPosition} 
            rotation={rotation}
        >
            <planeGeometry args={[1, 1]} />
            
            <meshStandardMaterial 
                map={texture}
                transparent={true} 
                side={THREE.DoubleSide}
                color={color} 
                emissive={color}
                emissiveIntensity={isWinner ? 4 : 2}
                toneMapped={false}
                roughness={0.1}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={-4}
            />
        </mesh>
    );
};

const PhysicsD12: React.FC<Props> = ({ position = [0, 5, 0], onStop }) => {
  const { vertices, indices, physicsFaces, faceData } = useMemo(() => createD12Data(1.5), []);

  const geoArgs = useMemo(() => {
    const v: number[][] = [];
    for (let i = 0; i < vertices.length; i += 3) {
      v.push([vertices[i], vertices[i + 1], vertices[i + 2]]);
    }
    return [v, physicsFaces];
  }, [vertices, physicsFaces]);

  const [ref, api] = useConvexPolyhedron(() => ({
    mass: 1,
    position,
    args: geoArgs as any,
    material: { friction: 0.1, restitution: 0.5 },
    linearDamping: 0.2, 
    angularDamping: 0.2,
  }));

  const velocity = useRef([0, 0, 0]);
  const isRolling = useRef(true);
  
  const faceRefs = useRef<(THREE.Object3D | null)[]>([]);
  if (faceRefs.current.length !== 12) faceRefs.current = Array(12).fill(null);
  const [detectedValue, setDetectedValue] = useState<number | null>(null);

  // Arremesso Automático ao Montar
  useEffect(() => {
      api.wakeUp();
      
      const impulseForce: [number, number, number] = [
        (Math.random() - 0.5) * 4, // X aleatório
        12 + Math.random() * 5,    // Y (Altura do arco)
        -25 - Math.random() * 10   // Z (A força que joga para o fundo)
      ];
      
      api.applyImpulse(impulseForce, [Math.random(), -1, Math.random()]);
  
      api.applyTorque([
          (Math.random() - 0.5) * 35, 
          (Math.random() - 0.5) * 35, 
          (Math.random() - 0.5) * 35
      ]);
    }, [api]);
  
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  // Detector de Parada com Verificação de Inclinação (Dado Truncado)
  useEffect(() => {
    const tempVec = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();
    const tempNormal = new THREE.Vector3();

    const interval = setInterval(() => {
      if (!isRolling.current) return;
      const v = velocity.current;

      if (Math.abs(v[0]) < 0.05 && Math.abs(v[1]) < 0.05 && Math.abs(v[2]) < 0.05) {
        if (ref.current) {
            let highestY = -Infinity;
            let winnerIndex = -1;

            faceRefs.current.forEach((obj, index) => {
                if (obj) {
                    obj.getWorldPosition(tempVec);
                    if (tempVec.y > highestY) {
                        highestY = tempVec.y;
                        winnerIndex = index;
                    }
                }
            });

            if (winnerIndex !== -1) {
                const winnerObj = faceRefs.current[winnerIndex]!;
                winnerObj.getWorldQuaternion(tempQuat);
                
                // Calcula a normal da face vencedora no espaço do mundo
                tempNormal.set(0, 0, 1).applyQuaternion(tempQuat);

                // Se Y for menor que 0.9, o dado parou "torto"
                if (tempNormal.y < 0.9) {
                    console.log("⚠️ D12 Truncado! Rerolando...");
                    api.wakeUp();
                    api.applyImpulse([0, 7, 0], [Math.random()*0.1, -1, Math.random()*0.1]);
                    return;
                }

                isRolling.current = false; 
                const winnerValue = faceData[winnerIndex].value;
                const rpgResult = getResult(winnerValue);
                console.log(`✅ D12 Estável: ${winnerValue} | Resultado: ${rpgResult.label}`);
                setDetectedValue(winnerValue);
                if (onStop) onStop(winnerValue);
            }
        }
      }
    }, 200); 
    return () => clearInterval(interval);
  }, [faceData, onStop, api]);

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <bufferGeometry onUpdate={(self) => self.computeVertexNormals()}>
        <bufferAttribute attach="attributes-position" count={vertices.length / 3} itemSize={3} array={vertices} args={[vertices, 3]} />
        <bufferAttribute attach="index" count={indices.length} itemSize={1} array={new Uint16Array(indices)} args={[new Uint16Array(indices), 1]} />
      </bufferGeometry>

      <meshPhysicalMaterial 
        color="#1a1a3a"
        transmission={0.95}
        thickness={2}
        roughness={0.1}
        metalness={0}
        ior={1.5}
        clearcoat={1}
        side={THREE.BackSide}
        flatShading={true}
        transparent={true}
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

export default PhysicsD12;