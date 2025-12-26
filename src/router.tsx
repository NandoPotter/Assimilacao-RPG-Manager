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
/* Ajustado para a pasta 'contentesAssimilator' que aparece no seu VS Code */
import { ThreatCreator } from './pages/Dashboard/contentesAssimilator/ThreatCreator/index';

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
        path: 'characters',
        element: <CharactersPage />,
      },
      {
            path: 'ameacas',
            element: <ThreatCreator />,
        },
      {
        path: 'character-creator/:id?',
        element: <CharacterCreatorBoard />,
      },
      {
        path: 'sheet/:id',
        element: <CharacterSheetBoard />,
      }
    ]
  }
]);