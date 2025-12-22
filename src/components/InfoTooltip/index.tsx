import React, { useState, useRef } from 'react';
import './styles.css';

interface Props {
    textKey: string; 
    descriptions: Record<string, string>;
}

const InfoTooltip: React.FC<Props> = ({ textKey, descriptions }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    // CORREÇÃO AQUI: Trocamos 'NodeJS.Timeout' por 'ReturnType<typeof setTimeout>'
    // Isso faz o TypeScript detectar automaticamente o tipo correto (number no navegador)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const description = descriptions[textKey];

    if (!description) return null;

    const handleMouseEnter = () => {
        timerRef.current = setTimeout(() => setIsVisible(true), 2000);
    };

    const handleMouseLeave = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsVisible(false);
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsVisible(!isVisible);
    };

    return (
        <div 
            className="info-icon-container"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <span className="info-icon-symbol">i</span>
            {isVisible && <div className="info-tooltip-balloon">{description}</div>}
        </div>
    );
};

export default InfoTooltip;