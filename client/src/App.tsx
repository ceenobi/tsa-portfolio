import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { Bounce, ToastContainer } from 'react-toastify';
import { queryClient } from './lib/utils';
import { router } from './routes';

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop={true}
        closeOnClick={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </>
  )
}

export default App
