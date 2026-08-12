import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'

export default function CtaSection() {
  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-[100px]">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[#0266F41A] relative h-[413px]">
        <img className='absolute ' src="/images/leftStar.svg" alt="" />
        <img className='absolute right-0 bottom-0' src="/images/rightStar.svg" alt="" />

        <div className="flex h-full flex-col justify-center relative z-10 items-center gap-6 px-6 py-16 text-center">
          <h2 className="max-w-2xl text-[50px] font-extrabold tracking-tight text-blue-950 sm:text-4xl">
            Start your journey in tech <br /> and build projects <br /> that shape the future.
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
