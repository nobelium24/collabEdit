// app/invite/[token]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Requests } from '@/services/requests';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function InvitePage() {
    const { token } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [inviteData, setInviteData] = useState<{
        documentTitle: string;
        role: string;
        email: string;
    } | null>(null);
    const [requests, setRequests] = useState<Requests | null>(null);

    useEffect(() => {
        const tokenValue = Array.isArray(token) ? token[0] : token;
        const authToken = localStorage.getItem('authToken');
        setRequests(new Requests(authToken || ''));

        const verifyInvite = async () => {
            try {
                if (!tokenValue) {
                    throw new Error('Invalid invite token');
                }

                const response = await fetch(`/api/invite/verify?token=${tokenValue}`);
                if (!response.ok) {
                    throw new Error('Failed to verify invite');
                }

                const data = await response.json();
                setInviteData({
                    documentTitle: data.documentTitle,
                    role: data.role,
                    email: data.email
                });
            } catch (error) {
                console.error('Error verifying invite:', error);
                toast.error('Invalid or expired invitation link');
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        verifyInvite();
    }, [token, router]);

    const handleAcceptInvite = async () => {
        try {
            setLoading(true);
            const tokenValue = Array.isArray(token) ? token[0] : token;

            if (!requests || !tokenValue) {
                throw new Error('Invalid request');
            }

            const response = await requests.acceptInvite(tokenValue);

            if (response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken!);
            }

            toast.success('Invitation accepted successfully!');
            router.push(response.redirectTo || '/dashboard');
        } catch (error) {
            console.error('Error accepting invite:', error);
            toast.error('Failed to accept invitation');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!inviteData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Invalid Invitation</h1>
                    <p className="mb-4">This invitation link is invalid or has expired.</p>
                    <Button onClick={() => router.push('/')}>Return to Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">You're Invited!</h1>
                    <p className="text-gray-600 mt-2">
                        {inviteData.email} has been invited to collaborate
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Document:</span>
                        <span className="font-medium">{inviteData.documentTitle}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <span className="font-medium capitalize">{inviteData.role.toLowerCase()}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={handleAcceptInvite}
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Accept Invitation'
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="w-full"
                    >
                        Decline
                    </Button>
                </div>
            </div>
        </div>
    );
}