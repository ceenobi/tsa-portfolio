import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./button";


export default function NotFound() {
  return (
      <section className="mx-auto max-w-7xl px-4 py-25 sm:px-6 lg:px-25">
				<div className="mx-auto max-w-xl rounded-[30px] border border-border bg-card px-6 py-16 text-center shadow-sm sm:px-12">
					<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-mainBlue/10">
						<SearchX className="size-7 text-mainBlue" />
					</div>
					<h1 className="mt-6 text-2xl font-bold tracking-tight">
						Project not found
					</h1>
					<p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
						This project may have been removed or is not published.
					</p>
					<Button
						size="lg"
						nativeButton={false}
						render={<Link to="/" />}
						className="mt-8 h-10 bg-mainBlue px-6 text-sm text-white hover:bg-mainBlue/90"
					>
						<ArrowLeft /> Back to showcase
					</Button>
				</div>
			</section>
  );
}
