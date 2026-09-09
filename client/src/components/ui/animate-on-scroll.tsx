import type { HTMLAttributes, ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

interface AnimateOnScrollProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	/** Delay in ms before the animation starts (for staggering). */
	delay?: number;
}

/**
 * Wrapper that fades + translates its children into view on scroll.
 * Uses the `useReveal` hook (IntersectionObserver, one-shot).
 *
 * Respects prefers-reduced-motion — under reduced motion the element
 * renders immediately without transition.
 */
export function AnimateOnScroll({
	children,
	delay,
	className,
	...rest
}: AnimateOnScrollProps) {
	const ref = useReveal<HTMLDivElement>();

	return (
		<div
			ref={ref}
			className={cn("reveal", className)}
			style={delay ? { "--reveal-delay": `${delay}ms` } as React.CSSProperties : undefined}
			{...rest}
		>
			{children}
		</div>
	);
}
