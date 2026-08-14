import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'

export default function CtaSection() {
  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-[100px] bg-[#D0D0D0]/10 pt-[85px]">
      <div className="relative mx-auto min-h-[413px] max-w-7xl overflow-hidden rounded-2xl bg-[hsla(215,98%,48%,0.1)]">
        <img
          className="absolute top-0 left-0 w-24 sm:w-32 lg:w-48"
          src="/images/leftStar.svg"
          alt=""
        />
        <img
          className="absolute right-0 bottom-0 w-24 sm:w-32 lg:w-48"
          src="/images/rightStar.svg"
          alt=""
        />

        <div className="relative z-10 flex h-full min-h-[413px] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl lg:text-5xl">
            Start your journey in tech and build projects that shape the
            future.
          </h2>
          <Button
            onClick={() => toast.info("Coming soon!")}
            className="h-10 rounded-md bg-blue-600 px-6 text-sm text-white hover:bg-blue-500"
          >
            Join Us Now
          </Button>
        </div>
      </div>
    </section>
  );
}
