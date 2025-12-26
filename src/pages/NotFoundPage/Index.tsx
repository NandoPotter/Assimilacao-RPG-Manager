/** ============================================================
 * ARQUIVO: src/pages/NotFound/index.tsx
 * DESCRIÇÃO: Página 404 - Tema: Dissociação / Controle do Parasita
 * ============================================================ */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import './Styles.css';

const VISCERAL_MESSAGES = [
    "Você se afastou demais... o Parasita está assumindo o controle.",
    "Esta memória não existe. É uma alucinação da infecção.",
    "Silêncio. Você consegue ouvir a colmeia chamando?",
    "Sua consciência falhou. Apenas o instinto resta aqui.",
    "Você caminhou para o vazio. Não há nada aqui além de fome.",
    "Cuidado. Quando você olha para o abismo, o Parasita olha de volta."
];

function NotFoundPage() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");

    useEffect(() => {
        const randomMsg = VISCERAL_MESSAGES[Math.floor(Math.random() * VISCERAL_MESSAGES.length)];
        setMessage(randomMsg);
    }, []);

    return (
        <div className="not-found-container">
            {/* Overlay de Vinheta (Visão escurecendo) */}
            <div className="vignette-overlay"></div>
            
            {/* Efeito de "Pulso" de fundo (como um batimento cardíaco ou respiração) */}
            <div className="pulse-background"></div>

            <div className="content-wrapper">
                <div className="hallucination-wrapper">
                    <h1 className="hallucination-text" data-text="404">404</h1>
                </div>
                
                <h2 className="status-text">DISSOCIAÇÃO DETECTADA</h2>
                
                <p className="visceral-description">
                    {message}
                </p>

                <div className="action-area">
                    <button className="btn-resist" onClick={() => navigate('/dashboard')}>
                        RETOMAR CONSCIÊNCIA
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;