/** ==================================================================
 * ARQUIVO: src/pages/Dashboard/components/CharacterCreator/index.tsx
 * DESCRIÇÃO: Wizard de Criação de Personagem
 * =================================================================== */

import React, { useEffect, useState, useRef } from 'react'; // <--- ADICIONADO useRef
import { useNavigate, useParams } from 'react-router';
import { type Aptitudes, type CharacterStatus, type Instincts } from '../../../../interfaces/Gameplay';
import { characterService } from '../../../../services/characterService';
import { supabase } from '../../../../services/supabaseClient';
import './styles.css';

// --- IMPORTAÇÕES PARA O INFO TOOLTIP ---
import InfoTooltip from '../../../../components/InfoTooltip/Index';
import { DESCRIPTIONS } from '../../../../constants/Descriptions';

const NAME_MAP: { [key: string]: string } = {
    influencia: 'Influência', percepcao: 'Percepção', potencia: 'Potência',
    reacao: 'Reação', resolucao: 'Resolução', sagacidade: 'Sagacidade',
    biologia: 'Biologia', erudicao: 'Erudição', engenharia: 'Engenharia',
    geografia: 'Geografia', medicina: 'Medicina', seguranca: 'Segurança',
    armas: 'Armas', atletismo: 'Atletismo', expressao: 'Expressão',
    furtividade: 'Furtividade', manufaturas: 'Manufaturas', sobrevivencia: 'Sobrevivência'
};

interface Requirement { type: 'instintos' | 'aptidoes' | 'ou'; key?: string; val?: number; options?: Requirement[]; }
interface CharacteristicItem { id: number; name: string; description: string; cost: number; requirements: Requirement[]; req_label?: string; }
interface KitItem { id: number; name: string; items_description: string; }

interface FormData {
    nome: string;
    geracao: 'Pré-Colapso' | 'Colapso' | 'Pós-Colapso';
    ocupacao: string;
    evento: string;
    descricao: string; 
    p1: string; p2: string;
    c1: string; c2: string;
    instintos: { [key: string]: number };
    aptidoes: { [key: string]: number };
    aptidoesBase: { [key: string]: number }; 
    xpDisponivel: number;
    kitName: string; 
    caracteristicas: number[]; 
}

const INITIAL_DATA: FormData = {
    nome: '',
    geracao: 'Colapso',
    ocupacao: '',
    evento: '',
    descricao: '',
    p1: '', p2: '', c1: '', c2: '',
    instintos: { influencia: 1, percepcao: 1, potencia: 1, reacao: 1, resolucao: 1, sagacidade: 1 },
    aptidoes: { 
        biologia: 0, erudicao: 0, engenharia: 0, geografia: 0, medicina: 0, seguranca: 0, 
        armas: 0, atletismo: 0, expressao: 0, furtividade: 0, manufaturas: 0, sobrevivencia: 0 
    },
    aptidoesBase: {}, 
    xpDisponivel: 7,
    kitName: '',
    caracteristicas: []
};

function CharacterCreatorBoard() {
    const navigate = useNavigate();
    const { id } = useParams(); 
    
    // --- MARCADOR DE TOPO ---
    const topRef = useRef<HTMLDivElement>(null); // Cria a referência

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
    const [isSaving, setIsSaving] = useState(false);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false); 
    
    const [pontosInstintos, setPontosInstintos] = useState(3);
    const [pontosAptidoes, setPontosAptidoes] = useState(7);

    const [characteristicsList, setCharacteristicsList] = useState<CharacteristicItem[]>([]);
    const [kitsList, setKitsList] = useState<KitItem[]>([]);
    
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // --- EFEITO DE SCROLL AUTOMÁTICO (FIXO E GARANTIDO) ---
    useEffect(() => {
        // Pequeno delay para garantir que o DOM atualizou
        setTimeout(() => {
            if (topRef.current) {
                // Rola suavemente até o elemento marcador
                topRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 100);
    }, [step]); // Dispara sempre que o passo muda

    useEffect(() => {
        const init = async () => {
            try {
                const [charRes, kitRes] = await Promise.all([
                    supabase.from('characteristics').select('*').order('cost', { ascending: true }),
                    supabase.from('starting_kits').select('*')
                ]);
                if (charRes.error) throw charRes.error;
                if (kitRes.error) throw kitRes.error;
                setCharacteristicsList(charRes.data || []);
                setKitsList(kitRes.data || []);

                if (id) {
                    setIsLoadingData(true);
                    await loadDraftData(id);
                }
            } catch (error) {
                console.error("Erro na inicialização:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        init();
    }, [id]);

    const loadDraftData = async (charId: string) => {
        const char = await characterService.getCharacterById(charId);
        if (!char) {
            showModal("Erro", "Personagem não encontrado.", "error");
            navigate('/dashboard/characters');
            return;
        }

        const loadedData: FormData = {
            nome: char.name,
            geracao: char.generation as any,
            ocupacao: char.background?.occupation || '',
            evento: char.background?.event || '',
            descricao: char.background?.description || '',
            p1: char.background?.purposes?.p1 || '',
            p2: char.background?.purposes?.p2 || '',
            c1: char.background?.purposes?.c1 || '',
            c2: char.background?.purposes?.c2 || '',
            instintos: char.instincts as any || INITIAL_DATA.instintos,
            aptidoes: char.aptitudes as any || INITIAL_DATA.aptidoes,
            aptidoesBase: char.base_aptitudes as any || {},
            xpDisponivel: char.xp_available ?? 7,
            kitName: char.kit_name || '',
            caracteristicas: char.characteristics_ids || []
        };

        setFormData(loadedData);
        setDraftId(char.id);
        if (char.avatar_url) setAvatarPreview(char.avatar_url);
        recalculatePoints(loadedData.instintos, loadedData.aptidoes);
    };

    const recalculatePoints = (inst: any, apt: any) => {
        let spentInst = 0;
        Object.values(inst).forEach((v: any) => spentInst += (v - 1));
        setPontosInstintos(3 - spentInst);

        let spentApt = 0;
        Object.values(apt).forEach((v: any) => spentApt += v);
        setPontosAptidoes(7 - spentApt);
    };

    const checkSingleReq = (req: Requirement): boolean => {
        if (req.type === 'ou' && req.options) return req.options.some(opt => checkSingleReq(opt));
        if (req.key && req.val !== undefined) {
            const currentVal = req.type === 'instintos' ? formData.instintos[req.key] : formData.aptidoes[req.key];
            return (currentVal || 0) >= req.val;
        }
        return false;
    };
    const checkAllReqs = (reqs: Requirement[]) => {
        if (!reqs || reqs.length === 0) return true;
        const reqArray = Array.isArray(reqs) ? reqs : []; 
        return reqArray.every(r => checkSingleReq(r));
    };

    useEffect(() => {
        if (characteristicsList.length === 0) return;
        const invalidChars = formData.caracteristicas.filter(charId => {
            const char = characteristicsList.find(c => c.id === charId);
            return char && !checkAllReqs(char.requirements); 
        });
        if (invalidChars.length > 0) {
            let refund = 0;
            const newCharList = formData.caracteristicas.filter(id => {
                if (invalidChars.includes(id)) {
                    const char = characteristicsList.find(c => c.id === id);
                    if (char) refund += char.cost;
                    return false;
                }
                return true;
            });
            setFormData(prev => ({ ...prev, caracteristicas: newCharList, xpDisponivel: prev.xpDisponivel + refund }));
        }
    }, [formData.aptidoes, formData.instintos, characteristicsList]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { showModal("Erro", "Máximo de 2MB.", 'error'); return; }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    const changeStat = (type: 'instintos' | 'aptidoes', key: string, delta: number) => {
        const pool = type === 'instintos' ? pontosInstintos : pontosAptidoes;
        const currentVal = type === 'instintos' ? formData.instintos[key] : formData.aptidoes[key];
        const min = type === 'instintos' ? 1 : 0;
        const max = type === 'instintos' ? 3 : 2;
        if (delta > 0 && pool <= 0) { showModal("Sem Pontos", "Sem pontos disponíveis.", 'error'); return; }
        if (currentVal + delta < min || currentVal + delta > max) return;
        const newData = { ...formData };
        if (type === 'instintos') newData.instintos[key] = currentVal + delta; else newData.aptidoes[key] = currentVal + delta;
        setFormData(newData);
        if (type === 'instintos') setPontosInstintos(p => p - delta); else setPontosAptidoes(p => p - delta);
    };
    const handleEvolucao = (key: string, delta: number) => {
        const currentVal = formData.aptidoes[key];
        const baseVal = formData.aptidoesBase[key] || 0; 
        if (delta < 0) {
            if (currentVal <= baseVal) return; 
            let custo = currentVal === 1 ? 2 : currentVal === 2 ? 4 : 6;
            setFormData(p => ({ ...p, aptidoes: { ...p.aptidoes, [key]: currentVal - 1 }, xpDisponivel: p.xpDisponivel + custo }));
        } else {
            if (currentVal >= 3) return; 
            let custo = currentVal === 0 ? 2 : currentVal === 1 ? 4 : 6;
            if (formData.xpDisponivel < custo) { showModal("Erro", `XP Insuficiente (${custo} XP).`, 'error'); return; }
            setFormData(p => ({ ...p, aptidoes: { ...p.aptidoes, [key]: currentVal + 1 }, xpDisponivel: p.xpDisponivel - custo }));
        }
    };
    const toggleCharacteristic = (charId: number, cost: number, reqs: Requirement[]) => {
        if (!formData.caracteristicas.includes(charId)) {
            if (!checkAllReqs(reqs) || formData.xpDisponivel < cost) return;
            setFormData(p => ({ ...p, caracteristicas: [...p.caracteristicas, charId], xpDisponivel: p.xpDisponivel - cost }));
        } else {
            setFormData(p => ({ ...p, caracteristicas: p.caracteristicas.filter(id => id !== charId), xpDisponivel: p.xpDisponivel + cost }));
        }
    };

    const getPayload = (userId: string, avatarUrl: string | null) => {
        const pot = formData.instintos.potencia || 1;
        const res = formData.instintos.resolucao || 1;
        const vidaMax = 6 * (1 + pot + res);
        return {
            user_id: userId, name: formData.nome, avatar_url: avatarUrl, generation: formData.geracao, status: 'Em Criação' as CharacterStatus, is_draft: true,
            background: { occupation: formData.ocupacao, event: formData.evento, description: formData.descricao, purposes: { p1: formData.p1, p2: formData.p2, c1: formData.c1, c2: formData.c2 } },
            instincts: formData.instintos as unknown as Instincts, aptitudes: formData.aptidoes as unknown as Aptitudes, base_aptitudes: formData.aptidoesBase as unknown as Aptitudes,
            vitals: { health: { current: vidaMax, max: vidaMax, temp: 0 }, determination: { current: 9, max: 9 }, assimilation: { current: 1, max: 1 } },
            xp_available: formData.xpDisponivel, kit_name: formData.kitName, characteristics_ids: formData.caracteristicas
        };
    };
    const saveDraft = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Sessão inválida.");
            let uploadedUrl = null;
            if (avatarFile) uploadedUrl = await characterService.uploadAvatar(avatarFile, user.id);
            const payload: any = getPayload(user.id, uploadedUrl);
            let savedChar;
            if (!draftId) {
                savedChar = await characterService.createCharacter(payload);
                setDraftId(savedChar.id); 
            } else {
                if (!uploadedUrl) delete payload.avatar_url; 
                savedChar = await characterService.updateCharacter(draftId, payload);
            }
            return true;
        } catch (error: any) {
            console.error(error);
            showModal("Erro", error.message, 'error');
            return false;
        } finally { setIsSaving(false); }
    };

    const finalizeCreation = async () => {
        if (!formData.kitName) {
            showModal("Atenção", "Selecione um Kit Inicial.", 'error');
            return;
        }
        setIsSaving(true);

        try {
            if (!draftId) throw new Error("ID do rascunho perdido.");

            await characterService.populateInventoryFromKit(draftId, formData.kitName);

            await characterService.updateCharacter(draftId, {
                status: 'Saudável' as CharacterStatus,
                is_draft: false,
                kit_name: formData.kitName,
                characteristics_ids: formData.caracteristicas,
                aptitudes: formData.aptidoes as unknown as Aptitudes,
                xp_available: formData.xpDisponivel
            });
            
            showModal("Sucesso", "Personagem Criado com Sucesso!", 'success');

        } catch (error: any) {
            console.error("Erro na finalização:", error);
            showModal("Erro", error.message || "Falha ao processar criação.", 'error');
            setIsSaving(false);
        }
    };

    const handleNext = async () => {
        if (step === 1) {
            if (!formData.nome) { showModal("Erro", "Nome obrigatório.", 'error'); return; }
            const success = await saveDraft();
            if (success) setStep(2);
        } else if (step === 2) {
            if (pontosInstintos > 0) { showModal("Erro", `Gaste seus pontos de Instintos!`, 'error'); return; }
            if (pontosAptidoes > 0) { showModal("Erro", `Gaste seus pontos de Aptidões!`, 'error'); return; }
            setFormData(prev => ({ ...prev, aptidoesBase: { ...prev.aptidoes } }));
            const success = await saveDraft();
            if (success) setStep(3);
        } else {
            finalizeCreation();
        }
    };

    const showModal = (title: string, message: string, type: string) => setModalState({ isOpen: true, title, message, type });
    const closeModal = () => {
        setModalState(p => ({ ...p, isOpen: false }));
        if (modalState.title === 'Sucesso') navigate('/dashboard/characters');
    };

    const renderRequirementLabel = (reqs: Requirement[]) => {
        if (!reqs || reqs.length === 0) return <span className="req-success">Livre</span>;

        return reqs.map((req, index) => {
            const separator = index > 0 ? <span className="req-neutral" style={{color:'#888'}}>, </span> : null;

            if (req.type === 'ou' && req.options) {
                return (
                    <React.Fragment key={index}>
                        {separator}
                        {req.options.map((opt, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <span className="req-neutral" style={{color:'#888'}}> ou </span>}
                                <span className={checkSingleReq(opt) ? "req-success" : "req-fail"}>
                                    {opt.key ? (NAME_MAP[opt.key] || opt.key) : 'Req'} {opt.val}
                                </span>
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                );
            }

            const met = checkSingleReq(req);
            return (
                <React.Fragment key={index}>
                    {separator}
                    <span className={met ? "req-success" : "req-fail"}>
                        {req.key ? (NAME_MAP[req.key] || req.key) : 'Req'} {req.val}
                    </span>
                </React.Fragment>
            );
        });
    };

    const renderStatRow = (label: string, key: string, type: 'instintos' | 'aptidoes') => (
        <div className="stat-row" key={key}>
            <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                <span className="stat-name" style={{color: '#ccc', fontSize: '0.85rem'}}>{label}</span>
                <InfoTooltip textKey={key} descriptions={DESCRIPTIONS} />
            </div>
            <div className="stat-control">
                <button className="btn-mini" onClick={() => changeStat(type, key, -1)}>-</button>
                <span className="stat-value">{type === 'instintos' ? formData.instintos[key] : formData.aptidoes[key]}</span>
                <button className="btn-mini" onClick={() => changeStat(type, key, 1)}>+</button>
            </div>
        </div>
    );

    const renderUpgradeRow = (label: string, key: string) => {
        const base = formData.aptidoesBase[key] || 0; 
        const total = formData.aptidoes[key] || 0; 
        const added = total - base;
        const nextCost = total === 0 ? '2XP' : total === 1 ? '4XP' : total === 2 ? '6XP' : 'MAX';
        
        return (
            <div className="stat-row" key={key}>
                <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                    <span className="stat-name" style={{color: '#ccc', fontSize: '0.85rem'}}>{label}</span>
                    <InfoTooltip textKey={key} descriptions={DESCRIPTIONS} />
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <div className="upgrade-math">
                        <span className="math-base">{base}</span>
                        +
                        <span className={`math-added ${added > 0 ? 'active' : ''}`}>{added}</span>
                        =
                        <span className="math-total">{total}</span>
                    </div>
                    <div className="stat-control">
                        <button className="btn-mini" onClick={() => handleEvolucao(key, -1)} disabled={total <= base} style={{opacity: total <= base ? 0.3 : 1}}>-</button>
                        <span className="next-cost-preview">{nextCost}</span>
                        <button className="btn-mini" onClick={() => handleEvolucao(key, 1)} disabled={total >= 3} style={{opacity: total >= 3 ? 0.3 : 1}}>+</button>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoadingData) {
        return <div className="creator-container" style={{justifyContent:'center', alignItems:'center'}}>Carregando rascunho...</div>;
    }

    return (
        <div className="creator-container">
            {/* --- MARCADOR INVISÍVEL PARA SCROLL --- */}
            {/* scrollMarginTop garante que a barra fixa do mobile não tampe o conteúdo */}
            <div ref={topRef} style={{ scrollMarginTop: '100px' }}></div> 

            <div className="wizard-header">
                <div className="wizard-title-row">
                    <h2 className="wizard-title">Criação de Infectado - {step}/3</h2>
                    <div className="wizard-steps">{[1, 2, 3].map(i => <div key={i} className={`step-indicator ${step >= i ? 'active' : ''}`}></div>)}</div>
                </div>
            </div>

            <div className="wizard-content">
                <div className="wizard-wrapper">
                    {step === 1 && (
                        <>
                            <div className="form-section compact-section">
                                <div className="header-compact" style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                                    <h3 style={{color: 'var(--cor-tema)', margin:0, borderBottom:'none'}}>Identidade</h3>
                                </div>                                
                                <div className="identity-grid">
                                    <div className="identity-col-left">
                                            
                                            <div className="input-group">
                                                <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px'}}>
                                                    <label style={{marginBottom:0, color: 'var(--cor-tema)'}}>Nome</label>
                                                    <InfoTooltip textKey="char_name" descriptions={DESCRIPTIONS} />
                                                </div>
                                                <input className="input-field" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome" />
                                            </div>

                                            <div className="input-group">
                                                <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px'}}>
                                                    <label style={{marginBottom:0, color: 'var(--cor-tema)'}}>Geração</label>
                                                    <InfoTooltip textKey="generation" descriptions={DESCRIPTIONS} />
                                                </div>
                                                <select className="input-field" value={formData.geracao} onChange={e => setFormData({...formData, geracao: e.target.value as any})}><option>Pré-Colapso</option><option>Colapso</option><option>Pós-Colapso</option></select>
                                            </div>

                                            <div className="input-group">
                                                <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px'}}>
                                                    <label style={{marginBottom:0, color: 'var(--cor-tema)'}}>Ocupação</label>
                                                    <InfoTooltip textKey="occupation" descriptions={DESCRIPTIONS} />
                                                </div>
                                                <input className="input-field" value={formData.ocupacao} onChange={e => setFormData({...formData, ocupacao: e.target.value})} />
                                            </div>

                                            <div className="input-group">
                                                <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px'}}>
                                                    <label style={{marginBottom:0, color: 'var(--cor-tema)'}}>Evento Marcante</label>
                                                    <InfoTooltip textKey="defining_event" descriptions={DESCRIPTIONS} />
                                                </div>
                                                <input className="input-field" value={formData.evento} onChange={e => setFormData({...formData, evento: e.target.value})} />
                                            </div>
                                    </div>
                                    <div className="identity-col-right">
                                            <div className="input-group">
                                                <label style={{color: 'var(--cor-tema)'}}>Foto</label>
                                                <div className="avatar-upload-container">
                                                    <div className="avatar-preview-circle" style={{ backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none' }}>
                                                        {!avatarPreview && <span className="avatar-placeholder-icon">?</span>}
                                                    </div>
                                                    <div className="avatar-controls">
                                                        <input type="file" id="avatar-upload-input" accept=".png, .gif, .webp" onChange={handleImageChange} style={{ display: 'none' }} />
                                                        <label htmlFor="avatar-upload-input" className="btn-upload-custom">Escolher Arquivo</label>
                                                        <span className="avatar-help-text">Aceita: .WEBP, .PNG, .GIF (Máx 2MB)</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px'}}>
                                                <label style={{color:'#88aacc', fontSize:'0.85rem', marginBottom:0}}>Descrição</label>
                                                <InfoTooltip textKey="visual_description" descriptions={DESCRIPTIONS} />
                                            </div>
                                            <textarea className="input-field text-area-full" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} /></div>
                                </div>
                            </div>
                            <div className="form-section compact-section">
                                <div className="header-compact">
                                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                        <h3 style={{color: 'var(--cor-tema)', margin:0, borderBottom:'none'}}>Propósitos</h3>
                                        <InfoTooltip textKey="purposes" descriptions={DESCRIPTIONS} />
                                    </div>
                                </div>
                                <div className="stats-grid-container">
                                    <div>
                                        <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px'}}>
                                            <h4 className="subtitle-std" style={{margin:0, color: 'var(--cor-tema)'}}>Pessoais</h4>
                                            <InfoTooltip textKey="personal_purpose" descriptions={DESCRIPTIONS} />
                                        </div>
                                        <input className="input-field mb-2" placeholder="Propósito 1" value={formData.p1} onChange={e => setFormData({...formData, p1: e.target.value})} /><input className="input-field" placeholder="Propósito 2" value={formData.p2} onChange={e => setFormData({...formData, p2: e.target.value})} />
                                    </div>
                                    <div>
                                        <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px'}}>
                                            <h4 className="subtitle-std" style={{margin:0, color: 'var(--cor-tema)'}}>Coletivos</h4>
                                            <InfoTooltip textKey="collective_purpose" descriptions={DESCRIPTIONS} />
                                        </div>
                                        <input className="input-field mb-2" placeholder="Propósito 1" value={formData.c1} onChange={e => setFormData({...formData, c1: e.target.value})} /><input className="input-field" placeholder="Propósito 2" value={formData.c2} onChange={e => setFormData({...formData, c2: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="form-section compact-section">
                                <div className="header-compact" style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                        <h3 style={{color: 'var(--cor-tema)', margin:0, borderBottom:'none'}}>Instintos</h3>
                                        <InfoTooltip textKey="instincts" descriptions={DESCRIPTIONS} />
                                    </div>
                                    <span className="points-remaining">Pontos: {pontosInstintos}</span>
                                </div>
                                <div className="stats-grid-3col">{renderStatRow('Influência', 'influencia', 'instintos')}{renderStatRow('Percepção', 'percepcao', 'instintos')}{renderStatRow('Potência', 'potencia', 'instintos')}{renderStatRow('Reação', 'reacao', 'instintos')}{renderStatRow('Resolução', 'resolucao', 'instintos')}{renderStatRow('Sagacidade', 'sagacidade', 'instintos')}</div>
                            </div>
                            <div className="form-section compact-section">
                                <div className="header-compact" style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                                    <div style={{display:'flex', alignItems:'center', gap: '5px'}}>
                                        <h3 style={{color: 'var(--cor-tema)', margin:0, borderBottom:'none'}}>Aptidões</h3>
                                        <InfoTooltip textKey="aptitudes" descriptions={DESCRIPTIONS} />
                                    </div>
                                    <span className="points-remaining">Pontos: {pontosAptidoes}</span>
                                </div>
                                <div className="aptitudes-split-row compact-gap">
                                    <div className="compact-col">
                                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', marginBottom:'5px', gap:'5px'}}>
                                            <h4 className="subtitle-std text-center" style={{margin:0, color: 'var(--cor-tema)'}}>Conhecimentos</h4>
                                            <InfoTooltip textKey="knowledge" descriptions={DESCRIPTIONS} />
                                        </div>
                                        <div className="stats-list-vertical">{['biologia','erudicao','engenharia','geografia','medicina','seguranca'].map(k => renderStatRow(NAME_MAP[k], k, 'aptidoes'))}</div>
                                    </div>
                                    <div className="compact-col">
                                        <div style={{display:'flex', justifyContent:'center', alignItems:'center', marginBottom:'5px', gap:'5px'}}>
                                            <h4 className="subtitle-std text-center" style={{margin:0, color: 'var(--cor-tema)'}}>Práticas</h4>
                                            <InfoTooltip textKey="practices" descriptions={DESCRIPTIONS} />
                                        </div>
                                        <div className="stats-list-vertical">{['armas','atletismo','expressao','furtividade','manufaturas','sobrevivencia'].map(k => renderStatRow(NAME_MAP[k], k, 'aptidoes'))}</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <div className="step3-grid">
                            <div className="step3-col-left">
                                <div className="form-section characteristics-container">
                                    <div className="header-compact" style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                        <h3 style={{color: 'var(--cor-tema)', margin:0, borderBottom:'none'}}>Características</h3>
                                        <InfoTooltip textKey="characteristics" descriptions={DESCRIPTIONS} />
                                    </div>
                                    <div className="characteristics-list">
                                        {characteristicsList.length === 0 ? <p style={{padding:'20px', color:'#666'}}>Sem regras...</p> : 
                                         characteristicsList.map(char => {
                                            const isChecked = formData.caracteristicas.includes(char.id);
                                            const isLocked = !checkAllReqs(char.requirements) && !isChecked;
                                            return (
                                                <div key={char.id} className={`carac-row ${isLocked ? 'locked' : ''}`} onClick={() => !isLocked && toggleCharacteristic(char.id, char.cost, char.requirements)}>
                                                    <label className="circular-checkbox-container"><input type="checkbox" checked={isChecked} readOnly /><span className={`circular-checkmark ${isLocked ? 'locked-check' : ''}`}></span></label>
                                                    <div className="carac-info">
                                                        <div className="carac-name" style={{color: isChecked ? 'var(--cor-tema)' : '#fff'}}>{char.name}</div>
                                                        <div className="carac-desc">{char.description}</div>
                                                        <div className="carac-req">
                                                            <span className="req-static">Req: </span>
                                                            {renderRequirementLabel(char.requirements)}
                                                        </div>
                                                        <div className="carac-cost">{char.cost} XP</div>
                                                    </div>
                                                </div>
                                            );
                                         })}
                                    </div>
                                </div>
                            </div>
                            <div className="step3-col-right">
                                <div className="xp-panel"><span className="xp-label">XP DISPONÍVEL</span><span className="xp-value">{formData.xpDisponivel}</span></div>
                                <div className="form-section expanded-section">
                                    <div className="header-compact">
                                        <h3 style={{color: 'var(--cor-tema)', margin:0, borderBottom:'none'}}>Evoluir Aptidões</h3>
                                        <p className="evolution-hint">0→1 (2XP) | 1→2 (4XP) | 2→3 (6XP)</p>
                                    </div>
                                    <div className="aptitudes-split-row compact-gap" style={{overflowY:'auto', flex: 1}}>
                                        <div className="compact-col" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                                            <div className="stats-list-vertical" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                                {['biologia','erudicao','engenharia','geografia','medicina','seguranca'].map(k => renderUpgradeRow(NAME_MAP[k], k))}
                                            </div>
                                        </div>
                                        <div className="compact-col" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                                            <div className="stats-list-vertical" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                                {['armas','atletismo','expressao','furtividade','manufaturas','sobrevivencia'].map(k => renderUpgradeRow(NAME_MAP[k], k))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-section compact-section kit-section">
                                    <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'10px'}}>
                                        <h3 style={{color: 'var(--cor-tema)', margin:0, borderBottom:'none'}}>Kit Inicial</h3>
                                        <InfoTooltip textKey="starting_kit" descriptions={DESCRIPTIONS} />
                                    </div>
                                    <select className="input-field" value={formData.kitName} onChange={e => setFormData({...formData, kitName: e.target.value})}>
                                        <option value="">Selecione...</option>
                                        {kitsList.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}
                                    </select>
                                    <div className="kit-items-display">{kitsList.find(k => k.name === formData.kitName)?.items_description || "Selecione um kit."}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="creator-footer">
                <button className="btn-nav btn-back" onClick={() => step > 1 ? setStep(step-1) : navigate('/dashboard/characters')} disabled={isSaving}>
                    {step === 1 ? 'Cancelar' : 'Voltar'}
                </button>
                <button className="btn-nav btn-next" onClick={handleNext} disabled={isSaving} style={{cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '10px'}}>
                    {isSaving ? 'SALVANDO...' : step === 3 ? 'FINALIZAR' : 'PRÓXIMO'}
                </button>
            </div>

            {modalState.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-title">{modalState.title}</div>
                        <div className="modal-message">{modalState.message}</div>
                        <button className="modal-btn" onClick={closeModal}>Entendido</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CharacterCreatorBoard;