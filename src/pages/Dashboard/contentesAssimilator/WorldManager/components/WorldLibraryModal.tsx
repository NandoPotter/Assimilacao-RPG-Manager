import { useEffect, useState } from 'react';
import type { WorldLibrary } from '../../../../../interfaces/World';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: WorldLibrary | null;
}

export const WorldLibraryModal = ({ isOpen, onClose, onSave, initialData }: Props) => {
    const [formData, setFormData] = useState({ name: '', description: '', is_public: false });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                is_public: initialData.is_public
            });
        } else {
            setFormData({ name: '', description: '', is_public: false });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{zIndex: 2200}}>
            <div className="modal-box" style={{ maxWidth: '500px' }}>
                <h3 className="modal-title">{initialData ? 'EDITAR MUNDO' : 'CRIAR NOVO MUNDO'}</h3>
                
                <div className="modal-body">
                    {!initialData && (
                        <div style={{padding: '10px', background: 'rgba(var(--cor-tema-rgb), 0.1)', borderRadius: '4px', marginBottom: '15px', border: '1px solid var(--cor-tema)', fontSize: '0.85rem', color: '#fff'}}>
                            ℹ️ Ao criar um novo mundo, ele será populado automaticamente com todos os Biomas (Floresta, Deserto, etc.), Arquétipos (Agrocultura, Gangue, etc.) e Construções oficiais do livro "Assimilação". Você poderá editá-los depois.
                        </div>
                    )}

                    <div className="mb-2">
                        <label className="input-label">NOME DO MUNDO</label>
                        <input className="input-dark-sheet" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                    </div>
                    
                    <div className="mb-2">
                        <label className="input-label">DESCRIÇÃO</label>
                        <textarea className="input-dark-sheet" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <div className="mb-2">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background: 'rgba(255,255,255,0.05)', padding:'10px', borderRadius:'4px'}}>
                            <span style={{fontWeight:'bold'}}>Tornar Público?</span>
                            <label className="tech-switch">
                                <input type="checkbox" checked={formData.is_public} onChange={e => setFormData({...formData, is_public: e.target.checked})} />
                                <span className="tech-slider"></span>
                            </label>
                        </div>
                        <span style={{fontSize:'0.7rem', color:'#888'}}>Outros jogadores poderão ver e clonar seu mundo.</span>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary-action" onClick={onClose}>CANCELAR</button>
                    <button className="btn-primary-action" onClick={() => onSave(formData)}>
                        {initialData ? 'SALVAR ALTERAÇÕES' : 'CRIAR MUNDO'}
                    </button>
                </div>
            </div>
        </div>
    );
};