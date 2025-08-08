// hooks/useDocumentWebSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Document } from "@/@types/types";
import { toast } from "sonner";

export const useDocumentWebSocket = (
    docId: string,
    onDocumentUpdate: (document: Document) => void
) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken") || "";
        const socket = io(`${process.env.NEXT_PUBLIC_WS_URL}`, {
            extraHeaders: {
                Authorization: `Bearer ${token}`,
            },
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Connected to WebSocket server");
            socket.emit("join", docId);
        });

        socket.on("document_updated", (updatedDoc: Document) => {
            onDocumentUpdate(updatedDoc);
        });

        socket.on("error", (error: Error) => {
            toast.error("WebSocket error: " + error.message);
        });

        socket.on("disconnect", () => {
            toast.warning("Disconnected from real-time server");
        });

        return () => {
            socket.disconnect();
        };
    }, [docId]);

    const emitEdit = (document: Partial<Document>) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit("edit", {
                ...document,
                id: docId,
            });
        }
    };

    return { emitEdit };
};