import LogoIcon from "../../assets/tsaIcon.svg"
import { Link, useLocation } from "react-router"

export interface SidebarTab {
  key: string;
  label: string;
  icon: React.ReactNode;
  iconActive: React.ReactNode;
}

type Props = {
  tabs: SidebarTab[];
};

export default function Sidebar({
  tabs,
}: Props) {
    const location = useLocation();
  return (
    <div className="bg-deepBlue w-27.75 flex flex-col justify-between items-center h-screen py-5 px-5 ">
      <nav className="flex flex-col gap-5">
      <Link to="/">
      <img src={LogoIcon} alt="Tech Studio Academy Logo" className="mx-auto w-fit mb-1 h-10.75" />
      </Link>
        {tabs.map((tab) => {
          const isActive = (tab.key === "dashboard" && (location.pathname === "/dashboard" || 
            location.pathname === "/dashboard/")) || location.pathname === `/dashboard/${tab.key}`;

          return (
            <Link
              key={tab.key}
              to={`/dashboard/${tab.key === "dashboard" ? "" : tab.key}`}
              className={`flex flex-col items-center justify-center gap-2 w-13 h-2.5 min-h-18.75 text-center ${
                isActive ? "text-white" : "text-[#8F92B3]"
              }`}
            >
              {typeof tab.icon === "string" && typeof tab.iconActive === "string" ? (
                <img
                  src={isActive ? tab.iconActive : tab.icon}
                  alt={`${tab.label} icon`}
                  className="w-4.5 h-4.5"
                />
              ) : (
                <span className="shrink-0 w-4.5 h-4.5">
                  {isActive ? tab.iconActive : tab.icon}
                </span>
              )}
              <span className="text-[14px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  )
}