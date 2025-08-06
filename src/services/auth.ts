import { AuthResponse } from "@/@types/types";

export class AuthService {
    setSecureTokens(response: AuthResponse) {
        sessionStorage.setItem("accessToken", response.accessToken)
        localStorage.setItem("refreshToken", response.refreshToken);
    }

    setUserData(userDetails: Partial<AuthResponse>) {
        sessionStorage.setItem("user", JSON.stringify(userDetails));
    }
}