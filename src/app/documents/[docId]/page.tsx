"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Input } from "@/components/ui/input";
import DocumentSidebar from "@/components/DocumentSideBar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Requests } from "@/services/requests";
import { toast } from "sonner";
import { Document, DocumentContent, DocumentJSON } from "@/@types/types";
import { useDocumentWebSocket } from "@/hooks/useDocumentWebSocket";

//TODO: Implement fetch one document logic
export default function DocumentEditorPage() {
    const { docId } = useParams();
    const safeDocId = Array.isArray(docId) ? docId[0] ?? "" : docId ?? "";
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState<DocumentJSON>({
        type: "doc",
        content: [],
    } as DocumentJSON
    );
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const [requests, setRequests] = useState<Requests | null>(null);
    const [Document, setDocument] = useState<Document | null>(null);

    const handleDocumentUpdate = useCallback((updatedDoc: Document) => {
        setDocument(updatedDoc);
        setTitle(updatedDoc.title);
        setContent(updatedDoc.content || {
            type: "doc",
            content: [],
        } as DocumentJSON
        );
        editor?.commands.setContent(updatedDoc.content || "");
        toast.info("Document updated in real-time");
    }, []);

    const { emitEdit } = useDocumentWebSocket(safeDocId, handleDocumentUpdate);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Start writing your document here...",
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: "min-h-[600px] w-full outline-none prose focus:outline-none",
            },
        },
        injectCSS: false,
        immediatelyRender: false,
        onUpdate({ editor }) {
            const json = editor.getJSON();
            emitEdit({
                content: json,
                updatedAt: new Date(),
            });
        },
    });

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem('authToken') || '' : '';
        setRequests(new Requests(token));
    }, []);

    const fetchDocument = async () => {
        if (!requests) return;
        try {
            const { document } = await requests.getSingleDocument(safeDocId);
            if (document) {
                setDocument(document);
                setTitle(document.title);
                setContent(document.content || {
                    type: "doc",
                    content: [],
                } as DocumentJSON);
                editor?.commands.setContent(document.content || "");
            } else {
                toast.error("Document not found.");
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error fetching document:", error);
            toast.error("Failed to load document.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // if (safeDocId) {
        //     fetchDocument();
        // } else {
        //     toast.error("Invalid document ID.");
        //     router.push("/dashboard");
        // }
        fetchDocument();
    }, [safeDocId, requests]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (document) {
            emitEdit({
                title: newTitle,
                updatedAt: new Date(),
            });
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="fixed inset-0 flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white z-10">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-500 hover:text-gray-700 transition flex-shrink-0"
                >
                    ← Back
                </button>

                <Input
                    value={title ?? ""}
                    onChange={handleTitleChange}
                    placeholder="Document title..."
                    className="text-lg sm:text-2xl font-semibold border-none shadow-none focus-visible:ring-0 focus-visible:outline-none px-2 sm:px-0 bg-transparent w-full max-w-3xl text-center mx-2"
                />

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden flex-shrink-0"
                >
                    Settings
                </Button>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                <div className="hidden md:block h-full border-r bg-white">
                    <DocumentSidebar docId={safeDocId} />
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 h-full">
                        <EditorContent editor={editor} />
                    </div>
                </div>

                {sidebarOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/30 md:hidden z-40"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <div className="fixed inset-y-0 left-0 w-full bg-white z-50 shadow-lg border-r flex flex-col">
                            <div className="flex justify-end p-3 border-b">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSidebarOpen(false)}
                                    className="h-8 w-8"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <DocumentSidebar docId={safeDocId} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}