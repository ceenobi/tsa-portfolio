import { Outlet, ScrollRestoration, useMatches } from "react-router";
import { ProgressBar } from "@/components/provider/progress-bar";
import { Seo, type SeoHandle } from "@/components/provider/seo";

const DEFAULT_SEO = {
	title: "Techstudio Portfolio",
	description: "See what our students are building.",
};

export default function Root() {
	const matches = useMatches();
	const lastMatch = matches.at(-1);
	const seo = (lastMatch?.handle as SeoHandle | undefined)?.seo ?? DEFAULT_SEO;

	return (
		<>
			<Seo {...seo} />
			<ProgressBar />
			<ScrollRestoration />
			<Outlet />
		</>
	);
}
