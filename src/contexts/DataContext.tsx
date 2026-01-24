import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { BusinessProfile, Client, Quotation, FurnitureItem } from '@/types';
import api from '@/lib/api';
import {
  mapApiClient,
  mapClientToApi,
  mapApiBusinessProfile,
  mapBusinessProfileToApi,
  mapApiQuotation,
  mapQuotationToApi,
  mapApiQuotationItem,
  mapQuotationItemToApi,
  ApiClient,
  ApiBusinessProfile,
  ApiQuotation,
  ApiQuotationItem
} from '@/lib/mappers';
import { useAuth } from './AuthContext';
import { useCatalogs } from './CatalogContext';
import { uploadImageToCloudinary } from '@/lib/imageUpload';

// Helper para subir imágenes base64 a Cloudinary antes de enviar a la API
const processItemImages = async (items: FurnitureItem[]): Promise<FurnitureItem[]> => {
  const processedItems: FurnitureItem[] = [];
  
  for (const item of items) {
    let processedItem = { ...item };
    
    // Si hay una imagen en base64, subirla a Cloudinary
    if (item.imageUrl && item.imageUrl.startsWith('data:')) {
      console.log('[processItemImages] Uploading image for item:', item.name);
      const cloudinaryUrl = await uploadImageToCloudinary(item.imageUrl, `item-${item.id}`);
      
      if (cloudinaryUrl) {
        console.log('[processItemImages] Got Cloudinary URL:', cloudinaryUrl);
        processedItem.imageUrl = cloudinaryUrl;
      } else {
        console.warn('[processItemImages] Failed to upload image, clearing imageUrl');
        processedItem.imageUrl = ''; // Clear if upload failed to prevent API rejection
      }
    }
    
    processedItems.push(processedItem);
  }
  
  return processedItems;
};

interface DataContextType {
  // Estado de carga
  isLoading: boolean;
  isSyncing: boolean; // New: indicates background sync
  error: string | null;
  lastSyncAt: Date | null; // New: timestamp of last successful sync
  
  // Business Profile
  businessProfile: BusinessProfile | null;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => Promise<boolean>;
  refreshBusinessProfile: () => Promise<void>;
  
  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<Client | null>;
  updateClient: (id: string, client: Partial<Client>) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  getClientById: (id: string) => Client | undefined;
  refreshClients: () => Promise<void>;
  
  // Quotations
  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id' | 'folio' | 'createdAt' | 'updatedAt'>) => Promise<Quotation | null>;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => Promise<boolean>;
  deleteQuotation: (id: string) => Promise<boolean>;
  getQuotationById: (id: string) => Quotation | undefined;
  updateQuotationStatus: (id: string, status: Quotation['status']) => Promise<boolean>;
  getNextFolio: () => Promise<string>;
  refreshQuotations: (force?: boolean) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Perfil por defecto mientras carga
const defaultBusinessProfile: BusinessProfile = {
  id: '1',
  businessName: 'El Melaminas',
  ownerName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  primaryColor: '#8B4513'
};

// Cache duration in milliseconds (30 seconds)
const CACHE_DURATION = 30 * 1000;

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { getMaterialName, getColorName, getFinishName } = useCatalogs();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // === BUSINESS PROFILE ===
  const refreshBusinessProfile = useCallback(async () => {
    const response = await api.get<ApiBusinessProfile>('/perfil-negocio');
    if (response.success && response.data) {
      setBusinessProfile(mapApiBusinessProfile(response.data));
    } else {
      setBusinessProfile(defaultBusinessProfile);
    }
  }, []);

  const updateBusinessProfileFn = async (profile: Partial<BusinessProfile>): Promise<boolean> => {
    const apiData = mapBusinessProfileToApi(profile);
    const response = await api.put('/perfil-negocio', apiData);
    
    if (response.success) {
      setBusinessProfile(prev => prev ? { ...prev, ...profile } : null);
      return true;
    }
    return false;
  };

  // === CLIENTS ===
  const refreshClients = useCallback(async () => {
    const response = await api.get<ApiClient[]>('/clientes/activos');
    if (response.success && response.data) {
      setClients(response.data.map(mapApiClient));
    }
  }, []);

  const addClientFn = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client | null> => {
    try {
      const newId = Date.now().toString();
      const apiData = mapClientToApi({ ...clientData, id: newId }, currentUser?.id);
      
      console.log('[DataContext] Creating client with data:', apiData);
      
      const response = await api.post<ApiClient>('/clientes', apiData);
      
      console.log('[DataContext] API Response:', response);
      
      if (response.success && response.data) {
        const newClient = mapApiClient(response.data);
        console.log('[DataContext] Mapped new client:', newClient);
        setClients(prev => [...prev, newClient]);
        return newClient;
      } else {
        console.error('[DataContext] Failed to create client:', response.error);
        return null;
      }
    } catch (error) {
      console.error('[DataContext] Exception creating client:', error);
      return null;
    }
  };

  const updateClientFn = async (id: string, clientData: Partial<Client>): Promise<boolean> => {
    const apiData = mapClientToApi(clientData, undefined, true);
    const response = await api.put(`/clientes/${id}`, apiData);
    
    if (response.success) {
      setClients(prev => 
        prev.map(client => 
          client.id === id ? { ...client, ...clientData } : client
        )
      );
      return true;
    }
    return false;
  };

  const deleteClientFn = async (id: string): Promise<boolean> => {
    const response = await api.del(`/clientes/${id}`);
    
    if (response.success) {
      setClients(prev => prev.filter(client => client.id !== id));
      return true;
    }
    return false;
  };

  const getClientById = (id: string) => clients.find(c => c.id === id);

  // === QUOTATIONS ===
  const refreshQuotations = useCallback(async (force: boolean = false) => {
    // Check cache - skip if synced recently (unless forced)
    if (!force && lastSyncAt && Date.now() - lastSyncAt.getTime() < CACHE_DURATION) {
      return;
    }

    setIsSyncing(true);
    
    try {
      const response = await api.get<ApiQuotation[]>('/cotizaciones');
      if (response.success && response.data) {
        // OPTIMIZATION: Fetch all quotation details in PARALLEL instead of sequentially
        const quotationsWithClient = response.data
          .map(apiQuotation => ({
            apiQuotation,
            client: clients.find(c => c.id === apiQuotation.id_cliente)
          }))
          .filter((q): q is { apiQuotation: ApiQuotation; client: Client } => q.client !== undefined);

        // Parallel fetch all details
        const detailPromises = quotationsWithClient.map(({ apiQuotation }) =>
          api.get<ApiQuotationItem[]>(`/cotizacion-detalle/cotizacion/${apiQuotation.id}`)
        );
        
        const detailResponses = await Promise.all(detailPromises);
        
        // Map results
        const quotationsWithDetails: Quotation[] = quotationsWithClient.map(({ apiQuotation, client }, index) => {
          const detailResponse = detailResponses[index];
          const items = detailResponse.success && detailResponse.data 
            ? detailResponse.data.map(apiItem => {
                const item = mapApiQuotationItem(apiItem);
                return {
                  ...item,
                  _materialName: getMaterialName(item.material),
                  _colorName: getColorName(item.sheetColor),
                  _finishName: item.finish ? getFinishName(item.finish) : undefined
                };
              })
            : [];
          
          return mapApiQuotation(apiQuotation, items, client);
        });
        
        setQuotations(quotationsWithDetails);
        setLastSyncAt(new Date());
      }
    } finally {
      setIsSyncing(false);
    }
  }, [clients, getMaterialName, getColorName, getFinishName]);

  const getNextFolio = async (): Promise<string> => {
    const response = await api.get<string>('/cotizaciones/util/siguiente-folio');
    if (response.success && response.data) {
      return response.data;
    }
    // Fallback
    const year = new Date().getFullYear();
    return `COT-${year}-${String(quotations.length + 1).padStart(3, '0')}`;
  };

  const addQuotationFn = async (quotationData: Omit<Quotation, 'id' | 'folio' | 'createdAt' | 'updatedAt'>): Promise<Quotation | null> => {
    // 1. Obtener siguiente folio
    const folio = await getNextFolio();
    
    // 2. Crear cotización (encabezado)
    const newId = Date.now().toString();
    const apiData = {
      id: newId,
      ...mapQuotationToApi(quotationData, folio, currentUser?.id)
    };
    
    const response = await api.post<ApiQuotation>('/cotizaciones', apiData);
    
    if (!response.success) {
      return null;
    }
    
    const quotationId = response.data?.id || newId;
    
    // 3. Agregar items (detalle) - uno por uno
    if (quotationData.items.length > 0) {
      // Primero procesar imágenes (subir a Cloudinary si son base64)
      console.log('[DataContext] Procesando imágenes de items...');
      const processedItems = await processItemImages(quotationData.items);
      
      const itemPromises = processedItems.map((item, index) => {
        const itemData = {
          id: `${quotationId}-${index + 1}`,
          ...mapQuotationItemToApi(item, quotationId)
        };
        console.log('[DataContext] Guardando item:', itemData);
        return api.post('/cotizacion-detalle', itemData);
      });
      
      const results = await Promise.all(itemPromises);
      console.log('[DataContext] Resultados de items:', results);
    }
    
    // 4. Crear objeto completo
    const now = new Date();
    const newQuotation: Quotation = {
      ...quotationData,
      id: quotationId,
      folio: folio,
      createdAt: now,
      updatedAt: now
    };
    
    setQuotations(prev => [...prev, newQuotation]);
    return newQuotation;
  };

  const updateQuotationFn = async (id: string, quotationData: Partial<Quotation>): Promise<boolean> => {
    console.log('[DataContext] updateQuotation llamado con:', { id, quotationData });
    console.log('[DataContext] Items a guardar:', quotationData.items?.length || 0);
    
    try {
      // Si hay items (incluso array vacío significa que hay que actualizar)
      if (quotationData.items !== undefined) {
        console.log('[DataContext] Eliminando items existentes...');
        // Eliminar items existentes
        const deleteResult = await api.del(`/cotizacion-detalle/cotizacion/${id}`);
        console.log('[DataContext] Resultado de eliminación:', deleteResult);
        
        // Agregar nuevos items - uno por uno
        if (quotationData.items.length > 0) {
          console.log('[DataContext] Insertando', quotationData.items.length, 'items...');
          
          // Primero procesar imágenes (subir a Cloudinary si son base64)
          console.log('[DataContext] Procesando imágenes de items...');
          const processedItems = await processItemImages(quotationData.items);
          
          for (let index = 0; index < processedItems.length; index++) {
            const item = processedItems[index];
            const itemData = {
              id: `${id}-${index + 1}`,
              ...mapQuotationItemToApi(item, id)
            };
            console.log(`[DataContext] Guardando item ${index + 1}:`, JSON.stringify(itemData, null, 2));
            
            try {
              const result = await api.post('/cotizacion-detalle', itemData);
              console.log(`[DataContext] Resultado item ${index + 1}:`, result);
              
              if (!result.success) {
                console.error(`[DataContext] ERROR al guardar item ${index + 1}:`, result);
                toast.error(`Error al guardar mueble: ${item.name}`);
              }
            } catch (itemError) {
              console.error(`[DataContext] EXCEPCIÓN al guardar item ${index + 1}:`, itemError);
              toast.error(`Error al guardar mueble: ${item.name}`);
            }
          }
        }
      }
      
      // Actualizar encabezado (excluyendo items, client, y fechas)
      const { items, client, createdAt, updatedAt, ...headerData } = quotationData as any;
      
      if (Object.keys(headerData).length > 0) {
        const existingQuotation = quotations.find(q => q.id === id);
        if (existingQuotation) {
          const apiData = mapQuotationToApi(
            { ...existingQuotation, ...headerData },
            existingQuotation.folio,
            currentUser?.id,
            true // isUpdate = true
          );
          
          console.log('[DataContext] Actualizando encabezado:', apiData);
          const response = await api.put(`/cotizaciones/${id}`, apiData);
          console.log('[DataContext] Resultado encabezado:', response);
          
          if (!response.success) {
            console.error('[DataContext] Error al actualizar encabezado:', response);
            return false;
          }
        }
      }
      
      setQuotations(prev => 
        prev.map(quotation => 
          quotation.id === id 
            ? { ...quotation, ...quotationData, updatedAt: new Date() } 
            : quotation
        )
      );
      
      console.log('[DataContext] Cotización actualizada exitosamente');
      return true;
    } catch (error) {
      console.error('[DataContext] Error general en updateQuotation:', error);
      toast.error('Error al actualizar cotización');
      return false;
    }
  };

  const deleteQuotationFn = async (id: string): Promise<boolean> => {
    const response = await api.del(`/cotizaciones/${id}`);
    
    if (response.success) {
      setQuotations(prev => prev.filter(q => q.id !== id));
      return true;
    }
    return false;
  };

  const getQuotationById = (id: string) => quotations.find(q => q.id === id);

  const updateQuotationStatus = async (id: string, status: Quotation['status']): Promise<boolean> => {
    const statusMap: Record<string, string> = {
      'borrador': '1',
      'enviada': '2',
      'aceptada': '3',
      'rechazada': '4'
    };
    
    const response = await api.put(`/cotizaciones/${id}/estado`, { estado: statusMap[status] });
    
    if (response.success) {
      setQuotations(prev => 
        prev.map(q => q.id === id ? { ...q, status, updatedAt: new Date() } : q)
      );
      return true;
    }
    return false;
  };

  // === CARGA INICIAL ===
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          refreshBusinessProfile(),
          refreshClients()
        ]);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Error al cargar datos');
      }
      
      setIsLoading(false);
    };
    
    loadInitialData();
  }, [refreshBusinessProfile, refreshClients]);

  // Cargar cotizaciones después de clientes
  useEffect(() => {
    if (clients.length > 0) {
      refreshQuotations();
    }
  }, [clients, refreshQuotations]);

  return (
    <DataContext.Provider value={{
      isLoading,
      isSyncing,
      error,
      lastSyncAt,
      businessProfile,
      updateBusinessProfile: updateBusinessProfileFn,
      refreshBusinessProfile,
      clients,
      addClient: addClientFn,
      updateClient: updateClientFn,
      deleteClient: deleteClientFn,
      getClientById,
      refreshClients,
      quotations,
      addQuotation: addQuotationFn,
      updateQuotation: updateQuotationFn,
      deleteQuotation: deleteQuotationFn,
      getQuotationById,
      updateQuotationStatus,
      getNextFolio,
      refreshQuotations
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
