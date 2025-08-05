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
        <div className="flex h-screen flex-col overflow-hidden">
            <Navbar onToggleSidebar={handleToggleSidebar} />

            <div className="flex flex-1 relative">
                {/* Sidebar with improved mobile behavior */}
                <Sidebar
                    visible={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-30 md:hidden"
                        onClick={handleToggleSidebar}
                    />
                )}

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <DashboardHome />
                </main>
            </div>
        </div>
    );
}