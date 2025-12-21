// ============================================================================
// src/router.tsx
// Configuração das Rotas da Aplicação
// ============================================================================

import { createBrowserRouter } from 'react-router-dom';

// Pagina para direcionamento das rotas teste no frontend
import HomePage from './testEnvironments/TestPage'

// Importação das Páginas
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/Auth/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'

// Dashboard Contents
import OverviewBoard from './pages/Dashboard/OverviewBoard'

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
      }
    ]
  }
])