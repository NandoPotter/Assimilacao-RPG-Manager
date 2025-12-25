/** ============================================================
 * ARQUIVO: src/components/AssimilationDices/PhysicsD10.tsx
 * DESCRIÇÃO: Configurações D10 - Com detecção de dado truncado
 * ============================================================ */

import { useConvexPolyhedron } from '@react-three/cannon';
import { Edges, Text, useTexture } from '@react-three/drei';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { createD10Data } from '../../utils/d10Geometry';

import face_1_2 from '../../assets/facesD10/face_1-2.svg'
import face_3_4 from '../../assets/facesD10/face_3-4.svg'
import face_5 from '../../assets/facesD10/face_5.svg'
import face_6 from '../../assets/facesD10/face_6.svg'
import face_7 from '../../assets/facesD10/face_7.svg'
import face_8 from '../../assets/facesD10/face_8.svg'
import face_9 from '../../assets/facesD10/face_9.svg'
import face_10 from '../../assets/facesD10/face_10.svg'

interface Props {
  position?: [number, number, number];
  onStop?: (resultValue: number) => void;
}

const getFacePath = (value: number) => {

  switch (value) {
    case 1: return face_1_2;
    case 2: return face_1_2;
    case 3: return face_3_4;
    case 4: return face_3_4;
    case 5: return face_5;
    case 6: return face_6;
    case 7: return face_7;
    case 8: return face_8;
    case 9: return face_9;
    case 10: return face_10;
    default: return face_1_2;
  }
};

useTexture.preload(face_1_2);

const FaceSticker = ({ value, detectedValue, position, rotation }: any) => {
    const texturePath = getFacePath(value);
    const texture = useTexture(texturePath);
    texture.center.set(0.5, 0.5);
    texture.repeat.set(1, 1);

    const isWinner = detectedValue === value;
    const color = isWinner ? '#39ff14' : '#ffffffff';
    const offsetPosition = new THREE.Vector3(...position).multiplyScalar(0.96);

    return (
        <mesh position={offsetPosition} rotation={rotation}>
            <planeGeometry args={[0.9, 0.9]} />
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

const PhysicsD10: React.FC<Props> = ({ position = [0, 5, 0], onStop }) => {
  const { vertices, indices, physicsIndices, faceData } = useMemo(() => createD10Data(1.5, 1.2), []);

  const geoArgs = useMemo(() => {
    const v: number[][] = [];
    for (let i = 0; i < vertices.length; i += 3) {
      v.push([vertices[i], vertices[i + 1], vertices[i + 2]]);
    }
    const f: number[][] = [];
    for (let i = 0; i < physicsIndices.length; i += 4) {
      f.push([physicsIndices[i], physicsIndices[i + 1], physicsIndices[i + 2], physicsIndices[i + 3]]);
    }
    return [v, f];
  }, [vertices, physicsIndices]);

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
  if (faceRefs.current.length !== 10) faceRefs.current = Array(10).fill(null);
  
  const [detectedValue, setDetectedValue] = useState<number | null>(null);

  // Arremesso Automático
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

  // Detector de Parada com Verificação de Inclinação
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
            
            // Vetor normal da face (Z+ do objeto transformado pela rotação mundial)
            tempNormal.set(0, 0, 1).applyQuaternion(tempQuat);

            // Se Y for baixo, significa que a face está muito inclinada (dado truncado)
            if (tempNormal.y < 0.9) {
              console.log("⚠️ D10 Truncado! Aplicando reroll...");
              api.wakeUp();
              api.applyImpulse([0, 8, 0], [Math.random()*0.1, -1, Math.random()*0.1]);
              return;
            }

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
        side={THREE.FrontSide} 
        flatShading={true}
        transparent={true}
      />
            
      <Edges threshold={30} color="#ffffffff" />

      {faceData.map((face, i) => (
        <React.Fragment key={i}>
            <FaceSticker 
                value={face.value} 
                detectedValue={detectedValue} 
                position={face.position}
                rotation={face.rotation}
            />
            <group 
                position={face.position} 
                rotation={face.rotation}
                ref={(el) => (faceRefs.current[i] = el)}
            >
                <Text visible={false} fontSize={0.5}>
                    {face.value === 10 ? '0' : face.value.toString()}
                </Text>
            </group>
        </React.Fragment>
      ))}
    </mesh>
  );
};

export default PhysicsD10;