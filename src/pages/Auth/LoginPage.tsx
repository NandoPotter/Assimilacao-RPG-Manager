/** ============================================================
 * ARQUIVO: src/pages/Auth/LoginPage.tsx
 * DESCRIÇÃO: Interface de autenticação integrada ao Supabase.
 * ============================================================ */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './LoginPage.css';

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

  // SEÇÃO: ESTADOS DE CADASTRO
  const [newUserName, setNewUserName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // LÓGICA: LOGIN REAL
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      alert("Erro ao entrar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // LÓGICA: REGISTRO REAL
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.register(newEmail, newPassword, newUserName);
      setShowRegisterModal(false);
      setShowRegisterSuccess(true);
    } catch (error: any) {
      alert("Erro ao cadastrar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setShowForgotModal(false);
    setShowSendEmail(true);
  };

  return (
    <div className="auth-page">
      
      {/* OVERLAY DE CARREGAMENTO */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processando...</p>
        </div>
      )}

      <div className="auth-container">
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

          {/* RODAPÉ */}
          <div className="auth-footer">
            <span>© {new Date().getFullYear()} - {coreAppAuthor}</span>
            <span>Versão {coreAppVersion}</span>
          </div>
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

      {/* MODAIS DE SUCESSO */}
      {showRegisterSuccess && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">Cadastro Realizado!</h2>
            <p>Sua conta foi criada. Faça login para continuar.</p>
            <button type="button" className="auth-button" onClick={() => setShowRegisterSuccess(false)}>Fechar</button>
          </div>
        </div>
      )}

      {showSendEmail && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">Email Enviado!</h2>
            <p>Verifique sua caixa de entrada.</p>
            <button type="button" className="auth-button" onClick={() => setShowSendEmail(false)}>Fechar</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default LoginPage;