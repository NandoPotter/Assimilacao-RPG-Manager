/** ============================================================
 * ARQUIVO: src/Pages/DashboardContents/Characters.tsx
 * DESCRIÇÃO: Frontend do Dashboard - Listagem de Personagens (Final)
 * ============================================================ */

import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { type Character } from '../../../../interfaces/Gameplay';
import { characterService } from '../../../../services/characterService';
import './Styles.css';

// Constantes de Limite
const MAX_DRAFTS = 5;
const MAX_ACTIVE = 15;

function CharactersBoard() {
  const navigate = useNavigate();
  
  const [chars, setChars] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. CARREGAR DADOS AO INICIAR
  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const data = await characterService.listMyCharacters();
      setChars(data);
    } catch (error) {
      console.error("Erro ao carregar personagens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtros
  const activeChars = chars.filter(c => c.status !== 'Em Criação');
  const draftChars = chars.filter(c => c.status === 'Em Criação');

  // 2. LÓGICA DE CRIAÇÃO
  const handleNewCharacter = () => {
    if (draftChars.length >= MAX_DRAFTS) {
        alert(`Limite de ${MAX_DRAFTS} rascunhos atingido. Termine ou exclua um existente.`);
        return;
    }
    if (activeChars.length >= MAX_ACTIVE) {
        alert("Limite de personagens ativos atingido.");
        return;
    }
    navigate('/dashboard/character-creator');
  };

  // 3. LÓGICA DE DELETE
  const handleDelete = async (id: string) => {
      if(confirm("Tem certeza que deseja apagar este registro permanentemente?")) {
          try {
            await characterService.deleteCharacter(id);
            setChars(prev => prev.filter(c => c.id !== id));
          } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Não foi possível excluir o personagem.");
          }
      }
  }

  // --- CARD COMPONENT ---
  const CharacterCard = ({ char, isDraft }: { char: Character, isDraft?: boolean }) => {
    
    // Safety Checks
    const determination = char.vitals?.determination?.current ?? 1;
    const assimilation = char.vitals?.assimilation?.current ?? 0;
    const initialLetter = char.name ? char.name.charAt(0).toUpperCase() : '?';

    return (
      <div className={`char-card ${isDraft ? 'card-draft' : ''}`}>
          
          {/* CABEÇALHO */}
          <div className="card-header">
              <div className="header-stats-stack">
                  <span className="stat-item" title="Determinação">DET {determination}</span>
                  <span className="stat-item" title="Assimilação">ASS {assimilation}</span>
              </div>

              <div className="header-name">
                  {char.name}
              </div>
              
              <div className="header-status">
                  <p style={{fontSize: '0.75rem'}}>
                    <span style={{ 
                      color: char.status === 'Saudável' ? '#5f5' :
                             char.status === 'Escoriado' ? '#5f5' :
                             char.status === 'Lacerado' ? '#fa0' :
                             char.status === 'Ferido' ? '#fa0' :
                             char.status === 'Debilitado' ? 'rgba(121, 24, 24, 1)' :
                             char.status === 'Incapacitado' ? 'rgba(121, 24, 24, 1)' :
                             char.status === 'Morto' ? '#555' :
                             char.status === 'Em Criação' ? '#88aacc' : '#88aacc' ,
                      fontSize: '1.2rem',
                      lineHeight: 0
                    }} title={char.status}>
                      ● </span>
                    {char.status}
                  </p>
                  
              </div>
          </div>

          {/* CORPO DO CARD */}
          <div className="card-body">
              <div className="char-avatar-placeholder">
                  {char.avatar_url ? (
                    <img src={char.avatar_url} alt={char.name} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} />
                  ) : (
                    initialLetter
                  )}
              </div>              
          </div>

          {/* RODAPÉ (Botões de Ação) */}
          <div className="card-footer">
              <button className="btn-trash" onClick={() => handleDelete(char.id)} title="Excluir">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
              
              {isDraft ? (
                  // Rascunho -> Vai para o Criador
                  <NavLink 
                      to={`/dashboard/character-creator/${char.id}`} 
                      className="btn-card-action btn-continue"
                      style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                      CONTINUAR
                  </NavLink>
              ) : (
                  // Ativo -> Vai para a Ficha Interativa (CORRIGIDO AQUI)
                  <NavLink 
                      to={`/dashboard/sheet/${char.id}`}
                      className="btn-card-action btn-play"
                      style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                      ABRIR
                  </NavLink>
              )}
          </div>
      </div>
    );
  };

  if (isLoading) {
    return (
        <div className="chars-page-container" style={{display:'flex', justifyContent:'center', paddingTop:'50px'}}>
            <p style={{color:'#666'}}>Carregando registros...</p>
        </div>
    );
  }

  return (
    <div className="chars-page-container">
            
      <header className="chars-header">
        <div>
            <h1 className="chars-title">Meus Personagens</h1>
        </div>
        
        <button className="btn-new-char" onClick={handleNewCharacter}>
          <span style={{fontSize:'1.2rem', lineHeight:0, marginRight: '5px'}}>+</span> 
          NOVO
        </button>
      </header>

      {/* ÁREA DE RASCUNHOS */}
      {draftChars.length > 0 && (
          <section className="drafts-section">
              <div className="drafts-header-row">
                  <h2 className="section-label">EM CRIAÇÃO ({draftChars.length}/{MAX_DRAFTS})</h2>
                  <div className="divider-line"></div>
              </div>
              
              <div className="chars-grid">
                {draftChars.map((char) => (
                    <CharacterCard char={char} key={char.id} isDraft={true} />
                ))}
              </div>
          </section>
      )}


      <div className="active-section-divider">
          <div className="text-group">
              <h2 className="section-label">ATIVOS</h2>            
              <p className="chars-subtitle">{activeChars.length} / {MAX_ACTIVE} Ativos</p>
          </div>
          
          <div className="divider-line"></div>
      </div>

      {activeChars.length === 0 ? (
        <div className="empty-state">
           {draftChars.length === 0 && (
               <>
                <h2>Nenhum registro encontrado.</h2>
                <p>O sistema não detectou assinaturas vitais.</p>
               </>
           )}
        </div>
      ) : (
        <div className="chars-grid">
          {activeChars.map((char) => (
             <CharacterCard char={char} key={char.id} />
          ))}
        </div>
      )}

    </div>
  );
}

export default CharactersBoard;