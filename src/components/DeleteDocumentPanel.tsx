import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Requests } from '@/services/requests';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DocumentActionPanelProps } from '@/@types/types';

export const DeleteDocumentPanel = ({ docId }: DocumentActionPanelProps) => {
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<Requests | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken') || '';
        setRequests(new Requests(token));
    }, []);

    const handleDelete = async () => {
        if (confirmText !== 'permanently delete' || !requests) return;

        try {
            setLoading(true);
            const response = await requests.deleteDocument(docId);
            toast.success(response.message);
            router.push('/dashboard');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Deletion failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-4">
            <h3 className="font-medium text-destructive">Delete Document</h3>
            <p className="text-sm text-muted-foreground">
                This action cannot be undone. All document data will be permanently removed.
            </p>
            <div className="space-y-2">
                <Label htmlFor="confirmDelete">
                    Type <span className="font-mono">permanently delete</span> to confirm
                </Label>
                <Input
                    id="confirmDelete"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="permanently delete"
                />
            </div>
            <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={loading || confirmText !== 'permanently delete'}
                className="w-full"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    'Delete Permanently'
                )}
            </Button>
        </div>
    );
};