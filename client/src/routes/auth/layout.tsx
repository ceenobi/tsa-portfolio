import { Outlet } from "react-router";
import Logo from "@/components/ui/logo";

export default function AuthLayout() {
	return (
		<div className="bg-[url('/bgBlue.png')] bg-cover bg-no-repeat min-h-screen flex justify-center items-center">
			<section className="w-full max-w-[90%] md:max-w-120 mx-auto bg-white space-y-8 py-10 px-8 rounded-lg">
				<Logo />
				<Outlet />
			</section>
		</div>
	);
}
