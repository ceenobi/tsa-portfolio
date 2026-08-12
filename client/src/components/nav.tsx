import { useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { Link } from 'react-router'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const COURSES = [
  'Front End Development',
  'Android Development',
  'UI/UX Design',
  'Full Stack Development',
  'Data Science',
]

function comingSoon() {
  toast.info('Coming soon!')
}

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [coursesOpen, setCoursesOpen] = useState(false)

  return (
    <header className="relative z-20 bg-[#1F2666] text-[14px]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-[100px]">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-white lg:flex">
          <Link to="/about" className="hover:text-blue-300">
            About Us
          </Link>

          <div
            className="group relative"
            onMouseEnter={() => setCoursesOpen(true)}
            onMouseLeave={() => setCoursesOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:text-blue-300"
              onClick={() => setCoursesOpen((open) => !open)}
              aria-expanded={coursesOpen}
            >
              Courses
              <ChevronDown className="size-3.5" />
            </button>

            {coursesOpen && (
              <div className="absolute left-0 top-full w-56 rounded-md border border-border bg-popover p-1 shadow-lg">
                {COURSES.map((course) => (
                  <button
                    key={course}
                    type="button"
                    onClick={comingSoon}
                    className="block w-full rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                  >
                    {course}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={comingSoon}
            className="hover:text-blue-300"
          >
            Employers
          </button>
          <button
            type="button"
            onClick={comingSoon}
            className="hover:text-blue-300"
          >
            FAQ
          </button>
          <button
            type="button"
            onClick={comingSoon}
            className="hover:text-blue-300"
          >
            Contact Us
          </button>
          <button
            type="button"
            onClick={comingSoon}
            className="hover:text-blue-300"
          >
            Portfolio
          </button>
        </nav>

        <div className="hidden lg:block">
          <Button
            onClick={comingSoon}
            className="h-9 rounded-md bg-[#0266F4] py-[12px] px-[26px] text-sm text-white hover:bg-blue-500"
          >
            Register
          </Button>
        </div>

        <button
          type="button"
          className="text-white lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div
        className={cn(
          "grid gap-1 overflow-hidden px-4 text-white transition-[grid-template-rows] duration-200 lg:hidden",
          mobileOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]",
        )}
      >
        <div className="flex min-h-0 flex-col gap-1 text-sm font-medium">
          <Link to="/about" className="rounded-md px-2 py-2 hover:bg-white/10">
            About Us
          </Link>
          {COURSES.map((course) => (
            <button
              key={course}
              type="button"
              onClick={comingSoon}
              className="rounded-md px-2 py-2 text-left hover:bg-white/10"
            >
              {course}
            </button>
          ))}
          <button
            type="button"
            onClick={comingSoon}
            className="rounded-md px-2 py-2 text-left hover:bg-white/10"
          >
            Employers
          </button>
          <button
            type="button"
            onClick={comingSoon}
            className="rounded-md px-2 py-2 text-left hover:bg-white/10"
          >
            FAQ
          </button>
          <button
            type="button"
            onClick={comingSoon}
            className="rounded-md px-2 py-2 text-left hover:bg-white/10"
          >
            Contact Us
          </button>
          <button
            type="button"
            onClick={comingSoon}
            className="rounded-md px-2 py-2 text-left hover:bg-white/10"
          >
            Portfolio
          </button>
          <Button
            onClick={comingSoon}
            className="mt-2 h-9 w-full rounded-md bg-blue-600 text-sm text-white hover:bg-blue-500"
          >
            Register
          </Button>
        </div>
      </div>
    </header>
  );
}
