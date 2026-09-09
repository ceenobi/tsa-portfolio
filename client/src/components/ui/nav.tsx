import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { COURSES } from "@/lib/constants";
import { cn } from "@/lib/utils";


export default function Nav() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [coursesOpen, setCoursesOpen] = useState(false);

	return (
		<div className="fixed top-0 w-full z-100 bg-deepBlue">
			<header className="relative text-[14px]">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-25">
					<a href="https://www.techstudioacademy.com" rel="noopener noreferrer">
						<Logo />
					</a>

					<nav className="hidden items-center gap-7 text-sm font-medium text-white lg:flex">
						<a
							href="https://www.techstudioacademy.com/about"
							rel="noopener noreferrer"
							className="hover:text-blue-300"
						>
							About Us
						</a>

					<div
						className="group relative"
						onMouseEnter={() => setCoursesOpen(true)}
						onMouseLeave={() => setCoursesOpen(false)}
						onBlur={(e) => {
							if (!e.currentTarget.contains(e.relatedTarget as Node)) {
								setCoursesOpen(false);
							}
						}}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								setCoursesOpen(false);
							}
						}}
					>
							<button
								type="button"
								className="flex items-center gap-1 hover:text-blue-300"
								onClick={() => setCoursesOpen((open) => !open)}
								aria-expanded={coursesOpen}
								aria-haspopup="true"
								aria-controls="courses-menu"
							>
								Courses
								<ChevronDown className="size-3.5" />
							</button>

							{coursesOpen && (
								<div
									id="courses-menu"
									className="absolute left-0 top-full w-64 rounded-md border border-border bg-popover p-1 shadow-lg"
								>
									{COURSES.map((course) => (
										<a
											key={course.name}
											href={course.href}
											target="_blank"
											rel="noopener noreferrer"
											className="block rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
										>
											{course.name}
										</a>
									))}
								</div>
							)}
						</div>
						<a
							href="https://www.techstudioacademy.com/faq"
							rel="noopener noreferrer"
							className="hover:text-blue-300"
						>
							FAQ
						</a>
						<a
							href="https://www.techstudioacademy.com/contact"
							rel="noopener noreferrer"
							className="hover:text-blue-300"
						>
							Contact Us
						</a>
						<a
							href="https://www.techstudioacademy.com/portfolio"
							rel="noopener noreferrer"
							className="hover:text-blue-300"
						>
							Portfolio
						</a>
					</nav>

					<div className="hidden lg:block">
						<Button
							nativeButton={false}
							className="h-9 rounded-md bg-mainBlue py-3 px-6.5 text-sm text-white hover:bg-blue-500"
							render={
								<a
									href="https://www.techstudioacademy.com/register"
									rel="noopener noreferrer"
								/>
							}
						>
							Register
						</Button>
					</div>

					<button
						type="button"
						className="text-white lg:hidden"
						onClick={() => setMobileOpen((open) => !open)}
						aria-label="Toggle menu"
						aria-expanded={mobileOpen}
						aria-controls="mobile-nav"
					>
						{mobileOpen ? (
							<X className="size-6" />
						) : (
							<Menu className="size-6" />
						)}
					</button>
				</div>

				<div
					id="mobile-nav"
					className={cn(
						"grid gap-1 overflow-hidden px-4 text-white transition-[grid-template-rows] duration-200 lg:hidden",
						mobileOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]",
					)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setMobileOpen(false);
						}
					}}
				>
					<div className="flex min-h-0 flex-col gap-1 text-sm font-medium">
						<a
							href="https://www.techstudioacademy.com/about"
							className="rounded-md px-2 py-2 text-left hover:bg-white/10"
							onClick={() => setMobileOpen(false)}
						>
							About Us
						</a>
						{COURSES.map((course) => (
							<a
								key={course.name}
								href={course.href}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-md px-2 py-2 text-left hover:bg-white/10"
								onClick={() => setMobileOpen(false)}
							>
								{course.name}
							</a>
						))}
						<a
							href="https://www.techstudioacademy.com/faq"
							rel="noopener noreferrer"
							className="rounded-md px-2 py-2 text-left hover:bg-white/10"
							onClick={() => setMobileOpen(false)}
						>
							FAQ
						</a>
						<a
							href="https://www.techstudioacademy.com/contact"
							rel="noopener noreferrer"
							className="rounded-md px-2 py-2 text-left hover:bg-white/10"
							onClick={() => setMobileOpen(false)}
						>
							Contact Us
						</a>
						<a
							href="https://www.techstudioacademy.com/portfolio"
							rel="noopener noreferrer"
							className="rounded-md px-2 py-2 text-left hover:bg-white/10"
							onClick={() => setMobileOpen(false)}
						>
							Portfolio
						</a>

						<Button
							nativeButton={false}
							className="mt-2 h-9 w-full rounded-md bg-blue-600 text-sm text-white hover:bg-blue-500"
							render={
								<a
									href="https://www.techstudioacademy.com/register"
									rel="noopener noreferrer"
								/>
							}
						>
							Register
						</Button>
					</div>
				</div>
			</header>
		</div>
	);
}
