"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // To get current path
import { Sidebar, SidebarMenuItem, SidebarTrigger } from "./ui/sidebar";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { SlCalender } from "react-icons/sl";
import { TbHeartRateMonitor } from "react-icons/tb";
import { HiOutlineArchiveBox } from "react-icons/hi2";

export default function DashBoardSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", icon: <MdOutlineDashboardCustomize />, label: "Dashboard" },
    { href: "/patients", icon: <FiUsers />, label: "Patients" },
    { href: "/appointments", icon: <SlCalender />, label: "Appointments" },
    // { href: "/clinical", icon: <TbHeartRateMonitor />, label: "Clinical" },
    // { href: "/billing", icon: <HiOutlineArchiveBox />, label: "Billings" },
  ];

  return (
    <Sidebar className="w-64 h-screen shadow-md bg-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
            <span className="text-xl font-semibold">EHR HealthCare Pro</span>
            {/* <SidebarTrigger className="flex justify-between items-center" /> */}
        </div>

        <div className="flex flex-col space-y-2 mt-4">
            {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
                <SidebarMenuItem key={item.href}>
                <Link
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3 m-2 rounded-md transition-colors duration-200
                    ${isActive ? "bg-blue-500/80 text-white" : "hover:bg-gray-700/10"}`}
                >
                    {item.icon} <span>{item.label}</span>
                </Link>
                </SidebarMenuItem>
            );
            })}
        </div>
    </Sidebar>

  );
}
