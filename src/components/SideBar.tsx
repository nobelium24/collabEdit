// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const navItems = [
    { name: "All Documents", href: "/documents", icon: "📝" },
    { name: "Shared With Me", href: "/shared", icon: "👥" },
    { name: "Trash", href: "/trash", icon: "🗑️" },
];

export const Sidebar = ({
    visible,
    onClose
}: {
    visible: boolean;
    onClose: () => void;
}) => {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar (always visible) */}
            <aside className="hidden md:flex flex-col w-64 h-full border-r bg-gray-50 px-4 py-6">
                <h2 className="text-lg font-semibold mb-6">Menu</h2>
                <nav className="space-y-2 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center px-3 py-2 rounded-md hover:bg-gray-200 transition",
                                pathname.startsWith(item.href) && "bg-gray-200 font-medium"
                            )}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Mobile Sidebar (conditional) */}
            {visible && (
                <aside className="fixed inset-y-0 left-0 w-90 bg-white z-40 shadow-lg border-r flex flex-col md:hidden">
                    <div className="flex justify-end p-3 border-b">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-6">Menu</h2>
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center px-3 py-2 rounded-md hover:bg-gray-200 transition",
                                        pathname.startsWith(item.href) && "bg-gray-200 font-medium"
                                    )}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>
            )}
        </>
    );
};