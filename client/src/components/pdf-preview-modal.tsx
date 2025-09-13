import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, X } from "lucide-react";
import { generateQuotePDF } from "@/lib/pdf-generator";
import type { QuoteWithItems } from "@shared/schema";

interface PDFPreviewModalProps {
  quote: QuoteWithItems | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PDFPreviewModal({ quote, isOpen, onClose }: PDFPreviewModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!quote) return;
    
    setIsGenerating(true);
    try {
      await generateQuotePDF(quote);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>PDF Preview</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">PDF Preview</p>
              <p className="text-sm text-slate-500">
                {quote ? `Quote ${quote.quoteNumber} - ${quote.projectName}` : "No quote selected"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleDownload} 
            disabled={!quote || isGenerating}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Download"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Global state for PDF modal
let globalPDFModal: {
  quote: QuoteWithItems | null;
  isOpen: boolean;
  onClose: () => void;
} = {
  quote: null,
  isOpen: false,
  onClose: () => {},
};

export function usePDFModal() {
  const [state, setState] = useState(globalPDFModal);

  const openPDFModal = (quote: QuoteWithItems) => {
    globalPDFModal = {
      quote,
      isOpen: true,
      onClose: () => {
        globalPDFModal.isOpen = false;
        setState({ ...globalPDFModal });
      },
    };
    setState({ ...globalPDFModal });
  };

  const closePDFModal = () => {
    globalPDFModal.isOpen = false;
    setState({ ...globalPDFModal });
  };

  return {
    ...state,
    openPDFModal,
    closePDFModal,
  };
}
