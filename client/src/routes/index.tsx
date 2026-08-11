import ErrorBoundary from '@/components/error-boundary'
import SuspenseUi from '@/components/ui/suspense-ui'
import { createBrowserRouter, type RouteObject } from 'react-router'
import MainLayout from './main/layout'
import Root from './root/layout'
import AuthLayout from './auth/layout'

const routes = [
  {
    path: '/',
    Component: Root,
    ErrorBoundary,
    hydrateFallbackElement: <SuspenseUi />,
    handle: {
      seo: {
        title: 'Techstudio Portfolio',
        description: 'See what our students are building.',
      },
    },
    children: [
      {
        Component: MainLayout,
        children: [
          {
            index: true,
            handle: {
              seo: {
                title: 'Home',
                description: 'See what our students are building.',
              },
            },
            lazy: async () => {
              const { default: Component } = await import('@/routes/main/home')
              return { Component }
            },
          },
          {
            path:'about'
          }
        ],
      },
      {
        path: '/auth',
        Component: AuthLayout,
        ErrorBoundary,
        hydrateFallbackElement: <SuspenseUi />,
        children: [
          {
            path: 'login',
            handle: {
              seo: {
                title: 'Login - Techstudio Academy Portfolio',
                description: 'Login to your account.',
              },
            },
            lazy: async () => {
              const { default: Component } = await import('@/routes/auth/login')
              return { Component }
            },
          },
          {
            path: 'register',
            handle: {
              seo: {
                title: 'Register - Techstudio Academy Portfolio',
                description: 'Register for an admin account.',
              },
            },
            lazy: async () => {
              const { default: Component } = await import('@/routes/auth/register')
              return { Component }
            },
          },
        ],
      },
    ],
  },
] satisfies RouteObject[]

export const router = createBrowserRouter(routes)
