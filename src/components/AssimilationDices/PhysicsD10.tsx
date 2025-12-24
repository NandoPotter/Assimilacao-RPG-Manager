import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useConvexPolyhedron } from '@react-three/cannon';
import { Edges, Text, useTexture } from '@react-three/drei'; // Removido Decal
import * as THREE from 'three';
import { createD10Data } from '../../utils/d10Geometry';
import { getResult } from '../../interfaces/DicePoints';

interface Props {
  position?: [number, number, number];
  onStop?: (resultValue: number) => void;
}

const getFacePath = (value: number) => {
  const base = '/assets/facesD10'; 
  switch (value) {
    case 1: return `${base}/face_1-2.svg`; // Ajuste conforme seus arquivos reais
    case 2: return `${base}/face_1-2.svg`;
    case 3: return `${base}/face_3-4.svg`;
    case 4: return `${base}/face_3-4.svg`;
    case 5: return `${base}/face_5.svg`;
    case 6: return `${base}/face_6.svg`;
    case 7: return `${base}/face_7.svg`;
    case 8: return `${base}/face_8.svg`;
    case 9: return `${base}/face_9.svg`;
    case 10: return `${base}/face_10.svg`;
    default: return `${base}/face_1-2.svg`;
  }
};

// Pré-load básico
useTexture.preload('/assets/facesD10/face_1-2.svg');

// --- COMPONENTE DO ADESIVO (AGORA É UM PLANO FÍSICO) ---
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
    
    // Configura a textura para não repetir e centralizar
    texture.center.set(0.5, 0.5);
    texture.repeat.set(1, 1); // Garante que é 1x1

    const isWinner = detectedValue === value;
    const color = isWinner ? '#39ff14' : '#ffffffff';

    // CÁLCULO DE POSIÇÃO DE FLUTUAÇÃO
    // Pegamos a posição da face e afastamos um pouquinho do centro (ex: 2%)
    // Isso garante que o plano fique "flutuando" acima do plástico preto
    const offsetPosition = new THREE.Vector3(...position).multiplyScalar(1.0);

    return (
        <mesh 
            position={offsetPosition} 
            rotation={rotation}
        >
            {/* Geometria Plana (Quadrado) */}
            <planeGeometry args={[0.9, 0.9]} /> {/* Ajuste o tamanho da imagem aqui */}
            
            <meshStandardMaterial 
                map={texture}
                transparent={true} // Permite o fundo transparente do SVG
                
                // MÁGICA PARA NÃO VER O VERSO:
                side={THREE.FrontSide} // Só desenha a frente. Se olhar por trás, fica invisível.
                
                // GLOW
                color={color} 
                emissive={color}
                emissiveIntensity={isWinner ? 3 : 1}
                toneMapped={false}
                roughness={0.1}
                
                // Prioridade de Renderização (Evita piscar com o preto)
                depthTest={true}
                depthWrite={false} // Não escreve na profundidade, evita "recortar" o dado
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
  const isRolling = useRef(false);
  const faceRefs = useRef<(THREE.Object3D | null)[]>([]);
  if (faceRefs.current.length !== 10) faceRefs.current = Array(10).fill(null);
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
            console.log(`Face: ${winnerValue} | Resultado: ${rpgResult.label}`);
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
      {/* CORREÇÃO DO DADO PRETO: Forçamos DoubleSide para garantir que ele pareça sólido */}
      <bufferGeometry onUpdate={(self) => self.computeVertexNormals()}>
        <bufferAttribute attach="attributes-position" count={vertices.length / 3} itemSize={3} array={vertices} args={[vertices, 3]} />
        <bufferAttribute attach="index" count={indices.length} itemSize={1} array={new Uint16Array(indices)} args={[new Uint16Array(indices), 1]} />
      </bufferGeometry>

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
            
            {/* ADESIVO (Plano Flutuante) */}
            <FaceSticker 
                value={face.value} 
                detectedValue={detectedValue} 
                position={face.position}
                rotation={face.rotation}
            />

            {/* Grupo Lógico (Sensor de Altura) */}
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