"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Document {
    id: string;
    title: string;
    createdAt: string;
}

export const DashboardHome = () => {
    const [user, setUser] = useState<{ name: string; image: string } | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("collab_user");
        if (stored) {
            setUser(JSON.parse(stored));
        }

        // Simulated data for now — replace with real API call later
        setDocuments([
            { id: "1", title: "Team Meeting Notes", createdAt: "2025-08-01" },
            { id: "2", title: "Product Roadmap", createdAt: "2025-07-27" },
            { id: "3", title: "Design Sprint Plan", createdAt: "2025-07-25" },
        ]);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    Welcome back{user?.name ? `, ${user.name}` : ""} 👋
                </h1>
                <p className="text-gray-600">Here are your recent documents.</p>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-medium">Recent Documents</h2>
                    <Link href="/new">
                        <Button size="sm">New Document</Button>
                    </Link>
                </div>

                {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/documents/${doc.id}`}
                                className="border rounded-lg p-4 hover:shadow transition"
                            >
                                <h3 className="text-base font-semibold">{doc.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Created on {new Date(doc.createdAt).toLocaleDateString()}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating New Doc Button on small screens */}
            <Link href="/new">
                <Button
                    className="fixed bottom-6 right-6 rounded-full shadow-lg md:hidden"
                    size="icon"
                >
                    ➕
                </Button>
            </Link>
        </div>
    );
};
