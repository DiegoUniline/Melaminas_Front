import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation, BusinessProfile, FurnitureItem } from '@/types';

export const generateQuotationPDF = (
  quotation: Quotation,
  businessProfile: BusinessProfile
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors from business profile (convert HSL to RGB approximation)
  const primaryColor: [number, number, number] = [34, 89, 70]; // Deep brown/wood color
  const textColor: [number, number, number] = [51, 51, 51];
  
  let yPosition = 20;

  // Header with business name
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(businessProfile.businessName, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.text(`${businessProfile.address}, ${businessProfile.city}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 5;
  doc.text(`Tel: ${businessProfile.phone} | Email: ${businessProfile.email}`, pageWidth / 2, yPosition, { align: 'center' });

  // Line separator
  yPosition += 8;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);

  // Quotation info
  yPosition += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('COTIZACIÓN', 20, yPosition);
  
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text(quotation.folio, pageWidth - 20, yPosition, { align: 'right' });

  // Date
  yPosition += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const createdDate = new Date(quotation.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Fecha: ${createdDate}`, 20, yPosition);
  
  const validUntil = new Date(quotation.createdAt);
  validUntil.setDate(validUntil.getDate() + quotation.validityDays);
  doc.text(`Válida hasta: ${validUntil.toLocaleDateString('es-MX')}`, pageWidth - 20, yPosition, { align: 'right' });

  // Client info
  yPosition += 12;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, yPosition - 5, pageWidth - 40, 25, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', 25, yPosition + 2);
  
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.client.name, 55, yPosition + 2);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.text(`Tel: ${quotation.client.phone}`, 25, yPosition + 2);
  doc.text(`Dirección: ${quotation.client.address}`, 80, yPosition + 2);

  // Items table
  yPosition += 20;
  
  const tableData = quotation.items.map((item: FurnitureItem, index: number) => {
    const dimensions = item.height && item.width 
      ? `${item.height}x${item.width}${item.depth ? `x${item.depth}` : ''} ${item.measureUnit}`
      : '-';
    
    return [
      (index + 1).toString(),
      item.name,
      `${item.material}\n${item.sheetColor}\n${item.sheetCount} hojas`,
      dimensions,
      item.quantity.toString(),
      `$${item.unitPrice.toLocaleString('es-MX')}`,
      `$${item.subtotal.toLocaleString('es-MX')}`
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Mueble', 'Material/Color', 'Medidas', 'Cant.', 'P. Unit.', 'Subtotal']],
    body: tableData,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textColor
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });

  // Get final Y position after table
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Totals section
  const totalsX = pageWidth - 80;
  
  doc.setFontSize(10);
  doc.text('Subtotal:', totalsX, yPosition);
  doc.text(`$${quotation.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - 20, yPosition, { align: 'right' });
  
  if (quotation.discount) {
    yPosition += 6;
    const discountText = quotation.discountType === 'percentage' 
      ? `Descuento (${quotation.discount}%):`
      : 'Descuento:';
    doc.text(discountText, totalsX, yPosition);
    const discountAmount = quotation.discountType === 'percentage'
      ? (quotation.subtotal * quotation.discount / 100)
      : quotation.discount;
    doc.text(`-$${discountAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - 20, yPosition, { align: 'right' });
  }

  yPosition += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL:', totalsX, yPosition);
  doc.text(`$${quotation.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - 20, yPosition, { align: 'right' });

  // Conditions section
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text('CONDICIONES:', 20, yPosition);

  yPosition += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const conditions = [
    `• Tiempo de entrega: ${quotation.deliveryDays} días hábiles`,
    `• Forma de pago: ${quotation.paymentTerms}`,
    quotation.advancePercentage ? `• Anticipo requerido: ${quotation.advancePercentage}%` : null,
    `• Vigencia de cotización: ${quotation.validityDays} días`,
  ].filter(Boolean);

  conditions.forEach((condition) => {
    doc.text(condition as string, 20, yPosition);
    yPosition += 5;
  });

  // Observations
  if (quotation.observations) {
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES:', 20, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    const splitObservations = doc.splitTextToSize(quotation.observations, pageWidth - 40);
    doc.text(splitObservations, 20, yPosition);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Gracias por su preferencia', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`${businessProfile.businessName} - ${businessProfile.phone}`, pageWidth / 2, footerY + 4, { align: 'center' });

  return doc;
};

export const downloadQuotationPDF = (quotation: Quotation, businessProfile: BusinessProfile): void => {
  const doc = generateQuotationPDF(quotation, businessProfile);
  doc.save(`${quotation.folio}.pdf`);
};

export const getQuotationPDFBlob = (quotation: Quotation, businessProfile: BusinessProfile): Blob => {
  const doc = generateQuotationPDF(quotation, businessProfile);
  return doc.output('blob');
};
