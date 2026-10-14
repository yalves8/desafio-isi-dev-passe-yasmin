import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { LoginPage } from '@/pages/login/login-page'
import { NotFoundPage } from '@/pages/not-found/not-found-page'
import { RegisterPage } from '@/pages/register/register-page'
import { RoomFormPage } from '@/pages/room-form/room-form-page'
import { RoomsPage } from '@/pages/rooms/rooms-page'
import { UserFormPage } from '@/pages/user-form/user-form-page'
import { UsersPage } from '@/pages/users/users-page'
import { PrivateRoute, PublicOnlyRoute } from './private-route'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/cadastro', element: <RegisterPage /> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/salas" replace /> },
          { path: '/salas', element: <RoomsPage /> },
          {
            element: <PrivateRoute roles={['ADMIN']} />,
            children: [
              { path: '/salas/nova', element: <RoomFormPage /> },
              { path: '/salas/:id/editar', element: <RoomFormPage /> },
              { path: '/usuarios', element: <UsersPage /> },
              { path: '/usuarios/novo', element: <UserFormPage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
