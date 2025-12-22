/** ========================================================================================
 * ARQUIVO: src/pages/Dashboard/components/CharacterSheet/components/AssimilationsTab.tsx
 * DESCRIÇÃO: Aba de Assimilações da Ficha Interativa
 * ========================================================================================= */

import React from 'react';
import PaginatedSection, { type ItemData } from './PaginatedSection';

interface Props {
    characterId: string; // Futuramente usaremos isso para buscar no banco
}

// Mock de dados para visualizar o layout
const MOCK_ASSIMILATIONS: ItemData[] = [
    { id: 1, name: 'Garras de Sangue', description: 'Garras vermelhas.', type: 'evolutiva' },
    { id: 2, name: 'Pele Camaleão', description: 'Muda de cor.', type: 'adaptativa' },
    { id: 3, name: 'Tumor Ósseo', description: 'Dói mas protege.', type: 'inoportuna' },
    { id: 4, name: 'Mente Colmeia', description: 'Conexão única.', type: 'singular' },
    { id: 5, name: 'Olhos de Águia', description: 'Vê longe.', type: 'evolutiva' }, // Teste paginação
];

function AssimilationsTab({ characterId }: Props) {
    // Futuro: useEffect para buscar no banco
    const items = MOCK_ASSIMILATIONS; // Por enquanto, usa o mock

    return (
        <PaginatedSection 
            title="Assimilações" 
            items={items}  // Roxo/Azul
        />
    );
}

export default AssimilationsTab;