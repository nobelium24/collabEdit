
"use client";

import { ErrorBoundary } from 'react-error-boundary';
import EditorErrorFallback from './EditorErrorFallback';
import { EditorContent } from '@tiptap/react';

export default function EditorWithErrorBoundary({ editor }: { editor: any }) {
    return (
        <ErrorBoundary
            FallbackComponent={EditorErrorFallback}
            onError={(error, info) => {
                console.error("Editor error:", error, info);
            }}
        >
            <EditorContent editor={editor} />
        </ErrorBoundary>
    );
}