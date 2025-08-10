export type User = {
    id: string
    firstName: string
    lastName: string
    email: string
    password: string
    profilePhoto: Media
    createdAt: Date
    updatedAt: Date
}

export type Media = {
    public_id: string
    secure_url: string
}

export type DocumentContent = {
    type: string;
    content?: DocumentContent[];
    text?: string;
    //TODO: Add other Tiptap/ProseMirror node properties once you find out about them. We might get rid of the documentMetadata table self...
    attrs?: Record<string, any>;
    marks?: Array<{
        type: string;
        attrs?: Record<string, any>;
    }>;
};

export type DocumentJSON = {
    type: string;
    content: DocumentContent[];
};


export type Document = {
    id: string;
    title: string;
    content?: DocumentJSON;
    userId: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type DocumentAccess = {
    id: string;
    collaboratorId: string;
    documentId: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
    Document?: Document;
    User?: User;
};

export type DocumentMedia = {
    id: string;
    documentId: string;
    public_id: string;
    secure_url: string;
    format: string;
    createdAt: Date;
    updatedAt: Date;
};

export type DocumentActionPanelProps = {
    docId: string;
};


export type DocumentMetadata = {
    id: string;
    documentId: string;
    version: number;
    metadata?: Metadata;
    createdAt: Date;
    updatedAt: Date;
    document?: Document;
};

export type Metadata = {
    font?: string;
    fontSize?: number;
    lineSpacing?: number;
    marginTop?: number;
    marginLeft?: number;
    marginRight?: number;
    marginBottom?: number;
};

export type ForgotPassword = {
    id: string;
    email: string;
    resetCode: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Invite = {
    id: string;
    collaboratorId?: string | null;
    email?: string | null;
    documentId: string;
    role: Role;
    token: string;
    status: InviteStatus;
    inviterId?: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    user: {
        email: string;
        name: string;
        profilePhoto: string;
    };
};

export type LoginPayload = {
    email?: string,
    userName?: string,
    password: string
}

export type Role = "edit" | "read" | "creator";
export type InviteStatus = "pending" | "accepted" | "declined";
