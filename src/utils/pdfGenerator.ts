import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation, BusinessProfile, FurnitureItem } from '@/types';

// Helper to parse HSL string and convert to RGB
const hslToRgb = (hslString: string): [number, number, number] => {
  // Default brown color if parsing fails
  const defaultColor: [number, number, number] = [139, 69, 45];
  
  if (!hslString) return defaultColor;
  
  // Remove any "hsl(" wrapper and clean up
  const cleanHsl = hslString.replace(/hsl\(|\)/g, '').trim();
  
  // Parse "H S% L%" format
  const parts = cleanHsl.split(/[\s,]+/);
  if (parts.length < 3) return defaultColor;
  
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1].replace('%', '')) / 100;
  const l = parseFloat(parts[2].replace('%', '')) / 100;
  
  if (isNaN(h) || isNaN(s) || isNaN(l)) return defaultColor;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// Get display name for material (uses stored name or ID)
const getMaterialDisplay = (item: FurnitureItem): string => {
  return item._materialName || item.material || '-';
};

// Get display name for color
const getColorDisplay = (item: FurnitureItem): string => {
  return item._colorName || item.sheetColor || '-';
};

// Get display name for finish
const getFinishDisplay = (item: FurnitureItem): string => {
  return item._finishName || item.finish || '';
};

export const generateQuotationPDF = (
  quotation: Quotation,
  businessProfile: BusinessProfile | null
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Use default profile if none provided
  const profile = businessProfile || {
    businessName: 'Mi Negocio',
    address: '',
    city: '',
    phone: '',
    email: '',
    primaryColor: '340 30% 45%',
    secondaryColor: '40 60% 50%'
  };
  
  // Colors from business profile
  const primaryColor = hslToRgb(profile.primaryColor);
  const textColor: [number, number, number] = [51, 51, 51];
  
  let yPosition = 20;

  // Header with business name
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.businessName, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  const addressLine = [profile.address, profile.city].filter(Boolean).join(', ');
  if (addressLine) {
    doc.text(addressLine, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
  }
  
  const contactLine = [
    profile.phone ? `Tel: ${profile.phone}` : null,
    profile.email ? `Email: ${profile.email}` : null
  ].filter(Boolean).join(' | ');
  
  if (contactLine) {
    doc.text(contactLine, pageWidth / 2, yPosition, { align: 'center' });
  }

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
  if (quotation.client.address) {
    doc.text(`Dirección: ${quotation.client.address}`, 80, yPosition + 2);
  }

  // Items table
  yPosition += 20;
  
  const tableData = quotation.items.map((item: FurnitureItem, index: number) => {
    const dimensions = item.height && item.width 
      ? `${item.height}x${item.width}${item.depth ? `x${item.depth}` : ''} ${item.measureUnit}`
      : '-';
    
    // Use display names instead of IDs
    const materialName = getMaterialDisplay(item);
    const colorName = getColorDisplay(item);
    const finishName = getFinishDisplay(item);
    
    const materialInfo = [
      materialName,
      colorName,
      finishName ? `Acabado: ${finishName}` : null,
      item.sheetCount > 1 ? `${item.sheetCount} hojas` : null
    ].filter(Boolean).join('\n');
    
    return [
      (index + 1).toString(),
      item.name + (item.description ? `\n${item.description}` : ''),
      materialInfo,
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

  // Add images section if any items have images
  const itemsWithImages = quotation.items.filter(item => item.imageUrl);
  if (itemsWithImages.length > 0) {
    // Check if we need a new page for images
    if (yPosition > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('IMÁGENES DE REFERENCIA', 20, yPosition);
    yPosition += 10;

    const imageWidth = 55;
    const imageHeight = 45;
    const imagesPerRow = 3;
    let xPosition = 20;
    let imagesInRow = 0;

    for (const item of itemsWithImages) {
      if (!item.imageUrl) continue;

      // Check if we need a new row or page
      if (imagesInRow >= imagesPerRow) {
        xPosition = 20;
        yPosition += imageHeight + 20;
        imagesInRow = 0;
      }

      if (yPosition + imageHeight > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = 20;
        xPosition = 20;
        imagesInRow = 0;
      }

      try {
        // Add image
        doc.addImage(item.imageUrl, 'JPEG', xPosition, yPosition, imageWidth, imageHeight);
        
        // Add item name below image
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        const truncatedName = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name;
        doc.text(truncatedName, xPosition + imageWidth / 2, yPosition + imageHeight + 5, { align: 'center' });
      } catch (error) {
        console.error('Error adding image to PDF:', error);
      }

      xPosition += imageWidth + 5;
      imagesInRow++;
    }

    yPosition += imageHeight + 15;
  }

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
    `• Método de pago: ${quotation.paymentTerms}`,
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
  doc.text(`${profile.businessName} - ${profile.phone}`, pageWidth / 2, footerY + 4, { align: 'center' });

  return doc;
};

export const downloadQuotationPDF = (quotation: Quotation, businessProfile: BusinessProfile | null): void => {
  const doc = generateQuotationPDF(quotation, businessProfile);
  doc.save(`${quotation.folio}.pdf`);
};

export const getQuotationPDFBlob = (quotation: Quotation, businessProfile: BusinessProfile | null): Blob => {
  const doc = generateQuotationPDF(quotation, businessProfile);
  return doc.output('blob');
};
