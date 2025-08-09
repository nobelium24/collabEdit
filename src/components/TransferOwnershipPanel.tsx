'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Requests } from '@/services/requests';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { DocumentActionPanelProps } from '@/@types/types';

export const TransferOwnershipPanel = ({ docId }: DocumentActionPanelProps) => {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<Requests | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken') || '';
        setRequests(new Requests(token));
    }, []);

    const handleTransfer = async () => {
        if (!recipientEmail || !requests) return;

        try {
            setLoading(true);
            const response = await requests.transferOwnership(docId, recipientEmail);
            toast.success(response.message);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-4 border-b">
            <h3 className="font-medium">Transfer Ownership</h3>
            <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email</Label>
                <Input
                    id="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="collaborator@example.com"
                />
            </div>
            <Button
                onClick={handleTransfer}
                variant="destructive"
                disabled={loading || !recipientEmail}
                className="w-full"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    'Transfer Ownership'
                )}
            </Button>
        </div>
    );
};

