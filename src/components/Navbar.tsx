// components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

interface User {
    name: string;
    avatar: string;
    email: string;
}

export const Navbar = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <nav className="w-full flex justify-between items-center px-6 py-4 border-b shadow-sm bg-white">
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle Button - visible only on mobile */}
                <button
                    onClick={onToggleSidebar}
                    className="md:hidden p-2 rounded hover:bg-gray-100"
                >
                    <Menu className="h-6 w-6" />
                </button>

                <Link href="/" className="text-xl font-bold">
                    CollabEdit
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <Button asChild>
                    <Link href="/editor/new">New Document</Link>
                </Button>

                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled>{user.name}</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout}>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </nav>
    );
};
