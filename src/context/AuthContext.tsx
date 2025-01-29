import React, { createContext, useEffect, useState, ReactNode } from "react";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
    [key: string]: string; // Generic key-value structure for token
}

interface AuthContextProps {
    isAdmin: boolean;
    refreshAuthState: () => void; // Function to manually refresh the auth state
}

const AuthContext = createContext<AuthContextProps>({
    isAdmin: false,
    refreshAuthState: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    const checkToken = () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken: DecodedToken = jwtDecode(token);
                const role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
                setIsAdmin(role === "Admin");
            } catch (err) {
                console.error("Invalid token:", err);
                setIsAdmin(false);
            }
        } else {
            setIsAdmin(false);
        }
    };

    // Refresh the authentication state
    const refreshAuthState = () => {
        checkToken();
    };

    // Check token on mount
    useEffect(() => {
        checkToken();

        // Listen for storage changes (e.g., logout or login in another tab)
        const handleStorageChange = () => {
            checkToken();
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ isAdmin, refreshAuthState }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);
