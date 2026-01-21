// Tipos para el sistema de cotizaciones de carpintería - El Melaminas

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'vendedor' | 'instalador';
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
  secondaryColor: string;
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

export interface FurnitureItem {
  id: string;
  category: FurnitureCategory;
  customCategory?: string;
  name: string;
  description?: string;
  // Medidas
  height?: number;
  width?: number;
  depth?: number;
  measureUnit: 'cm' | 'm' | 'pulgadas';
  // Materiales
  material: string;
  sheetCount: number;
  sheetColor: string;
  finish?: string;
  // Precios
  unitPrice: number;
  quantity: number;
  subtotal: number;
  notes?: string;
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
  admin: { label: 'Administrador', color: 'bg-primary' },
  vendedor: { label: 'Vendedor', color: 'bg-info' },
  instalador: { label: 'Instalador', color: 'bg-success' }
};
