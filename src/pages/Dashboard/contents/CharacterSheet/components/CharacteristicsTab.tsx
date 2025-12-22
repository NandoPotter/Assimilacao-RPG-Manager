/** ========================================================================================
 * ARQUIVO: src/pages/Dashboard/components/CharacterSheet/components/CharacteristicsTab.tsx
 * DESCRIÇÃO: Aba de Características da Ficha Interativa
 * ========================================================================================= */

import React, { useEffect, useState } from 'react';
import { characterService } from '../../../../../services/characterService';
import PaginatedSection, { type ItemData } from './PaginatedSection';

interface Props {
    ids: number[] | undefined;
}

function CharacteristicsTab({ ids }: Props) {
    const [features, setFeatures] = useState<ItemData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeats = async () => {
            if (!ids || ids.length === 0) {
                setLoading(false);
                return;
            }
            try {
                const data = await characterService.getCharacteristicsByIds(ids);
                setFeatures(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeats();
    }, [ids]);

    if (loading) return <div style={{color:'#666', fontSize:'0.8rem'}}>Carregando...</div>;

    return (
        <PaginatedSection 
            title="Características" 
            items={features}
        />
    );
}

export default CharacteristicsTab;