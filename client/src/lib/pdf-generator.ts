import jsPDF from "jspdf";
import type { QuoteWithItems } from "@shared/schema";

export async function generateQuotePDF(quote: QuoteWithItems): Promise<void> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Colors
  const primaryColor = [59, 130, 246]; // Blue
  const darkColor = [51, 65, 85]; // Slate-700
  const lightColor = [148, 163, 184]; // Slate-400

  // Header
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 30, "F");
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("PRIVEE", 20, 20);
  
  // Quote title and info
  pdf.setTextColor(...darkColor);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(quote.projectName, 20, 50);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Cotización #${quote.quoteNumber}`, 20, 60);
  pdf.text(`Generada el ${new Date(quote.createdAt!).toLocaleDateString()}`, 20, 68);

  // Total amount (top right)
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  const totalText = `$${parseFloat(quote.total).toFixed(2)}`;
  const totalWidth = pdf.getTextWidth(totalText);
  pdf.text(totalText, pageWidth - totalWidth - 20, 50);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const subtitleText = "Costo Total del Proyecto";
  const subtitleWidth = pdf.getTextWidth(subtitleText);
  pdf.text(subtitleText, pageWidth - subtitleWidth - 20, 58);

  // Client and Partner info
  let yPos = 85;
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Preparado Para:", 20, yPos);
  pdf.text("Preparado Por:", pageWidth / 2 + 10, yPos);
  
  yPos += 10;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  // Client info
  pdf.setFont("helvetica", "bold");
  pdf.text(quote.clientCompany || quote.clientName, 20, yPos);
  yPos += 8;
  pdf.setFont("helvetica", "normal");
  pdf.text(quote.clientName, 20, yPos);
  yPos += 6;
  pdf.text(quote.clientEmail, 20, yPos);
  
  // Partner info
  yPos = 95;
  pdf.setFont("helvetica", "bold");
  pdf.text(quote.partnerCompany, pageWidth / 2 + 10, yPos);
  yPos += 8;
  pdf.setFont("helvetica", "normal");
  pdf.text(quote.partnerName, pageWidth / 2 + 10, yPos);
  yPos += 6;
  pdf.text(quote.partnerEmail, pageWidth / 2 + 10, yPos);

  // Services table
  yPos = 130;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Servicios Incluidos", 20, yPos);
  
  yPos += 15;
  
  // Table header
  pdf.setFillColor(248, 250, 252); // slate-50
  pdf.rect(20, yPos - 8, pageWidth - 40, 12, "F");
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...darkColor);
  pdf.text("Servicio", 25, yPos);
  pdf.text("Descripción", 80, yPos);
  pdf.text("Precio", pageWidth - 40, yPos, { align: "right" });
  
  yPos += 15;
  
  // Table rows
  pdf.setFont("helvetica", "normal");
  quote.items.forEach((item, index) => {
    if (yPos > pageHeight - 50) {
      pdf.addPage();
      yPos = 40;
    }
    
    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251); // slate-50
      pdf.rect(20, yPos - 8, pageWidth - 40, 12, "F");
    }
    
    pdf.setFont("helvetica", "bold");
    pdf.text(item.name, 25, yPos);
    
    pdf.setFont("helvetica", "normal");
    // Wrap description text
    const description = pdf.splitTextToSize(item.description, 60);
    pdf.text(description, 80, yPos);
    
    pdf.setFont("helvetica", "bold");
    pdf.text(`$${parseFloat(item.totalPrice).toFixed(2)}`, pageWidth - 40, yPos, { align: "right" });
    
    yPos += Math.max(12, description.length * 6);
  });

  // Total summary
  yPos += 20;
  const summaryX = pageWidth - 80;
  
  pdf.setDrawColor(...lightColor);
  pdf.line(summaryX, yPos - 5, pageWidth - 20, yPos - 5);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  pdf.text("Subtotal", summaryX, yPos);
  pdf.text(`$${parseFloat(quote.subtotal).toFixed(2)}`, pageWidth - 25, yPos, { align: "right" });
  yPos += 8;
  
  pdf.text("Impuestos", summaryX, yPos);
  pdf.text(`$${parseFloat(quote.tax).toFixed(2)}`, pageWidth - 25, yPos, { align: "right" });
  yPos += 12;
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Total", summaryX, yPos);
  pdf.text(`$${parseFloat(quote.total).toFixed(2)}`, pageWidth - 25, yPos, { align: "right" });

  // Terms and conditions
  if (quote.terms) {
    yPos += 25;
    if (yPos > pageHeight - 60) {
      pdf.addPage();
      yPos = 40;
    }
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Términos y Condiciones", 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    
    const terms = pdf.splitTextToSize(quote.terms, pageWidth - 40);
    pdf.text(terms, 20, yPos);
  }

  // Save the PDF
  pdf.save(`quote-${quote.quoteNumber}.pdf`);
}
