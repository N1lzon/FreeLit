// app/context/AuthProvider.tsx
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { account } from "../lib/appwrite";

type AuthContextType = {
  authenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        await account.get();
        setAuthenticated(true);
      } catch (error) {
        setAuthenticated(false);
        router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, loading }}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
