import {
    User, AuthResponse, Media, Document, DocumentAccess, DocumentMedia,
    DocumentMetadata, Metadata, ForgotPassword, Invite, Role, InviteStatus,
    LoginPayload
} from "@/@types/types";
import axios, { AxiosResponse } from "axios";
import { ROOT_URL } from "@/constants/constants";

export class Requests {
    private accessToken: string | null = null;

    constructor(accessToken?: string) {
        this.accessToken = accessToken || this.getStoredAccessToken();
        this.signIn = this.signIn.bind(this);
        this.completeAccount = this.completeAccount.bind(this);
        this.generateAccessToken = this.generateAccessToken.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        
    }

    private getStoredAccessToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken');
        }
        return null;
    }

    private updateStoredAccessToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
        }
    }

    private updateRefreshToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', token);
        }
    }

    private setUserData(userDetails: Partial<AuthResponse>) {
        sessionStorage.setItem("user", JSON.stringify(userDetails));
    }

    private getAuthHeaders() {
        const token = this.accessToken || this.getStoredAccessToken();
        if (!token) {
            throw new Error("Access token is required for authenticated requests");
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    private getMultipartAuthHeaders() {
        const token = this.accessToken || this.getStoredAccessToken();
        if (!token) {
            throw new Error("Access token is required for authenticated requests");
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        };
    }

    

    async signIn(params: LoginPayload): Promise<AuthResponse> {
        try {
            const response: AxiosResponse<AuthResponse> = await axios.post(`${ROOT_URL}/auth/login`, params)
            this.accessToken = response.data.accessToken;
            this.updateStoredAccessToken(response.data.accessToken);
            this.updateRefreshToken(response.data.refreshToken);
            this.setUserData({ user: response.data.user });
            return response.data;
        } catch (error) {
            console.log("Error in signIn:", error);
            throw error;
        }
    }

    async completeAccount(
        userId: string,
        documentId: string,
        params: { firstName: string, lastName: string, password: string }
    ): Promise<{
        message: string,
        accessToken: string,
        refreshToken: string,
        redirectTo: string
    }> {
        try {
            const response = await axios.post(`${ROOT_URL}/auth/complete-account?documentId=${documentId}`, params, {
                headers: { 'user-id': userId }
            });
            this.accessToken = response.data.accessToken;
            this.updateStoredAccessToken(response.data.accessToken);
            return response.data;
        } catch (error) {
            console.log("Error in completeAccount:", error);
            throw error;
        }
    }

    async generateAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const response = await axios.post(`${ROOT_URL}/auth/access-token`, { refreshToken });
            this.accessToken = response.data.accessToken;
            this.updateStoredAccessToken(response.data.accessToken);
            return response.data;
        } catch (error) {
            console.log("Error in generateAccessToken:", error);
            throw error;
        }
    }

    setAccessToken(token: string) {
        this.accessToken = token;
        this.updateStoredAccessToken(token);
    }


    async forgotPassword(email: string): Promise<void> {
        try {
            await axios.post(`${ROOT_URL}/auth/forgot-password`, { email });
        } catch (error) {
            console.log("Error in forgotPassword:", error);
            throw error;
        }
    }

    async verifyResetCode(resetCode: string): Promise<{ token: string }> {
        try {
            const response: AxiosResponse<{ token: string }> = await axios.post(`${ROOT_URL}/auth/verify-reset-code`, { resetCode });
            return response.data;
        } catch (error) {
            console.log("Error in verifyResetCode:", error);
            throw error;
        }
    }

    async resetPassword(newPassword: string): Promise<void> {
        try {
            await axios.post(`${ROOT_URL}/auth/reset-password`,
                { newPassword },
                { headers: this.getAuthHeaders() }
            );
        } catch (error) {
            console.log("Error in resetPassword:", error);
            throw error;
        }
    }

    async getProfile(): Promise<User> {
        try {
            const response: AxiosResponse<User> = await axios.get(
                `${ROOT_URL}/member/profile`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error in getProfile:", error);
            throw error;
        }
    }

    async uploadProfilePicture(file: File): Promise<{ message: string, imageUrl: string }> {
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const response: AxiosResponse<{ message: string, imageUrl: string }> = await axios.post(
                `${ROOT_URL}/member/profile-upload`,
                formData,
                { headers: this.getMultipartAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error in uploadProfilePicture:", error);
            throw error;
        }
    }

    async createDocument(params: {
        title: string;
        content?: string;
        isPublic?: boolean;
    }): Promise<{ message: string }> {
        try {
            const response: AxiosResponse<{ message: string }> = await axios.post(
                `${ROOT_URL}/document/create`,
                params,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error creating document:", error);
            throw error;
        }
    }

    async getUserCreatedDocuments(): Promise<{ documents: Document[] }> {
        try {
            const response: AxiosResponse<{ documents: Document[] }> = await axios.get(
                `${ROOT_URL}/document/user-created-docs`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error fetching user documents:", error);
            throw error;
        }
    }

    async getSingleDocument(documentId: string): Promise<{ document: Document }> {
        try {
            const response: AxiosResponse<{ document: Document }> = await axios.get(
                `${ROOT_URL}/document/get-one?documentId=${documentId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error fetching document:", error);
            throw error;
        }
    }

    async toggleDocumentVisibility(documentId: string): Promise<void> {
        try {
            await axios.patch(
                `${ROOT_URL}/document/toggle-visibility/${documentId}`,
                {},
                { headers: this.getAuthHeaders() }
            );
        } catch (error) {
            console.log("Error toggling document visibility:", error);
            throw error;
        }
    }

    async deleteDocument(documentId: string): Promise<{ message: string }> {
        try {
            const response: AxiosResponse<{ message: string }> = await axios.delete(
                `${ROOT_URL}/document/delete/${documentId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error deleting document:", error);
            throw error;
        }
    }

    async revokeAccess(documentAccessId: string): Promise<{ message: string }> {
        try {
            const response: AxiosResponse<{ message: string }> = await axios.delete(
                `${ROOT_URL}/document/revoke-access/${documentAccessId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error revoking access:", error);
            throw error;
        }
    }

    async modifyAccess(
        documentAccessId: string,
        newRole: Role
    ): Promise<{ message: string }> {
        try {
            const response: AxiosResponse<{ message: string }> = await axios.patch(
                `${ROOT_URL}/document/modify-access/${documentAccessId}/${newRole}`,
                {},
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error modifying access:", error);
            throw error;
        }
    }

    async fetchAllDocuments(): Promise<{ documents: Document[] }> {
        try {
            const response: AxiosResponse<{ documents: Document[] }> = await axios.get(
                `${ROOT_URL}/document/all`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error fetching all documents:", error);
            throw error;
        }
    }

    async fetchCollaborators(documentId: string): Promise<{ collaborators: DocumentAccess[] }> {
        try {
            const response: AxiosResponse<{ collaborators: DocumentAccess[] }> = await axios.get(
                `${ROOT_URL}/document/collaborators/${documentId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error fetching collaborators:", error);
            throw error;
        }
    }

    async transferOwnership(
        documentId: string,
        recipientId: string
    ): Promise<{ message: string }> {
        try {
            const response: AxiosResponse<{ message: string }> = await axios.patch(
                `${ROOT_URL}/document/transfer-ownership/${documentId}/${recipientId}`,
                {},
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error transferring ownership:", error);
            throw error;
        }
    }

    async inviteCollaborator(params: {
        documentId: string;
        email: string;
        role: Role;
    }): Promise<{ message: string }> {
        try {
            const response: AxiosResponse<{ message: string }> = await axios.post(
                `${ROOT_URL}/document/invite-collaborator`,
                params,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error inviting collaborator:", error);
            throw error;
        }
    }

    async generateDocPDF(documentId: string): Promise<{ documentLink: string }> {
        try {
            const response: AxiosResponse<{ documentLink: string }> = await axios.get(
                `${ROOT_URL}/document/generate-pdf?documentId=${documentId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error generating PDF:", error);
            throw error;
        }
    }

    async acceptInvitation(token: string): Promise<{
        message: string;
        accessToken?: string;
        refreshToken?: string;
        redirectTo?: string;
    }> {
        try {
            const response: AxiosResponse<{
                message: string;
                accessToken?: string;
                refreshToken?: string;
                redirectTo?: string;
            }> = await axios.get(`${ROOT_URL}/invite/accept?token=${token}`);
            return response.data;
        } catch (error) {
            console.log("Error accepting invitation:", error);
            throw error;
        }
    }

    async createDocumentMetadata(params: {
        documentId: string;
        version?: number;
        metadata?: Metadata;
    }): Promise<{ message: string }> {
        try {
            const response: AxiosResponse<{ message: string }> = await axios.post(
                `${ROOT_URL}/document-metadata/create`,
                params,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error creating document metadata:", error);
            throw error;
        }
    }

    async getDocumentMetadata(documentId: string): Promise<{
        metadata: DocumentMetadata
    }> {
        try {
            const response: AxiosResponse<{ metadata: DocumentMetadata }> = await axios.get(
                `${ROOT_URL}/document-metadata/get-one?documentId=${documentId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error fetching document metadata:", error);
            throw error;
        }
    }

    async updateDocumentMetadata(
        documentMetadataId: string,
        updates: Partial<DocumentMetadata>
    ): Promise<{ message: string }> {
        try {
            const response: AxiosResponse<{ message: string }> = await axios.patch(
                `${ROOT_URL}/document-metadata/update?documentMetadataId=${documentMetadataId}`,
                updates,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error updating document metadata:", error);
            throw error;
        }
    }

    async deleteDocumentMetadata(documentMetadataId: string): Promise<{ message: string }> {
        try {
            const response: AxiosResponse<{ message: string }> = await axios.delete(
                `${ROOT_URL}/document-metadata/delete?documentMetadataId=${documentMetadataId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.log("Error deleting document metadata:", error);
            throw error;
        }
    }

}