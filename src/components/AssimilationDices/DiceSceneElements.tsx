/** =========================================================================
 * ARQUIVO: src/components/AssimilationDices/DiceSceneElements.tsx
 * DESCRIÇÃO: Elementos de cena (COLISORES)
 * ========================================================================= */

import { usePlane } from '@react-three/cannon';

export function Scene() {
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

export function InvisibleWalls() {
    // === AJUSTE DE DIMENSÕES (Para Câmera Y=20 / FOV=40) ===
    // Expandido para preencher a tela widescreen (16:9) nessa altura.
    // Largura (X): +/- 11 (Total 22)
    // Altura (Z): +/- 6 (Total 12)

    // Fundo (Z negativo)
    usePlane(() => ({ position: [0, 0, -6], rotation: [0, 0, 0] })); 
    
    // Frente (Z positivo)
    usePlane(() => ({ position: [0, 0, 6], rotation: [0, -Math.PI, 0] })); 
    
    // Esquerda (X negativo)
    usePlane(() => ({ position: [-11, 0, 0], rotation: [0, Math.PI / 2, 0] })); 
    
    // Direita (X positivo)
    usePlane(() => ({ position: [11, 0, 0], rotation: [0, -Math.PI / 2, 0] }));  

    return null;
}