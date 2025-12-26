import { useState } from 'react';
import './Styles.css';

export function ThreatCreator() {
    // Estado para saber qual tela mostrar: 'menu', 'conflitos' ou 'ameacas'
    const [view, setView] = useState<'menu' | 'conflitos' | 'ameacas'>('menu');
    
    // Estados do sistema (compartilhados ou específicos)
    const [level, setLevel] = useState(0);
    const [conflitoNome, setConflitoNome] = useState('');
    const [principais, setPrincipais] = useState(['', '', '']);
    const [secundarios, setSecundarios] = useState(['', '', '']);

    const handleObjChange = (index: number, value: string, type: 'p' | 's') => {
        if (type === 'p') {
            const newArr = [...principais];
            newArr[index] = value;
            setPrincipais(newArr);
        } else {
            const newArr = [...secundarios];
            newArr[index] = value;
            setSecundarios(newArr);
        }
    };

    // --- RENDERIZAÇÃO DO MENU INICIAL ---
    if (view === 'menu') {
        return (
            <div className="threat-container">
                <header className="threat-header">
                    <h1>Criador de Ameaças</h1>
                    <p>Selecione o módulo de gestão para sua cena.</p>
                </header>
                <div className="menu-selection-grid">
                    <div className="selection-card" onClick={() => setView('conflitos')}>
                        <div className="card-icon">⚔️</div>
                        <h2>Gerenciar Conflitos</h2>
                        <p>Defina nomes, objetivos principais e secundários da cena.</p>
                    </div>
                    <div className="selection-card" onClick={() => setView('ameacas')}>
                        <div className="card-icon">☣️</div>
                        <h2>Nível de Ameaça</h2>
                        <p>Monitore o risco e a urgência das ações dos Infectados.</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDERIZAÇÃO DA TELA DE CONFLITOS ---
    if (view === 'conflitos') {
        return (
            <div className="threat-container">
                <button className="back-btn" onClick={() => setView('menu')}>← Voltar ao Menu</button>
                <div className="setup-card">
                    <div className="form-group">
                        <label>Nome do Conflito</label>
                        <input 
                            type="text" 
                            placeholder="Ex: Fuga do Armazém" 
                            value={conflitoNome}
                            onChange={(e) => setConflitoNome(e.target.value)}
                        />
                    </div>
                    <div className="objectives-grid">
                        <div className="obj-section">
                            <h4>Objetivos Principais</h4>
                            {principais.map((obj, i) => (
                                <input key={`p-${i}`} type="text" value={obj} onChange={(e) => handleObjChange(i, e.target.value, 'p')} />
                            ))}
                        </div>
                        <div className="obj-section">
                            <h4>Objetivos Secundários</h4>
                            {secundarios.map((obj, i) => (
                                <input key={`s-${i}`} type="text" value={obj} onChange={(e) => handleObjChange(i, e.target.value, 's')} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDERIZAÇÃO DA TELA DE AMEAÇAS ---
    return (
        <div className="threat-container">
            <button className="back-btn" onClick={() => setView('menu')}>← Voltar ao Menu</button>
            <div className="threat-card center-card">
                <span className="level-number">{level}</span>
                <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${(level / 5) * 100}%`, backgroundColor: level > 3 ? '#ff4444' : '#ff9900' }}></div>
                </div>
                <div className="threat-controls">
                    <button onClick={() => setLevel(Math.max(0, level - 1))}>Reduzir</button>
                    <button onClick={() => setLevel(Math.min(5, level + 1))}>Aumentar</button>
                </div>
            </div>
        </div>
    );
}