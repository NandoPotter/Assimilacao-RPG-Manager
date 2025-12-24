/** ===============================================================================
 * ARQUIVO: src/pages/Dashboard/components/CharacterSheet/contents/OriginsTab.tsx
 * DESCRIÇÃO: Aba de Origens da Ficha Interativa
 * ================================================================================ */

import { useEffect, useState } from 'react';
import { type BackgroundData } from '../../../../../interfaces/Gameplay';

interface Props {
    background: BackgroundData;
    onSave: (newBg: BackgroundData) => void;
}

function OriginsTab({ background, onSave }: Props) {
    const [formData, setFormData] = useState<BackgroundData>(background);

    useEffect(() => {
        setFormData(background);
    }, [background]);

    const handleChange = (field: string, value: string, nestedField?: string) => {
        if (nestedField) {
            setFormData(prev => ({
                ...prev,
                purposes: { ...prev.purposes, [nestedField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleBlur = () => {
        onSave(formData);
    };

    return (
        // Alterado: Padding reduzido (10px) e MarginBottom reduzido (10px) para colar na seção de baixo
        <div className="attr-group-container" style={{marginBottom:'10px', padding:'10px'}}>
            <div className="group-title">Origens</div>
            
            {/* LINHA 1: Ocupação e Evento - Gap reduzido */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px'}}>
                <div>
                    <label className="input-label">Ocupação</label>
                    <input 
                        className="input-dark-sheet"
                        value={formData.occupation}
                        onChange={(e) => handleChange('occupation', e.target.value)}
                        onBlur={handleBlur}
                    />
                </div>
                <div>
                    <label className="input-label">Evento Marcante</label>
                    <input 
                        className="input-dark-sheet"
                        value={formData.event}
                        onChange={(e) => handleChange('event', e.target.value)}
                        onBlur={handleBlur}
                    />
                </div>
            </div>

            {/* LINHA 2: Propósitos */}
            <div className="purposes-grid">
                {/* Pessoais */}
                <div className="purpose-col">
                    <span className="purpose-title">Pessoais</span>
                    <input 
                        className="input-dark-sheet purpose-input"
                        placeholder="Propósito 1"
                        value={formData.purposes.p1}
                        onChange={(e) => handleChange('purposes', e.target.value, 'p1')}
                        onBlur={handleBlur}
                    />
                    <input 
                        className="input-dark-sheet purpose-input"
                        placeholder="Propósito 2"
                        value={formData.purposes.p2}
                        onChange={(e) => handleChange('purposes', e.target.value, 'p2')}
                        onBlur={handleBlur}
                    />
                </div>

                {/* Coletivos */}
                <div className="purpose-col">
                    <span className="purpose-title">Coletivos</span>
                    <input 
                        className="input-dark-sheet purpose-input"
                        placeholder="Propósito 1"
                        value={formData.purposes.c1}
                        onChange={(e) => handleChange('purposes', e.target.value, 'c1')}
                        onBlur={handleBlur}
                    />
                    <input 
                        className="input-dark-sheet purpose-input"
                        placeholder="Propósito 2"
                        value={formData.purposes.c2}
                        onChange={(e) => handleChange('purposes', e.target.value, 'c2')}
                        onBlur={handleBlur}
                    />
                </div>
            </div>
        </div>
    );
}

export default OriginsTab;