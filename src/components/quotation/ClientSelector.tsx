import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Client } from '@/types';
import { useData } from '@/contexts/DataContext';
import { ClientFormModal, ClientFormData } from '@/components/shared/ClientFormModal';
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

    const client = await addClient({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim(),
      city: formData.city.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    });

    if (client) {
      onSelectClient(client);
      toast.success('Cliente creado exitosamente');
      return true;
    } else {
      toast.error('Error al crear cliente');
      return false;
    }
  }, [addClient, onSelectClient]);

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

        <Button size="icon" variant="outline" onClick={() => setSheetOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {selectedClient && (
        <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
          <p className="font-medium">{selectedClient.name}</p>
          <p className="text-muted-foreground">{selectedClient.phone}</p>
          <p className="text-muted-foreground">{selectedClient.address}</p>
        </div>
      )}

      <ClientFormModal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSaveClient}
      />
    </div>
  );
};
