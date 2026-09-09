import { Button } from "@/components/ui/button";

// Inline fetch-failure state: announced on mount, with a retry action.
// Use for errors only — empty results get their own empty-state UI.
export default function QueryError({
	message = "Couldn't load data. Please try again.",
	onRetry,
}: {
	message?: string;
	onRetry?: () => void;
}) {
	return (
		<div
			role="alert"
			className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-input bg-white/50 px-6 py-12 text-center"
		>
			<p className="text-sm text-muted-foreground">{message}</p>
			{onRetry && (
				<Button type="button" variant="outline" onClick={onRetry}>
					Try again
				</Button>
			)}
		</div>
	);
}
