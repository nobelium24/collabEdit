
"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/SideBar";
import { DashboardHome } from "@/components/DashboardHome";

export default function DashboardPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(true)} />

            <div className="flex flex-1 relative">
                <Sidebar
                    visible={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-30 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <DashboardHome />
                </main>
            </div>
        </div>
    );
}