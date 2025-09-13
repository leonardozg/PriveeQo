import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertItemSchema, insertPartnerSchema, type Item, type InsertItem, type Partner, type InsertPartner } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Plus, Pencil, Trash2, Package, DollarSign, TrendingUp, Users, Settings, Building2, LogOut, User, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { z } from "zod";

const itemFormSchema = insertItemSchema.extend({
  basePrice: z.string().min(1, "Price is required"),
  minMargin: z.string().min(1, "Minimum margin is required"),
  maxMargin: z.string().min(1, "Maximum margin is required"),
});

type ItemFormData = z.infer<typeof itemFormSchema>;
type PartnerFormData = z.infer<typeof insertPartnerSchema>;

function LoginForm() {
  const { loginMutation } = useAdminAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center mobile-padding animate-fade-in">
      <Card className="w-full max-w-md enhanced-card animate-scale-in shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="relative hover-lift">
              <img 
                src="/logo.jpg" 
                alt="PRIVEE Logo" 
                className="h-20 w-20 object-cover rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-black/10 pointer-events-none"></div>
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl privee-text-gradient animate-slide-up">
            Panel de Administración
          </CardTitle>
          <CardDescription className="mt-2 text-base text-gray-600 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Inicia sesión para acceder al sistema de gestión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Ingresa tu usuario"
                className="enhanced-input h-12 text-base"
                required
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Ingresa tu contraseña"
                className="enhanced-input h-12 text-base"
                required
                data-testid="input-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full enhanced-button h-12 text-base font-semibold animate-slide-up shadow-lg hover:shadow-xl" 
              style={{ animationDelay: '0.4s' }}
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              <span className="relative z-10">
                {loginMutation.isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-dots w-2 h-2 bg-white rounded-full"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </span>
            </Button>
            
            <div className="text-center mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <p className="text-sm text-blue-700 font-semibold mb-1">Credenciales del administrador:</p>
              <p className="text-xs text-blue-600 font-mono bg-white/50 rounded px-2 py-1 inline-block">
                Usuario: admin | Contraseña: Admin2025!
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Development breakpoint indicator */}
      <div className="breakpoint-indicator"></div>
    </div>
  );
}

function AdminDashboard() {
  const { adminUser, logoutMutation } = useAdminAuth();
  const { toast } = useToast();
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  
  const itemForm = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      basePrice: "",
      minMargin: "",
      maxMargin: "",
      status: "active",
      quality: "",
      ambientacion: "",
    },
  });

  const partnerForm = useForm<PartnerFormData>({
    resolver: zodResolver(insertPartnerSchema),
    defaultValues: {
      fullName: "",
      company: "",
      rfc: "",
      email: "",
      whatsapp: "",
      personalAddress: "",
      assistantName: "",
    },
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/items"],
  });

  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ["/api/partners"],
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (data: InsertPartner) => {
      const res = await apiRequest("POST", "/api/partners", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create partner");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "¡Éxito!", description: "Socio registrado correctamente" });
      setIsPartnerDialogOpen(false);
      partnerForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo registrar el socio", 
        variant: "destructive" 
      });
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPartner> }) => {
      const res = await apiRequest("PUT", `/api/partners/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update partner");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "¡Éxito!", description: "Socio actualizado correctamente" });
      setIsPartnerDialogOpen(false);
      setEditingPartner(null);
      partnerForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo actualizar el socio", 
        variant: "destructive" 
      });
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/partners/${id}`);
      if (!res.ok) throw new Error("Failed to delete partner");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({ title: "¡Éxito!", description: "Socio eliminado correctamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el socio", variant: "destructive" });
    },
  });

  const onSubmitPartner = (data: PartnerFormData) => {
    if (editingPartner) {
      updatePartnerMutation.mutate({ id: editingPartner.id, data });
    } else {
      createPartnerMutation.mutate(data);
    }
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    partnerForm.reset({
      fullName: partner.fullName,
      company: partner.company,
      rfc: partner.rfc,
      email: partner.email,
      whatsapp: partner.whatsapp,
      personalAddress: partner.personalAddress,
      assistantName: partner.assistantName,
    });
    setIsPartnerDialogOpen(true);
  };

  const handleDeletePartner = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este socio?")) {
      deletePartnerMutation.mutate(id);
    }
  };

  const stats = {
    totalItems: items?.length || 0,
    activeItems: items?.filter((item: Item) => item.status === "active").length || 0,
    totalPartners: partners?.length || 0,
    avgPrice: items?.length ? 
      items.reduce((sum: number, item: Item) => sum + parseFloat(item.basePrice), 0) / items.length : 0,
  };

  if (itemsLoading || partnersLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.jpg" 
                alt="PRIVEE Logo" 
                className="h-8 w-8 object-cover rounded"
              />
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Panel de Administración</h1>
                <p className="text-sm text-slate-600">PRIVEE - Gestión Completa</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <User className="h-4 w-4" />
                <span>Hola, {adminUser?.username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-emerald-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Servicios</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Servicios Activos</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Socios</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalPartners}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Precio Promedio</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${stats.avgPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partners Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Registro de Socios</span>
                </CardTitle>
                <CardDescription>
                  Administra la información de todos los socios registrados
                </CardDescription>
              </div>
              
              <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingPartner(null);
                    partnerForm.reset({
                      fullName: "",
                      company: "",
                      rfc: "",
                      email: "",
                      whatsapp: "",
                      personalAddress: "",
                      assistantName: "",
                    });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Socio
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPartner ? "Editar Socio" : "Registrar Nuevo Socio"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPartner 
                        ? "Modifica la información del socio"
                        : "Completa toda la información requerida del socio"
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...partnerForm}>
                    <form onSubmit={partnerForm.handleSubmit(onSubmitPartner)} className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={partnerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre Completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Juan Pérez García" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={partnerForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Empresa</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Tecnología Avanzada S.A." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={partnerForm.control}
                          name="rfc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>RFC / RFC de Empresa</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: PEGJ850101A1B" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={partnerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="juan@empresa.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={partnerForm.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: +52 55 1234 5678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={partnerForm.control}
                        name="personalAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección Personal</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Calle, número, colonia, ciudad, estado, código postal..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={partnerForm.control}
                        name="assistantName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de Asistente</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: María López" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={createPartnerMutation.isPending || updatePartnerMutation.isPending}
                        >
                          {createPartnerMutation.isPending || updatePartnerMutation.isPending
                            ? "Guardando..." 
                            : editingPartner ? "Actualizar Socio" : "Registrar Socio"
                          }
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {partners?.map((partner: Partner) => (
                <div key={partner.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-lg">{partner.fullName}</h3>
                      <p className="text-emerald-600 font-medium">{partner.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPartner(partner)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePartner(partner.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{partner.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{partner.whatsapp}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>RFC: {partner.rfc}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                        <span className="text-xs">{partner.personalAddress}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>Asistente: {partner.assistantName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Registrado: {new Date(partner.registrationDate).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {!partners?.length && (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No hay socios registrados</p>
                  <p className="text-sm text-slate-500">Registra el primer socio para empezar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function AdminPage() {
  const { isAuthenticated } = useAdminAuth();
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return <AdminDashboard />;
}