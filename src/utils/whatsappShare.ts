import { Quotation, BusinessProfile } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateQuotationImage, canShareFiles, downloadQuotationImage } from './quotationToImage';

/**
 * Generates a formatted WhatsApp message for a quotation
 */
export const generateWhatsAppMessage = (
  quotation: Quotation,
  businessProfile: BusinessProfile | null
): string => {
  const businessName = businessProfile?.businessName || 'El Melaminas';
  const createdDate = format(new Date(quotation.createdAt), "d 'de' MMMM, yyyy", { locale: es });
  
  // Format currency
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  // Build items summary
  const itemsSummary = quotation.items.map((item, index) => {
    const dimensions = item.height && item.width 
      ? `${item.height}x${item.width}${item.depth ? `x${item.depth}` : ''} ${item.measureUnit}`
      : '';
    return `${index + 1}. ${item.name}${dimensions ? ` (${dimensions})` : ''} - ${formatCurrency(item.subtotal)}`;
  }).join('\n');


  // Build message
  let message = `🪵 *${businessName}*\n`;
  message += `📋 *Cotización ${quotation.folio}*\n`;
  message += `📅 ${createdDate}\n\n`;
  
  message += `👤 *Cliente:* ${quotation.client.name}\n`;
  if (quotation.client.phone) {
    message += `📱 ${quotation.client.phone}\n`;
  }
  message += `\n`;
  
  message += `📦 *Productos:*\n${itemsSummary}\n\n`;
  
  if (quotation.discount && quotation.discount > 0) {
    message += `💰 Subtotal: ${formatCurrency(quotation.subtotal)}\n`;
    const discountAmount = quotation.discountType === 'percentage' 
      ? quotation.subtotal * (quotation.discount / 100)
      : quotation.discount;
    message += `🏷️ Descuento: -${formatCurrency(discountAmount)}\n`;
  }
  
  message += `💵 *TOTAL: ${formatCurrency(quotation.total)}*\n\n`;
  
  message += `⏱️ Tiempo de entrega: ${quotation.deliveryDays} días\n`;
  message += `📆 Vigencia: ${quotation.validityDays} días\n`;
  
  if (quotation.advancePercentage) {
    message += `💳 Anticipo: ${quotation.advancePercentage}%\n`;
  }
  
  if (quotation.observations) {
    message += `\n📝 *Notas:* ${quotation.observations}\n`;
  }
  
  message += `\n¡Gracias por su preferencia! 🙏`;

  return message;
};

/**
 * Opens WhatsApp with a pre-filled message for the quotation (text only fallback)
 */
export const shareViaWhatsApp = (
  quotation: Quotation,
  businessProfile: BusinessProfile | null,
  phoneNumber?: string
): void => {
  const message = generateWhatsAppMessage(quotation, businessProfile);
  const encodedMessage = encodeURIComponent(message);
  
  const url = phoneNumber 
    ? `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
  
  window.open(url, '_blank');
};

/**
 * Shares to client's WhatsApp if available (text only fallback)
 */
export const shareToClientWhatsApp = (
  quotation: Quotation,
  businessProfile: BusinessProfile | null
): void => {
  const clientPhone = quotation.client.whatsapp || quotation.client.phone;
  shareViaWhatsApp(quotation, businessProfile, clientPhone);
};

/**
 * Share quotation as image using Web Share API (like banking apps)
 * Falls back to downloading image + text-only WhatsApp if not supported
 */
export const shareQuotationAsImage = async (
  quotation: Quotation,
  businessProfile: BusinessProfile | null
): Promise<{ success: boolean; fallback: boolean }> => {
  try {
    // Generate the image
    const imageBlob = await generateQuotationImage(quotation, businessProfile);
    const imageFile = new File([imageBlob], `${quotation.folio}.png`, { type: 'image/png' });
    
    // Check if we can share files natively
    if (canShareFiles()) {
      await navigator.share({
        files: [imageFile],
        title: `Cotización ${quotation.folio}`,
        text: `Cotización para ${quotation.client.name} - Total: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(quotation.total)}`
      });
      return { success: true, fallback: false };
    }
    
    // Fallback: Download image and open WhatsApp with text
    downloadQuotationImage(imageBlob, `${quotation.folio}.png`);
    
    // Open WhatsApp with text message
    const clientPhone = quotation.client.whatsapp || quotation.client.phone;
    shareViaWhatsApp(quotation, businessProfile, clientPhone);
    
    return { success: true, fallback: true };
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name === 'AbortError') {
      return { success: false, fallback: false };
    }
    throw error;
  }
};

