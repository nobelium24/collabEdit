
"use client";

export default function EditorErrorFallback() {
    return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-medium">Editor Failed to Load</h3>
            <p className="text-red-700 mt-1">
                The document editor encountered an error. Please refresh the page.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
                Refresh Page
            </button>
        </div>
    );
}