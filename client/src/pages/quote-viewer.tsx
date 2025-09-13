import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface QuoteViewerProps {
  quoteCode: string;
}

interface QuoteViewData {
  quote: any;
  html: string;
  validUntil: string;
  isExpired: boolean;
}

export default function QuoteViewer({ quoteCode }: QuoteViewerProps) {
  const { data: quoteData, isLoading, error } = useQuery<QuoteViewData>({
    queryKey: ["/api/quotes/by-code", quoteCode],
    retry: false,
  });

  useEffect(() => {
    if (quoteData && quoteData.html) {
      // Create a new container element and safely set HTML content
      const container = document.createElement('div');
      container.innerHTML = quoteData.html;
      
      // Replace the document body content safely
      document.body.replaceChildren(container);
    }
  }, [quoteData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cotización...</p>
        </div>
      </div>
    );
  }

  if (error || !quoteData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cotización no encontrada</h1>
          <p className="text-gray-600 mb-6">
            La cotización que buscas no existe o ha expirado.
          </p>
          <div className="text-sm text-gray-500">
            <p>Código de cotización: <span className="font-mono">{quoteCode}</span></p>
            <p className="mt-2">Las cotizaciones tienen una vigencia de 30 días.</p>
          </div>
        </div>
      </div>
    );
  }

  // The actual quote HTML will be injected via useEffect
  return null;
}