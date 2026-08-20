import { Settings } from "lucide-react";

import DashboardIconActive from "../../assets/dashboard-active.svg";
import DashboardIcon from "../../assets/dashboardIcon.svg";
import PortfolioIcon from "../../assets/portfolioIcon.svg";
import PortfolioIconActive from "../../assets/portfolioIcon-active.svg";

export const Tabs = [
	{
		key: "dashboard",
		label: "Dashboard",
		icon: <img src={DashboardIcon} alt="Portfolio Icon" className="w-6 h-6" />,
		iconActive: (
			<img src={DashboardIconActive} alt="Portfolio Icon" className="w-6 h-6" />
		),
	},
	{
		key: "portfolio",
		label: "Portfolio",
		icon: <img src={PortfolioIcon} alt="Portfolio Icon" className="w-6 h-6" />,
		iconActive: (
			<img src={PortfolioIconActive} alt="Portfolio Icon" className="w-6 h-6" />
		),
	},
	{
		key: "settings",
		label: "Settings",
		icon: <Settings />,
		iconActive: <Settings />,
	},
];
