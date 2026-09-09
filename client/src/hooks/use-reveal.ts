import { useEffect, useRef } from "react";

/**
 * Adds `.reveal-visible` to the referenced element once it enters the
 * viewport (IntersectionObserver, threshold 0.1). Observer disconnects
 * after the first intersection — this is a one-shot reveal.
 *
 * The element must carry the `.reveal` base class in markup or via CSS.
 */
export function useReveal<T extends HTMLElement>() {
	const ref = useRef<T>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReduced) {
			el.classList.add("reveal-visible");
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					el.classList.add("reveal-visible");
					observer.disconnect();
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return ref;
}
