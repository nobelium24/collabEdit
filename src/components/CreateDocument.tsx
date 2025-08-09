'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner";
import { Requests } from "@/services/requests";
import { AxiosError } from "axios"

interface CreateDocumentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function CreateDocumentModal({ open, onOpenChange, }: CreateDocumentModalProps) {
    const [title, setTitle] = useState("")
    const request = new Requests();
    const { createDocument } = request;

    const handleCreate = async () => {
        if (!title.trim()) {
            toast.error("Document title cannot be empty.");
            return;
        }

        try {
            const response = await createDocument({ title });
            toast.success("Document created successfully.");
            setTitle("");
            onOpenChange(false);
            window.location.reload();

        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Error creating document:", axiosError);
            if (axiosError.response &&
                axiosError.response.data &&
                (axiosError.response.data as { message?: string }).message) {
                toast.error(
                    (axiosError.response.data as { message?: string }).message ||
                    "Failed to create document"
                );
            } else {
                toast.error("Failed to create document");
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Enter document title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!title.trim()}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
