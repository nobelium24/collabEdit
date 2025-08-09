'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import DocumentSettings from './DocumentSettings';
import CollaboratorsPanel from './CollaboratorsPanel';
import { TransferOwnershipPanel } from './TransferOwnershipPanel';
import { DeleteDocumentPanel } from './DeleteDocumentPanel';

type Props = {
    docId: string;
};

const DocumentSidebar = ({ docId }: Props) => {
    return (
        <ScrollArea className="h-full w-100 border-l border-border bg-muted">
            <div className="flex flex-col gap-6 p-4">
                <DocumentSettings docId={docId} />
                <CollaboratorsPanel docId={docId} />
                <TransferOwnershipPanel docId={docId} />
                <DeleteDocumentPanel docId={docId} />
            </div>
        </ScrollArea>
    );
};

export default DocumentSidebar; 