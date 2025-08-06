"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

const DEFAULT_AVATAR =
    "https://res.cloudinary.com/djqokg2kh/image/upload/v1743772890/zynsxy22g6lhtcmuakif.jpg";

interface User {
    name: string;
    avatar?: string | null;
    email: string;
}

export const Navbar = ({
    onToggleSidebar,
}: {
    onToggleSidebar: () => void;
}) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser({
                ...parsedUser,
                avatar: parsedUser.avatar || DEFAULT_AVATAR,
            });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
    };

    return (
        <nav className="w-full flex justify-between items-center px-4 sm:px-6 py-3 border-b bg-white z-10">
            <div className="flex items-center gap-3">
                {/* Mobile Avatar (sidebar trigger) */}
                <div className="flex md:hidden">
                    <Avatar className="h-8 w-8 cursor-pointer" onClick={onToggleSidebar}>
                        <AvatarImage src={user?.avatar || DEFAULT_AVATAR} />
                        <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                </div>

                <Link href="/" className="text-lg sm:text-xl font-semibold">
                    CollabEdit
                </Link>
            </div>

            {/* Desktop Avatar + Dropdown */}
            {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                        <div className="hidden md:flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || DEFAULT_AVATAR} />
                                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{user.name}</span>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {user.name}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </nav>
    );
};
