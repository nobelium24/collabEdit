'use client';

import DocumentSettings from './DocumentSettings'
import CollaboratorsPanel from './CollaboratorsPanel'

type Props = {
    docId: string
}

const DocumentSidebar = ({ docId }: Props) => {
    return (
        <aside className="w-100 border-l border-border bg-muted p-4 flex flex-col gap-6">
            <DocumentSettings docId={docId} />
            <CollaboratorsPanel docId={docId} />
        </aside>
    )
}

export default DocumentSidebar
