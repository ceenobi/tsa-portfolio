import Footer from '@/components/ui/footer';
import Nav from '@/components/ui/nav';
import { Outlet } from 'react-router';

export default function MainLayout() {
  return (
    <>
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
