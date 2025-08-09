'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Requests } from '@/services/requests'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentAccess, Role } from '@/@types/types'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

const CollaboratorsPanel = ({ docId }: { docId: string }) => {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<Role>('read') // Default to read-only
    const [collaborators, setCollaborators] = useState<DocumentAccess[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [requests, setRequests] = useState<Requests | null>(null);

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem('authToken') || '' : '';
        setRequests(new Requests(token));
    }, []);

    const loadCollaborators = async () => {
        if (!requests) return;
        setIsLoading(true);
        try {
            const { collaborators } = await requests.fetchCollaborators(docId);
            setCollaborators(collaborators);
            setError(null);
        }
        catch (err: unknown) {
            const error = err as AxiosError;
            if (error.response && error.response.data && (error.response.data as { message?: string }).message) {
                setError(
                    (error.response.data as { message?: string }).message ||
                    "Failed to load collaborators"
                );
            } else {
                setError("Failed to load collaborators");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (requests) {
            loadCollaborators();
        }
    }, [docId, requests]);

    const handleInvite = async () => {
        if (!email) return

        setIsLoading(true)
        if (!requests) return;
        try {
            await requests.inviteCollaborator({
                documentId: docId,
                email,
                role
            })
            toast.success("Invitation sent successfully")
            setEmail('')
            await loadCollaborators()
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.error("Failed to send invitation:", axiosError);
            if (axiosError.response &&
                axiosError.response.data &&
                (axiosError.response.data as { message?: string }).message) {
                toast.error(
                    (axiosError.response.data as { message?: string }).message ||
                    "Failed to send invitation"
                );
            } else {
                toast.error("Failed to send invitation");
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleRoleChange = async (accessId: string, newRole: Role) => {
        if (!requests) return;
        setIsLoading(true)
        try {
            await requests.modifyAccess(accessId, newRole)
            await loadCollaborators()
        } catch (err: unknown) {
            const axiosError = err as AxiosError;
            console.error("Failed to update role:", axiosError);
            if (axiosError.response &&
                axiosError.response.data &&
                (axiosError.response.data as { message?: string }).message) {
                setError(
                    (axiosError.response.data as { message?: string }).message ||
                    "Failed to update role"
                );
            } else {
                setError("Failed to update role");
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemove = async (accessId: string) => {
        if (!requests) return;
        setIsLoading(true)
        try {
            await requests.revokeAccess(accessId)
            await loadCollaborators()
        } catch (err) {
            const axiosError = err as AxiosError;
            console.error("Failed to remove collaborator:", axiosError);
            if (axiosError.response &&
                axiosError.response.data &&
                (axiosError.response.data as { message?: string }).message) {
                setError(
                    (axiosError.response.data as { message?: string }).message ||
                    "Failed to remove collaborator"
                );
            } else {
                setError("Failed to remove collaborator");
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleTransfer = async (userId: string) => {
        if (!requests) return;
        setIsLoading(true)
        try {
            await requests.transferOwnership(docId, userId)
            await loadCollaborators()
        } catch (err) {
            const axiosError = err as AxiosError;
            console.error("Failed to transfer ownership:", axiosError);
            if (axiosError.response &&
                axiosError.response.data &&
                (axiosError.response.data as { message?: string }).message) {
                setError(
                    (axiosError.response.data as { message?: string }).message ||
                    "Failed to transfer ownership"
                );
            } else {
                setError("Failed to transfer ownership");
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="space-y-4">
            <h2 className="font-semibold text-lg">Collaborators</h2>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                    <Label htmlFor="collab-email">Email</Label>
                    <Input
                        id="collab-email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="w-32 space-y-1">
                    <Label htmlFor="collab-role">Role</Label>
                    <Select
                        value={role}
                        onValueChange={(value: Role) => setRole(value)}
                        disabled={isLoading}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="read">View</SelectItem>
                            <SelectItem value="edit">Edit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handleInvite}
                    disabled={!email || isLoading}
                >
                    Invite
                </Button>
            </div>

            <div className="space-y-3">
                {isLoading && !collaborators.length ? (
                    <div className="text-center py-4">Loading collaborators...</div>
                ) : collaborators.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                        No collaborators yet
                    </div>
                ) : (
                    collaborators.map((collab) => (
                        <div key={collab.id} className="flex items-center gap-3 p-2 border rounded">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                    {collab.user?.email || 'Unknown user'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {collab.user?.firstName} {collab.user?.lastName}
                                </p>
                            </div>

                            <Select
                                value={collab.role}
                                onValueChange={(value: Role) =>
                                    handleRoleChange(collab.id, value)
                                }
                                disabled={isLoading || collab.role === 'creator'}
                            >
                                <SelectTrigger className="w-28">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="read">View</SelectItem>
                                    <SelectItem value="edit">Edit</SelectItem>
                                    {collab.role === 'creator' && (
                                        <SelectItem value="creator">Owner</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>

                            {collab.role !== 'creator' && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemove(collab.id)}
                                        disabled={isLoading}
                                    >
                                        Remove
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => collab.user && handleTransfer(collab.user.id)}
                                        disabled={isLoading || !collab.user}
                                    >
                                        Transfer
                                    </Button>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}

export default CollaboratorsPanel