// ARQUIVO: src/components/InfoTooltip/index.tsx
import React, { useState } from 'react';
import './styles.css';
import { type DescriptionData } from '../../constants/Descriptions'; // Importe a interface se precisar

interface Props {
    textKey: string; 
    descriptions: Record<string, DescriptionData>; // Atualizado para o novo tipo
}

const InfoTooltip: React.FC<Props> = ({ textKey, descriptions }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const data = descriptions[textKey];

    // Se não tiver dados para essa chave, não renderiza nada
    if (!data) return null;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* O ÍCONE PEQUENO (Gatilho) */}
            <div className="info-icon-container" onClick={handleToggle}>
                <span className="info-icon-symbol">i</span>
            </div>

            {/* O MODAL (Só renderiza se isOpen for true) */}
            {isOpen && (
                <div className="info-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="info-modal-header">
                            <h3 className="info-modal-title">{data.title}</h3>
                            <button className="info-modal-close" onClick={() => setIsOpen(false)}>×</button>
                        </div>

                        {/* Texto */}
                        <div className="info-modal-body">
                            <p className="info-text">{data.text1}</p>
                            <p className="info-text">{data.text2}</p>
                            <p className="info-text-cent">{data.textC}</p>

                            {/* Renderização Condicional da Tabela */}
                            {data.table && (
                                <div className="info-table-wrapper">
                                    <table className="info-table">
                                        <thead>
                                            <tr>
                                                {data.table.headers.map((head, i) => (
                                                    <th key={i}>{head}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.table.rows.map((row, rIndex) => (
                                                <tr key={rIndex}>
                                                    {row.map((cell, cIndex) => (
                                                        <td key={cIndex}>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Renderização do Texto Especial */}
                            {data.textE && (
                                <p className="info-text-especial">
                                    <span>ESPECIAL: </ span>
                                    {data.textE}
                                </p>
                            )}

                            <p className="info-text">{data.text3}</p>
                            <p className="info-text">{data.text4}</p>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default InfoTooltip;