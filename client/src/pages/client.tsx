import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { QuoteWithItems } from "@shared/schema";
import { Eye, Download, Check, Edit } from "lucide-react";
import { openQuoteInNewTab } from "@/lib/html-quote-generator";
import { useToast } from "@/hooks/use-toast";

export default function ClientPage() {
  const { toast } = useToast();
  const [match, params] = useRoute("/client/:quoteId");
  
  // For demo purposes, we'll show a sample quote
  // In a real app, you'd fetch the quote by ID
  const { data: quotes = [] } = useQuery<QuoteWithItems[]>({
    queryKey: ["/api/quotes"],
  });

  // Use the first quote as demo, or the one specified by ID
  const demoQuote: QuoteWithItems = quotes[0] || {
    id: "demo-1",
    quoteNumber: "QF-2024-001",
    clientName: "John Smith",
    clientEmail: "john.smith@acme.com", 
    clientCompany: "Acme Corporation",
    projectName: "Website Development Project",
    partnerName: "Sarah Johnson",
    partnerEmail: "sarah@digitalsolutions.com",
    partnerCompany: "Digital Solutions Pro",
    subtotal: "2500.00",
    totalMargin: "625.00",
    tax: "0.00",
    total: "3125.00",
    status: "sent",
    terms: "• Payment terms: 50% upfront, 50% upon completion\n• Project timeline: 4-6 weeks from project start date\n• Quote valid for 30 days from issue date\n• Additional revisions beyond scope may incur extra charges",
    createdAt: new Date("2024-03-15"),
    items: [
      {
        id: "item-1",
        quoteId: "demo-1",
        itemId: "item-1",
        name: "Website Design & Development",
        description: "Custom responsive website with modern design, contact forms, and content management system",
        basePrice: "2500.00",
        margin: 25,
        marginAmount: "625.00",
        totalPrice: "3125.00",
      }
    ]
  };

  const handleViewQuote = async () => {
    try {
      openQuoteInNewTab(demoQuote);
      toast({ title: "Cotización abierta exitosamente" });
    } catch (error) {
      toast({ title: "Error al abrir la cotización", variant: "destructive" });
    }
  };

  const handleAcceptQuote = () => {
    toast({ title: "Quote acceptance feature coming soon" });
  };

  const handleRequestChanges = () => {
    toast({ title: "Request changes feature coming soon" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Client Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.jpg" 
              alt="Privee Logo" 
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Visor de Cotizaciones</h1>
              <p className="text-sm text-slate-500">Ver y Descargar tus Cotizaciones</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-purple-100 text-purple-800">Cliente</Badge>
          </div>
        </div>
      </header>

      {/* Client Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            {/* Quote Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-4">
                <img 
                  src="/logo.jpg" 
                  alt="Privee Logo" 
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{demoQuote.projectName}</h2>
                  <p className="text-slate-600 mt-1">Cotización #{demoQuote.quoteNumber}</p>
                  <p className="text-sm text-slate-500">
                    Generada el {new Date(demoQuote.createdAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">
                  ${parseFloat(demoQuote.total).toFixed(2)}
                </div>
                <p className="text-sm text-slate-500">Costo Total del Proyecto</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Preparado Para:</h3>
                <div className="text-slate-600">
                  <p className="font-medium">{demoQuote.clientCompany}</p>
                  <p>{demoQuote.clientName}</p>
                  <p>{demoQuote.clientEmail}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Preparado Por:</h3>
                <div className="text-slate-600">
                  <p className="font-medium">{demoQuote.partnerCompany}</p>
                  <p>{demoQuote.partnerName}</p>
                  <p>{demoQuote.partnerEmail}</p>
                </div>
              </div>
            </div>

            {/* Services Breakdown */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-900 mb-4">Servicios Incluidos</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Servicio</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Descripción</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-600">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {demoQuote.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-900">{item.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-slate-600">{item.description}</div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-semibold">
                          ${parseFloat(item.totalPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Summary */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-mono">${parseFloat(demoQuote.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Impuestos</span>
                    <span className="font-mono">${parseFloat(demoQuote.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-slate-200 font-semibold text-lg">
                    <span className="text-slate-900">Total</span>
                    <span className="font-mono text-slate-900">${parseFloat(demoQuote.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            {demoQuote.terms && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Términos y Condiciones</h3>
                <div className="text-sm text-slate-600 space-y-2">
                  {demoQuote.terms.split('\n').map((term, index) => (
                    <p key={index}>{term}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleViewQuote}
                className="flex-1 bg-primary-600 hover:bg-primary-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Cotización
              </Button>
              <Button
                onClick={handleAcceptQuote}
                variant="outline"
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Aceptar Cotización
              </Button>
              <Button
                onClick={handleRequestChanges}
                variant="outline"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Solicitar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
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
