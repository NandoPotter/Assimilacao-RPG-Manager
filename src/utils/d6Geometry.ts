import * as THREE from 'three';

export const createD6Data = (size = 2) => {
  // Tamanho do cubo (meio tamanho, raio)
  const h = size * 0.5;

  // --- 1. VÉRTICES (8 pontas do cubo) ---
  const vertices = [
    -h, -h, -h, // 0: Trás Baixo Esq
     h, -h, -h, // 1: Trás Baixo Dir
     h,  h, -h, // 2: Trás Cima Dir
    -h,  h, -h, // 3: Trás Cima Esq
    -h, -h,  h, // 4: Frente Baixo Esq
     h, -h,  h, // 5: Frente Baixo Dir
     h,  h,  h, // 6: Frente Cima Dir
    -h,  h,  h  // 7: Frente Cima Esq
  ];

  // --- 2. ÍNDICES VISUAIS (Triângulos - 12 faces triangulares) ---
  const indices = [
    2, 1, 0, 0, 3, 2, // Trás
    0, 4, 7, 7, 3, 0, // Esquerda
    1, 2, 6, 6, 5, 1, // Direita
    4, 5, 6, 6, 7, 4, // Frente
    3, 7, 6, 6, 2, 3, // Cima
    0, 1, 5, 5, 4, 0  // Baixo
  ];

  // --- 3. ÍNDICES DE FÍSICA (Quads - 6 faces quadradas) ---
  // A ordem deve ser CCW (Anti-horário) olhando de fora
  const physicsIndices = [
    3, 2, 1, 0, // Trás
    4, 5, 6, 7, // Frente
    3, 7, 4, 0, // Esquerda
    1, 2, 6, 5, // Direita
    2, 3, 7, 6, // Cima
    0, 4, 5, 1  // Baixo
  ];

  // --- 4. METADADOS DAS FACES (Posição, Rotação e Valor) ---
  // Padrão de dados: Lados opostos somam 7.
  const faceData = [
    { // Face 1 (Baixo)
      position: [0, -h, 0], 
      rotation: [Math.PI / 2, 0, 0], 
      value: 1 
    },
    { // Face 6 (Cima)
      position: [0, h, 0], 
      rotation: [-Math.PI / 2, 0, 0], 
      value: 6 
    },
    { // Face 2 (Trás)
      position: [0, 0, -h], 
      rotation: [0, Math.PI, 0], 
      value: 2 
    },
    { // Face 5 (Frente)
      position: [0, 0, h], 
      rotation: [0, 0, 0], 
      value: 5 
    },
    { // Face 3 (Esquerda)
      position: [-h, 0, 0], 
      rotation: [0, -Math.PI / 2, 0], 
      value: 3 
    },
    { // Face 4 (Direita)
      position: [h, 0, 0], 
      rotation: [0, Math.PI / 2, 0], 
      value: 4 
    }
  ];

  return { 
      vertices: Float32Array.from(vertices), 
      indices,
      physicsIndices, 
      faceData 
  };
};