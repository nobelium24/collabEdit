// app/(dashboard)/page.tsx

"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/SideBar";
import { DashboardHome } from "@/components/DashboardHome";

export default function DashboardPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleToggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return (
        <div className="flex h-screen flex-col relative">
            <Navbar onToggleSidebar={handleToggleSidebar} />

            <div className="flex flex-1 relative">
                <Sidebar visible={isSidebarOpen} />
                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
                        onClick={handleToggleSidebar}
                    />
                )}

                <main className="flex-1 p-6 overflow-y-auto">
                    <DashboardHome />
                </main>
            </div>
        </div>
    );
}
