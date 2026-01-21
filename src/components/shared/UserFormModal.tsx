import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, USER_ROLES } from '@/types';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: User['role'];
  isActive: boolean;
}

const defaultFormData: UserFormData = {
  name: '',
  email: '',
  phone: '',
  role: 'vendedor',
  isActive: true,
};

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser?: User | null;
  onSave: (data: UserFormData) => Promise<boolean> | boolean;
  title?: string;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onOpenChange,
  editingUser,
  onSave,
  title = 'Nuevo Usuario',
}) => {
  const [formData, setFormData] = useState<UserFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editing user changes
  useEffect(() => {
    if (open) {
      if (editingUser) {
        setFormData({
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role,
          isActive: editingUser.isActive,
        });
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [open, editingUser]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSave(formData);
    setIsSubmitting(false);
    
    if (success) {
      onOpenChange(false);
      setFormData(defaultFormData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Editar Usuario' : title}</DialogTitle>
          <DialogDescription>
            {editingUser ? 'Modifica los datos del usuario' : 'Ingresa los datos del nuevo usuario'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nombre completo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
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
            <Label>Rol *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: User['role']) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {Object.entries(USER_ROLES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Usuario activo</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : (editingUser ? 'Actualizar Usuario' : 'Crear Usuario')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export type { UserFormData };
