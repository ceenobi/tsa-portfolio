import { useState } from "react";
import { cn } from "@/lib/utils";

type BlurImageProps = {
	src?: string;
	alt: string;
	blurSrc?: string;
	className?: string;
	imgClassName?: string;
	/** Above-the-fold images: eager load with high fetch priority (LCP). */
	eager?: boolean;
};

export function BlurImage({
	src,
	alt,
	blurSrc,
	className,
	imgClassName,
	eager = false,
}: BlurImageProps) {
	const [loaded, setLoaded] = useState(false);

	return (
		<div className={cn("relative overflow-hidden bg-muted", className)}>
			{blurSrc && !loaded && (
				<img
					src={blurSrc}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 size-full scale-110 object-cover blur-lg"
				/>
			)}
			{src && (
				<img
					src={src}
					alt={alt}
					loading={eager ? "eager" : "lazy"}
					fetchPriority={eager ? "high" : "auto"}
					onLoad={() => setLoaded(true)}
					onError={() => setLoaded(true)}
					className={cn(
						"relative size-full object-cover transition-all duration-300 motion-reduce:transition-none",
						loaded ? "opacity-100" : "opacity-0",
						imgClassName,
					)}
				/>
			)}
		</div>
	);
}
