"use client";

import React from "react";
import DashBoardSidebar from "@/components/Sidebar";
import { Sidebar, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import TopBar from "@/components/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <div className="flex w-full min-h-screen">
            <Sidebar side="left" variant="sidebar" collapsible="icon">
                <DashBoardSidebar />
                {/* <SidebarTrigger variant={"secondary"}/> */}
            </Sidebar>

            <SidebarInset className="flex-1 bg-white">
                <TopBar />
                {children}
            </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
