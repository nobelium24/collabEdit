"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateDocumentModal from "./CreateDocument";
import { AuthService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Requests } from "@/services/requests";

interface Document {
    id: string;
    title: string;
    createdAt: string;
}

export const DashboardHome = () => {
    const [user, setUser] = useState<{ name: string; image: string } | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [open, setOpen] = useState(false)
    const router = useRouter();
    const request = new Requests();

    const { getUserCreatedDocuments } = request;

    async function checkAuth() {
        try {
            const isAuthenticated = await AuthService.requireAuth("/login");
            if (!isAuthenticated) {
                router.push("/login");
            }
        } catch (error) {
            console.error("Authentication check failed:", error);
            toast.error("Authentication failed. Please log in again.");
            AuthService.clearAuthData();
            setUser(null);
            setDocuments([]);
            router.push("/login");
        }
    }
    useEffect(() => {
        checkAuth();
        const stored = sessionStorage.getItem("user");
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    async function handleGetUserDocuments() {
        try {
            const documents = await getUserCreatedDocuments();
            console.log("Fetched documents:", documents);
            const normalizedDocs = (documents.documents || []).map(doc => ({
                ...doc,
                createdAt: typeof doc.createdAt === "string"
                    ? doc.createdAt
                    : doc.createdAt.toISOString(),
            }));
            setDocuments(normalizedDocs);
            console.log("Documents set:", normalizedDocs);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
            toast.error("Failed to load documents. Please try again later.");
        }
    }
    useEffect(() => {
        if (user) {
            handleGetUserDocuments();
        }
    }, [user]);



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
                    <div>
                        <Button onClick={() => setOpen(true)}>New Document</Button>
                        <CreateDocumentModal open={open} onOpenChange={setOpen} />
                    </div>
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

            <div>
                <Button
                    className="fixed bottom-6 right-6 rounded-full shadow-lg md:hidden"
                    size="icon"
                    onClick={() => setOpen(true)}
                >
                    ➕
                </Button>
                <CreateDocumentModal open={open} onOpenChange={setOpen} />
            </div>
        </div>
    );
};
