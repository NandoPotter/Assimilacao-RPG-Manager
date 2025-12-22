// ============================================================================
// src/router.tsx
// Configuração das Rotas da Aplicação
// ============================================================================

import { createBrowserRouter } from 'react-router-dom';

// Pagina para direcionamento das rotas teste no frontend
import HomePage from './testEnvironments/TestPage'

// Importação das Páginas
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/Auth/Index'
import DashboardLayout from './pages/Dashboard/Index'

// Dashboard Contents
import OverviewBoard from './pages/Dashboard/contents/OverviewBoard'
import CharactersPage from './pages/Dashboard/contents/Characters/Index'
import CharacterCreatorBoard from './pages/Dashboard/contents/CharacterCreator/Index'
import CharacterSheetBoard from './pages/Dashboard/contents/CharacterSheet/Index'

// Definição das Rotas

export const Router = createBrowserRouter([
  {
    path: '/testenv',
    element: <HomePage />,
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
        path: 'character-creator/:id?',
        element: <CharacterCreatorBoard />,
      },
      {
        path: 'sheet/:id',
        element: <CharacterSheetBoard />,
      }
    ]
  }
])