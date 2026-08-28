import { Outlet } from "react-router";
import Footer from "@/components/ui/footer";
import Nav from "@/components/ui/nav";

export default function MainLayout() {
	return (
		<>
			<Nav />
			<main>
				<Outlet />
			</main>
			<Footer />
		</>
	);
}
