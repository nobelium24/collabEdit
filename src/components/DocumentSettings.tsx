import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Requests } from '@/services/requests'
import { Metadata } from '@/@types/types'

type Props = {
    docId: string
}

const DocumentSettings = ({ docId }: Props) => {
    const [isPublic, setIsPublic] = useState(false)
    const [metadata, setMetadata] = useState<Metadata>({});
    const [requests, setRequests] = useState<Requests | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('authToken')
        if (token) {
            setRequests(new Requests(token))
        }
    }, [])

    const handleToggleVisibility = async () => {
        setIsPublic(!isPublic)
        if (requests) await requests.toggleDocumentVisibility(docId)
    }

    const handleMetadataChange = (key: string, value: string) => {
        setMetadata((prev) => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        if (requests) await requests.updateDocumentMetadata(docId, { metadata })
    }

    return (
        <section>
            <h2 className="font-semibold mb-4">Document Settings</h2>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor="public">Public</Label>
                    <Switch id="public" checked={isPublic} onCheckedChange={handleToggleVisibility} />
                </div>
                {['font', 'fontSize', 'lineSpacing', 'marginTop', 'marginLeft', 'marginRight', 'marginBottom'].map((key) => (
                    <div key={key} className="flex flex-col gap-1">
                        {/* <Label htmlFor={key}>{key}</Label> */}
                        <Input
                            className='mb-2'
                            id={key}
                            value={(metadata as any)[key] || ''}
                            onChange={(e) => handleMetadataChange(key, e.target.value)}
                            placeholder={key}
                        />
                    </div>
                ))}
                <button
                    onClick={handleSave}
                    className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 mt-2"
                >
                    Save Settings
                </button>
            </div>
        </section>
    )
}

export default DocumentSettings