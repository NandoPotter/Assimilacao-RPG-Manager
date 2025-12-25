/** ============================================================
 * ARQUIVO: src/components/AssimilationDices/PhysicsD12.tsx
 * DESCRIÇÃO: D12 com Controle Individual de Escala e Assets via Import
 * ============================================================ */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useConvexPolyhedron } from '@react-three/cannon';
import { Edges, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

import { createD12Data } from '../../utils/d12Geometry';

// Importação dos Assets (Caminho atualizado para src/assets)
import face_1_2 from '../../assets/facesD12/face_1-2.svg'
import face_3_4 from '../../assets/facesD12/face_3-4.svg'
import face_5 from '../../assets/facesD12/face_5.svg'
import face_6 from '../../assets/facesD12/face_6.svg'
import face_7 from '../../assets/facesD12/face_7.svg'
import face_8 from '../../assets/facesD12/face_8.svg'
import face_9 from '../../assets/facesD12/face_9.svg'
import face_10 from '../../assets/facesD12/face_10.svg'
import face_11 from '../../assets/facesD12/face_11.svg'
import face_12 from '../../assets/facesD12/face_12.svg'

// 1. MAPA DE CONFIGURAÇÃO INDIVIDUAL DAS FACES DO D12
const FACE_CONFIG: Record<number, { path: string, scale: number }> = {
  1:  { path: face_1_2, scale: 1 },
  2:  { path: face_1_2, scale: 1 },
  3:  { path: face_3_4, scale: 1 },
  4:  { path: face_3_4, scale: 1 },
  5:  { path: face_5,   scale: 1.2 },
  6:  { path: face_6,   scale: 1 },
  7:  { path: face_7,   scale: 1.2 },
  8:  { path: face_8,   scale: 1.2 },
  9:  { path: face_9,   scale: 1.2 },
  10: { path: face_10,  scale: 1.2 },
  11: { path: face_11,  scale: 1.4 },
  12: { path: face_12,  scale: 1.2 },
};

interface Props {
  position?: [number, number, number];
  onStop?: (resultValue: number) => void;
}

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
    const config = FACE_CONFIG[value] || FACE_CONFIG[1];
    const texture = useTexture(config.path);
    
    texture.center.set(0.5, 0.5);
    texture.repeat.set(1, 1);

    const isWinner = detectedValue === value;
    const color = isWinner ? '#39ff14' : '#ffffff';

    // Multiplicador 0.97 para colar bem na face pentagonal
    const offsetPosition = new THREE.Vector3(...position).multiplyScalar(0.97);

    return (
        <mesh position={offsetPosition} rotation={rotation}>
            {/* Usando o scale individual definido no FACE_CONFIG */}
            <planeGeometry args={[config.scale, config.scale]} />
            
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

  useEffect(() => {
      api.wakeUp();
      const impulseForce: [number, number, number] = [
        (Math.random() - 0.5) * 4,
        12 + Math.random() * 5,
        -25 - Math.random() * 10
      ];
      api.applyImpulse(impulseForce, [Math.random(), -1, Math.random()]);
      api.applyTorque([(Math.random()-0.5)*35, (Math.random()-0.5)*35, (Math.random()-0.5)*35]);
    }, [api]);
  
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

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
                tempNormal.set(0, 0, 1).applyQuaternion(tempQuat);

                if (tempNormal.y < 0.9) {
                    api.wakeUp();
                    api.applyImpulse([0, 7, 0], [Math.random()*0.1, -1, Math.random()*0.1]);
                    return;
                }

                isRolling.current = false; 
                const winnerValue = faceData[winnerIndex].value;
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
      
      <Edges threshold={30} color="#ffffff" />

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