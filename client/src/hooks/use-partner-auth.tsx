import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { Partner, partnerLoginSchema } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";

type PartnerAuthContextType = {
  partner: Partner | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Partner, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  changePasswordMutation: UseMutationResult<void, Error, ChangePasswordData>;
};

type LoginData = z.infer<typeof partnerLoginSchema>;
type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export const PartnerAuthContext = createContext<PartnerAuthContextType | null>(null);

export function PartnerAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage on mount and verify with server
  useEffect(() => {
    const savedPartner = localStorage.getItem('partnerUser');
    if (savedPartner) {
      try {
        const parsedPartner = JSON.parse(savedPartner);
        setPartner(parsedPartner);
        setIsAuthenticated(true);
        
        // Verify session with server (non-blocking)
        fetch('/api/partner/me', { credentials: 'include' })
          .then(res => {
            if (!res.ok) {
              // Session expired, clear local storage
              localStorage.removeItem('partnerUser');
              setPartner(null);
              setIsAuthenticated(false);
            }
            // Always set initialized after server check
            setIsInitialized(true);
          })
          .catch(() => {
            // Network error, keep local state for offline experience
            setIsInitialized(true);
          });
      } catch (error) {
        localStorage.removeItem('partnerUser');
        setIsInitialized(true);
      }
    } else {
      setIsInitialized(true);
    }
  }, []);

  // For compatibility with existing code
  const {
    data: serverPartner,
    error,
    isLoading: serverLoading,
  } = useQuery<Partner | undefined, Error>({
    queryKey: ["/api/partner/me"],
    retry: false,
    enabled: false, // Disabled to use local state management
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await fetch("/api/partner/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      
      return await res.json();
    },
    onSuccess: (partnerData: Partner) => {
      setPartner(partnerData);
      setIsAuthenticated(true);
      setIsInitialized(true); // Ensure initialized state
      localStorage.setItem('partnerUser', JSON.stringify(partnerData));
      queryClient.setQueryData(["/api/partner/me"], partnerData);
      
      toast({
        title: "Bienvenido",
        description: `Hola ${partnerData.fullName}!`,
      });
      
      // Small delay to ensure state is set before redirect
      setTimeout(() => {
        setLocation("/partner");
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Error de autenticación",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/partner/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      setPartner(null);
      setIsAuthenticated(false);
      localStorage.removeItem('partnerUser');
      queryClient.setQueryData(["/api/partner/me"], null);
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      
      setLocation("/partner/login");
    },
    onError: (error: Error) => {
      // Clear local state even on error
      setPartner(null);
      setIsAuthenticated(false);
      localStorage.removeItem('partnerUser');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión",
      });
      
      setLocation("/partner/login");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const res = await fetch("/api/partner/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Password change failed");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al cambiar contraseña",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <PartnerAuthContext.Provider
      value={{
        partner,
        isLoading: !isInitialized,
        error: error || null,
        loginMutation,
        logoutMutation,
        changePasswordMutation,
      }}
    >
      {children}
    </PartnerAuthContext.Provider>
  );
}

export function usePartnerAuth() {
  const context = useContext(PartnerAuthContext);
  if (!context) {
    throw new Error("usePartnerAuth must be used within a PartnerAuthProvider");
  }
  return context;
}