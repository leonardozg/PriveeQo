import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Database, Users, Package, CheckCircle, AlertCircle, Loader2, FileText, X, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ImportStats {
  items: number;
  partners: number;
  adminUsers: number;
}

interface ImportResult {
  success: boolean;
  message: string;
  stats?: ImportStats;
  errors?: string[];
}

export default function DataImport() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [currentStep, setCurrentStep] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"predefined" | "custom">("predefined");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
    } else {
      toast({
        title: "Archivo no válido",
        description: "Por favor selecciona un archivo CSV válido",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBulkImport = async () => {
    if (uploadMode === "custom" && !selectedFile) {
      toast({
        title: "Archivo requerido",
        description: "Por favor selecciona un archivo CSV para cargar",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    setResult(null);
    setCurrentStep("Iniciando carga masiva...");

    try {
      setProgress(20);
      
      if (uploadMode === "custom" && selectedFile) {
        setCurrentStep("Procesando archivo CSV...");
        
        // REPLIT DEPLOYMENT FIX: Send CSV as text instead of FormData
        const csvContent = await selectedFile.text();
        
        const response = await fetch("/api/admin/upload-csv", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            csvContent: csvContent,
            filename: selectedFile.name
          })
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        
        setProgress(100);
        setCurrentStep("¡Importación de CSV completada!");
        
        setResult(responseData);
        
        // FORCE CACHE INVALIDATION - Fix UI not updating without refresh
        await queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
        await queryClient.refetchQueries({ queryKey: ['/api/admin/items'] });
        
        toast({
          title: "Importación Exitosa", 
          description: `CSV importado con ${responseData.stats?.items || 0} productos`,
        });
        
      } else {
        // Modo predefinido (código original)
        setCurrentStep("Cargando catálogo predefinido...");
        
        const response = await fetch("/api/admin/bulk-import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            importType: "full",
            includeProducts: true,
            includePartners: true,
            includeAdmin: true
          })
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();

        setProgress(60);
        setCurrentStep("Procesando usuarios y partners...");
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProgress(90);
        setCurrentStep("Finalizando importación...");
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProgress(100);
        setCurrentStep("¡Importación completada!");
        
        setResult(responseData);
        
        // FORCE CACHE INVALIDATION - Fix UI not updating without refresh
        await queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
        await queryClient.refetchQueries({ queryKey: ['/api/admin/items'] });
        
        toast({
          title: "Importación Exitosa", 
          description: `Base de datos inicializada con ${responseData.stats?.items || 0} productos`,
        });
      }
      
    } catch (error) {
      console.error("Error during import:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      
      setResult({
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      });
      
      toast({
        title: "Error en Importación",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar SOLO los productos y cotizaciones? Los usuarios y socios NO serán afectados. Esta acción no se puede deshacer.")) {
      return;
    }

    setImporting(true);
    setCurrentStep("Eliminando productos y cotizaciones...");
    
    try {
      const resetResponse = await fetch("/api/admin/reset-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!resetResponse.ok) {
        throw new Error(`Error: ${resetResponse.status} ${resetResponse.statusText}`);
      }
      
      setResult(null);
      setCurrentStep("");
      
      // Refresh all relevant queries to reflect the changes
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quotes/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      
      toast({
        title: "Productos Eliminados",
        description: "Solo productos y cotizaciones fueron eliminados. Los usuarios y socios se mantienen.",
      });
      
    } catch (error) {
      console.error("Error resetting database:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar los productos",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header con botón de regresar */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Regresar al Panel
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-slate-700" />
              <h1 className="text-xl font-semibold text-slate-900">Importación Masiva de Datos</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <p className="text-gray-600">
            Carga únicamente el catálogo de productos. Los usuarios y socios se crean manualmente desde el panel de administración.
          </p>
        </div>

        <div className="grid gap-6">
        {/* Selector de modo de importación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`cursor-pointer transition-all ${uploadMode === "predefined" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"}`}>
            <CardContent className="p-4" onClick={() => setUploadMode("predefined")}>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${uploadMode === "predefined" ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Catálogo Predefinido</h3>
                  <p className="text-sm text-gray-600">87 productos listos para usar</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`cursor-pointer transition-all ${uploadMode === "custom" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"}`}>
            <CardContent className="p-4" onClick={() => setUploadMode("custom")}>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${uploadMode === "custom" ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Archivo CSV Personalizado</h3>
                  <p className="text-sm text-gray-600">Sube tu propio catálogo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tarjeta principal de importación */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>
                {uploadMode === "predefined" ? "Carga Completa del Sistema" : "Importación de CSV Personalizado"}
              </CardTitle>
            </div>
            <CardDescription>
              {uploadMode === "predefined" 
                ? "Importa solo el catálogo completo de productos. Los usuarios y socios se gestionan manualmente."
                : "Carga tu archivo CSV personalizado solo con productos"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Selector de archivo CSV para modo personalizado */}
            {uploadMode === "custom" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-file" className="text-base font-medium">
                    Seleccionar archivo CSV
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    El archivo debe contener las columnas: name, description, category, basePrice, minMargin, maxMargin, quality, ambientacion
                  </p>
                </div>
                
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Arrastra tu archivo CSV aquí o haz clic para seleccionar
                      </p>
                      <Input
                        ref={fileInputRef}
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Seleccionar archivo CSV
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">{selectedFile.name}</p>
                        <p className="text-sm text-green-700">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Datos a importar - solo para modo predefinido */}
            {uploadMode === "predefined" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-semibold">87 Productos</div>
                    <div className="text-sm text-gray-600">Catálogo completo</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Users className="h-8 w-8 text-amber-600" />
                  <div>
                    <div className="font-semibold">Gestión Manual</div>
                    <div className="text-sm text-gray-600">Usuarios y Socios</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="font-semibold">3 Calidades</div>
                    <div className="text-sm text-gray-600">Plata, Oro, Platino</div>
                  </div>
                </div>
              </div>
            )}

            {/* Progreso de importación */}
            {importing && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">{currentStep}</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-4">
              <Button 
                onClick={handleBulkImport} 
                disabled={importing || (uploadMode === "custom" && !selectedFile)}
                className="flex-1"
                size="lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                {importing 
                  ? "Importando..." 
                  : uploadMode === "predefined" 
                    ? "Iniciar Carga Masiva"
                    : "Importar CSV"
                }
              </Button>
              
              <Button 
                onClick={handleResetDatabase}
                disabled={importing}
                variant="outline"
                className="text-red-600 hover:text-red-700"
                title="Elimina SOLO productos y cotizaciones. Los usuarios y socios NO son afectados."
              >
                Eliminar Solo Productos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <CardTitle>
                  {result.success ? "Importación Completada" : "Error en Importación"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className={result.success ? "border-green-200" : "border-red-200"}>
                <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                  {result.message}
                </AlertDescription>
              </Alert>

              {result.success && result.stats && (
                <div className="mt-4 space-y-4">
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Datos Importados:</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">
                        {result.stats.items} Productos
                      </Badge>
                      {result.stats.partners > 0 && (
                        <Badge variant="outline">
                          {result.stats.partners} Socios Existentes
                        </Badge>
                      )}
                      {result.stats.adminUsers > 0 && (
                        <Badge variant="outline">
                          {result.stats.adminUsers} Admin Existente
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Productos Importados:</strong> El catálogo está listo para usar.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Para crear usuarios y socios, usa las opciones del panel de administración.
                    </p>
                  </div>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-red-800 mb-2">Errores Detectados:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}