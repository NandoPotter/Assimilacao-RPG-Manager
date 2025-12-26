/** ========================================================================================
 * ARQUIVO: src/pages/Dashboard/contents/CharacterSheet/components/HealthMonitor.tsx
 * DESCRIÇÃO: Componente de Monitor de Saúde
 * ========================================================================================= */

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
    // NOVO: Função para avisar a ficha que o status mudou
    onStatusChange?: (newStatus: string) => void;
}

function HealthMonitor({ health, instincts, onUpdate, onStatusChange }: Props) {
    
    const tempHealth = health.temp || 0;
    const currentReal = health.current;
    
    // FÓRMULA: 1 + Resolução + Potência
    // Define quantos quadradinhos (segmentos) cada caixa de vida tem.
    const segmentsPerBox = 1 + (instincts.resolucao || 0) + (instincts.potencia || 0);

    // Calculamos o Máximo Real: 6 caixas * segmentos por caixa
    const calculatedMax = segmentsPerBox * 6;
    const maxHealth = calculatedMax; 
    
    const totalDisplay = currentReal + tempHealth;

    // --- LÓGICA DE STATUS ---
    const checkStatusChange = (newCurrent: number) => {
        if (!onStatusChange) return;

        // Regras de negócio solicitadas:
        // 0 = Morto
        // <= 1 caixa (S*1) = Incapacitado
        // <= 2 caixas (S*2) = Debilitado
        // <= 3 caixas (S*3) = Ferido
        // <= 4 caixas (S*4) = Lacerado
        // <= 5 caixas (S*5) = Escoriado
        // > 5 caixas = Vivo (Padrão)

        if (newCurrent === 0) {
            onStatusChange('Morto');
        } else if (newCurrent <= segmentsPerBox) {
            onStatusChange('Incapacitado');
        } else if (newCurrent <= segmentsPerBox * 2) {
            onStatusChange('Debilitado');
        } else if (newCurrent <= segmentsPerBox * 3) {
            onStatusChange('Ferido');
        } else if (newCurrent <= segmentsPerBox * 4) {
            onStatusChange('Lacerado');
        } else if (newCurrent <= segmentsPerBox * 5) {
            onStatusChange('Escoriado');
        } else {
            onStatusChange('Saudável');
        }
    };

    // --- HANDLERS ---
    const adjustReal = (delta: number) => {
        const newVal = Math.max(0, Math.min(maxHealth, currentReal + delta));
        
        // 1. Atualiza a vida
        onUpdate({ ...health, current: newVal, max: maxHealth, temp: tempHealth });
        
        // 2. Verifica se o status mudou baseado no novo valor
        checkStatusChange(newVal);
    };

    const adjustTemp = (delta: number) => {
        const newVal = Math.max(0, tempHealth + delta);
        onUpdate({ ...health, current: currentReal, max: maxHealth, temp: newVal });
    };

    // --- RENDERIZAÇÃO DE UMA CAIXA ---
    const renderHealthBox = (boxNumber: number, label: string, colorClass: 'green' | 'yellow' | 'red') => {
        const startValue = (boxNumber - 1) * segmentsPerBox;
        
        const segments = [];
        for (let s = 1; s <= segmentsPerBox; s++) {
            const segmentValue = startValue + s;
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
                        Necessita de cuidados médico
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