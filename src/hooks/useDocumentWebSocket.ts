import { useEffect, useRef, useState } from "react";
// For socket.io-client v2.x, use require or import as namespace
import * as io from "socket.io-client";
import { Document } from "@/@types/types";
import { toast } from "sonner";
import { ROOT_URL } from "@/constants/constants";

export const useDocumentWebSocket = (
    docId: string,
    onDocumentUpdate: (document: Document) => void
) => {
    // v2.x type
    const socketRef = useRef<SocketIOClient.Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);


    console.log(docId)

    useEffect(() => {
        const token = localStorage.getItem("accessToken") || "";
        console.log(token)
        // @ts-ignore
        const socket = io(`${ROOT_URL}/ws`, {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            },
            transports: ["websocket", "polling"],
            forceNew: true,
            reconnectionAttempts: 5,
            query: {
                token: token
            }
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            console.log("Connected to WebSocket server");
            socket.emit("join", docId);
            toast.success("Connected")
        });

        socket.on("document_updated", (updatedDoc: Document) => {
            onDocumentUpdate(updatedDoc);
        });

        socket.on("error", (error: any) => {
            toast.error("WebSocket error: " + (error?.message || error));
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
            toast.warning("Disconnected from real-time server");
        });

        return () => {
            socket.disconnect();
        };
    }, [docId]);

    const emitEdit = (document: Partial<Document>) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit("edit", {
                ...document,
                id: docId,
            });
        }
    };

    return { emitEdit, isConnected };
};