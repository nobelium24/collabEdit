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
import { Document, DocumentContent, DocumentJSON, DocumentMetadata, Metadata } from "@/@types/types";
import { useDocumentWebSocket } from "@/hooks/useDocumentWebSocket";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import EditorWithErrorBoundary from "@/components/EditorWithErrorBoundary";
import { AxiosError } from "axios";

//TODO: Implement fetch one document logic
export default function DocumentEditorPage() {
    const { docId } = useParams();
    const safeDocId = Array.isArray(docId) ? docId[0] ?? "" : docId ?? "";
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<DocumentJSON | undefined>();
    const [title, setTitle] = useState<string | undefined>();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const [requests, setRequests] = useState<Requests | null>(null);
    const [Document, setDocument] = useState<Document | null>(null);
    const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Start writing your document here...",
            }),
        ],
        content: content || null, // Handle undefined content
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

    const handleDocumentUpdate = useCallback((updatedDoc: Document) => {
        // Only update if the document ID matches
        if (updatedDoc.id !== safeDocId) return;

        setDocument(updatedDoc);
        setTitle(updatedDoc.title);

        const newContent = updatedDoc.content || { type: "doc", content: [] };
        setContent(newContent);

        // Debounce editor updates to prevent flickering
        if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(newContent)) {
            editor.commands.setContent(newContent);
        }

        toast.info("Document updated in real-time");
    }, [safeDocId, editor]);

    const fetchDocumentMetadata = useCallback(async () => {
        if (!requests || !safeDocId) return;

        try {
            const { metadata } = await requests.getDocumentMetadata(safeDocId);
            setMetadata(metadata);

            // Apply metadata to editor if it exists
            if (metadata?.metadata) {
                applyMetadataToEditor(metadata.metadata);
            }
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.error("Error loading document formatting:", axiosError);
            if (axiosError.response &&
                axiosError.response.data &&
                (axiosError.response.data as { message?: string }).message) {
                toast.error(
                    (axiosError.response.data as { message?: string }).message ||
                    "Failed to load document formatting"
                );
            } else {
                toast.error("Failed to load document formatting");
            }
        }
    }, [requests, safeDocId]);

    useEffect(() => {
        if (!safeDocId) {
            toast.error("Invalid document ID.");
            return router.push("/dashboard");
        }

        fetchDocumentMetadata();
    }, [safeDocId, requests, fetchDocumentMetadata]);


    const applyMetadataToEditor = (meta: Metadata) => {
        if (!editor) return;

        // Apply font styling if specified
        if (meta.font) {
            // You'll need to implement font handling logic
            // This might involve adding a custom extension
        }

        // Apply other metadata
        editor.setOptions({
            editorProps: {
                attributes: {
                    style: `
                    font-size: ${meta.fontSize}px;
                    line-height: ${meta.lineSpacing};
                    margin-top: ${meta.marginTop}px;
                    margin-left: ${meta.marginLeft}px;
                    margin-right: ${meta.marginRight}px;
                    margin-bottom: ${meta.marginBottom}px;
                `,
                },
            },
        });
    };

    const { emitEdit } = useDocumentWebSocket(safeDocId, handleDocumentUpdate);

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem('authToken') || '' : '';
        setRequests(new Requests(token));
    }, []);

    useEffect(() => {
        if (editor && content) {
            const currentContent = editor.getJSON();
            if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    const fetchDocument = async () => {
        if (!requests) return;
        setLoading(true);
        try {
            const [{ document }, { metadata }] = await Promise.all([
                requests.getSingleDocument(safeDocId),
                requests.getDocumentMetadata(safeDocId)
            ]);

            if (!document) {
                toast.error("Document not found.");
                return router.push("/dashboard");
            }

            setDocument(document);
            setTitle(document.title);

            const docContent = document.content || { type: "doc", content: [] };
            setContent(docContent);

            if (editor) {
                editor.commands.setContent(docContent);
            }

            if (metadata?.metadata) {
                setMetadata(metadata);
                applyMetadataToEditor(metadata.metadata);
            }
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.error("Error loading document:", axiosError);
            if (axiosError.response &&
                axiosError.response.data &&
                (axiosError.response.data as { message?: string }).message) {
                toast.error(
                    (axiosError.response.data as { message?: string }).message ||
                    "Failed to load document"
                );
            } else {
                toast.error("Failed to load document");
            }
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

    if (loading || !content) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
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
                        <EditorWithErrorBoundary editor={editor} />
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