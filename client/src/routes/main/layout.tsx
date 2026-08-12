import Footer from '@/components/footer'
import Nav from '@/components/nav'
import { Outlet } from 'react-router'

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
