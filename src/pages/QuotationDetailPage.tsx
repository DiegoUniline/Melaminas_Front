import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  Package,
  FileText,
  Download,
  MessageCircle,
  Edit2,
  Trash2,
  Clock,
  CreditCard
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { QuotationStatus, FURNITURE_CATEGORIES } from '@/types';
import { downloadQuotationPDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';

const statusConfig: Record<QuotationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  borrador: { label: 'Borrador', variant: 'secondary' },
  enviada: { label: 'Enviada', variant: 'outline' },
  aceptada: { label: 'Aceptada', variant: 'default' },
  rechazada: { label: 'Rechazada', variant: 'destructive' },
};

const QuotationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuotationById, updateQuotationStatus, deleteQuotation, businessProfile } = useData();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const quotation = getQuotationById(id || '');

  if (!quotation) {
    return (
      <ResponsiveLayout title="Cotización">
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Cotización no encontrada</p>
            <Button variant="link" onClick={() => navigate('/historial')}>
              Volver al historial
            </Button>
          </CardContent>
        </Card>
      </ResponsiveLayout>
    );
  }

  const handleStatusChange = (status: QuotationStatus) => {
    updateQuotationStatus(quotation.id, status);
    toast.success(`Estado actualizado a: ${statusConfig[status].label}`);
  };

  const handleDownloadPDF = () => {
    try {
      downloadQuotationPDF(quotation, businessProfile);
      toast.success('PDF descargado');
    } catch (error) {
      toast.error('Error al generar PDF');
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola ${quotation.client.name}, te comparto la cotización ${quotation.folio} de ${businessProfile.businessName}.\n\n` +
      `Total: $${quotation.total.toLocaleString('es-MX')}\n` +
      `Vigencia: ${quotation.validityDays} días\n\n` +
      `¿Te gustaría proceder con el pedido?`
    );
    const phone = quotation.client.whatsapp || quotation.client.phone;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/52${cleanPhone}?text=${message}`, '_blank');
  };

  const handleDelete = () => {
    deleteQuotation(quotation.id);
    toast.success('Cotización eliminada');
    navigate('/historial');
  };

  // Calculate material summary
  const materialSummary = quotation.items.reduce((acc, item) => {
    const key = `${item.material} - ${item.sheetColor}`;
    if (!acc[key]) {
      acc[key] = { material: item.material, color: item.sheetColor, sheets: 0 };
    }
    acc[key].sheets += item.sheetCount * item.quantity;
    return acc;
  }, {} as Record<string, { material: string; color: string; sheets: number }>);

  const createdDate = new Date(quotation.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <ResponsiveLayout title={quotation.folio}>
      <div className="space-y-4">
        {/* Status and Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Badge variant={statusConfig[quotation.status].variant} className="text-sm px-3 py-1">
                {statusConfig[quotation.status].label}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {createdDate}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Cambiar estado:</label>
              <Select value={quotation.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="enviada">Enviada</SelectItem>
                  <SelectItem value="aceptada">Aceptada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{quotation.client.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              {quotation.client.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {quotation.client.address}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Muebles ({quotation.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quotation.items.map((item, index) => (
              <div key={item.id} className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm">x{item.quantity}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.material} • {item.sheetColor} • {item.sheetCount} hojas
                </p>
                {item.height && item.width && (
                  <p className="text-sm text-muted-foreground">
                    {item.height}x{item.width}{item.depth ? `x${item.depth}` : ''} {item.measureUnit}
                  </p>
                )}
                <p className="text-sm font-medium mt-1">
                  ${item.subtotal.toLocaleString('es-MX')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Material Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumen de Materiales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.values(materialSummary).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">{item.material} - {item.color}</span>
                  <Badge variant="secondary">{item.sheets} hojas</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Condiciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Entrega: {quotation.deliveryDays} días</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Vigencia: {quotation.validityDays} días</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>{quotation.paymentTerms}</span>
            </div>
            {quotation.observations && (
              <p className="p-2 bg-muted rounded text-muted-foreground mt-2">
                {quotation.observations}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm opacity-80">
                <span>Subtotal</span>
                <span>${quotation.subtotal.toLocaleString('es-MX')}</span>
              </div>
              {quotation.discount && (
                <div className="flex justify-between text-sm opacity-80">
                  <span>
                    Descuento {quotation.discountType === 'percentage' ? `(${quotation.discount}%)` : ''}
                  </span>
                  <span>
                    -${(quotation.discountType === 'percentage' 
                      ? quotation.subtotal * quotation.discount / 100 
                      : quotation.discount
                    ).toLocaleString('es-MX')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-primary-foreground/20">
                <span>Total</span>
                <span>${quotation.total.toLocaleString('es-MX')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button variant="outline" onClick={handleShareWhatsApp}>
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate(`/cotizacion/${quotation.id}/editar`)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            className="text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la cotización {quotation.folio} permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ResponsiveLayout>
  );
};

export default QuotationDetailPage;
