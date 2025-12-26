/** ============================================================
 * ARQUIVO: src/pages/Auth/LoginPage.tsx
 * DESCRIÇÃO: Interface de autenticação
 * ============================================================ */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Styles.css';

import {
  coreAppName,
  coreAppVersion,
  coreAppAuthor,
  coreAppFunction,
  coreAppMode
} from '../../core/SystemConstants';

import logoImg from '../../assets/LogoAssimilacao.png';

function LoginPage() {
  const navigate = useNavigate();

  // SEÇÃO: ESTADOS PRINCIPAIS
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // SEÇÃO: ESTADOS DOS MODAIS
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  
  // Modal de serviço indisponível
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);

  // SEÇÃO: ESTADOS DE CADASTRO
  const [newUserName, setNewUserName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // LÓGICA: LOGIN
  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
    
    if (!email || !password) {
        alert("Preencha email e senha");
        return;
    }

    setIsLoading(true);

    try {
      await authService.login(email, password);
      navigate('/dashboard');

    } catch (error: any) {
      console.error("ERRO CRÍTICO NO LOGIN:", error);
      alert("Erro ao entrar: " + (error.message || "Erro desconhecido"));

    } finally {
      setIsLoading(false);
    }
  };

  // LÓGICA: REGISTRO (BLOQUEADA)
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
        alert("As senhas não coincidem. Por favor, verifique.");
        return;
    }

    setIsLoading(true);
    
    // Simula delay e mostra indisponível
    setTimeout(() => {
        setIsLoading(false);
        setShowRegisterModal(false);
        setShowUnavailableModal(true);
    }, 800);
  };

  // LÓGICA: RECUPERAÇÃO DE SENHA (BLOQUEADA)
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    // Simula delay e mostra indisponível
    setTimeout(() => {
        setIsLoading(false);
        setShowForgotModal(false);
        // Ao invés de sucesso, mostra o modal de indisponível
        setShowUnavailableModal(true);
    }, 800);
  };

  return (
    <div className="auth-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      
      {/* OVERLAY DE CARREGAMENTO */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processando...</p>
        </div>
      )}

      {/* ALTERAÇÃO AQUI: Adicionado display flex column para garantir que fiquem um embaixo do outro */}
      <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="auth-box">
          
          {/* CABEÇALHO */}
          <div className="auth-header">
            <img src={logoImg} alt="Logo" className="auth-logo" />
            <h1 className="auth-title">{coreAppName}</h1>
            <p className="auth-subtitle">{coreAppFunction}</p>
            <p className="auth-mode">{coreAppMode}</p>
          </div>

          {/* FORMULÁRIO DE LOGIN */}
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-form-group">
              <label className="auth-label">Email:</label>
              <input
                type="email"
                className="auth-input"
                placeholder="Digite seu email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Senha:</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Digite sua senha"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <button type="button" className="link-btn" onClick={() => setShowForgotModal(true)}>
                Esqueci minha senha.
              </button>
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="auth-register-link">
              <span>Não tem uma conta? </span>
              <button type="button" className="link-btn" onClick={() => setShowRegisterModal(true)}>
                Cadastre-se aqui.
              </button>
            </div>
          </form>

          {/* RODAPÉ DO BOX */}
          <div className="auth-footer">
            <span>© {new Date().getFullYear()} - {coreAppAuthor}</span>
            <span>Versão {coreAppVersion}</span>
          </div>
        </div>

        {/* --- DISCLAIMER / AVISO LEGAL --- */}
        <div style={{
            marginTop: '2rem',
            maxWidth: '500px',
            textAlign: 'center',
            color: '#6b7280', 
            fontSize: '0.75rem',
            lineHeight: '1.4',
            borderTop: '1px solid #374151',
            paddingTop: '1rem'
        }}>
            {/* ALTERAÇÃO AQUI: Cor vermelha adicionada */}
            <p style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#ef4444' }}>
                Aviso Legal / Disclaimer
            </p>
            <p>
                Este é um projeto <strong>não oficial (Fan-Made)</strong>, sem fins lucrativos, 
                desenvolvido para fins de estudo e apoio à comunidade. 
            </p>
            <p style={{ marginTop: '0.5rem' }}>
                "Assimilação RPG", seus logotipos e terminologias são propriedade intelectual de seus criadores.
            </p>
        </div>

      </div>

      {/* MODAL: CADASTRO */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">Cadastro de Usuário</h2>
            <form onSubmit={handleRegisterUser}>
              <input
                type="text"
                placeholder="Username"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirme sua senha"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ 
                    marginTop: '10px',
                    borderColor: (confirmPassword && newPassword !== confirmPassword) ? 'red' : '' 
                }}
              />
              
              <div className="modal-password-buttons">
                <button type="submit" className="auth-button">Cadastrar</button>
                <button type="button" className="modal-cancel-btn" onClick={() => setShowRegisterModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ESQUECI SENHA */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">Recuperar Senha</h2>
            <form onSubmit={handleSendEmail}>
              <input type="email" placeholder="Digite seu email" required />
              <div className="modal-password-buttons">
                <button type="submit" className="auth-button">Enviar link</button>
                <button type="button" className="modal-cancel-btn" onClick={() => setShowForgotModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOVO MODAL: SERVIÇO INDISPONÍVEL (GENÉRICO PARA CADASTRO E RECOVERY) */}
      {showUnavailableModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ border: '1px solid #eab308' }}>
            <h2 className="modal-title" style={{ color: '#eab308' }}>Funcionalidade Indisponível</h2>
            <p style={{ marginTop: '1rem', color: '#d1d5db' }}>
                Obrigado pelo interesse!
                <br /><br />
                No momento, o <strong>registro de novos usuários</strong> e a <strong>recuperação de conta</strong> estão desabilitados, pois estamos em fase de testes fechados (Protótipo Alpha).
            </p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#9ca3af' }}>
                Se você faz parte da equipe oficial do Assimilação, utilize as credenciais de teste fornecidas.
            </p>
            <button 
                type="button" 
                className="auth-button" 
                style={{ marginTop: '1.5rem', backgroundColor: '#374151' }}
                onClick={() => setShowUnavailableModal(false)}
            >
                Entendi
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default LoginPage;