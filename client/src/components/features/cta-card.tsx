import { Button } from "@/components/ui/button";

// Shared call-to-action card (home + project detail). Spacing wrappers
// stay with the callers; this owns the card itself.
export default function CtaCard() {
	return (
		<div className="relative mx-auto min-h-103.25 max-w-7xl overflow-hidden rounded-2xl bg-mainBlue/10">
			<img
				className="absolute top-0 left-0 w-24 sm:w-32 lg:w-48"
				src="/images/leftStar.svg"
				alt=""
				aria-hidden="true"
			/>
			<img
				className="absolute right-0 bottom-0 w-24 sm:w-32 lg:w-48"
				src="/images/rightStar.svg"
				alt=""
				aria-hidden="true"
			/>

			<div className="relative z-10 flex h-full min-h-103.25 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
				<h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl lg:text-5xl">
					Start your journey in tech and build projects that shape the
					future.
				</h2>
				<Button
					nativeButton={false}
					className="h-10 rounded-md bg-blue-600 px-6 text-sm text-white hover:bg-blue-500"
					render={
						<a
							href="https://www.techstudioacademy.com/register"
							rel="noopener noreferrer"
						/>
					}
				>
					Join Us Now
				</Button>
			</div>
		</div>
	);
}
