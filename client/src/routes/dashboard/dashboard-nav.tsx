import { useLocation } from "react-router";
import { Search, ChevronDown, ChevronUp, UserRoundCog, LogOut } from "lucide-react";
import { useState } from "react";
import DefaultAvatar from "../../assets/defaultAvatar.svg"

export default function DashboardNav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const getHeading = () => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname.startsWith("/dashboard/portfolio")) return "Portfolio";
    if (location.pathname.startsWith("/dashboard/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <header className="flex items-center justify-between px-6 border-b h-18.5 border-[#E7E4E4]">
      <h1 className="font-bold text-[28px] text-deepBlue">{getHeading()}</h1>

      <div className="flex-1 flex justify-center">
        <div className="relative w-138.25 max-w-md">
          <Search className="absolute left-3 top-2.5 h-[16.21294403076172px] w-[16.21294403076172px] text-[#747474]" />
          <input
            type="text"
            placeholder="Search project"
            className="w-full font-semibold pl-9 pr-3 h-9.5 border border-[#F0F0F0] bg-[#ffffff] rounded-[5px] text-[10px] text-[#747474] focus:outline-none focus:ring-2 focus:ring-[#747474]"
          />
        </div>
      </div>

      <div className="relative flex items-center gap-3">
          <img
            src={DefaultAvatar}
            alt="User Avatar"
            className="w-8 h-8 rounded-full p-0.5"
          />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-700">Admin</p>
            <p className="text-xs text-gray-500">TSAadmin@gmail.com</p>
          </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="cursor-pointer"
        >
            {menuOpen ? <ChevronUp /> : <ChevronDown /> }
        </button>

        {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <ul className="py-2 text-sm text-gray-700 text-[16px]">
            <li className="px-4 py-2 hover:bg-gray-100 text-[#292929] cursor-pointer flex items-center gap-2">
              <UserRoundCog size={24} /> Account Settings
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 text-red-600 cursor-pointer flex items-center gap-2">
              <LogOut />  Log out
            </li>
          </ul>
        </div>
        )}

      </div>
    </header>
  );
}
