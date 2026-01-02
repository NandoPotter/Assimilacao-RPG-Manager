import { useEffect, useState } from 'react';

export const LibraryModal = ({ isOpen, onClose, onSave, initialData }: any) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        if (initialData) { setName(initialData.name); setDesc(initialData.description || ''); setIsPublic(initialData.is_public); } 
        else { setName(''); setDesc(''); setIsPublic(false); }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3 className="modal-title">{initialData ? 'EDITAR DEPÓSITO' : 'NOVO DEPÓSITO'}</h3>
                <input className="input-dark-sheet mb-2" placeholder="Nome da Coleção" value={name} onChange={e => setName(e.target.value)} autoFocus />
                <textarea className="input-dark-sheet mb-2" placeholder="Descrição" rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
                <div className="tech-toggle-container mb-2">
                    <span className="tech-toggle-label">Disponibilizar para a Comunidade</span>
                    <label className="tech-switch"><input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} /><span className="tech-slider"></span></label>
                </div>
                <div className="modal-actions"><button className="btn-secondary-action" onClick={onClose}>CANCELAR</button><button className="btn-primary-action" onClick={() => onSave({ name, description: desc, is_public: isPublic })}>SALVAR</button></div>
            </div>
        </div>
    );
};