import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertItemSchema } from "@shared/schema";
import type { Item, InsertItem } from "@shared/schema";
import { Plus, Edit, Trash2, Users, FileText, Package, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const itemFormSchema = insertItemSchema.extend({
  basePrice: z.string().min(1, "Base price is required"),
});

export default function AdminPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertItem) => {
      const response = await apiRequest("POST", "/api/items", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setIsAddModalOpen(false);
      toast({ title: "Item created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create item", variant: "destructive" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertItem> }) => {
      const response = await apiRequest("PUT", `/api/items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setEditingItem(null);
      toast({ title: "Item updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update item", variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({ title: "Item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete item", variant: "destructive" });
    },
  });

  const form = useForm<z.infer<typeof itemFormSchema>>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      basePrice: "",
      minMargin: 15,
      maxMargin: 40,
      status: "active",
    },
  });

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(items.map(item => item.category)));

  const onSubmit = (values: z.infer<typeof itemFormSchema>) => {
    const data: InsertItem = {
      ...values,
      basePrice: values.basePrice,
    };

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description,
      category: item.category,
      basePrice: item.basePrice,
      minMargin: item.minMargin,
      maxMargin: item.maxMargin,
      status: item.status,
    });
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingItem(null);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.jpg" 
              alt="Privee Logo" 
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Privee Admin</h1>
              <p className="text-sm text-slate-500">Gestión de Artículos y Precios</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-primary-100 text-primary-800">Administrador</Badge>
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <Users className="text-slate-600 text-sm" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <nav className="w-64 bg-white border-r border-slate-200 min-h-screen">
          <div className="p-6">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium">
                  <Package className="w-5 h-5" />
                  <span>Base de Datos</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                  <TrendingUp className="w-5 h-5" />
                  <span>Reglas de Precios</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                  <Users className="w-5 h-5" />
                  <span>Gestión de Socios</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                  <TrendingUp className="w-5 h-5" />
                  <span>Analíticas</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Admin Main Content */}
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total de Artículos</p>
                    <p className="text-2xl font-bold text-slate-900">{items.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Socios Activos</p>
                    <p className="text-2xl font-bold text-slate-900">18</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Users className="text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Cotizaciones Mensuales</p>
                    <p className="text-2xl font-bold text-slate-900">156</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Margen Promedio</p>
                    <p className="text-2xl font-bold text-slate-900">24%</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/logo.jpg" 
                    alt="Privee Logo" 
                    className="w-12 h-12 object-contain opacity-80"
                  />
                  <div>
                    <CardTitle>Base de Datos de Artículos</CardTitle>
                    <p className="text-sm text-slate-500">Gestiona servicios, precios y límites de margen</p>
                  </div>
                </div>
                <Dialog open={isAddModalOpen || !!editingItem} onOpenChange={handleCloseModal}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary-600 hover:bg-primary-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Artículo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Editar Artículo" : "Añadir Nuevo Artículo"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripción</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoría</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="basePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Precio Base</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="minMargin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Margen Mín (%)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="maxMargin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Margen Máx (%)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createItemMutation.isPending || updateItemMutation.isPending}
                            className="bg-primary-600 hover:bg-primary-700"
                          >
                            {createItemMutation.isPending || updateItemMutation.isPending ? "Guardando..." : "Guardar"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Items Table */}
              {isLoading ? (
                <div className="text-center py-8">Loading items...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Item</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Base Price</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Min Margin</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Max Margin</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-500">
                            No items found
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item) => (
                          <tr key={item.id}>
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-slate-900">{item.name}</div>
                                <div className="text-sm text-slate-500">{item.description}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="secondary">{item.category}</Badge>
                            </td>
                            <td className="py-4 px-4 font-mono text-slate-900">
                              ${parseFloat(item.basePrice).toFixed(2)}
                            </td>
                            <td className="py-4 px-4 font-mono text-slate-600">{item.minMargin}%</td>
                            <td className="py-4 px-4 font-mono text-slate-600">{item.maxMargin}%</td>
                            <td className="py-4 px-4">
                              <Badge variant={item.status === "active" ? "default" : "secondary"}>
                                {item.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteItemMutation.mutate(item.id)}
                                  disabled={deleteItemMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Footer with Logo */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="flex items-center justify-center space-x-4">
          <img 
            src="/logo.jpg" 
            alt="Privee Logo" 
            className="w-16 h-16 object-contain opacity-90"
          />
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900">PRIVEE</p>
            <p className="text-sm text-slate-500">Sistema de Gestión de Cotizaciones</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
