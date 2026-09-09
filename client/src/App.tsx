import { QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { RouterProvider } from 'react-router';
import { queryClient } from './lib/utils';
import { router } from './routes';

// Toast UI rides in its own chunk, fetched in parallel — keeps
// react-toastify out of the initial bundle's evaluation path.
const ToastHost = lazy(() => import('./components/provider/toast-host'));

function App() {
  return (
    <>
      <Suspense fallback={null}>
        <ToastHost />
      </Suspense>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </>
  )
}

export default App
