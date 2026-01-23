// Tipos para el sistema de cotizaciones de carpintería - El Melaminas

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'superadmin' | 'admin' | 'vendedor' | 'instalador';
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface BusinessProfile {
  id: string;
  logo?: string;
  businessName: string;
  ownerName: string;
  phone: string;
  whatsapp?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  rfc?: string;
  facebook?: string;
  instagram?: string;
  primaryColor: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city?: string;
  notes?: string;
  createdAt: Date;
}

export type FurnitureCategory = 
  | 'cocinas-closets'
  | 'recamara'
  | 'oficina'
  | 'otro';

// Combinación de hojas (material + color + cantidad)
export interface SheetCombination {
  id: string;
  materialId: string;
  colorId: string;
  finishId?: string;
  quantity: number;
  // Display names (populated from catalog)
  _materialName?: string;
  _colorName?: string;
  _finishName?: string;
}

export interface FurnitureItem {
  id: string;
  category: FurnitureCategory;
  customCategory?: string;
  name: string;
  description?: string;
  // IDs para la API
  categoryId?: string;
  productId?: string;
  // Medidas
  height?: number;
  width?: number;
  depth?: number;
  measureUnit: 'cm' | 'm' | 'pulgadas';
  // Combinaciones de hojas (NUEVO: soporta múltiples combinaciones)
  sheets: SheetCombination[];
  // Campos legacy para compatibilidad (se usan si sheets está vacío)
  material?: string;
  sheetCount?: number;
  sheetColor?: string;
  finish?: string;
  // Precios
  unitPrice: number;
  quantity: number;
  subtotal: number;
  notes?: string;
  // Imagen del mueble (base64 o URL)
  imageUrl?: string;
  // Display names (populated from catalog) - legacy
  _materialName?: string;
  _colorName?: string;
  _finishName?: string;
}

export type QuotationStatus = 'borrador' | 'enviada' | 'aceptada' | 'rechazada';

export interface Quotation {
  id: string;
  folio: string;
  clientId: string;
  client: Client;
  items: FurnitureItem[];
  // Totales
  subtotal: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  total: number;
  // Condiciones
  deliveryDays: number;
  validityDays: number;
  paymentTerms: string;
  advancePercentage?: number;
  observations?: string;
  // Estado
  status: QuotationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Catálogo de tipos de muebles
export const FURNITURE_CATEGORIES: Record<FurnitureCategory, { label: string; items: string[] }> = {
  'cocinas-closets': {
    label: 'Cocinas y Closets',
    items: ['Gabinete de cocina', 'Alacena', 'Closet', 'Vestidor', 'Despensero', 'Isla de cocina', 'Barra desayunadora']
  },
  'recamara': {
    label: 'Muebles de Recámara',
    items: ['Cama', 'Cabecera', 'Buró', 'Cómoda', 'Tocador', 'Ropero', 'Zapatera']
  },
  'oficina': {
    label: 'Muebles de Oficina',
    items: ['Escritorio', 'Librero', 'Archivero', 'Mesa de juntas', 'Recepción', 'Credenza']
  },
  'otro': {
    label: 'Otro',
    items: []
  }
};

// Materiales comunes
export const COMMON_MATERIALS = [
  'MDF',
  'Melamina',
  'Triplay',
  'Madera de pino',
  'Madera de encino',
  'Madera de cedro',
  'Aglomerado',
  'Formaica',
  'Otro'
];

// Colores comunes de hojas/materiales
export const COMMON_SHEET_COLORS = [
  'Blanco',
  'Negro',
  'Chocolate',
  'Nogal',
  'Encino',
  'Cerezo',
  'Caoba',
  'Gris',
  'Arena',
  'Natural',
  'Otro'
];

// Roles de usuario
export const USER_ROLES = {
  superadmin: { label: 'Super Admin', color: 'bg-destructive' },
  admin: { label: 'Administrador', color: 'bg-primary' },
  vendedor: { label: 'Vendedor', color: 'bg-blue-500' },
  instalador: { label: 'Instalador', color: 'bg-green-500' }
};
