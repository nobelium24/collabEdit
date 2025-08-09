import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Requests } from '@/services/requests'
import { Metadata, DocumentMetadata } from '@/@types/types'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

type Props = {
    docId: string
}

const DocumentSettings = ({ docId }: Props) => {
    const [isPublic, setIsPublic] = useState(false)
    const [metadata, setMetadata] = useState<Metadata>({})
    const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null)
    const [requests, setRequests] = useState<Requests | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                if (!token) throw new Error('No access token found')

                const req = new Requests(token)
                setRequests(req)

                const { metadata } = await req.getDocumentMetadata(docId)
                if (!metadata) throw new Error('No metadata returned from server')

                setDocumentMetadata(metadata)
                if (metadata.metadata) {
                    setMetadata(metadata.metadata)
                }

                // Optional: Fetch document visibility status
                try {
                    const { document } = await req.getSingleDocument(docId)
                    setIsPublic(document?.isPublic || false)
                } catch (docError) {
                    console.warn('Could not fetch document visibility:', docError)
                }
            } catch (err: unknown) {
                const axiosError = err as AxiosError;
                console.error("Error fetching document settings:", axiosError);
                if (axiosError.response &&
                    axiosError.response.data &&
                    (axiosError.response.data as { message?: string }).message) {
                    setError(
                        (axiosError.response.data as { message?: string }).message ||
                        "Failed to load document settings"
                    );
                } else {
                    setError("Failed to load document settings");
                }
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [docId])

    const handleToggleVisibility = async () => {
        try {
            const newVisibility = !isPublic
            setIsPublic(newVisibility)
            if (requests) {
                await requests.toggleDocumentVisibility(docId)
                toast.success(`Document is now ${newVisibility ? 'public' : 'private'}`)
            }
        } catch (err) {
            console.error('Toggle visibility error:', err)
            toast.error('Failed to update visibility')
            setIsPublic(!isPublic) // Revert on error
        }
    }

    // Properly implemented handleMetadataChange
    const handleMetadataChange = (key: keyof Metadata, value: string | number) => {
        // Create new metadata object with the updated value
        const updatedMetadata = {
            ...metadata,
            [key]: value
        }

        // Update local state
        setMetadata(updatedMetadata)

        // If you want to auto-save changes (optional):
        // handleSave(updatedMetadata)
    }

    const handleSave = async () => {
        if (!requests || !documentMetadata) return

        try {
            setLoading(true)
            await requests.updateDocumentMetadata(documentMetadata.id, { metadata })

            // Update local state with new metadata
            const { metadata: updatedMetadata } = await requests.getDocumentMetadata(docId)
            setDocumentMetadata(updatedMetadata)

            toast.success("Document settings updated")
        } catch (err) {
            console.error('Save error:', err)
            toast.error("Failed to update settings")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="p-4">Loading settings...</div>
    }

    if (error) {
        return <div className="p-4 text-destructive">Error: {error}</div>
    }

    return (
        <section className="p-4">
            <h2 className="font-semibold mb-4">Document Settings</h2>

            {documentMetadata && (
                <div className="mb-6 p-3 bg-gray-50 rounded-md text-sm">
                    <h3 className="font-medium mb-2">Current Settings</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div>Version: <span className="font-semibold">{documentMetadata.version}</span></div>
                        <div>Updated: <span className="font-semibold">
                            {new Date(documentMetadata.updatedAt).toLocaleString()}
                        </span></div>
                        {Object.entries(metadata).map(([key, value]) => (
                            value !== undefined && (
                                <div key={key}>
                                    {key}: <span className="font-semibold">{value}</span>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor="public">Public</Label>
                    <Switch
                        id="public"
                        checked={isPublic}
                        onCheckedChange={handleToggleVisibility}
                    />
                </div>

                {[
                    { key: 'font', label: 'Font', type: 'text' },
                    { key: 'fontSize', label: 'Font Size (px)', type: 'number' },
                    { key: 'lineSpacing', label: 'Line Spacing', type: 'number', step: '0.1' },
                    { key: 'marginTop', label: 'Margin Top (px)', type: 'number' },
                    { key: 'marginLeft', label: 'Margin Left (px)', type: 'number' },
                    { key: 'marginRight', label: 'Margin Right (px)', type: 'number' },
                    { key: 'marginBottom', label: 'Margin Bottom (px)', type: 'number' },
                ].map(({ key, label, type, step }) => (
                    <div key={key} className="flex flex-col gap-1">
                        {/* <Label htmlFor={key}>{label}</Label> */}
                        <Input
                            id={key}
                            type={type}
                            step={step}
                            value={metadata[key as keyof Metadata] ?? ''}
                            onChange={(e) => {
                                const value = type === 'number'
                                    ? parseFloat(e.target.value)
                                    : e.target.value
                                handleMetadataChange(key as keyof Metadata, value)
                            }}
                            placeholder={label}
                        />
                    </div>
                ))}

                <button
                    onClick={handleSave}
                    className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 mt-4"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </section>
    )
}

export default DocumentSettings