import React, { useState, useCallback, useMemo } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ClientFormModal, ClientFormData } from '@/components/shared/ClientFormModal';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

const ClientsPage: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, quotations } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  // Debounced search for better performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredClients = useMemo(() => 
    clients.filter(client =>
      client.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      client.phone.includes(debouncedSearch)
    ),
    [clients, debouncedSearch]
  );

  const getClientQuotationsCount = useCallback((clientId: string) => {
    return quotations.filter(q => q.clientId === clientId).length;
  }, [quotations]);

  const openNewClientSheet = useCallback(() => {
    setEditingClient(null);
    setSheetOpen(true);
  }, []);

  const openEditClientSheet = useCallback((client: Client) => {
    setEditingClient(client);
    setSheetOpen(true);
  }, []);

  const handleSaveClient = useCallback(async (formData: ClientFormData): Promise<boolean> => {
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('El teléfono es obligatorio');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('La dirección es obligatoria');
      return false;
    }

    const clientData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim(),
      city: formData.city.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    if (editingClient) {
      const success = await updateClient(editingClient.id, clientData);
      if (success) {
        toast.success('Cliente actualizado');
        return true;
      }
      toast.error('Error al actualizar cliente');
      return false;
    } else {
      const newClient = await addClient(clientData);
      if (newClient) {
        toast.success('Cliente creado');
        return true;
      }
      toast.error('Error al crear cliente');
      return false;
    }
  }, [editingClient, updateClient, addClient]);

  const handleDeleteClient = useCallback(() => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      toast.success('Cliente eliminado');
      setClientToDelete(null);
    }
  }, [clientToDelete, deleteClient]);

  const openWhatsApp = useCallback((phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/52${cleanPhone}`, '_blank');
  }, []);

  return (
    <ResponsiveLayout title="Clientes">
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
              <ClientCard
                key={client.id}
                client={client}
                quotationsCount={getClientQuotationsCount(client.id)}
                onEdit={openEditClientSheet}
                onDelete={(c) => {
                  setClientToDelete(c);
                  setDeleteDialogOpen(true);
                }}
                onWhatsApp={openWhatsApp}
              />
            ))
          )}
        </div>
      </div>

      {/* Reusable Client Form Modal */}
      <ClientFormModal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingClient={editingClient}
        onSave={handleSaveClient}
      />

      {/* Reusable Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar cliente?"
        description={`Esta acción no se puede deshacer. Se eliminará el cliente "${clientToDelete?.name}" permanentemente.`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteClient}
        variant="danger"
      />
    </ResponsiveLayout>
  );
};

// Memoized Client Card component
interface ClientCardProps {
  client: Client;
  quotationsCount: number;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onWhatsApp: (phone: string) => void;
}

const ClientCard = React.memo<ClientCardProps>(({ 
  client, 
  quotationsCount, 
  onEdit, 
  onDelete, 
  onWhatsApp 
}) => (
  <Card className="overflow-hidden">
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
          {quotationsCount}
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
            onClick={() => onWhatsApp(client.whatsapp!)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            WhatsApp
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(client)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive"
          onClick={() => onDelete(client)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
));

ClientCard.displayName = 'ClientCard';

export default ClientsPage;
