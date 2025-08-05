import {
    User, AuthResponse, Media, Document, DocumentAccess, DocumentMedia,
    DocumentMetadata, Metadata, ForgotPassword, Invite, Role, InviteStatus
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

    async signIn(params: { email?: string, userName?: string, password: string }): Promise<AuthResponse> {
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

    // Helper method to update the access token
    setAccessToken(token: string) {
        this.accessToken = token;
    }
}
