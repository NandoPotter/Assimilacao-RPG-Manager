/** ========================================================================================
 * ARQUIVO: src/pages/Dashboard/components/CharacterSheet/components/ControlTrack.tsx
 * DESCRIÇÃO: Componente do Cabo de Guerra para Ficha Interativa
 * ========================================================================================= */

import React from 'react';

interface VitalsData {
    current: number;
    max: number;
}

interface Props {
    determination: VitalsData;
    assimilation: VitalsData;
    onUpdate: (vitals: { determination?: VitalsData; assimilation?: VitalsData }) => void;
}

function ControlTrack({ determination, assimilation, onUpdate }: Props) {
    
    const DET_COLOR = "var(--cor-assim-evolutiva)";   // Vermelho
    const ASS_COLOR = "var(--cor-assim-inoportuna)";  // Azul
    const STROKE_WIDTH = 2;

    // --- LÓGICA DE BOTÕES INVERTIDA ---
    
    // Botão < (Esquerda): Empurra os triângulos para esquerda (Azul cresce)
    // Aumenta Assimilação, Diminui Determinação
    const pushLeft = () => {
        if (determination.max > 0) {
            onUpdate({
                determination: { ...determination, max: determination.max - 1 },
                assimilation: { ...assimilation, max: assimilation.max + 1 }
            });
        }
    };

    // Botão > (Direita): Empurra os triângulos para direita (Vermelho cresce)
    // Aumenta Determinação, Diminui Assimilação
    const pushRight = () => {
        if (assimilation.max > 0) {
            onUpdate({
                determination: { ...determination, max: determination.max + 1 },
                assimilation: { ...assimilation, max: assimilation.max - 1 }
            });
        }
    };

    // --- LÓGICA DE CLIQUE NOS TRIÂNGULOS ---

    // Determinação (Vermelho) - Esquerda -> Direita
    const handleDetClick = (index: number) => {
        const value = index + 1;
        const newValue = (value === determination.current) ? value - 1 : value;
        onUpdate({ determination: { ...determination, current: newValue } });
    };

    // Assimilação (Azul) - Direita -> Esquerda
    const handleAssClick = (index: number) => {
        const value = assimilation.max - index;
        const newValue = (value === assimilation.current) ? value - 1 : value;
        onUpdate({ assimilation: { ...assimilation, current: newValue } });
    };

    return (
        <div className="tug-wrapper">
            
            {/* TRILHA */}
            <div className="tug-track-container">
                
                {/* 1. GRUPO VERMELHO (Determinação) */}
                {Array.from({ length: determination.max }).map((_, i) => {
                    const isFilled = i < determination.current;
                    return (
                        <svg 
                            key={`det-${i}`}
                            className="tug-triangle"
                            viewBox="0 0 14 20"
                            preserveAspectRatio="none"
                            onClick={() => handleDetClick(i)}
                        >
                            <path 
                                d="M0,0 L0,20 L14,10 Z"
                                fill={isFilled ? DET_COLOR : 'transparent'}
                                stroke={DET_COLOR}
                                strokeWidth={STROKE_WIDTH}
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    );
                })}

                {/* 2. GRUPO AZUL (Assimilação) */}
                {Array.from({ length: assimilation.max }).map((_, i) => {
                    const isFilled = i >= (assimilation.max - assimilation.current);
                    return (
                        <svg 
                            key={`ass-${i}`}
                            className="tug-triangle"
                            viewBox="0 0 14 20"
                            preserveAspectRatio="none"
                            onClick={() => handleAssClick(i)}
                        >
                            <path 
                                d="M14,0 L14,20 L0,10 Z"
                                fill={isFilled ? ASS_COLOR : 'transparent'}
                                stroke={ASS_COLOR}
                                strokeWidth={STROKE_WIDTH}
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    );
                })}

            </div>

            {/* CONTROLES E VALORES */}
            <div className="tug-controls-row">
                
                {/* Círculo Vermelho (Det) */}
                <div className="tug-circle det-circle">
                    {determination.max}
                </div>

                <div className="tug-buttons-group">
                    {/* Seta < Aumenta Assimilação (Move para esquerda) */}
                    <button className="btn-tug-adjust" onClick={pushLeft} title="Aumentar Assimilação">
                        &lt;
                    </button>
                    
                    <span style={{fontSize:'0.6rem', color:'#666', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                        EQUILÍBRIO
                    </span>
                    
                    {/* Seta > Aumenta Determinação (Move para direita) */}
                    <button className="btn-tug-adjust" onClick={pushRight} title="Aumentar Determinação">
                        &gt;
                    </button>
                </div>

                {/* Círculo Azul (Ass) */}
                <div className="tug-circle ass-circle">
                    {assimilation.max}
                </div>

            </div>
        </div>
    );
}

export default ControlTrack;