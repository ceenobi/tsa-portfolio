import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getPageNumbers } from "@/lib/utils";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
} from "./pagination";

type PaginateBoxProps = {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

export default function PaginateBox({ page, totalPages, onPageChange }: PaginateBoxProps) {
	return (
		<Pagination className="mx-0 w-auto justify-end">
			<PaginationContent className="gap-1.75">
				<PaginationItem>
					<PaginationLink
						href="#"
						aria-label="Go to previous page"
						aria-disabled={page === 1}
						size="icon"
						className={cn(
							"size-7 rounded-md border-transparent",
							page === 1
								? "pointer-events-none bg-muted text-muted-foreground opacity-60"
								: "bg-[#1988FE] text-white hover:bg-[#1988FE]/90",
						)}
						onClick={(e) => {
							e.preventDefault();
							onPageChange(Math.max(1, page - 1));
						}}
					>
						<ChevronLeft />
					</PaginationLink>
				</PaginationItem>

				{getPageNumbers(page, totalPages).map((item, index) =>
					item === "ellipsis" ? (
						<PaginationItem key={`ellipsis-${index}`}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={item}>
							<PaginationLink
								href="#"
								isActive={item === page}
								className={cn(
									"size-7 border-transparent bg-transparent text-sm font-medium text-[#878789] hover:bg-transparent hover:underline",
									item === page && "font-semibold text-[#E00017]",
								)}
								onClick={(e) => {
									e.preventDefault();
									onPageChange(item);
								}}
							>
								{item}
							</PaginationLink>
						</PaginationItem>
					),
				)}

				<PaginationItem>
					<PaginationLink
						href="#"
						aria-label="Go to next page"
						aria-disabled={page === totalPages}
						size="icon"
						className={cn(
							"size-7 rounded-md border-transparent",
							page === totalPages
								? "pointer-events-none bg-muted text-muted-foreground opacity-60"
								: "bg-[#1988FE] text-white hover:bg-[#1988FE]/90",
						)}
						onClick={(e) => {
							e.preventDefault();
							onPageChange(Math.min(totalPages, page + 1));
						}}
					>
						<ChevronRight />
					</PaginationLink>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}