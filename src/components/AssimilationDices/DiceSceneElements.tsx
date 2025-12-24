import { usePlane, useBox } from '@react-three/cannon';

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
    usePlane(() => ({ position: [0, 0, 4], rotation: [0, -Math.PI, 0] })); 
    usePlane(() => ({ position: [-8, 0, 0], rotation: [0, Math.PI / 2, 0] })); 
    usePlane(() => ({ position: [8, 0, 0], rotation: [0, -Math.PI / 2, 0] }));  

    const [backWallRef] = useBox(() => ({
        type: 'Static',
        args: [20, 10, 1],
        position: [0, 5, -8.5], 
    }));

    return (
        <mesh ref={backWallRef as any} visible={false}>
            <boxGeometry args={[20, 10, 1]} />
        </mesh>
    );
}