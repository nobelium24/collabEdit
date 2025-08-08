import { AuthResponse } from "@/@types/types";
import { redirect } from "next/navigation";
import { Requests } from "@/services/requests";

export class AuthService {
    private static ACCESS_TOKEN_KEY = "accessToken";
    private static REFRESH_TOKEN_KEY = "refreshToken";
    private static USER_DATA_KEY = "user";

    static setSecureTokens(response: AuthResponse): void {
        if (typeof window !== "undefined") {
            localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        }
    }

    static setUserData(userDetails: Partial<AuthResponse>): void {
        if (typeof window !== "undefined") {
            localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userDetails));
        }
    }

    static getAccessToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem(this.ACCESS_TOKEN_KEY);
        }
        return null;
    }

    static getRefreshToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem(this.REFRESH_TOKEN_KEY);
        }
        return null;
    }

    static getUserData(): Partial<AuthResponse> | null {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem(this.USER_DATA_KEY);
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    }

    static clearAuthData(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem(this.ACCESS_TOKEN_KEY);
            localStorage.removeItem(this.REFRESH_TOKEN_KEY);
            localStorage.removeItem(this.USER_DATA_KEY);
        }
    }

    static async requireAuth(redirectPath = "/login"): Promise<boolean> {
        if (typeof window === "undefined") return false;

        let accessToken = this.getAccessToken();
        if (!accessToken) {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
                try {
                    const requests = new Requests();
                    const { accessToken: newToken } = await requests.generateAccessToken(refreshToken);
                    localStorage.setItem(this.ACCESS_TOKEN_KEY, newToken);
                    return true;
                } catch (err) {
                    console.error("Token refresh failed:", err);
                    this.clearAuthData();
                    redirect(redirectPath);
                    return false;
                }
            } else {
                this.clearAuthData();
                redirect(redirectPath);
                return false;
            }
        }

        return true;
    }

    static async isAuthenticated(): Promise<boolean> {
        if (typeof window === "undefined") return false;

        let accessToken = this.getAccessToken();
        if (accessToken) return true;

        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
            try {
                const requests = new Requests();
                const { accessToken: newToken } = await requests.generateAccessToken(refreshToken);
                localStorage.setItem(this.ACCESS_TOKEN_KEY, newToken);
                return true;
            } catch (err) {
                console.error("Silent re-auth failed:", err);
                return false;
            }
        }

        return false;
    }
}
