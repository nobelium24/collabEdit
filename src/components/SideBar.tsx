// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "All Documents", href: "/documents", icon: "📝" },
    { name: "Shared With Me", href: "/shared", icon: "👥" },
    { name: "Trash", href: "/trash", icon: "🗑️" },
];

export const Sidebar = ({ visible }: { visible: boolean }) => {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "fixed md:static z-40 top-0 left-0 h-full w-80 bg-gray-50 border-r px-4 py-6 transition-transform duration-200 ease-in-out",
                visible ? "translate-x-0" : "-translate-x-full",
                "md:translate-x-0 md:flex md:flex-col"
            )}
        >
            <h2 className="text-lg font-semibold mb-6">Menu</h2>
            <nav className="space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center px-3 py-2 rounded-md hover:bg-gray-200 transition",
                            pathname === item.href && "bg-gray-200 font-medium"
                        )}
                    >
                        <span className="mr-2">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
};
