import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { toast } from 'react-toastify'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'

const COURSES = [
  'Front End Development',
  'Android Development',
  'UI/UX Design',
  'Full Stack Development',
  'Data Science',
]

const ABOUT_LINKS = ['Blog', 'Partnership', 'FAQs', 'Privacy Policy', 'Contact Us']

function comingSoon() {
  toast.info('Coming soon!')
}

function SocialIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current">
      <path d={path} />
    </svg>
  )
}

const SOCIALS = [
  {
    label: 'Twitter',
    path: 'M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.078 3.878-.767-.025-1.49-.235-2.122-.586-.002.02-.002.04-.002.06 0 2.258 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.096 7.14 2.096 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z',
  },
  {
    label: 'Facebook',
    path: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z',
  },
  {
    label: 'LinkedIn',
    path: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45z',
  },
]

export default function Footer() {
  const [email, setEmail] = useState('')

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    toast.info('Coming soon!')
    setEmail('')
  }

  return (
    <footer className="bg-blue-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:py-[60px] sm:px-6 lg:px-[100px]">
        <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-white/70">
              1, Ogunlesi Street, Awoyokun Bus Stop, Onipanu, Lagos.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold">Courses</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {COURSES.map((course) => (
                <li key={course}>
                  <button type="button" onClick={comingSoon} className="hover:text-white">
                    {course}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold">About Us</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {ABOUT_LINKS.map((link) => (
                <li key={link}>
                  <button type="button" onClick={comingSoon} className="text-white">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold">Subscribe to our newsletter</h3>
            <form
              onSubmit={handleSubscribe}
              className="mt-4 flex items-center gap-2 rounded-lg bg-white p-1.5  "
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full min-w-0 bg-transparent px-2 text-sm text-muted-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                className="h-auto shrink-0 gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
              >
                Subscribe
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col w-full justify-end  items-center  gap-[42px] border-t border-t-[1.4px] border-white pt-6 sm:flex-row">
          <button
            type="button"
            onClick={comingSoon}
            className="align-middle font-sans text-[16px] font-normal tracking-[0.2px] text-white leading-[28.8px] hover:text-white [leading-trim:none]"
          >
            Terms and Policy
          </button>

          <div className="flex items-center gap-[33px]">
            {SOCIALS.map((social) => (
              <button
                key={social.label}
                type="button"
                onClick={comingSoon}
                aria-label={social.label}
                className="text-white hover:text-white"
              >
                <SocialIcon path={social.path} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
