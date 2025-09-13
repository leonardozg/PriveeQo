import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AdminUser, InsertAdminUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AdminAuthContextType = {
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AdminUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  isAuthenticated: boolean;
};

type LoginData = {
  username: string;
  password: string;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check localStorage on mount
  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminUser');
    if (savedAdmin) {
      try {
        const parsedAdmin = JSON.parse(savedAdmin);
        setAdminUser(parsedAdmin);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/admin/login", credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return await res.json();
    },
    onSuccess: (user: AdminUser) => {
      setAdminUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('adminUser', JSON.stringify(user));
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error de inicio de sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // No need for server call, just local logout
    },
    onSuccess: () => {
      setAdminUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('adminUser');
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    },
  });

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isLoading: loginMutation.isPending,
        error: null,
        loginMutation,
        logoutMutation,
        isAuthenticated,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}