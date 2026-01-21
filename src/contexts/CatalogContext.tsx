import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import api from '@/lib/api';

// Interfaces para los catálogos de la API
export interface CatalogItem {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  orden?: number;
  activo?: string;
}

export interface CatalogColor extends CatalogItem {
  id_material?: string;
  codigo_hex?: string;
}

export interface CatalogProduct extends CatalogItem {
  id_categoria?: string;
}

export interface Catalogs {
  categorias: CatalogItem[];
  productos: CatalogProduct[];
  materiales: CatalogItem[];
  colores: CatalogColor[];
  acabados: CatalogItem[];
  unidades_medida: CatalogItem[];
  metodos_pago: CatalogItem[];
  estados_cotizacion: CatalogItem[];
  roles: CatalogItem[];
}

interface CatalogContextType {
  catalogs: Catalogs | null;
  isLoading: boolean;
  error: string | null;
  refreshCatalogs: () => Promise<void>;
  // Helpers para obtener nombres por ID
  getCategoryName: (id: string) => string;
  getProductName: (id: string) => string;
  getMaterialName: (id: string) => string;
  getColorName: (id: string) => string;
  getFinishName: (id: string) => string;
  getUnitName: (id: string) => string;
  getPaymentMethodName: (id: string) => string;
  getStatusName: (id: string) => string;
  getRoleName: (id: string) => string;
  // Helpers para obtener listas activas
  getActiveCategories: () => CatalogItem[];
  getActiveMaterials: () => CatalogItem[];
  getActiveColors: (materialId?: string) => CatalogColor[];
  getActiveFinishes: () => CatalogItem[];
  getProductsByCategory: (categoryId: string) => CatalogProduct[];
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalogs = async () => {
    setIsLoading(true);
    setError(null);
    
    const response = await api.get<Catalogs>('/catalogos/todos');
    
    if (response.success && response.data) {
      setCatalogs(response.data);
    } else {
      setError(response.error || 'Error al cargar catálogos');
      console.error('Error loading catalogs:', response.error);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);

  // Helper genérico para buscar nombre por ID
  const getNameById = (list: CatalogItem[] | undefined, id: string): string => {
    if (!list) return id;
    const item = list.find(i => i.id === id);
    return item?.nombre || id;
  };

  // Helpers específicos
  const getCategoryName = (id: string) => getNameById(catalogs?.categorias, id);
  const getProductName = (id: string) => getNameById(catalogs?.productos, id);
  const getMaterialName = (id: string) => getNameById(catalogs?.materiales, id);
  const getColorName = (id: string) => getNameById(catalogs?.colores, id);
  const getFinishName = (id: string) => getNameById(catalogs?.acabados, id);
  const getUnitName = (id: string) => getNameById(catalogs?.unidades_medida, id);
  const getPaymentMethodName = (id: string) => getNameById(catalogs?.metodos_pago, id);
  const getStatusName = (id: string) => getNameById(catalogs?.estados_cotizacion, id);
  const getRoleName = (id: string) => getNameById(catalogs?.roles, id);

  // Helpers para listas activas
  const getActiveCategories = () => 
    catalogs?.categorias.filter(c => c.activo !== 'N') || [];
  
  const getActiveMaterials = () => 
    catalogs?.materiales.filter(m => m.activo !== 'N') || [];
  
  const getActiveColors = (materialId?: string) => {
    const colors = catalogs?.colores.filter(c => c.activo !== 'N') || [];
    if (materialId) {
      return colors.filter(c => c.id_material === materialId);
    }
    return colors;
  };
  
  const getActiveFinishes = () => 
    catalogs?.acabados.filter(a => a.activo !== 'N') || [];
  
  const getProductsByCategory = (categoryId: string) =>
    catalogs?.productos.filter(p => p.id_categoria === categoryId && p.activo !== 'N') || [];

  return (
    <CatalogContext.Provider value={{
      catalogs,
      isLoading,
      error,
      refreshCatalogs: fetchCatalogs,
      getCategoryName,
      getProductName,
      getMaterialName,
      getColorName,
      getFinishName,
      getUnitName,
      getPaymentMethodName,
      getStatusName,
      getRoleName,
      getActiveCategories,
      getActiveMaterials,
      getActiveColors,
      getActiveFinishes,
      getProductsByCategory
    }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalogs = (): CatalogContextType => {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalogs must be used within a CatalogProvider');
  }
  return context;
};
