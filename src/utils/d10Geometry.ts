import * as THREE from 'three';

export const createD10Data = (radius = 1.3, height = 1.3) => {
  const vertices: number[] = [];
  const indices: number[] = [];        // Para o VISUAL (Triângulos)
  const physicsIndices: number[] = []; // Para a FÍSICA (Quads/Pipas)
  
  const sides = 5; 
  const H = height; 
  const R = radius;
  const magicFactor = Math.pow(Math.tan(18 * (Math.PI / 180)), 2); 
  const Y = H * magicFactor;

  // --- 1. VÉRTICES ---
  const v3Array: THREE.Vector3[] = [];
  v3Array.push(new THREE.Vector3(0, H, 0));  // 0: Top
  v3Array.push(new THREE.Vector3(0, -H, 0)); // 1: Bottom

  const stepAngle = Math.PI / sides;
  
  for (let i = 0; i < sides * 2; i++) {
    const angle = i * stepAngle;
    const isHigh = i % 2 === 0;
    vertices.push(R * Math.cos(angle), isHigh ? Y : -Y, R * Math.sin(angle));
    v3Array.push(new THREE.Vector3(R * Math.cos(angle), isHigh ? Y : -Y, R * Math.sin(angle)));
  }
  
  vertices.unshift(0, -H, 0); vertices.unshift(0, H, 0);

  // Helper para circular o array (ex: índice 11 vira 2, índice 1 vira 10)
  // O offset é 2 porque 0 e 1 são os polos
  const getIdx = (i: number) => 2 + ((i % (sides * 2) + (sides * 2)) % (sides * 2));

  // --- 2. FACES VISUAIS (Triângulos) ---
  for (let i = 0; i < sides * 2; i++) {
    const current = getIdx(i);
    const next = getIdx(i + 1);
    
    if (i % 2 === 0) { // High Point
      indices.push(0, current, next); // Top
      indices.push(1, next, current); // Bottom
    } else { // Low Point
      indices.push(0, current, next); // Top
      indices.push(1, next, current); // Bottom
    }
  }

  // --- 3. FACES DE FÍSICA (QUADS / PIPAS) ---
  // Isso cria uma superfície sólida sem aresta no meio
  for (let i = 0; i < sides * 2; i++) {
      // Faces Superiores são centradas nos pontos Baixos (Ímpares)
      if (i % 2 !== 0) {
          const topNode = 0;
          const leftWing = getIdx(i + 1);
          const centerTip = getIdx(i); // O ponto baixo
          const rightWing = getIdx(i - 1);
          
          // Ordem Anti-Horária (CCW) olhando de fora: Top -> Left -> Center -> Right
          physicsIndices.push(topNode, leftWing, centerTip, rightWing);
      }
      
      // Faces Inferiores são centradas nos pontos Altos (Pares)
      if (i % 2 === 0) {
          const bottomNode = 1;
          const leftWing = getIdx(i - 1);
          const centerTip = getIdx(i); // O ponto alto
          const rightWing = getIdx(i + 1);

          // Ordem CCW olhando de baixo (ou de fora): Bottom -> Left -> Center -> Right
          physicsIndices.push(bottomNode, leftWing, centerTip, rightWing);
      }
  }

  // --- 4. METADADOS DAS FACES (Cálculo de Texto) ---
  const faceData: { position: [number, number, number], rotation: [number, number, number], value: number, isTop: boolean, normal: number[] }[] = [];

  for (let i = 0; i < sides * 2; i++) {
    const isHighPoint = i % 2 === 0;
    let vPole, vTip, vWingL, vWingR, isTopFace = false;

    if (!isHighPoint) { // Baixo -> Face Top
        isTopFace = true;
        vPole = v3Array[0]; 
        vTip = v3Array[getIdx(i)];
        vWingL = v3Array[getIdx(i + 1)]; 
        vWingR = v3Array[getIdx(i - 1)]; 
    } else { // Alto -> Face Bottom
        isTopFace = false;
        vPole = v3Array[1]; 
        vTip = v3Array[getIdx(i)];
        vWingL = v3Array[getIdx(i - 1)]; 
        vWingR = v3Array[getIdx(i + 1)]; 
    }

    const center = new THREE.Vector3().lerpVectors(vTip, vPole, 0.4);
    const yAxis = new THREE.Vector3().subVectors(vPole, center).normalize();
    const xAxis = new THREE.Vector3().subVectors(vWingR, vWingL).normalize();
    const zAxis = new THREE.Vector3().crossVectors(xAxis, yAxis).normalize();
    const textPos = center.clone().add(zAxis.clone().multiplyScalar(0.04));
    
    const matrix = new THREE.Matrix4();
    matrix.makeBasis(xAxis, yAxis, zAxis);
    const rotation = new THREE.Euler();
    rotation.setFromRotationMatrix(matrix);

    let value = i + 1;
    if (!isTopFace) { value = i + 1; if (value === 10) value = 0; } else { value = i + 1; }

    faceData.push({
        position: [textPos.x, textPos.y, textPos.z],
        rotation: [rotation.x, rotation.y, rotation.z],
        value: value === 0 ? 10 : value,
        normal: [zAxis.x, zAxis.y, zAxis.z],
        isTop: isTopFace 
    });
  }

  return { 
      vertices: Float32Array.from(vertices), 
      indices,
      physicsIndices, // <--- EXPORTANDO O NOVO ARRAY
      faceData 
  };
};