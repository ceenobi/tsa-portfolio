import { Outlet } from "react-router";
import Sidebar from "./sidebar";
import { Tabs } from "./tabs";
import DashboardNav from "./dashboardNav";

export default function DashboardLayout() {
  return (
    <>
       <div className="flex h-screen">
      <Sidebar tabs={Tabs} />
      <main className="flex-1 overflow-y-auto">
        <DashboardNav />
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
    </>
  );
}