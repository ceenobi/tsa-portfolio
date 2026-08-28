import { PROJECT_STATUS } from "@tsa/shared";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";

interface FilterProps {
	cohorts: string[];
	years: string[];
}

const ALL = "All";

export default function Filter({ cohorts, years }: FilterProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const queryParam = searchParams.get("query") || "";

	const category = validatedParam(searchParams, "category", CATEGORIES);
	const cohort = validatedParam(searchParams, "cohort", cohorts);
	const year = validatedParam(searchParams, "year", years);
	const status = validatedParam(searchParams, "status", [...PROJECT_STATUS]);

	const [searchValue, setSearchValue] = useState(queryParam);

	// Keep the input in sync when the URL changes externally (e.g. back/forward).
	const [prevQueryParam, setPrevQueryParam] = useState(queryParam);
	if (prevQueryParam !== queryParam) {
		setPrevQueryParam(queryParam);
		setSearchValue(queryParam);
	}

	// Debounced push of the search term into the URL.
	useEffect(() => {
		if (searchValue === queryParam) return;
		const timeout = setTimeout(() => {
			updateParams({ query: searchValue });
		}, 400);
		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchValue, queryParam]);

	function updateParams(changes: Record<string, string>) {
		const params = new URLSearchParams(searchParams);
		for (const [key, value] of Object.entries(changes)) {
			if (value && value !== ALL) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		}
		params.delete("page"); // any filter change resets pagination
		setSearchParams(params);
	}

	return (
		<div className="mt-6 bg-white p-4 border rounded-xl grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 items-center">
			<div className="flex flex-col gap-1.5">
				<h2 className="text-sm font-medium text-mainGray">Search</h2>
				<div className="relative w-full">
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mainGray" />
					<Input
						type="search"
						placeholder="Search projects..."
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						className="h-9 w-full pl-9"
						aria-label="Search projects"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<h2 className="text-sm font-medium text-mainGray">Department</h2>
				<Select
					value={category}
					onValueChange={(value) => updateParams({ category: String(value) })}
				>
					<SelectTrigger
						aria-label="Filter by category"
						className="!h-9 w-full text-sm md:text-xs/relaxed"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{CATEGORIES.map((option) => (
							<SelectItem key={option} value={option}>
								{option === ALL ? "Category" : option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-1.5">
				<h2 className="text-sm font-medium text-mainGray">Cohort</h2>
				<Select
					value={cohort}
					onValueChange={(value) => updateParams({ cohort: String(value) })}
				>
					<SelectTrigger
						aria-label="Filter by cohort"
						className="!h-9 w-full text-sm md:text-xs/relaxed"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{[ALL, ...cohorts].map((option) => (
							<SelectItem key={option} value={option}>
								{option === ALL ? "Cohort" : option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-1.5">
				<h2 className="text-sm font-medium text-mainGray">Year</h2>
				<Select
					value={year}
					onValueChange={(value) => updateParams({ year: String(value) })}
				>
					<SelectTrigger
						aria-label="Filter by year"
						className="!h-9 w-full text-sm md:text-xs/relaxed"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{[ALL, ...years].map((option) => (
							<SelectItem key={option} value={option}>
								{option === ALL ? "Year" : option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-1.5">
				<h2 className="text-sm font-medium text-mainGray">Status</h2>
				<Select
					value={status}
					onValueChange={(value) => updateParams({ status: String(value) })}
				>
					<SelectTrigger
						aria-label="Filter by status"
						className="!h-9 w-full text-sm md:text-xs/relaxed"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{[ALL, ...PROJECT_STATUS].map((option) => (
							<SelectItem key={option} value={option}>
								{option === ALL ? "Status" : capitalize(option)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

function validatedParam(
	searchParams: URLSearchParams,
	key: string,
	allowed: readonly string[],
): string {
	const param = searchParams.get(key);
	return param && allowed.includes(param) ? param : ALL;
}

const capitalize = (value: string) =>
	value.charAt(0).toUpperCase() + value.slice(1);
