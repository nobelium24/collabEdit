"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import axios from "axios";
// import { Spinner } from "@/components/ui/spinner";

export default function DocumentEditorPage() {
    const { docId } = useParams();
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<string>("");

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
                class: "prose border rounded-md p-4 min-h-[400px]",
            },
        },
        injectCSS: false,
        immediatelyRender: false,
        onUpdate({ editor }) {
            const json = editor.getJSON();

        },
    });

    // useEffect(() => {
    //     const fetchDoc = async () => {
    //         try {
    //             const res = await axios.get(`/api/documents/${docId}`);
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
        <div className="max-w-4xl mx-auto p-6">
            <EditorContent editor={editor} className="prose border rounded-md p-4 min-h-[400px]" />
        </div>
    );
}
