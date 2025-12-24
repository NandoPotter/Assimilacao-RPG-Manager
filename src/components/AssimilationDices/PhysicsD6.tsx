/** ============================================================
 * ARQUIVO: src/components/AssimilationDices/PhysicsD6.tsx
 * DESCRIÇÃO: Configurações D6 - Com detecção de dado truncado
 * ============================================================ */

import { useBox } from '@react-three/cannon';
import { Edges, Text, useTexture } from '@react-three/drei';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { createD6Data } from '../../utils/d6Geometry';

interface Props {
  position?: [number, number, number];
  onStop?: (resultValue: number) => void;
  // moveTo removido conforme solicitado
}

// ... (Função getFacePath e FaceSticker permanecem iguais ao seu código) ...
const getFacePath = (value: number) => {
  const base = '/assets/facesD6'; 
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

const FaceSticker = ({ value, detectedValue, position, rotation }: any) => {
    const texturePath = getFacePath(value);
    const texture = useTexture(texturePath);
    texture.center.set(0.5, 0.5);
    texture.repeat.set(1, 1); 
    const isWinner = detectedValue === value;
    const color = isWinner ? '#39ff14' : '#ffffffff';
    const offsetPosition = new THREE.Vector3(...position).multiplyScalar(0.98);

    return (
        <mesh position={offsetPosition} rotation={rotation}>
            <planeGeometry args={[1, 1]} /> 
            <meshStandardMaterial 
                map={texture}
                transparent={true}
                side={THREE.DoubleSide}
                color={color} 
                emissive={color}
                emissiveIntensity={isWinner ? 4 : 2} // Intensidade aumentada no brilho
                toneMapped={false}
                roughness={0.1}
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetFactor={-4}
            />
        </mesh>
    );
};

const PhysicsD6: React.FC<Props> = ({ position = [0, 5, 0], onStop }) => {
  const { vertices, indices, faceData } = useMemo(() => createD6Data(2.0), []);

  const [ref, api] = useBox(() => ({
    mass: 1.5,
    position,
    args: [2, 2, 2], 
    material: { friction: 0.1, restitution: 0.5 },
    linearDamping: 0.2, 
    angularDamping: 0.2,
  }));

  const velocity = useRef([0, 0, 0]);
  const isRolling = useRef(true);
  const faceRefs = useRef<(THREE.Object3D | null)[]>([]);
  if (faceRefs.current.length !== 6) faceRefs.current = Array(6).fill(null);
  
  const [detectedValue, setDetectedValue] = useState<number | null>(null);

  // 1. Efeito de Arremesso Automático
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

  // 2. LOGICA DE DETECÇÃO COM VERIFICAÇÃO DE DADO TRUNCADO
  useEffect(() => {
    const tempVec = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();
    const tempNormal = new THREE.Vector3();

    const interval = setInterval(() => {
      if (!isRolling.current) return;
      const v = velocity.current;

      // Se o dado estiver quase parado (velocidade baixa)
      if (Math.abs(v[0]) < 0.05 && Math.abs(v[1]) < 0.05 && Math.abs(v[2]) < 0.05) {
        if (ref.current) {
          let highestY = -Infinity;
          let winnerIndex = -1;

          // Acha qual face está mais alta no mundo
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
            
            // Pega a rotação da face vencedora e calcula o vetor normal dela
            winnerObj.getWorldQuaternion(tempQuat);
            tempNormal.set(0, 0, 1).applyQuaternion(tempQuat);

            // VERIFICAÇÃO DE INCLINAÇÃO (NormalY < 0.9 significa dado "de lado")
            if (tempNormal.y < 0.9) {
              console.log("🎲 Dado Truncado detectado! Dando um pulo...");
              api.wakeUp();
              // Aplica um pequeno pulo para forçar o dado a cair certo
              api.applyImpulse([0, 6, 0], [Math.random()*0.1, -1, Math.random()*0.1]);
              return; // Continua o loop sem setar resultado
            }

            // Se chegou aqui, o dado está plano
            isRolling.current = false;
            const val = faceData[winnerIndex].value;
            setDetectedValue(val);
            if (onStop) onStop(val);
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

export default PhysicsD6;