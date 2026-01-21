import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
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

interface CachedCatalogs {
  data: Catalogs;
  timestamp: number;
}

// Cache duration: 24 hours in milliseconds
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
const CACHE_KEY = 'elmelaminas_catalogs_cache';

interface CatalogContextType {
  catalogs: Catalogs | null;
  isLoading: boolean;
  error: string | null;
  refreshCatalogs: (forceRefresh?: boolean) => Promise<void>;
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
  // Cache info
  lastUpdated: Date | null;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

// Load cached catalogs from localStorage
const loadCachedCatalogs = (): CachedCatalogs | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as CachedCatalogs;
    }
  } catch (e) {
    console.warn('Error loading cached catalogs:', e);
  }
  return null;
};

// Save catalogs to localStorage
const saveCatalogsToCache = (data: Catalogs): void => {
  try {
    const cacheData: CachedCatalogs = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (e) {
    console.warn('Error saving catalogs to cache:', e);
  }
};

// Check if cache is still valid
const isCacheValid = (cached: CachedCatalogs): boolean => {
  const now = Date.now();
  const age = now - cached.timestamp;
  return age < CACHE_DURATION_MS;
};

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCatalogsFromAPI = useCallback(async (): Promise<Catalogs | null> => {
    const response = await api.get<Catalogs>('/catalogos/todos');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Error al cargar catálogos');
    }
  }, []);

  const loadCatalogs = useCallback(async (forceRefresh: boolean = false) => {
    setError(null);
    
    // Try to load from cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = loadCachedCatalogs();
      
      if (cached && isCacheValid(cached)) {
        console.log('[Catalogs] Using cached data from', new Date(cached.timestamp).toLocaleString());
        setCatalogs(cached.data);
        setLastUpdated(new Date(cached.timestamp));
        setIsLoading(false);
        return;
      }
    }
    
    // Fetch from API
    setIsLoading(true);
    console.log('[Catalogs] Fetching from API...');
    
    try {
      const data = await fetchCatalogsFromAPI();
      if (data) {
        setCatalogs(data);
        saveCatalogsToCache(data);
        setLastUpdated(new Date());
        console.log('[Catalogs] Updated and cached');
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error desconocido';
      setError(errorMsg);
      console.error('Error loading catalogs:', errorMsg);
      
      // Try to use stale cache if available
      const cached = loadCachedCatalogs();
      if (cached) {
        console.log('[Catalogs] Using stale cache due to error');
        setCatalogs(cached.data);
        setLastUpdated(new Date(cached.timestamp));
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchCatalogsFromAPI]);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

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
    const activeColors = catalogs?.colores.filter(c => c.activo !== 'N') || [];
    
    // If materialId is provided, try to filter by it
    if (materialId) {
      const filteredColors = activeColors.filter(c => c.id_material === materialId);
      // If no colors for this material, return all active colors
      return filteredColors.length > 0 ? filteredColors : activeColors;
    }
    
    return activeColors;
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
      refreshCatalogs: loadCatalogs,
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
      getProductsByCategory,
      lastUpdated
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
