import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { User } from 'lucide-react';
import { Client } from '@/types';

interface ClientFormData {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

const defaultFormData: ClientFormData = {
  name: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  city: '',
  notes: '',
};

interface ClientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClient?: Client | null;
  onSave: (data: ClientFormData) => Promise<boolean>;
  title?: string;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  open,
  onOpenChange,
  editingClient,
  onSave,
  title = 'Nuevo Cliente',
}) => {
  const [formData, setFormData] = useState<ClientFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editing client changes
  useEffect(() => {
    if (open) {
      if (editingClient) {
        setFormData({
          name: editingClient.name,
          phone: editingClient.phone,
          whatsapp: editingClient.whatsapp || '',
          email: editingClient.email || '',
          address: editingClient.address,
          city: editingClient.city || '',
          notes: editingClient.notes || '',
        });
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [open, editingClient]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await onSave(formData);
    setIsSubmitting(false);
    
    if (success) {
      onOpenChange(false);
      setFormData(defaultFormData);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {editingClient ? 'Editar Cliente' : title}
          </SheetTitle>
          <SheetDescription>
            {editingClient ? 'Modifica los datos del cliente' : 'Ingresa los datos del nuevo cliente'}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nombre completo"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="555-1234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="5551234567"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Calle, número, colonia"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Ciudad"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Notas sobre el cliente..."
              rows={2}
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : (editingClient ? 'Actualizar Cliente' : 'Guardar Cliente')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export type { ClientFormData };
