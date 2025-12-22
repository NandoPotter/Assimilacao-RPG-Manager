import React from 'react';

interface Props {
    name: string;
    generation: string;
    occupation: string;
    onBack: () => void;
}

function SheetHeader({ name, generation, occupation, onBack }: Props) {
    return (
        <header className="sheet-header">
            {/* Botão Voltar na Esquerda */}
            <div className="char-actions">
                <button className="btn-save-sheet" onClick={onBack}>
                    <span>←</span> VOLTAR
                </button>
            </div>
            
            {/* Identidade na Direita */}
            <div className="char-identity">
                <h1 className="char-name-title">{name}</h1>
                <span className="char-gen-subtitle">{generation} | {occupation}</span>
            </div>
        </header>
    );
}

export default SheetHeader;