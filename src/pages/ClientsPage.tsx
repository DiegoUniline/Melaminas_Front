import React, { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Edit2, 
  Trash2,
  FileText,
  MessageCircle
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Client } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { clients, addClient, updateClient, deleteClient, quotations } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const getClientQuotationsCount = (clientId: string) => {
    return quotations.filter(q => q.clientId === clientId).length;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openNewClientSheet = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: '',
      notes: '',
    });
    setSheetOpen(true);
  };

  const openEditClientSheet = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      whatsapp: client.whatsapp || '',
      email: client.email || '',
      address: client.address,
      city: client.city || '',
      notes: client.notes || '',
    });
    setSheetOpen(true);
  };

  const handleSaveClient = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('El teléfono es obligatorio');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('La dirección es obligatoria');
      return;
    }

    if (editingClient) {
      updateClient(editingClient.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
      toast.success('Cliente actualizado');
    } else {
      addClient({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
      toast.success('Cliente creado');
    }

    setSheetOpen(false);
  };

  const handleDeleteClient = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      toast.success('Cliente eliminado');
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/52${cleanPhone}`, '_blank');
  };

  return (
    <MobileLayout title="Clientes">
      <div className="space-y-4">
        {/* Search and Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={openNewClientSheet}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {clients.length} clientes
          </Badge>
        </div>

        {/* Client List */}
        <div className="space-y-3">
          {filteredClients.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <User className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No hay clientes</p>
                <Button variant="link" onClick={openNewClientSheet}>
                  Agregar primer cliente
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredClients.map((client) => (
              <Card key={client.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{client.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    </div>
                    <Badge variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      {getClientQuotationsCount(client.id)}
                    </Badge>
                  </div>

                  {client.notes && (
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded mb-3">
                      {client.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {client.whatsapp && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openWhatsApp(client.whatsapp!)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditClientSheet(client)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => {
                        setClientToDelete(client);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Client Form Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
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
            <Button className="w-full" onClick={handleSaveClient}>
              {editingClient ? 'Actualizar Cliente' : 'Guardar Cliente'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el cliente "{clientToDelete?.name}" permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
};

export default ClientsPage;
