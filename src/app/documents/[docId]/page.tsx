"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import axios from "axios";
import { Input } from "@/components/ui/input";

export default function DocumentEditorPage() {
    const { docId } = useParams();
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState<string>("");
    const router = useRouter();

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
                class:
                    "min-h-[600px] w-full outline-none prose focus:outline-none",
            },
        },
        injectCSS: false,
        immediatelyRender: false,
        onUpdate({ editor }) {
            const json = editor.getJSON();
            // optionally save json
        },
    });

    // useEffect(() => {
    //     const fetchDoc = async () => {
    //         try {
    //             const res = await axios.get(`/api/documents/${docId}`);
    //             setTitle(res.data.title || "");
    //             setContent(res.data.content || "");
    //         } catch (err) {
    //             console.error("Error loading doc:", err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchDoc();
    // }, [docId]);

    // if (loading || !editor) return <div className="p-6">Loading...</div>;

    return (
        <div className="fixed inset-0 flex flex-col bg-gray-50 px-6 py-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                    ← Back
                </button>
            </div>

            {/* Title input */}
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title..."
                className="text-2xl font-semibold border-none shadow-none focus-visible:ring-0 focus-visible:outline-none px-0 bg-transparent"
            />

            {/* Editor */}
            <div className="flex-1 overflow-y-auto border rounded-lg bg-white px-6 py-4 shadow-sm">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
