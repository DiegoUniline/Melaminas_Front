import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { BusinessProfile, Client, Quotation } from '@/types';
import { mockBusinessProfile, mockClients, mockQuotations, generateFolio } from '@/data/mockData';

interface DataContextType {
  // Business Profile
  businessProfile: BusinessProfile;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  
  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  
  // Quotations
  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id' | 'folio' | 'createdAt' | 'updatedAt'>) => Quotation;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  getQuotationById: (id: string) => Quotation | undefined;
  updateQuotationStatus: (id: string, status: Quotation['status']) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [businessProfile, setBusinessProfile] = useLocalStorage<BusinessProfile>(
    'carpinteria_business_profile',
    mockBusinessProfile
  );
  
  const [clients, setClients] = useLocalStorage<Client[]>(
    'carpinteria_clients',
    mockClients
  );
  
  const [quotations, setQuotations] = useLocalStorage<Quotation[]>(
    'carpinteria_quotations',
    mockQuotations
  );

  // Business Profile functions
  const updateBusinessProfile = (profile: Partial<BusinessProfile>) => {
    setBusinessProfile(prev => ({ ...prev, ...profile }));
  };

  // Client functions
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prev => 
      prev.map(client => 
        client.id === id ? { ...client, ...clientData } : client
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  const getClientById = (id: string) => clients.find(c => c.id === id);

  // Quotation functions
  const addQuotation = (quotationData: Omit<Quotation, 'id' | 'folio' | 'createdAt' | 'updatedAt'>): Quotation => {
    const now = new Date();
    const newQuotation: Quotation = {
      ...quotationData,
      id: Date.now().toString(),
      folio: generateFolio(),
      createdAt: now,
      updatedAt: now
    };
    setQuotations(prev => [...prev, newQuotation]);
    return newQuotation;
  };

  const updateQuotation = (id: string, quotationData: Partial<Quotation>) => {
    setQuotations(prev => 
      prev.map(quotation => 
        quotation.id === id 
          ? { ...quotation, ...quotationData, updatedAt: new Date() } 
          : quotation
      )
    );
  };

  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  const getQuotationById = (id: string) => quotations.find(q => q.id === id);

  const updateQuotationStatus = (id: string, status: Quotation['status']) => {
    updateQuotation(id, { status });
  };

  return (
    <DataContext.Provider value={{
      businessProfile,
      updateBusinessProfile,
      clients,
      addClient,
      updateClient,
      deleteClient,
      getClientById,
      quotations,
      addQuotation,
      updateQuotation,
      deleteQuotation,
      getQuotationById,
      updateQuotationStatus
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
