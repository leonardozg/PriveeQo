import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuoteSchema } from "@shared/schema";
import type { Item, InsertQuoteItem, QuoteWithItems } from "@shared/schema";
import { Plus, Eye, Save, FileText, Handshake, TrendingUp, Package, Filter, Search, X, DollarSign, Percent, Calculator, Users, Building2, Mail, Tag, Copy, ExternalLink, Share2, CheckCircle, LogOut, Settings, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePartnerAuth } from "@/hooks/use-partner-auth";
import { PartnerProtectedRoute } from "@/components/partner-protected-route";
import { isUnauthorizedError } from "@/lib/authUtils";
import { openQuoteInNewTab, generateQuoteHTML } from "@/lib/html-quote-generator";
import { z } from "zod";
import priveeLogoPath from "@assets/Hires jpeg-05_1754761049044.jpg";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";

const quoteFormSchema = insertQuoteSchema.extend({
  subtotal: z.string(),
  totalMargin: z.string(),
  tax: z.string(),
  total: z.string(),
  terms: z.string().optional(),
  eventDate: z.string().optional(),
});

interface SelectedItem extends Item {
  margin: number;
  marginAmount: number;
  totalPrice: number;
  customPrice?: number;
}

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

export default function PartnerPage() {
  return (
    <PartnerProtectedRoute>
      <PartnerPageContent />
    </PartnerProtectedRoute>
  );
}

function PartnerPageContent() {
  const { toast } = useToast();
  const { partner, logoutMutation, changePasswordMutation } = usePartnerAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState<QuoteWithItems | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'quotes'>('catalog');
  
  // Filter states - ordered by selection priority
  const [ambientacionFilter, setAmbientacionFilter] = useState<string>("all");
  const [qualityFilter, setQualityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: items = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["/api/admin/items"], // Use admin items endpoint for now
  });

  // Fetch partner quotes
  const { data: quotes = [], isLoading: quotesLoading, refetch: refetchQuotes } = useQuery<QuoteWithItems[]>({
    queryKey: ["/api/partner/quotes"],
  });

  // Use authenticated partner info
  const selectedPartner = partner;

  // Mutation for updating quote status
  const updateQuoteStatusMutation = useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/partner/quotes/${quoteId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      refetchQuotes();
      toast({ title: "Estado actualizado", description: "El estado de la cotización se actualizó correctamente." });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Redirigiendo al login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/partner-login";
        }, 1000);
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado de la cotización",
        variant: "destructive",
      });
    }
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: { quote: any; items: InsertQuoteItem[] }) => {
      const response = await apiRequest("POST", "/api/partner/quotes", data);
      return response.json();
    },
    onSuccess: (quote: QuoteWithItems) => {
      setGeneratedQuote(quote);
      setSuccessModalOpen(true);
      setQuoteModalOpen(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/partner/quotes"] });
      
      toast({ 
        title: "¡Cotización generada!", 
        description: `Código: ${quote.quoteNumber}. Usa el botón 'Ver Cotización' para abrir el enlace.` 
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Redirigiendo al login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({ title: "Error", description: "No se pudo crear la cotización", variant: "destructive" });
    },
  });

  // Password change mutation is already available from usePartnerAuth hook

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ 
        title: "Error", 
        description: "Las contraseñas no coinciden", 
        variant: "destructive" 
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({ 
        title: "Error", 
        description: "La contraseña debe tener al menos 6 caracteres", 
        variant: "destructive" 
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };



  const form = useForm<z.infer<typeof quoteFormSchema>>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientCompany: "",
      projectName: "",
      eventDate: "",
      partnerName: selectedPartner?.fullName || "Socio PRIVEE",
      partnerEmail: selectedPartner?.email || "socio@privee.com",
      partnerCompany: selectedPartner?.company || "PRIVEE Partners",
      subtotal: "0.00",
      totalMargin: "0.00",
      tax: "0.00",
      total: "0.00",
      status: "draft",
      terms: "• Precio por invitado en base a un estimado de 100 invitados adultos\n• Reserva con 5,000 pesos\n• Se requiere del 50% de anticipo para confirmación de fecha\n• Finiquito de 20 días hábiles antes del evento\n• Se solicita un mínimo de 100 personas para respetar los costos antes mencionados, en caso de ser menos invitados se tendrá que hacer un ajuste\n• Cotización válida por 30 días desde la fecha de emisión\n• Revisiones adicionales fuera del alcance pueden generar cargos extra",
    },
  });

  // Update form when partner info is loaded
  useEffect(() => {
    if (selectedPartner) {
      form.reset({
        clientName: "",
        clientEmail: "",
        clientCompany: "",
        projectName: "",
        eventDate: "",
        partnerName: selectedPartner.fullName || "Socio PRIVEE",
        partnerEmail: selectedPartner.email || "socio@privee.com",
        partnerCompany: selectedPartner.company || "PRIVEE Partners",
        subtotal: "0.00",
        totalMargin: "0.00",
        tax: "0.00",
        total: "0.00",
        status: "draft",
        terms: "• Precio por invitado en base a un estimado de 100 invitados adultos\n• Reserva con 5,000 pesos\n• Se requiere del 50% de anticipo para confirmación de fecha\n• Finiquito de 20 días hábiles antes del evento\n• Se solicita un mínimo de 100 personas para respetar los costos antes mencionados, en caso de ser menos invitados se tendrá que hacer un ajuste\n• Cotización válida por 30 días desde la fecha de emisión\n• Revisiones adicionales fuera del alcance pueden generar cargos extra",
      });
    }
  }, [selectedPartner, form]);

  // Filter items - only show active items and apply filters
  const filteredItems = items.filter((item) => {
    // Only show active items
    const isActive = item.status === "active";
    
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAmbientacion = ambientacionFilter === "all" || item.ambientacion === ambientacionFilter;
    const matchesQuality = qualityFilter === "all" || item.quality === qualityFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return isActive && matchesSearch && matchesAmbientacion && matchesQuality && matchesCategory;
  });

  const addItemToQuote = (item: Item) => {
    if (selectedItems.find(selected => selected.id === item.id)) {
      toast({ title: "Atención", description: "Este producto ya está en la cotización", variant: "destructive" });
      return;
    }

    const margin = Math.round(item.minMargin); // Start with minimum margin, ensure integer
    const basePrice = parseFloat(item.basePrice);
    const marginAmount = basePrice * (margin / 100);
    const totalPrice = basePrice + marginAmount;

    const selectedItem: SelectedItem = {
      ...item,
      margin,
      marginAmount,
      totalPrice,
    };

    setSelectedItems(prev => [...prev, selectedItem]);
    updateQuoteTotals([...selectedItems, selectedItem]);
    toast({ title: "¡Éxito!", description: `${item.name} agregado a la cotización` });
  };

  const removeItemFromQuote = (itemId: string) => {
    const updatedItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(updatedItems);
    updateQuoteTotals(updatedItems);
    toast({ title: "Producto removido", description: "El producto fue eliminado de la cotización" });
  };

  const updateItemMargin = (itemId: string, newMargin: number) => {
    const updatedItems = selectedItems.map(item => {
      if (item.id === itemId) {
        const basePrice = parseFloat(item.basePrice);
        const roundedMargin = Math.round(newMargin); // Ensure integer
        const marginAmount = basePrice * (roundedMargin / 100);
        const totalPrice = basePrice + marginAmount;
        return { ...item, margin: roundedMargin, marginAmount, totalPrice };
      }
      return item;
    });
    setSelectedItems(updatedItems);
    updateQuoteTotals(updatedItems);
  };

  const updateItemCustomPrice = (itemId: string, customPrice: number) => {
    const item = selectedItems.find(item => item.id === itemId);
    if (!item) return;
    
    const basePrice = parseFloat(item.basePrice);
    const maxAllowedPrice = basePrice + (basePrice * (item.maxMargin / 100));
    const minAllowedPrice = basePrice + (basePrice * (item.minMargin / 100));
    
    if (customPrice > maxAllowedPrice) {
      toast({ 
        title: "Precio fuera de rango", 
        description: `El precio máximo permitido es $${maxAllowedPrice.toFixed(2)}`, 
        variant: "destructive" 
      });
      return;
    }
    
    if (customPrice < minAllowedPrice) {
      toast({ 
        title: "Precio fuera de rango", 
        description: `El precio mínimo permitido es $${minAllowedPrice.toFixed(2)}`, 
        variant: "destructive" 
      });
      return;
    }
    
    const marginAmount = customPrice - basePrice;
    const margin = Math.round((marginAmount / basePrice) * 100); // Ensure integer
    
    const updatedItems = selectedItems.map(selectedItem => {
      if (selectedItem.id === itemId) {
        return { 
          ...selectedItem, 
          margin, 
          marginAmount, 
          totalPrice: customPrice,
          customPrice 
        };
      }
      return selectedItem;
    });
    
    setSelectedItems(updatedItems);
    updateQuoteTotals(updatedItems);
  };

  const updateQuoteTotals = (items: SelectedItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.basePrice), 0);
    const totalMargin = items.reduce((sum, item) => sum + item.marginAmount, 0);
    const tax = 0; // No tax for now
    const total = subtotal + totalMargin + tax;

    form.setValue("subtotal", subtotal.toFixed(2));
    form.setValue("totalMargin", totalMargin.toFixed(2));
    form.setValue("tax", tax.toFixed(2));
    form.setValue("total", total.toFixed(2));
  };

  const onSubmit = (data: z.infer<typeof quoteFormSchema>) => {
    if (selectedItems.length === 0) {
      toast({ title: "Error", description: "Debes agregar al menos un producto a la cotización", variant: "destructive" });
      return;
    }

    const quoteItems: InsertQuoteItem[] = selectedItems.map(item => ({
      itemId: item.id,
      name: item.name,
      description: item.description,
      basePrice: item.basePrice,
      margin: Math.round(item.margin), // Ensure integer
      marginAmount: item.marginAmount.toString(),
      totalPrice: item.totalPrice.toString(),
    }));

    // Keep all data as strings to match schema
    createQuoteMutation.mutate({ quote: data, items: quoteItems });
  };

  const previewQuote = (data: z.infer<typeof quoteFormSchema>) => {
    if (selectedItems.length === 0) {
      toast({ title: "Error", description: "Debes agregar al menos un producto para previsualizar", variant: "destructive" });
      return;
    }

    // Create a preview quote with the form data
    const subtotal = selectedItems.reduce((sum, item) => sum + parseFloat(item.basePrice), 0);
    const totalMargin = selectedItems.reduce((sum, item) => sum + item.marginAmount, 0);
    const ivaAmount = subtotal * 0.16;
    const total = subtotal + ivaAmount;

    const previewQuoteData: QuoteWithItems = {
      id: "preview",
      quoteNumber: "PREVIEW-001",
      partnerId: null,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientCompany: data.clientCompany || "",
      projectName: data.projectName,
      eventDate: data.eventDate || null,
      partnerName: data.partnerName,
      partnerEmail: data.partnerEmail, 
      partnerCompany: data.partnerCompany,
      subtotal: subtotal.toFixed(2),
      totalMargin: totalMargin.toFixed(2),
      tax: ivaAmount.toFixed(2),
      total: total.toFixed(2),
      status: "draft",
      terms: data.terms || "",
      createdAt: new Date(),
      items: selectedItems.map(item => ({
        id: `preview-item-${item.id}`,
        quoteId: "preview",
        itemId: item.id,
        name: item.name,
        description: item.description,
        basePrice: item.basePrice,
        margin: item.margin,
        marginAmount: item.marginAmount.toString(),
        totalPrice: item.totalPrice.toString(),
      }))
    };

    // Generate and open the preview HTML
    openQuoteInNewTab(previewQuoteData);
    toast({ 
      title: "Vista previa generada", 
      description: "La cotización se abrió en una nueva pestaña para previsualización" 
    });
  };

  const clearFilters = () => {
    setAmbientacionFilter("all");
    setQualityFilter("all");
    setCategoryFilter("all");
    setSearchTerm("");
  };

  const stats = {
    totalProducts: items.length,
    activeProducts: items.filter(item => item.status === "active").length,
    selectedItems: selectedItems.length,
    quoteTotal: selectedItems.reduce((sum, item) => sum + item.totalPrice, 0),
  };

  if (itemsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center animate-fade-in" style={{ fontFamily: 'var(--font-arial)' }}>
        <EnhancedCard className="max-w-md p-8 text-center" animation="scale" gradient>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary absolute top-0 left-0"></div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-700">Cargando catálogo PRIVEE</p>
              <p className="text-sm text-gray-500">Preparando productos para cotización...</p>
            </div>
          </div>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 animate-fade-in" style={{ fontFamily: 'var(--font-arial)' }}>
      {/* Enhanced Header with Micro-interactions */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="privee-container">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-4 animate-slide-up">
              {/* Enhanced PRIVEE Logo */}
              <div className="relative hover-lift">
                <img 
                  src={priveeLogoPath} 
                  alt="PRIVEE Logo" 
                  className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border-2 border-gray-200"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-black/10 pointer-events-none"></div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl sm:text-2xl font-bold privee-text-gradient">Portal de Socios</h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">PRIVEE - Cotizaciones Profesionales</p>
              </div>
              <div className="block md:hidden">
                <h1 className="text-lg font-bold privee-text-gradient">Portal</h1>
                <p className="text-xs text-gray-600">PRIVEE</p>
              </div>
            </div>
            
            {/* Enhanced Partner Info with Animation */}
            <div className="flex items-center space-x-2 sm:space-x-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {selectedPartner && (
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-xl border border-gray-200 hover-lift">
                  <Users className="h-4 w-4 text-gray-600" />
                  <div className="text-sm">
                    <span className="font-medium text-gray-800">{selectedPartner.fullName}</span>
                    <span className="text-gray-600 ml-2">• {selectedPartner.company}</span>
                  </div>
                </div>
              )}
              {selectedPartner && (
                <div className="flex sm:hidden items-center space-x-1 bg-gray-100 px-2 py-1 rounded-lg border">
                  <Users className="h-3 w-3 text-gray-600" />
                  <span className="text-xs font-medium text-gray-800 truncate max-w-20">{selectedPartner.fullName}</span>
                </div>
              )}
              {!selectedPartner && (
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-xl border border-gray-200">
                  <div className="loading-dots w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 mobile-hidden">Cargando información del socio...</span>
                  <span className="text-xs text-gray-700 mobile-only">Cargando...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {selectedItems.length > 0 && (
                <EnhancedButton 
                  onClick={() => setQuoteModalOpen(true)} 
                  disabled={!selectedPartner} 
                  gradient
                  animation="lift"
                  className="enhanced-button shadow-lg hover:shadow-xl"
                  icon={<FileText className="h-4 w-4" />}
                >
                  <span className="mobile-hidden">Crear Cotización</span>
                  <span className="mobile-only">Cotizar</span>
                </EnhancedButton>
              )}
              <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <EnhancedButton 
                    variant="ghost" 
                    size="sm"
                    animation="lift"
                    icon={<Settings className="h-4 w-4" />}
                    className="mobile-hidden"
                  >
                    Cambiar Contraseña
                  </EnhancedButton>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <EnhancedButton 
                    variant="ghost" 
                    size="sm"
                    animation="lift"
                    className="mobile-only"
                  >
                    <Settings className="h-4 w-4" />
                  </EnhancedButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                    <DialogDescription>
                      Actualiza tu contraseña de acceso al portal
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current">Contraseña Actual</Label>
                      <Input
                        id="current"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="enhanced-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new">Nueva Contraseña</Label>
                      <Input
                        id="new"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="enhanced-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm">Confirmar Nueva Contraseña</Label>
                      <Input
                        id="confirm"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="enhanced-input"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <EnhancedButton
                      variant="outline"
                      onClick={() => setPasswordDialogOpen(false)}
                    >
                      Cancelar
                    </EnhancedButton>
                    <EnhancedButton
                      onClick={handlePasswordChange}
                      disabled={changePasswordMutation.isPending}
                      loading={changePasswordMutation.isPending}
                      loadingText="Actualizando..."
                      gradient
                    >
                      Actualizar Contraseña
                    </EnhancedButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <EnhancedButton 
                variant="ghost" 
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                animation="press"
                icon={<LogOut className="h-4 w-4" />}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                data-testid="button-logout"
              >
                <span className="mobile-hidden">Cerrar Sesión</span>
              </EnhancedButton>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Stats Section */}
      <div className="privee-container privee-section">
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 4 }} gap={6} className="mb-8">
            <EnhancedCard hover animation="slide" delay={0.1}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Package className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Productos Disponibles</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
                  </div>
                </div>
              </CardContent>
            </EnhancedCard>
            
            <EnhancedCard hover animation="slide" delay={0.2}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">En Cotización</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.selectedItems}</p>
                  </div>
                </div>
              </CardContent>
            </EnhancedCard>
            
            <EnhancedCard hover animation="slide" delay={0.3}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Cotización</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.quoteTotal.toFixed(2)}
                    </p>
                </div>
              </div>
            </CardContent>
          </EnhancedCard>
          
          <EnhancedCard hover animation="slide" delay={0.4}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Resultados Filtrados</p>
                  <p className="text-2xl font-bold text-slate-900">{filteredItems.length}</p>
                </div>
              </div>
            </CardContent>
          </EnhancedCard>
        </ResponsiveGrid>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Catálogo de Productos
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'quotes'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Mis Cotizaciones ({quotes.length})
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters and Product Catalog */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Catálogo de Productos</span>
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground font-normal">Selecciona los productos para tu cotización comenzando con la Ambientación que espera tu cliente, después selecciona la Calidad que crees que puede pagar tu cliente y al final selecciona la Categoría de productos que irás agregando a la cotización</CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Filters Section */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-slate-600" />
                      <h3 className="font-medium text-slate-900">Filtros de Búsqueda</h3>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Limpiar Filtros
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Ambientación - Primer filtro */}
                    <div>
                      <Label htmlFor="ambientacion-filter" className="text-sm font-medium text-slate-700">
                        1. Ambientación
                      </Label>
                      <Select value={ambientacionFilter} onValueChange={setAmbientacionFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ambientación" />
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
                    
                    {/* 2. Calidad - Segundo filtro */}
                    <div>
                      <Label htmlFor="quality-filter" className="text-sm font-medium text-slate-700">
                        2. Calidad
                      </Label>
                      <Select value={qualityFilter} onValueChange={setQualityFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona calidad" />
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
                    
                    {/* 3. Categoría - Tercer filtro */}
                    <div>
                      <Label htmlFor="category-filter" className="text-sm font-medium text-slate-700">
                        3. Categoría
                      </Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona categoría" />
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
                    
                    {/* 4. Búsqueda - Último filtro */}
                    <div>
                      <Label htmlFor="search" className="text-sm font-medium text-slate-700">
                        Búsqueda
                      </Label>
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                        <Input
                          id="search"
                          type="text"
                          placeholder="Buscar productos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredItems.map((item) => {
                    const minPrice = parseFloat(item.basePrice) * (1 + item.minMargin / 100);
                    const maxPrice = parseFloat(item.basePrice) * (1 + item.maxMargin / 100);
                    const isSelected = selectedItems.find(selected => selected.id === item.id);
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 border rounded-lg transition-all ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-slate-900">{item.name}</h3>
                              <Badge variant="outline">{item.category}</Badge>
                              <Badge 
                                variant="outline" 
                                className={
                                  item.quality === "Platino" ? "border-purple-300 text-purple-700" :
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
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-slate-600">
                                Base: <strong>${item.basePrice}</strong>
                              </span>
                              <span className="text-emerald-600">
                                Rango: <strong>${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</strong>
                              </span>
                              <span className="text-blue-600">
                                Margen: <strong>{item.minMargin}%-{item.maxMargin}%</strong>
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            variant={isSelected ? "secondary" : "default"}
                            size="sm"
                            onClick={() => addItemToQuote(item)}
                            disabled={!!isSelected}
                          >
                            {isSelected ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Agregado
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredItems.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">
                        No se encontraron productos con los filtros aplicados
                      </p>
                      <p className="text-sm text-slate-500">
                        Prueba ajustando los filtros de búsqueda
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Items Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Productos Seleccionados</span>
                  <Badge variant="secondary">{selectedItems.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Ajusta precios dentro de los márgenes permitidos
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No hay productos seleccionados</p>
                    <p className="text-sm text-slate-500">
                      Selecciona productos del catálogo para crear una cotización
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedItems.map((item) => {
                      const minPrice = parseFloat(item.basePrice) * (1 + item.minMargin / 100);
                      const maxPrice = parseFloat(item.basePrice) * (1 + item.maxMargin / 100);
                      
                      return (
                        <div key={item.id} className="p-3 bg-slate-50 rounded-lg border">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 text-sm">{item.name}</h4>
                              <p className="text-xs text-slate-600">{item.category}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItemFromQuote(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-500">Precio base:</span>
                                <span className="font-medium ml-1">${item.basePrice}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Precio por persona:</span>
                                <span className="font-medium ml-1 text-emerald-600">
                                  ${item.totalPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Margen: {item.margin.toFixed(1)}%</Label>
                              <Slider
                                value={[item.margin]}
                                onValueChange={(value) => updateItemMargin(item.id, value[0])}
                                max={item.maxMargin}
                                min={item.minMargin}
                                step={0.5}
                                className="mt-2"
                              />
                              <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>{item.minMargin}%</span>
                                <span>{item.maxMargin}%</span>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Precio por Persona Personalizado</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min={minPrice}
                                max={maxPrice}
                                value={item.totalPrice.toFixed(2)}
                                onChange={(e) => {
                                  const newPrice = parseFloat(e.target.value) || 0;
                                  updateItemCustomPrice(item.id, newPrice);
                                }}
                                className="mt-1 text-xs"
                              />
                              <p className="text-xs text-slate-500 mt-1">
                                Rango: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="border-t pt-4 mt-4 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Total de Cotización:</span>
                        <span className="font-bold text-lg text-emerald-600">
                          ${stats.quoteTotal.toFixed(2)}
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => setQuoteModalOpen(true)}
                        disabled={selectedItems.length === 0}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Crear Cotización ({selectedItems.length} productos)
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {/* My Quotes Tab */}
        {activeTab === 'quotes' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Mis Cotizaciones</span>
              </CardTitle>
              <CardDescription>
                Gestiona el estado de tus cotizaciones creadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotesLoading && (
                  <div className="text-center py-8">
                    <p className="text-slate-600">Cargando cotizaciones...</p>
                  </div>
                )}

                {quotes.map((quote) => (
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
                          <p><strong>Cliente:</strong> {quote.clientName}</p>
                          <p><strong>Proyecto:</strong> {quote.projectName}</p>
                          <p><strong>Total:</strong> ${parseFloat(quote.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                          <p><strong>Fecha:</strong> {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('es-ES') : 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[100px]">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/quote/${quote.quoteNumber}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        {/* Status transition buttons */}
                        {quote.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => updateQuoteStatusMutation.mutate({ quoteId: quote.id, status: 'sent' })}
                            disabled={updateQuoteStatusMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            data-testid={`button-send-${quote.id}`}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                        {quote.status === 'sent' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => updateQuoteStatusMutation.mutate({ quoteId: quote.id, status: 'accepted' })}
                              disabled={updateQuoteStatusMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-xs px-2"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Aceptar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuoteStatusMutation.mutate({ quoteId: quote.id, status: 'rejected' })}
                              disabled={updateQuoteStatusMutation.isPending}
                              className="text-red-600 hover:text-red-700 text-xs px-2"
                            >
                              <X className="h-3 w-3" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                        {quote.status === 'accepted' && (
                          <Button
                            size="sm"
                            onClick={() => updateQuoteStatusMutation.mutate({ quoteId: quote.id, status: 'executed' })}
                            disabled={updateQuoteStatusMutation.isPending}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Ejecutar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {quotes.length === 0 && !quotesLoading && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No tienes cotizaciones creadas</p>
                    <p className="text-sm text-slate-500">Ve al catálogo para crear tu primera cotización</p>
                    <Button 
                      onClick={() => setActiveTab('catalog')}
                      className="mt-4"
                      variant="outline"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Ir al Catálogo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Quote Form Dialog */}
      <Dialog open={quoteModalOpen} onOpenChange={setQuoteModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear Nueva Cotización</DialogTitle>
            <DialogDescription>
              Completa la información del cliente y evento para generar la cotización
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email del Cliente</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="cliente@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa del Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Tecnología S.A." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Evento Corporativo 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-4 border-b pb-2">
                Información del Evento
              </h3>
              
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Tentativa del Evento</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ""} 
                        placeholder="Selecciona la fecha tentativa" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="partnerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tu Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-slate-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="partnerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tu Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled className="bg-slate-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="partnerCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tu Empresa</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-slate-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Términos y Condiciones</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Summary */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Resumen de Cotización</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Productos:</span>
                    <span>{selectedItems.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${form.watch("subtotal")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margen Total:</span>
                    <span>${form.watch("totalMargin")}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${form.watch("total")}</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => setQuoteModalOpen(false)}>
                  Cancelar
                </Button>

                <Button 
                  type="button" 
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    const formData = form.getValues();
                    if (!formData.clientName || !formData.clientEmail || !formData.projectName) {
                      toast({ title: "Campos requeridos", description: "Completa nombre del cliente, email y evento para previsualizar", variant: "destructive" });
                      return;
                    }
                    previewQuote(formData);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Previsualizar
                </Button>

                <Button type="submit" disabled={createQuoteMutation.isPending}>
                  {createQuoteMutation.isPending ? "Generando..." : "Generar Cotización"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>¡Cotización Generada Exitosamente! 🎉</DialogTitle>
            <DialogDescription>
              Tu cotización ha sido creada con un código único y está lista para compartir
            </DialogDescription>
          </DialogHeader>
          
          {generatedQuote && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">Cotización Creada</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-600">Código de Cotización:</span>
                    <span className="font-mono font-bold text-emerald-700 ml-2">
                      {generatedQuote.quoteNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Cliente:</span>
                    <span className="font-medium ml-2">{generatedQuote.clientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Evento:</span>
                    <span className="font-medium ml-2">{generatedQuote.projectName}</span>
                  </div>
                  {generatedQuote.eventDate && (
                    <div>
                      <span className="text-slate-600">Fecha del evento:</span>
                      <span className="font-medium ml-2">{generatedQuote.eventDate}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-600">Total:</span>
                    <span className="font-bold text-emerald-700 ml-2">
                      ${parseFloat(generatedQuote.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Enlace para Compartir</h4>
                <div className="flex items-center space-x-2">
                  <Input 
                    readOnly 
                    value={`${window.location.origin}/quote/${generatedQuote.quoteNumber}`}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/quote/${generatedQuote.quoteNumber}`);
                      toast({ title: "Enlace copiado", description: "El enlace se ha copiado al portapapeles" });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Comparte este enlace con tu cliente para que pueda ver la cotización
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Add small delay to ensure quote is fully saved
                    setTimeout(() => {
                      window.open(`/quote/${generatedQuote.quoteNumber}`, '_blank');
                    }, 100);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Cotización
                </Button>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/quote/${generatedQuote.quoteNumber}`);
                    toast({ 
                      title: "Enlace copiado", 
                      description: "Puedes enviarlo directamente a tu cliente" 
                    });
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copiar Enlace
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setSuccessModalOpen(false);
                // Reset form and selected items
                setSelectedItems([]);
                form.reset();
              }}
            >
              Crear Nueva Cotización
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña actual y la nueva contraseña que deseas usar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña Actual</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
                placeholder="Ingresa tu contraseña actual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                placeholder="Confirma tu nueva contraseña"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setPasswordDialogOpen(false);
                setPasswordForm({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                  toast({
                    title: "Error",
                    description: "Las contraseñas no coinciden",
                    variant: "destructive",
                  });
                  return;
                }
                if (passwordForm.newPassword.length < 6) {
                  toast({
                    title: "Error",
                    description: "La nueva contraseña debe tener al menos 6 caracteres",
                    variant: "destructive",
                  });
                  return;
                }
                changePasswordMutation.mutate({
                  currentPassword: passwordForm.currentPassword,
                  newPassword: passwordForm.newPassword,
                }, {
                  onSuccess: () => {
                    toast({
                      title: "Éxito",
                      description: "Contraseña cambiada correctamente",
                    });
                    setPasswordDialogOpen(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  },
                });
              }}
              disabled={changePasswordMutation.isPending || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              {changePasswordMutation.isPending ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  );
}