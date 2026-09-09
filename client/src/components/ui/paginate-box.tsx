import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getPageNumbers } from "@/lib/utils";
import { buttonVariants } from "./button-variants";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
} from "./pagination";

type PaginateBoxProps = {
	page: number | undefined;
	totalPages: number | undefined;
	onPageChange: (page: number) => void;
};

export default function PaginateBox({ page, totalPages, onPageChange }: PaginateBoxProps) {
	return (
		<Pagination className="mx-0 w-auto justify-end">
			<PaginationContent className="gap-1.75">
				<PaginationItem>
					<button
						type="button"
						aria-label="Go to previous page"
						disabled={page === 1}
						className={cn(
							buttonVariants({ variant: "ghost", size: "icon" }),
							"size-7 rounded-md border-transparent",
							page === 1
								? "bg-muted text-muted-foreground opacity-60"
								: "bg-[#1988FE] text-white hover:bg-[#1988FE]/90",
						)}
						onClick={() => onPageChange(Math.max(1, page - 1))}
					>
						<ChevronLeft />
					</button>
				</PaginationItem>

				{getPageNumbers(page, totalPages).map((item, index) =>
					item === "ellipsis" ? (
						<PaginationItem key={`ellipsis-${index}`}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={item}>
							<button
								type="button"
								aria-label={`Go to page ${item}`}
								aria-current={item === page ? "page" : undefined}
								disabled={item === page}
								className={cn(
									buttonVariants({ variant: "ghost", size: "icon" }),
									"size-7 border-transparent bg-transparent text-sm font-medium text-[#878789] hover:bg-transparent hover:underline",
									item === page && "font-semibold text-[#E00017]",
								)}
								onClick={() => onPageChange(item)}
							>
								{item}
							</button>
						</PaginationItem>
					),
				)}

				<PaginationItem>
					<button
						type="button"
						aria-label="Go to next page"
						disabled={page === totalPages}
						className={cn(
							buttonVariants({ variant: "ghost", size: "icon" }),
							"size-7 rounded-md border-transparent",
							page === totalPages
								? "bg-muted text-muted-foreground opacity-60"
								: "bg-[#1988FE] text-white hover:bg-[#1988FE]/90",
						)}
						onClick={() => onPageChange(Math.min(totalPages, page + 1))}
					>
						<ChevronRight />
					</button>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
