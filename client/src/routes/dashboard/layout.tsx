import { Outlet, useLoaderData } from "react-router";
import { Tabs } from "../../components/features/tabs";
import DashboardNav from "../../components/ui/dashboard-nav";
import Sidebar from "../../components/ui/sidebar";
import type { dashboardLoader } from "./loader";

export default function DashboardLayout() {
	const { user } = useLoaderData<typeof dashboardLoader>();
	return (
		<div className="flex h-screen">
			<Sidebar tabs={Tabs} />
			<main className="flex-1 overflow-y-auto">
				<DashboardNav user={user} />
				<div className="pt-6 pb-12 px-6">
					<Outlet context={{ user }} />
				</div>
			</main>
		</div>
	);
}
