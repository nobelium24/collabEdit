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
        if (accessToken) {
            this.accessToken = accessToken;
        }
    }

    private getAuthHeaders() {
        if (!this.accessToken) {
            throw new Error("Access token is required for authenticated requests");
        }
        return {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        };
    }

    private getMultipartAuthHeaders() {
        if (!this.accessToken) {
            throw new Error("Access token is required for authenticated requests");
        }
        return {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'multipart/form-data'
        };
    }

    // Auth endpoints (public)
    async signUp(params: Partial<User>): Promise<User> {
        try {
            const response: AxiosResponse<User> = await axios.post(`${ROOT_URL}/auth/register`, params);
            return response.data;
        } catch (error) {
            console.log("Error in signUp:", error);
            throw error;
        }
    }

    async signIn(params: LoginPayload): Promise<AuthResponse> {
        try {
            const response: AxiosResponse<AuthResponse> = await axios.post(`${ROOT_URL}/auth/login`, params);
            this.accessToken = response.data.accessToken; // Store the access token
            return response.data;
        } catch (error) {
            console.log("Error in signIn:", error);
            throw error;
        }
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

    async generateAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const response: AxiosResponse<{ accessToken: string }> = await axios.post(`${ROOT_URL}/auth/access-token`, { refreshToken });
            this.accessToken = response.data.accessToken; // Store the new access token
            return response.data;
        } catch (error) {
            console.log("Error in generateAccessToken:", error);
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
            const response: AxiosResponse<{
                message: string,
                accessToken: string,
                refreshToken: string,
                redirectTo: string
            }> = await axios.post(`${ROOT_URL}/auth/complete-account?documentId=${documentId}`, params, {
                headers: { 'user-id': userId }
            });
            this.accessToken = response.data.accessToken; // Store the access token
            return response.data;
        } catch (error) {
            console.log("Error in completeAccount:", error);
            throw error;
        }
    }

    // Protected endpoints (require JWT)
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

    // Helper method to update the access token
    setAccessToken(token: string) {
        this.accessToken = token;
    }
}

