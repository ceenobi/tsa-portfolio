import { useMutation } from "@tanstack/react-query";
import type { LogoutResponse, UserProfile } from "@tsa/shared";
import {
	ChevronDown,
	ChevronUp,
	LogOut,
	Search,
	UserRoundCog,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/utils";
import DefaultAvatar from "../../assets/defaultAvatar.svg";

export default function DashboardNav({ user }: { user: UserProfile | null }) {
	const location = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: () => {
			return api.post<LogoutResponse["body"]>("/auth/logout", {});
		},
		onSuccess: (res) => {
			if (res.success) {
				toast.success(res.body.message || "You are now logged out");
				queryClient.clear();
				navigate(`/`);
			}
		},
		onError: (err) => {
			if (import.meta.env.DEV) console.error("err", err);
			toast.error(err.message);
		},
	});

	const handleLogout = () => {
		mutation.mutate();
		setMenuOpen(!menuOpen);
	};

	const getHeading = () => {
		if (location.pathname === "/dashboard") return "Dashboard";
		if (location.pathname.startsWith("/dashboard/portfolio"))
			return "Portfolio";
		if (location.pathname.startsWith("/dashboard/settings")) return "Settings";
		return "Dashboard";
	};

	return (
		<header className="flex items-center justify-between gap-4 px-4 border-b h-18.5 border-[#E7E4E4]">
			<h1 className="hidden md:block font-bold text-xl lg:text-[28px] text-deepBlue">
				{getHeading()}
			</h1>

			<div className="flex-1 flex justify-center">
				<div className="relative w-full max-w-md">
					<Search className="absolute left-3 top-2.5 h-[16.21294403076172px] w-[16.21294403076172px] text-[#747474]" />
					<input
						type="text"
						placeholder="Search project"
						className="w-full font-semibold pl-9 pr-3 h-9.5 border border-[#F0F0F0] bg-[#ffffff] rounded-[5px] text-[10px] text-[#747474] focus:outline-none focus:ring-2 focus:ring-[#747474]"
					/>
				</div>
			</div>

			<div className="relative flex items-center gap-2 md:gap-3">
				<img
					src={DefaultAvatar}
					alt="User Avatar"
					className="w-8 h-8 rounded-full p-0.5"
				/>
				<div className="hidden md:block text-left">
					<p className="text-sm font-medium text-gray-700 capitalize">
						{user?.role}
					</p>
					<p className="text-xs text-gray-500">{user?.email}</p>
				</div>
				<button
					onClick={() => setMenuOpen(!menuOpen)}
					className="cursor-pointer"
					type="button"
				>
					{menuOpen ? <ChevronUp /> : <ChevronDown />}
				</button>

				{menuOpen && (
					<div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
						<ul className="py-2 text-sm text-gray-700 text-[16px]">
							<li className="px-4 py-2 hover:bg-gray-100 text-lightGray cursor-pointer flex items-center gap-2">
								<UserRoundCog size={24} /> Account Settings
							</li>
							<li
								className="px-4 py-2 hover:bg-gray-100 text-red-600 cursor-pointer flex items-center gap-2"
								onClick={handleLogout}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										mutation.mutate();
									}
								}}
							>
								<LogOut /> Log out
							</li>
						</ul>
					</div>
				)}
			</div>
		</header>
	);
}
