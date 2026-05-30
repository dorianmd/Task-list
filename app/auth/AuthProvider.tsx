"use client"

import { createContext, useContext, ReactNode } from "react";
import { TokenPayload } from "@/lib/auth/jwt";

const AuthContext = createContext<TokenPayload | null>(null);

export function AuthProvider({ children,
                                 session }: { children: ReactNode; session: TokenPayload | null }) {
    return (
        <AuthContext.Provider value={session}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);