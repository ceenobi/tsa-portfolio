import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <>
      {/*handle the sidebar - create the component in provider folder and import it here, outlet renders the routes for the dashboard sidebar*/}
      {/*dashboard layout has its own nav, create it in ui folder and import it here*/}
      <Outlet/>
    </>
  );
}