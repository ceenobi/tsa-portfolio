import { ArrowLeft, MapPinOff } from "lucide-react";
import { Link } from "react-router";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
	return (
		<section className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
			<AnimateOnScroll>
				<div className="mx-auto max-w-xl rounded-[30px] border border-border bg-card px-6 py-16 text-center shadow-sm sm:px-12">
					<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-mainBlue/10">
						<MapPinOff className="size-7 text-mainBlue" />
					</div>
					<p className="mt-6 text-5xl font-bold tracking-tight">404</p>
					<h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
						Page not found
					</h1>
					<p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
						The page you're looking for doesn't exist or has been moved.
					</p>
					<Button
						size="lg"
						nativeButton={false}
						render={<Link to="/" />}
						className="mt-8 h-10 bg-mainBlue px-6 text-sm text-white hover:bg-mainBlue/90"
					>
						<ArrowLeft /> Back to home
					</Button>
				</div>
			</AnimateOnScroll>
		</section>
	);
}
