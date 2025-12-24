import * as THREE from 'three';

export const createD12Data = (radius = 1.5) => {
  const t = (1 + Math.sqrt(5)) / 2; // Golden Ratio (Phi)
  const r = 1 / radius; // Fator de escala inverso

  // --- 1. VÉRTICES (20 Pontos baseados na Proporção Áurea) ---
  // Normalizamos para o raio desejado
  const baseVertices = [
    // (±1, ±1, ±1)
    [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1],
    [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1],
    // (0, ±1/phi, ±phi)
    [0, -1/t, -t], [0, -1/t, t], [0, 1/t, -t], [0, 1/t, t],
    // (±1/phi, ±phi, 0)
    [-1/t, -t, 0], [-1/t, t, 0], [1/t, -t, 0], [1/t, t, 0],
    // (±phi, 0, ±1/phi)
    [-t, 0, -1/t], [t, 0, -1/t], [-t, 0, 1/t], [t, 0, 1/t]
  ].map(v => new THREE.Vector3(v[0], v[1], v[2]).normalize().multiplyScalar(radius));

  const vertices: number[] = [];
  baseVertices.forEach(v => vertices.push(v.x, v.y, v.z));

  // --- 2. FACES DE FÍSICA (12 Pentágonos) ---
  // Índices manuais para formar os pentágonos corretos
  const physicsIndices = [
     [3, 11, 7, 15, 13], // Face 1
     [7, 19, 17, 6, 15], // Face 2
     [17, 4, 8, 10, 6],  // Face 3
     [8, 0, 16, 2, 10],  // Face 4
     [0, 12, 1, 18, 16], // Face 5
     [6, 10, 2, 13, 15], // Face 6
     [2, 16, 18, 3, 13], // Face 7
     [18, 1, 9, 11, 3],  // Face 8
     [4, 14, 12, 0, 8],  // Face 9
     [11, 9, 5, 19, 7],  // Face 10
     [19, 5, 14, 4, 17], // Face 11
     [1, 12, 14, 5, 9]   // Face 12
  ];

  // --- 3. FACES VISUAIS (Triângulos) ---
  // Transformamos cada pentágono em 3 triângulos para a GPU desenhar
  const indices: number[] = [];
  physicsIndices.forEach(face => {
    // Triangulação fã: (0,1,2), (0,2,3), (0,3,4)
    indices.push(face[0], face[1], face[2]);
    indices.push(face[0], face[2], face[3]);
    indices.push(face[0], face[3], face[4]);
  });

  // --- 4. METADADOS (Posição e Rotação dos Adesivos) ---
  const faceData: any[] = [];
  
  physicsIndices.forEach((faceIds, i) => {
    // 1. Centro da face (média dos vértices)
    const center = new THREE.Vector3();
    faceIds.forEach(id => center.add(baseVertices[id]));
    center.divideScalar(5);

    // 2. Normal (Apontando para fora)
    const normal = center.clone().normalize();

    // 3. Rotação (LookAt)
    // Criamos um dummy object para calcular o Quaternion de rotação facilmente
    const dummy = new THREE.Object3D();
    dummy.position.copy(center);
    dummy.lookAt(center.clone().add(normal)); // Olha para fora
    
    // Ajuste fino de rotação do texto se necessário (girar o SVG)
    // D12 as vezes precisa girar o eixo Z para o número ficar "em pé"
    dummy.rotateZ(Math.PI / 1); 

    faceData.push({
      position: [center.x, center.y, center.z],
      rotation: [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z],
      value: i + 1 // Valor de 1 a 12
    });
  });

  // Reordenar para regra de dados (Opostos somam 13) se necessário
  // Por enquanto segue a ordem geométrica (1-12 sequencial)
  
  return {
    vertices: Float32Array.from(vertices),
    indices,
    physicsIndices: physicsIndices.flat(), // Array plano para lógica antiga se precisar
    physicsFaces: physicsIndices, // Array de Arrays para o ConvexPolyhedron novo
    faceData
  };
};