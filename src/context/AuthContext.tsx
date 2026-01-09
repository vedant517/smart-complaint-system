import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "USER" | "ADMIN" | "OFFICER";

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    role: Role | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (role: Role, email: string) => Promise<void>;
    logout: () => void;
    switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const savedUser = localStorage.getItem("auth_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (role: Role, email: string) => {
        // Mock Authentication Logic
        const mockUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
            email,
            role,
        };

        setUser(mockUser);
        localStorage.setItem("auth_user", JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
    };

    const switchRole = (newRole: Role) => {
        const updatedUser: User = {
            id: user?.id || Math.random().toString(36).substr(2, 9),
            name: user?.name || "Demo User",
            email: user?.email || "demo@test.com",
            role: newRole,
        };
        setUser(updatedUser);
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    };

    const value = {
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
