import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, User, Package, Trash2, Edit2, Save, FileText } from 'lucide-react';
import { ClientSelector } from '@/components/quotation/ClientSelector';
import { FurnitureItemForm } from '@/components/quotation/FurnitureItemForm';
import { useData } from '@/contexts/DataContext';
import { Client, FurnitureItem, QuotationStatus } from '@/types';
import { downloadQuotationPDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';

const NewQuotationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addQuotation, updateQuotation, getQuotationById, businessProfile } = useData();
  
  const isEditing = !!id && id !== 'nueva';
  const existingQuotation = isEditing ? getQuotationById(id) : null;

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [furnitureFormOpen, setFurnitureFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FurnitureItem | null>(null);
  
  const [conditions, setConditions] = useState({
    deliveryDays: '15',
    validityDays: '30',
    paymentTerms: '50% anticipo, 50% contra entrega',
    advancePercentage: '50',
    observations: '',
  });

  const [discount, setDiscount] = useState({
    amount: '',
    type: 'percentage' as 'percentage' | 'fixed',
  });

  // Load existing quotation data
  useEffect(() => {
    if (existingQuotation) {
      setSelectedClient(existingQuotation.client);
      setItems(existingQuotation.items);
      setConditions({
        deliveryDays: existingQuotation.deliveryDays.toString(),
        validityDays: existingQuotation.validityDays.toString(),
        paymentTerms: existingQuotation.paymentTerms,
        advancePercentage: existingQuotation.advancePercentage?.toString() || '',
        observations: existingQuotation.observations || '',
      });
      if (existingQuotation.discount) {
        setDiscount({
          amount: existingQuotation.discount.toString(),
          type: existingQuotation.discountType || 'percentage',
        });
      }
    }
  }, [existingQuotation]);

  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConditions(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (item: FurnitureItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
      setEditingItem(null);
    } else {
      setItems(prev => [...prev, item]);
    }
  };

  const handleEditItem = (item: FurnitureItem) => {
    setEditingItem(item);
    setFurnitureFormOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    toast.success('Mueble eliminado');
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = discount.amount
    ? discount.type === 'percentage'
      ? subtotal * (parseFloat(discount.amount) / 100)
      : parseFloat(discount.amount)
    : 0;
  const total = subtotal - discountAmount;

  const handleSave = (status: QuotationStatus = 'borrador') => {
    if (!selectedClient) {
      toast.error('Selecciona un cliente');
      return;
    }
    if (items.length === 0) {
      toast.error('Agrega al menos un mueble');
      return;
    }

    const quotationData = {
      clientId: selectedClient.id,
      client: selectedClient,
      items,
      subtotal,
      discount: discount.amount ? parseFloat(discount.amount) : undefined,
      discountType: discount.amount ? discount.type : undefined,
      total,
      deliveryDays: parseInt(conditions.deliveryDays) || 15,
      validityDays: parseInt(conditions.validityDays) || 30,
      paymentTerms: conditions.paymentTerms,
      advancePercentage: conditions.advancePercentage ? parseInt(conditions.advancePercentage) : undefined,
      observations: conditions.observations || undefined,
      status,
    };

    if (isEditing && existingQuotation) {
      updateQuotation(existingQuotation.id, quotationData);
      toast.success('Cotización actualizada');
    } else {
      const newQuotation = addQuotation(quotationData);
      toast.success(`Cotización ${newQuotation.folio} creada`);
    }
    
    navigate('/historial');
  };

  const handleGeneratePDF = () => {
    if (!selectedClient) {
      toast.error('Selecciona un cliente');
      return;
    }
    if (items.length === 0) {
      toast.error('Agrega al menos un mueble');
      return;
    }

    // First save as draft, then generate PDF
    const quotationData = {
      clientId: selectedClient.id,
      client: selectedClient,
      items,
      subtotal,
      discount: discount.amount ? parseFloat(discount.amount) : undefined,
      discountType: discount.amount ? discount.type : undefined,
      total,
      deliveryDays: parseInt(conditions.deliveryDays) || 15,
      validityDays: parseInt(conditions.validityDays) || 30,
      paymentTerms: conditions.paymentTerms,
      advancePercentage: conditions.advancePercentage ? parseInt(conditions.advancePercentage) : undefined,
      observations: conditions.observations || undefined,
      status: 'enviada' as QuotationStatus,
    };

    let quotation;
    if (isEditing && existingQuotation) {
      updateQuotation(existingQuotation.id, quotationData);
      quotation = { ...existingQuotation, ...quotationData };
    } else {
      quotation = addQuotation(quotationData);
    }

    try {
      downloadQuotationPDF(quotation, businessProfile);
      toast.success('PDF generado');
      navigate('/historial');
    } catch (error) {
      toast.error('Error al generar PDF');
    }
  };

  return (
    <ResponsiveLayout title={isEditing ? 'Editar Cotización' : 'Nueva Cotización'}>
      <div className="space-y-4">
        {/* Cliente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientSelector
              selectedClient={selectedClient}
              onSelectClient={setSelectedClient}
            />
          </CardContent>
        </Card>

        {/* Muebles */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4" />
                Muebles
              </CardTitle>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
                  setFurnitureFormOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>
            {items.length === 0 && (
              <CardDescription>
                Agrega los muebles a cotizar
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay muebles agregados</p>
                <p className="text-sm">Toca "Agregar" para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.material} • {item.sheetColor} • {item.sheetCount} hojas
                        </p>
                        {item.height && item.width && (
                          <p className="text-sm text-muted-foreground">
                            {item.height}x{item.width}{item.depth ? `x${item.depth}` : ''} {item.measureUnit}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.subtotal.toLocaleString('es-MX')}</p>
                        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-destructive"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Descuento */}
        {items.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Descuento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="discountAmount">Cantidad</Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    inputMode="decimal"
                    value={discount.amount}
                    onChange={(e) => setDiscount(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={discount.type}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setDiscount(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="percentage">Porcentaje %</SelectItem>
                      <SelectItem value="fixed">Monto fijo $</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Condiciones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Condiciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="deliveryDays">Días de entrega</Label>
                <Input
                  id="deliveryDays"
                  name="deliveryDays"
                  type="number"
                  inputMode="numeric"
                  value={conditions.deliveryDays}
                  onChange={handleConditionChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validityDays">Vigencia (días)</Label>
                <Input
                  id="validityDays"
                  name="validityDays"
                  type="number"
                  inputMode="numeric"
                  value={conditions.validityDays}
                  onChange={handleConditionChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Forma de pago</Label>
              <Select
                value={conditions.paymentTerms}
                onValueChange={(value) => setConditions(prev => ({ ...prev, paymentTerms: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="50% anticipo, 50% contra entrega">50% anticipo, 50% contra entrega</SelectItem>
                  <SelectItem value="100% anticipo">100% anticipo</SelectItem>
                  <SelectItem value="40% anticipo, 30% a mitad, 30% contra entrega">40% - 30% - 30%</SelectItem>
                  <SelectItem value="30% anticipo, 70% contra entrega">30% anticipo, 70% contra entrega</SelectItem>
                  <SelectItem value="Pago contra entrega">Pago contra entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="advancePercentage">Porcentaje de anticipo</Label>
              <Input
                id="advancePercentage"
                name="advancePercentage"
                type="number"
                inputMode="numeric"
                value={conditions.advancePercentage}
                onChange={handleConditionChange}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                name="observations"
                value={conditions.observations}
                onChange={handleConditionChange}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm opacity-80">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm opacity-80">
                  <span>Descuento</span>
                  <span>-${discountAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold pt-2 border-t border-primary-foreground/20">
                <span>Total</span>
                <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary"
                onClick={() => handleSave('borrador')}
              >
                <Save className="w-4 h-4 mr-1" />
                Guardar
              </Button>
              <Button 
                variant="secondary" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={handleGeneratePDF}
              >
                <FileText className="w-4 h-4 mr-1" />
                Generar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Furniture Form Modal */}
      <FurnitureItemForm
        open={furnitureFormOpen}
        onOpenChange={setFurnitureFormOpen}
        onSave={handleAddItem}
        editItem={editingItem}
      />
    </ResponsiveLayout>
  );
};

export default NewQuotationPage;
