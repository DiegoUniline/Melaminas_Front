import React, { useState } from 'react';
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
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Client } from '@/types';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface ClientSelectorProps {
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  selectedClient,
  onSelectClient,
}) => {
  const { clients, addClient } = useData();
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!newClient.phone.trim()) {
      toast.error('El teléfono es obligatorio');
      return;
    }
    if (!newClient.address.trim()) {
      toast.error('La dirección es obligatoria');
      return;
    }

    const client = await addClient({
      name: newClient.name.trim(),
      phone: newClient.phone.trim(),
      whatsapp: newClient.whatsapp.trim() || undefined,
      email: newClient.email.trim() || undefined,
      address: newClient.address.trim(),
      city: newClient.city.trim() || undefined,
      notes: newClient.notes.trim() || undefined,
    });

    if (client) {
      onSelectClient(client);
      setSheetOpen(false);
      setNewClient({
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        city: '',
        notes: '',
      });
      toast.success('Cliente creado exitosamente');
    } else {
      toast.error('Error al crear cliente');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedClient ? (
                <span className="truncate">{selectedClient.name}</span>
              ) : (
                <span className="text-muted-foreground">Buscar cliente...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] p-0 bg-background border shadow-lg z-50" align="start">
            <Command>
              <CommandInput placeholder="Buscar por nombre..." />
              <CommandList>
                <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                <CommandGroup>
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.name}
                      onSelect={() => {
                        onSelectClient(client);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedClient?.id === client.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        <span className="text-xs text-muted-foreground">{client.phone}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Nuevo Cliente
              </SheetTitle>
              <SheetDescription>
                Ingresa los datos del nuevo cliente
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  name="name"
                  value={newClient.name}
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
                    value={newClient.phone}
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
                    value={newClient.whatsapp}
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
                  value={newClient.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  name="address"
                  value={newClient.address}
                  onChange={handleInputChange}
                  placeholder="Calle, número, colonia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  value={newClient.city}
                  onChange={handleInputChange}
                  placeholder="Ciudad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={newClient.notes}
                  onChange={handleInputChange}
                  placeholder="Notas sobre el cliente..."
                  rows={2}
                />
              </div>
              <Button className="w-full" onClick={handleCreateClient}>
                Guardar Cliente
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {selectedClient && (
        <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
          <p className="font-medium">{selectedClient.name}</p>
          <p className="text-muted-foreground">{selectedClient.phone}</p>
          <p className="text-muted-foreground">{selectedClient.address}</p>
        </div>
      )}
    </div>
  );
};
