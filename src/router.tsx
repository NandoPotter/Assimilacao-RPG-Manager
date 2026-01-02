/** ============================================================================
 * ARQUIVO: src/router.tsx
 * DESCRIÇÃO: Configuração das Rotas com HashRouter (suporte total GitHub Pages)
 * ============================================================================ */

import { createHashRouter } from 'react-router-dom';

// Importação das Páginas
import RootRedirect from './pages/Auth/Index';
import NotFoundPage from './pages/NotFoundPage/Index';
import LoginPage from './pages/Login/Index';
import DashboardLayout from './pages/Dashboard/Index';

// Dashboard Contents
import OverviewBoard from './pages/Dashboard/OverviewBoard/Index';
import CharactersPage from './pages/Dashboard/contents/Characters/Index';
import CharacterCreatorBoard from './pages/Dashboard/contents/CharacterCreator/Index';
import CharacterSheetBoard from './pages/Dashboard/contents/CharacterSheet/Index';

// Dashboard Assimilator Contentes
import ThreatCreator from './pages/Dashboard/contentesAssimilator/ThreatCreator';
import ItemManager from './pages/Dashboard/contentesAssimilator/ItemManager';
import WorldManager from './pages/Dashboard/contentesAssimilator/WorldManager'

export const Router = createHashRouter([
  {
    path: '/',
    element: <RootRedirect />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <OverviewBoard />,
      },
      {
        path: 'infectados',
        element: <CharactersPage />,
      },
      {
        path: 'criador-de-infectado/:id?',
        element: <CharacterCreatorBoard />,
      },
      {
        path: 'ficha-interativa/:id',
        element: <CharacterSheetBoard />,
      },

      // ASSIMILADOR
      
      {
        path: 'gestao-de-ameacas',
        element: <ThreatCreator />,
      },
      {
        path: 'gestao-de-itens',
        element: <ItemManager />
      },
      {
        path: 'gestao-de-mundo',
        element: <WorldManager />
      }
    ]
  }
]);