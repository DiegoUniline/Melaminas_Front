import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
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

interface DataContextType {
  // Estado de carga
  isLoading: boolean;
  error: string | null;
  
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
  refreshQuotations: () => Promise<void>;
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
  primaryColor: '#8B4513',
  secondaryColor: '#D2691E'
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    const newId = Date.now().toString();
    const apiData = mapClientToApi({ ...clientData, id: newId }, currentUser?.id);
    
    const response = await api.post<ApiClient>('/clientes', apiData);
    
    if (response.success && response.data) {
      const newClient = mapApiClient(response.data);
      setClients(prev => [...prev, newClient]);
      return newClient;
    }
    return null;
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
  const refreshQuotations = useCallback(async () => {
    const response = await api.get<ApiQuotation[]>('/cotizaciones');
    if (response.success && response.data) {
      // Para cada cotización, necesitamos obtener el cliente y los items
      const quotationsWithDetails: Quotation[] = [];
      
      for (const apiQuotation of response.data) {
        const client = clients.find(c => c.id === apiQuotation.id_cliente);
        if (client) {
          // Obtener detalle de items
          const detailResponse = await api.get<ApiQuotationItem[]>(`/cotizacion-detalle/cotizacion/${apiQuotation.id}`);
          const items = detailResponse.success && detailResponse.data 
            ? detailResponse.data.map(mapApiQuotationItem)
            : [];
          
          quotationsWithDetails.push(mapApiQuotation(apiQuotation, items, client));
        }
      }
      
      setQuotations(quotationsWithDetails);
    }
  }, [clients]);

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
    
    // 3. Agregar items (detalle)
    if (quotationData.items.length > 0) {
      const itemsApiData = quotationData.items.map((item, index) => ({
        id: `${quotationId}-${index + 1}`,
        ...mapQuotationItemToApi(item, quotationId)
      }));
      
      await api.post('/cotizacion-detalle/multiple', itemsApiData);
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
    // Si hay items, actualizar el detalle
    if (quotationData.items) {
      // Eliminar items existentes
      await api.del(`/cotizacion-detalle/cotizacion/${id}`);
      
      // Agregar nuevos items
      const itemsApiData = quotationData.items.map((item, index) => ({
        id: `${id}-${index + 1}`,
        ...mapQuotationItemToApi(item, id)
      }));
      
      await api.post('/cotizacion-detalle/multiple', itemsApiData);
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
        
        const response = await api.put(`/cotizaciones/${id}`, apiData);
        if (!response.success) {
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
    
    return true;
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
      error,
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
