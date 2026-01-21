import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  FileDown, 
  CheckCircle2, 
  Send, 
  XCircle, 
  Clock,
  MoreVertical,
  FileText,
  MessageCircle
} from 'lucide-react';
import { Quotation, QuotationStatus } from '@/types';
import { useData } from '@/contexts/DataContext';
import { downloadQuotationPDF } from '@/utils/pdfGenerator';
import { shareViaWhatsApp, shareToClientWhatsApp } from '@/utils/whatsappShare';
import { toast } from 'sonner';

interface QuotationActionsProps {
  quotation: Quotation;
  variant?: 'icon' | 'buttons' | 'dropdown';
  size?: 'sm' | 'default';
  onStatusChange?: () => void;
}

const statusOptions: { value: QuotationStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'borrador', label: 'Borrador', icon: Clock, color: 'text-muted-foreground' },
  { value: 'enviada', label: 'Enviada', icon: Send, color: 'text-info' },
  { value: 'aceptada', label: 'Aceptada', icon: CheckCircle2, color: 'text-success' },
  { value: 'rechazada', label: 'Rechazada', icon: XCircle, color: 'text-destructive' },
];

export const QuotationActions: React.FC<QuotationActionsProps> = ({
  quotation,
  variant = 'dropdown',
  size = 'sm',
  onStatusChange
}) => {
  const { updateQuotationStatus, businessProfile } = useData();
  const [isOpen, setIsOpen] = useState(false);

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await downloadQuotationPDF(quotation, businessProfile);
      toast.success('PDF descargado');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar PDF');
    }
  };

  const handleShareWhatsApp = (e: React.MouseEvent, toClient: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (toClient && (quotation.client.whatsapp || quotation.client.phone)) {
        shareToClientWhatsApp(quotation, businessProfile);
        toast.success('Abriendo WhatsApp...');
      } else {
        shareViaWhatsApp(quotation, businessProfile);
        toast.success('Abriendo WhatsApp...');
      }
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      toast.error('Error al compartir por WhatsApp');
    }
  };

  const handleStatusChange = async (e: React.MouseEvent, status: QuotationStatus) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (status === quotation.status) return;
    
    const success = await updateQuotationStatus(quotation.id, status);
    if (success) {
      const statusLabel = statusOptions.find(s => s.value === status)?.label;
      toast.success(`Estado: ${statusLabel}`);
      onStatusChange?.();
    } else {
      toast.error('Error al actualizar estado');
    }
    setIsOpen(false);
  };

  // Dropdown variant - compact with all options
  if (variant === 'dropdown') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleDownloadPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => handleShareWhatsApp(e as unknown as React.MouseEvent, true)}>
            <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
            Enviar por WhatsApp
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Cambiar estado
          </div>
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Cambiar estado
          </div>
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isActive = quotation.status === option.value;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={(e) => handleStatusChange(e as unknown as React.MouseEvent, option.value)}
                className={isActive ? 'bg-muted' : ''}
              >
                <Icon className={`h-4 w-4 mr-2 ${option.color}`} />
                <span className={isActive ? 'font-medium' : ''}>{option.label}</span>
                {isActive && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Icon variant - just PDF button, status in dropdown
  if (variant === 'icon') {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={handleDownloadPDF}
          title="Descargar PDF"
        >
          <FileDown className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={(e) => handleShareWhatsApp(e, true)}
          title="Enviar por WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              title="Cambiar estado"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isActive = quotation.status === option.value;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={(e) => handleStatusChange(e as unknown as React.MouseEvent, option.value)}
                  className={isActive ? 'bg-muted' : ''}
                >
                  <Icon className={`h-4 w-4 mr-2 ${option.color}`} />
                  <span className={isActive ? 'font-medium' : ''}>{option.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Buttons variant - visible buttons for both actions
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Button 
        variant="outline" 
        size={size}
        onClick={handleDownloadPDF}
        className="gap-1"
      >
        <FileDown className="h-4 w-4" />
        <span className="hidden sm:inline">PDF</span>
      </Button>
      <Button 
        variant="outline" 
        size={size}
        onClick={(e) => handleShareWhatsApp(e, true)}
        className="gap-1 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={size} className="gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Estado</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isActive = quotation.status === option.value;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={(e) => handleStatusChange(e as unknown as React.MouseEvent, option.value)}
                className={isActive ? 'bg-muted' : ''}
              >
                <Icon className={`h-4 w-4 mr-2 ${option.color}`} />
                <span className={isActive ? 'font-medium' : ''}>{option.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
