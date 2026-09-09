import { cn } from "@/lib/utils";

// Single status pill used by the dashboard table + mobile cards.
export default function StatusBadge({
	status,
	styles,
}: {
	status: string;
	styles?: string;
}) {
	return (
		<span
			className={cn(
				"w-fit rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
				styles ?? "bg-muted text-mainGray",
			)}
		>
			{status}
		</span>
	);
}
