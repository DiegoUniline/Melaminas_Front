import html2canvas from 'html2canvas';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Quotation, BusinessProfile } from '@/types';
import { QuotationImagePreview } from '@/components/quotation/QuotationImagePreview';

/**
 * Generates a PNG image blob from a quotation
 * Creates a temporary hidden element, renders the quotation preview, captures it, then cleans up
 */
export const generateQuotationImage = async (
  quotation: Quotation,
  businessProfile: BusinessProfile | null
): Promise<Blob> => {
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  document.body.appendChild(container);

  // Create a wrapper div that will hold our preview
  const wrapper = document.createElement('div');
  container.appendChild(wrapper);

  // Render the preview component
  const root = createRoot(wrapper);
  
  root.render(
    createElement(QuotationImagePreview, {
      quotation,
      businessProfile,
    })
  );

  // Wait for rendering and images to load
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    // Capture the rendered element
    const canvas = await html2canvas(wrapper, {
      scale: 2, // 2x for retina quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        },
        'image/png',
        1.0
      );
    });

    return blob;
  } finally {
    // Cleanup
    root.unmount();
    document.body.removeChild(container);
  }
};

/**
 * Checks if the browser supports sharing files via Web Share API
 */
export const canShareFiles = (): boolean => {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }
  
  // Create a test file to check if file sharing is supported
  const testFile = new File(['test'], 'test.png', { type: 'image/png' });
  return navigator.canShare({ files: [testFile] });
};

/**
 * Downloads the image to the device
 */
export const downloadQuotationImage = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
