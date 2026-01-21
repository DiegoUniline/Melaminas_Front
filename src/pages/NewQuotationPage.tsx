import React from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, User, Package } from 'lucide-react';

const NewQuotationPage: React.FC = () => {
  return (
    <MobileLayout title="Nueva Cotización">
      <div className="space-y-4">
        {/* Datos del cliente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Datos del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nombre</Label>
              <Input id="clientName" placeholder="Nombre del cliente" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" placeholder="555-1234567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" type="tel" placeholder="5551234567" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" placeholder="Dirección de entrega" />
            </div>
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
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>
            <CardDescription>
              Agrega los muebles a cotizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay muebles agregados</p>
              <p className="text-sm">Toca "Agregar" para comenzar</p>
            </div>
          </CardContent>
        </Card>

        {/* Condiciones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Condiciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="deliveryDays">Días de entrega</Label>
                <Input id="deliveryDays" type="number" placeholder="15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validityDays">Vigencia (días)</Label>
                <Input id="validityDays" type="number" placeholder="30" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Forma de pago</Label>
              <Input id="paymentTerms" placeholder="50% anticipo, 50% contra entrega" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea id="observations" placeholder="Notas adicionales..." rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Total y acciones */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg">Total</span>
              <span className="text-2xl font-bold">$0.00</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary">
                Guardar borrador
              </Button>
              <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                Generar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default NewQuotationPage;
