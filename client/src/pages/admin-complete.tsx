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
import { Plus, Pencil, Trash2, Package, DollarSign, TrendingUp, Users, Settings, Building2, LogOut, User, Phone, Mail, MapPin, Calendar, Filter, Search, FileText, Upload, Database, Eye } from "lucide-react";
import { z } from "zod";
import { Link } from "wouter";

const itemFormSchema = insertItemSchema.extend({
  basePrice: z.string().min(1, "Precio requerido"),
  minMargin: z.string().min(1, "Margen mínimo requerido"),
  maxMargin: z.string().min(1, "Margen máximo requerido"),
});

type ItemFormData = z.infer<typeof itemFormSchema>;
type PartnerFormData = z.infer<typeof insertPartnerSchema>;

// Categories and filters constants
const CATEGORIES = [
  "Mobiliario",
  "Menú", 
  "Decoración",
  "Branding",
  "Audio y Video",
  "Espectáculos",
  "Fotografía",
  "Memorabilia"
];

const QUALITY_LEVELS = ["Plata", "Oro", "Platino"];
const AMBIENTACION_TYPES = ["Conferencia", "Club", "Ceremonia", "Gala"];

function LoginForm() {
  const { loginMutation } = useAdminAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.jpg" 
              alt="PRIVEE Logo" 
              className="h-16 w-16 object-cover rounded-lg"
            />
          </div>
          <CardTitle>Panel de Administración</CardTitle>
          <CardDescription>
            Inicia sesión para acceder al sistema de gestión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard() {
  const { adminUser, logoutMutation } = useAdminAuth();
  const { toast } = useToast();
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  
  // Filters for items
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [qualityFilter, setQualityFilter] = useState<string>("all");
  const [ambientacionFilter, setAmbientacionFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  
  const itemForm = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "Menú" as const,
      basePrice: "",
      minMargin: "",
      maxMargin: "",
      status: "active",
      quality: "Plata" as const,
      ambientacion: "Club" as const,
    },
  });

  const partnerForm = useForm<PartnerFormData>({
    resolver: zodResolver(insertPartnerSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      company: "",
      rfc: "",
      email: "",
      whatsapp: "",
      personalAddress: "",
      assistantName: "",
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["/api/admin/items"],
  });

  const { data: partners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ["/api/partners"],
  }) as { data: Partner[]; isLoading: boolean };

  const { data: quotes = [] } = useQuery({
    queryKey: ["/api/admin/quotes"],
  });

  const { data: quoteStats = {} } = useQuery({
    queryKey: ["/api/admin/quotes/stats"],
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: InsertItem) => {
      const res = await apiRequest("POST", "/api/admin/items", data);
      if (!res.ok) throw new Error("Failed to create item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      toast({ title: "¡Éxito!", description: "Producto creado correctamente" });
      setIsItemDialogOpen(false);
      itemForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el producto", variant: "destructive" });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertItem> }) => {
      const res = await apiRequest("PUT", `/api/admin/items/${id}`, data);
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      toast({ title: "¡Éxito!", description: "Producto actualizado correctamente" });
      setIsItemDialogOpen(false);
      setEditingItem(null);
      itemForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el producto", variant: "destructive" });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/items/${id}`);
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      toast({ title: "¡Éxito!", description: "Producto eliminado correctamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el producto", variant: "destructive" });
    },
  });

  // Partner mutations
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

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/admin/change-password", {
        username: adminUser?.username,
        ...data
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "¡Éxito!", description: "Contraseña actualizada correctamente" });
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo cambiar la contraseña", 
        variant: "destructive" 
      });
    },
  });

  const onSubmitPassword = (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({ 
        title: "Error", 
        description: "Las contraseñas no coinciden", 
        variant: "destructive" 
      });
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  };

  const onSubmitItem = (data: ItemFormData) => {
    const processedData: InsertItem = {
      ...data,
      basePrice: data.basePrice,
      minMargin: parseInt(data.minMargin),
      maxMargin: parseInt(data.maxMargin),
    };

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data: processedData });
    } else {
      createItemMutation.mutate(processedData);
    }
  };

  const onSubmitPartner = (data: PartnerFormData) => {
    if (editingPartner) {
      updatePartnerMutation.mutate({ id: editingPartner.id, data });
    } else {
      createPartnerMutation.mutate(data);
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    itemForm.reset({
      name: item.name,
      description: item.description,
      category: item.category,
      basePrice: item.basePrice,
      minMargin: item.minMargin.toString(),
      maxMargin: item.maxMargin.toString(),
      status: item.status,
      quality: item.quality,
      ambientacion: item.ambientacion,
    });
    setIsItemDialogOpen(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    partnerForm.reset({
      username: partner.username,
      password: "", // Empty for security - admin can set new password if needed
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

  const handleDeleteItem = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const handleDeletePartner = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este socio?")) {
      deletePartnerMutation.mutate(id);
    }
  };

  // Filter items based on selected filters with production-safe normalization
  const filteredItems = items.filter((item: Item) => {
    // PRODUCTION FIX: Enhanced category matching for encoding issues
    const matchesCategory = categoryFilter === "all" || (() => {
      // Direct match first
      if (item.category === categoryFilter) return true;
      
      // Normalized comparison for production encoding differences
      const normalize = (str: string) => str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      // Handle specific problematic categories
      const itemCat = normalize(item.category);
      const filterCat = normalize(categoryFilter);
      
      if (itemCat === filterCat) return true;
      
      // Special handling for known problematic categories
      if ((itemCat === 'menu' || itemCat === 'menu') && (filterCat === 'menu' || filterCat === 'menu')) return true;
      if ((itemCat === 'mobiliario') && (filterCat === 'mobiliario')) return true;
      
      return false;
    })();
    
    const matchesQuality = qualityFilter === "all" || item.quality === qualityFilter;
    const matchesAmbientacion = ambientacionFilter === "all" || item.ambientacion === ambientacionFilter;
    const matchesSearch = searchFilter === "" || 
      item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.description.toLowerCase().includes(searchFilter.toLowerCase());
    
    return matchesCategory && matchesQuality && matchesAmbientacion && matchesSearch;
  });

  const stats = {
    totalItems: items.length,
    activeItems: items.filter((item: Item) => item.status === "active").length,
    totalPartners: partners.length,
    avgPrice: items.length ? 
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
              
              {/* Bulk Import Button */}
              <Link href="/data-import">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Carga Masiva
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>
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
        <div className="space-y-6 mb-8">
          {/* Indicadores de Cotizaciones */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Indicadores de Cotizaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">Total Cotizaciones</p>
                      <p className="text-2xl font-bold text-emerald-900">{quoteStats?.totalQuotes || 0}</p>
                    </div>
                    <FileText className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Vigentes (30 días)</p>
                      <p className="text-2xl font-bold text-blue-900">{quoteStats?.activeQuotes || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700">Vencidas</p>
                      <p className="text-2xl font-bold text-amber-900">{quoteStats?.expiredQuotes || 0}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Tasa Conversión</p>
                      <p className="text-2xl font-bold text-purple-900">{quoteStats?.conversionRate || 0}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Valores Monetarios */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Valores Monetarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Total Cotizado</p>
                      <p className="text-2xl font-bold text-green-900">
                        ${(quoteStats?.totalQuoted || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">Valor Aceptado</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        ${(quoteStats?.acceptedValue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyan-700">Este Mes</p>
                      <p className="text-2xl font-bold text-cyan-900">{quoteStats?.thisMonthQuotes || 0}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Indicadores de Sistema */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Productos</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.totalItems}</p>
                    </div>
                    <Package className="h-8 w-8 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Productos Activos</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.activeItems}</p>
                    </div>
                    <Settings className="h-8 w-8 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Socios</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.totalPartners}</p>
                    </div>
                    <Users className="h-8 w-8 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Precio Promedio</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${stats.avgPrice.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="items" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Productos</span>
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Cotizaciones</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Socios</span>
            </TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Catálogo de Productos</span>
                    </CardTitle>
                    <CardDescription>
                      Gestiona productos organizados por categorías con filtros de calidad y ambientación
                    </CardDescription>
                  </div>
                  
                  <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingItem(null);
                        itemForm.reset({
                          name: "",
                          description: "",
                          category: "",
                          basePrice: "",
                          minMargin: "",
                          maxMargin: "",
                          status: "active",
                          quality: "",
                          ambientacion: "",
                        });
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Producto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Editar Producto" : "Nuevo Producto"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingItem 
                            ? "Modifica los detalles del producto"
                            : "Agrega un nuevo producto al catálogo"
                          }
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...itemForm}>
                        <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4 max-h-96 overflow-y-auto">
                          <FormField
                            control={itemForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre del Producto</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ej: Mesa de Cristal Premium" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={itemForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe el producto en detalle..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={itemForm.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Categoría</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona categoría" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                          {category}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={itemForm.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Estado</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="active">Activo</SelectItem>
                                      <SelectItem value="inactive">Inactivo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={itemForm.control}
                              name="quality"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Calidad</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona calidad" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {QUALITY_LEVELS.map((quality) => (
                                        <SelectItem key={quality} value={quality}>
                                          {quality}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={itemForm.control}
                              name="ambientacion"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ambientación</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona ambientación" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {AMBIENTACION_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <FormField
                              control={itemForm.control}
                              name="basePrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Precio Base ($)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={itemForm.control}
                              name="minMargin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Margen Min (%)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={itemForm.control}
                              name="maxMargin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Margen Max (%)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={createItemMutation.isPending || updateItemMutation.isPending}
                            >
                              {createItemMutation.isPending || updateItemMutation.isPending
                                ? "Guardando..." 
                                : editingItem ? "Actualizar Producto" : "Crear Producto"
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
                {/* Filters Section */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <Filter className="h-4 w-4 text-slate-600" />
                    <h3 className="font-medium text-slate-900">Filtros</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="search">Buscar</Label>
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                        <Input
                          id="search"
                          placeholder="Buscar productos..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="category-filter">Categoría</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="quality-filter">Calidad</Label>
                      <Select value={qualityFilter} onValueChange={setQualityFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las calidades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las calidades</SelectItem>
                          {QUALITY_LEVELS.map((quality) => (
                            <SelectItem key={quality} value={quality}>
                              {quality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="ambientacion-filter">Ambientación</Label>
                      <Select value={ambientacionFilter} onValueChange={setAmbientacionFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las ambientaciones" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las ambientaciones</SelectItem>
                          {AMBIENTACION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {filteredItems.map((item: Item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{item.name}</h3>
                          <Badge variant={item.status === "active" ? "default" : "secondary"}>
                            {item.status === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge 
                            variant="outline" 
                            className={
                              item.quality === "Diamante" ? "border-purple-300 text-purple-700" :
                              item.quality === "Oro" ? "border-yellow-300 text-yellow-700" :
                              "border-gray-300 text-gray-700"
                            }
                          >
                            {item.quality}
                          </Badge>
                          <Badge variant="outline" className="border-blue-300 text-blue-700">
                            {item.ambientacion}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>Precio: <strong>${item.basePrice}</strong></span>
                          <span>Margen: <strong>{item.minMargin}%-{item.maxMargin}%</strong></span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredItems.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">
                        {searchFilter || categoryFilter !== "all" || qualityFilter !== "all" || ambientacionFilter !== "all"
                          ? "No se encontraron productos con los filtros aplicados"
                          : "No hay productos registrados"
                        }
                      </p>
                      <p className="text-sm text-slate-500">
                        {searchFilter || categoryFilter !== "all" || qualityFilter !== "all" || ambientacionFilter !== "all"
                          ? "Prueba ajustando los filtros"
                          : "Agrega tu primer producto para empezar"
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Gestión de Cotizaciones</span>
                    </CardTitle>
                    <CardDescription>
                      Control administrativo de todas las cotizaciones. Solo se pueden eliminar cotizaciones en estado "draft".
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Quote Filters */}
                  <div className="flex flex-wrap gap-4">
                    <Select value={"all"} onValueChange={() => {}}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="sent">Enviado</SelectItem>
                        <SelectItem value="accepted">Aceptado</SelectItem>
                        <SelectItem value="rejected">Rechazado</SelectItem>
                        <SelectItem value="executed">Ejecutado</SelectItem>
                        <SelectItem value="expired">Expirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quotes List */}
                  <div className="space-y-3">
                    {quotes?.map((quote: any) => (
                      <div key={quote.id} className="border rounded-lg p-4 bg-white hover:bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-slate-900">{quote.quoteNumber}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                quote.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                quote.status === 'executed' ? 'bg-purple-100 text-purple-700' :
                                quote.status === 'expired' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {quote.status === 'draft' ? 'Borrador' :
                                 quote.status === 'sent' ? 'Enviado' :
                                 quote.status === 'accepted' ? 'Aceptado' :
                                 quote.status === 'rejected' ? 'Rechazado' :
                                 quote.status === 'executed' ? 'Ejecutado' :
                                 quote.status === 'expired' ? 'Expirado' :
                                 quote.status
                                }
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 space-y-1">
                              <p><strong>Cliente:</strong> {quote.clientName} ({quote.clientCompany})</p>
                              <p><strong>Proyecto:</strong> {quote.projectName}</p>
                              <p><strong>Socio:</strong> {quote.partnerName}</p>
                              <p><strong>Total:</strong> ${parseFloat(quote.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                              <p><strong>Fecha:</strong> {new Date(quote.createdAt).toLocaleDateString('es-ES')}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/quote/${quote.quoteNumber}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {quote.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm(
                                    `¿Estás seguro de que deseas eliminar la cotización ${quote.quoteNumber}?\n\nEsta acción no se puede deshacer. Solo se pueden eliminar cotizaciones en estado borrador.`
                                  )) {
                                    // Handle delete quote
                                    console.log('Delete quote:', quote.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!quotes || quotes.length === 0) && (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No hay cotizaciones registradas</p>
                        <p className="text-sm text-slate-500">Las cotizaciones aparecerán aquí cuando los socios las creen</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners">
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
                          username: "",
                          password: "",
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
                          {/* Credenciales de Acceso */}
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-900 mb-3">Credenciales de Acceso</h4>
                            {editingPartner && (
                              <p className="text-xs text-blue-700 mb-3">
                                Deja la contraseña vacía para mantener la actual, o ingresa una nueva para cambiarla.
                              </p>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={partnerForm.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Usuario</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ej: socio1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={partnerForm.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Contraseña inicial" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Información Personal */}
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
                    <div key={partner.id} className="p-4 bg-white border rounded-lg shadow-sm">
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
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Actualiza tu contraseña de administrador
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input
                {...passwordForm.register("currentPassword")}
                type="password"
                placeholder="Ingresa tu contraseña actual"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                {...passwordForm.register("newPassword")}
                type="password"
                placeholder="Ingresa la nueva contraseña"
                minLength={6}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                {...passwordForm.register("confirmPassword")}
                type="password"
                placeholder="Confirma la nueva contraseña"
                minLength={6}
                required
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Nota para Socios:</strong> Los socios pueden cambiar su contraseña 
                directamente en su perfil de Replit. No requieren asistencia del administrador.
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsPasswordDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? "Actualizando..." : "Cambiar Contraseña"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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