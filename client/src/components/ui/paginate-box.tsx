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

// 28px visuals, 44px hit areas (invisible expansion keeps the look).
const hitArea =
	"relative before:absolute before:-inset-2 before:content-['']";

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
							hitArea,
							page === 1
								? "bg-muted text-muted-foreground opacity-60"
								: "bg-mainBlue text-white hover:bg-mainBlue/90",
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
									"size-7 border-transparent bg-transparent text-sm font-medium text-muted-foreground hover:bg-transparent hover:underline",
									hitArea,
									item === page && "font-semibold text-destructive",
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
							hitArea,
							page === totalPages
								? "bg-muted text-muted-foreground opacity-60"
								: "bg-mainBlue text-white hover:bg-mainBlue/90",
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
