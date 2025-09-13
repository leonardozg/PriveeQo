import { useState } from "react";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RoleSelector() {
  const [location, setLocation] = useLocation();
  
  const getCurrentRole = () => {
    if (location.startsWith("/admin")) return "admin";
    if (location.startsWith("/partner")) return "partner";
    return "admin";
  };

  const handleRoleChange = (role: string) => {
    switch (role) {
      case "admin":
        setLocation("/admin");
        break;
      case "partner":
        setLocation("/partner");
        break;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-2">
        <div className="flex items-center space-x-2 mb-2">
          <img 
            src="/logo.jpg" 
            alt="Privee Logo" 
            className="w-8 h-8 object-contain opacity-90"
          />
          <label className="block text-xs font-medium text-slate-600">
            Modo Demo - Cambiar Rol:
          </label>
        </div>
        <Select value={getCurrentRole()} onValueChange={handleRoleChange}>
          <SelectTrigger className="text-sm border border-slate-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary focus:border-primary w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Panel de Admin</SelectItem>
            <SelectItem value="partner">Portal de Socios</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
