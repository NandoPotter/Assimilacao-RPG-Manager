import React, { useState } from 'react';
import AssimilationDiceD10 from '../components/AssimilationDices/Index';
import PhysicsD10 from '../components/AssimilationDices/PhysicsD10';

function TestPage() {
    // Um estado para cada dado
    const [results, setResults] = useState({ d1: 0, d2: 0, d3: 0 });

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '20px', color: '#fff', textAlign: 'center', zIndex: 10, display: 'flex', justifyContent: 'center', gap: '40px' }}>
                <div>
                    <h3>Dado Esquerda</h3>
                    <h1 style={{ color: '#00f2fffa' }}>{results.d1 || '-'}</h1>
                </div>
                <div>
                    <h3>Dado Meio</h3>
                    <h1 style={{ color: '#00f3ff' }}>{results.d2 || '-'}</h1>
                </div>
                <div>
                    <h3>Dado Direita</h3>
                    <h1 style={{ color: '#00f3ff' }}>{results.d3 || '-'}</h1>
                </div>
            </div>

            <div style={{ flex: 1 }}>
                <AssimilationDiceD10>
                    {/* Dado 1: Esquerda */}
                    <PhysicsD10 
                        position={[-3, 5, 0]} 
                        onStop={(val) => setResults(prev => ({ ...prev, d1: val }))} 
                    />
                    
                    {/* Dado 2: Meio */}
                    <PhysicsD10 
                        position={[0, 6, 0]} 
                        onStop={(val) => setResults(prev => ({ ...prev, d2: val }))} 
                    />
                    
                    {/* Dado 3: Direita */}
                    <PhysicsD10 
                        position={[3, 5, 0]} 
                        onStop={(val) => setResults(prev => ({ ...prev, d3: val }))} 
                    />
                </AssimilationDiceD10>
            </div>
        </div>
    );
}

export default TestPage;