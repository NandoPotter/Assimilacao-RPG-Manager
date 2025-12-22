/** ========================================================================================
 * ARQUIVO: src/pages/Dashboard/components/CharacterSheet/components/HealthMonitor.tsx
 * DESCRIÇÃO: Componente de Monitor de Saúde para Ficha Interativa
 * ========================================================================================= */

import React from 'react';
import { type Instincts } from '../../../../../interfaces/Gameplay';

interface HealthData {
    current: number;
    max: number;
    temp?: number;
}

interface Props {
    health: HealthData;
    instincts: Instincts; 
    onUpdate: (newHealth: HealthData) => void;
}

function HealthMonitor({ health, instincts, onUpdate }: Props) {
    
    const tempHealth = health.temp || 0;
    const currentReal = health.current;
    
    // FÓRMULA CORRETA: 1 + Resolução + Potência
    // Define quantos quadradinhos (segmentos) cada caixa de vida tem.
    const segmentsPerBox = 1 + (instincts.resolucao || 0) + (instincts.potencia || 0);

    // Calculamos o Máximo Real: 6 caixas * segmentos por caixa
    const calculatedMax = segmentsPerBox * 6;
    const maxHealth = calculatedMax; 
    
    const totalDisplay = currentReal + tempHealth;

    // --- HANDLERS ---
    const adjustReal = (delta: number) => {
        const newVal = Math.max(0, Math.min(maxHealth, currentReal + delta));
        onUpdate({ ...health, current: newVal, max: maxHealth, temp: tempHealth });
    };

    const adjustTemp = (delta: number) => {
        const newVal = Math.max(0, tempHealth + delta);
        onUpdate({ ...health, current: currentReal, max: maxHealth, temp: newVal });
    };

    // --- RENDERIZAÇÃO DE UMA CAIXA ---
    const renderHealthBox = (boxNumber: number, label: string, colorClass: 'green' | 'yellow' | 'red') => {
        
        // Calcular o intervalo de HP que esta caixa representa.
        // Caixa 1 (Incapacitação) é a base (HP 1 até X).
        // Caixa 6 (Saudável) é o topo.
        
        // Box 1: HP 1 .. segs
        // Box 2: HP segs+1 .. 2*segs
        // ...
        // Box N: HP (N-1)*segs + 1 .. N*segs
        
        const startValue = (boxNumber - 1) * segmentsPerBox;
        
        const segments = [];
        for (let s = 1; s <= segmentsPerBox; s++) {
            // Valor exato deste segmento
            const segmentValue = startValue + s;
            
            // O segmento está preenchido se a vida atual for maior ou igual a ele
            const isActive = currentReal >= segmentValue;
            
            segments.push(
                <div 
                    key={s} 
                    className={`hp-segment ${colorClass} ${isActive ? 'active' : ''}`}
                />
            );
        }

        return (
            <div className="hp-box-container">
                <div className="hp-box-segments">
                    {segments}
                    <div className="hp-box-label-overlay">{label}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="health-section">
            
            {/* HEADER */}
            <div className="health-header-grid">
                <div className="health-ctrl-group">
                    <span className="health-ctrl-title" style={{color:'#00bbff'}}>Temp</span>
                    <div style={{display:'flex', gap:'5px'}}>
                        <button className="btn-health-adjust" onClick={() => adjustTemp(-1)}>-</button>
                        <button className="btn-health-adjust" onClick={() => adjustTemp(1)}>+</button>
                    </div>
                </div>

                <div className="health-display-box">
                    <div className="health-total-val">
                        {totalDisplay} <span style={{fontSize:'1rem', color:'#666'}}>/ {maxHealth}</span>
                    </div>
                    <span className="health-label-small">Estado Geral</span>
                </div>

                <div className="health-ctrl-group">
                    <span className="health-ctrl-title" style={{color:'#4caf50'}}>Real</span>
                    <div style={{display:'flex', gap:'5px'}}>
                        <button className="btn-health-adjust" onClick={() => adjustReal(-1)}>-</button>
                        <button className="btn-health-adjust" onClick={() => adjustReal(1)}>+</button>
                    </div>
                </div>
            </div>

            {/* GRUPOS DE CAIXAS */}
            <div className="health-groups-container">

                {/* GRUPO 1: SAUDÁVEL (6, 5) - VERDE */}
                <div className="health-group-row">
                    <span className="health-group-title">
                        Ativa Recuperação após repouso completo
                    </span>
                    <div className="health-boxes-wrapper">
                        {renderHealthBox(6, "Saudável", "green")}
                        {renderHealthBox(5, "Escoriação", "green")}
                    </div>
                </div>

                {/* GRUPO 2: FERIMENTOS (4, 3) - AMARELO */}
                <div className="health-group-row">
                    <span className="health-group-title">
                        Ativa a Recuperação após uma semana
                    </span>
                    <div className="health-boxes-wrapper">
                        {renderHealthBox(4, "Laceração", "yellow")}
                        {renderHealthBox(3, "Ferimentos", "yellow")}
                    </div>
                    <div className="hp-legend-row">-1 sucesso em testes</div>
                </div>

                {/* GRUPO 3: CRÍTICO (2, 1) - VERMELHO */}
                <div className="health-group-row">
                    <span className="health-group-title">
                        Não regenera naturalmente.<br/>Necessita de cuidados médico
                    </span>
                    <div className="health-boxes-wrapper">
                        <div className="hp-box-container">
                            {renderHealthBox(2, "Debilitação", "red").props.children}
                            <span className="hp-box-specific-legend">
                                Incapaz de agir<br/>-2 sucessos
                            </span>
                        </div>
                        <div className="hp-box-container">
                            {renderHealthBox(1, "Incapacitação", "red").props.children}
                            <span className="hp-box-specific-legend">
                                Inconsciente<br/>Ações exigem 2 adaptações
                            </span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default HealthMonitor;