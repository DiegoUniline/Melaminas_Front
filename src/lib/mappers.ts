// Mappers: API ↔ Frontend
import { User, Client, Quotation, FurnitureItem, BusinessProfile, QuotationStatus, FurnitureCategory } from '@/types';

// === MAPEO DE ROLES ===
const ROLE_MAP: Record<string, User['role']> = {
  '1': 'superadmin',
  '2': 'admin',
  '3': 'vendedor',
  '4': 'instalador'
};

const ROLE_REVERSE_MAP: Record<User['role'], string> = {
  'superadmin': '1',
  'admin': '2',
  'vendedor': '3',
  'instalador': '4'
};

// === MAPEO DE ESTADOS DE COTIZACIÓN ===
const STATUS_MAP: Record<string, QuotationStatus> = {
  '1': 'borrador',
  '2': 'enviada',
  '3': 'aceptada',
  '4': 'rechazada'
};

const STATUS_REVERSE_MAP: Record<QuotationStatus, string> = {
  'borrador': '1',
  'enviada': '2',
  'aceptada': '3',
  'rechazada': '4'
};

// === USUARIO ===
export interface ApiUser {
  id: string;
  nombre: string;
  correo: string;
  password?: string;
  telefono: string;
  rol: string;
  activo: string;
  fecha_creacion?: string;
}

export const mapApiUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.nombre,
  email: apiUser.correo,
  password: apiUser.password || '',
  phone: apiUser.telefono,
  role: ROLE_MAP[apiUser.rol] || 'vendedor',
  isActive: apiUser.activo === 'Y',
  createdAt: apiUser.fecha_creacion ? new Date(apiUser.fecha_creacion) : new Date()
});

export const mapUserToApi = (user: Partial<User> & { id?: string }): Partial<ApiUser> => {
  const mapped: Partial<ApiUser> = {};
  if (user.id !== undefined) mapped.id = user.id;
  if (user.name !== undefined) mapped.nombre = user.name;
  if (user.email !== undefined) mapped.correo = user.email;
  if (user.password !== undefined) mapped.password = user.password;
  if (user.phone !== undefined) mapped.telefono = user.phone;
  if (user.role !== undefined) mapped.rol = ROLE_REVERSE_MAP[user.role];
  if (user.isActive !== undefined) mapped.activo = user.isActive ? 'Y' : 'N';
  return mapped;
};

// === CLIENTE ===
export interface ApiClient {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp?: string;
  correo?: string;
  direccion: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  rfc?: string;
  notas?: string;
  activo?: string;
  creado_por?: string;
  fecha_creacion?: string;
}

export const mapApiClient = (apiClient: ApiClient): Client => ({
  id: apiClient.id,
  name: apiClient.nombre,
  phone: apiClient.telefono,
  whatsapp: apiClient.whatsapp,
  email: apiClient.correo,
  address: apiClient.direccion,
  city: apiClient.ciudad,
  notes: apiClient.notas,
  createdAt: apiClient.fecha_creacion ? new Date(apiClient.fecha_creacion) : new Date()
});

export const mapClientToApi = (client: Partial<Client> & { id?: string }, createdBy?: string): Partial<ApiClient> => {
  const mapped: Partial<ApiClient> = {};
  if (client.id !== undefined) mapped.id = client.id;
  if (client.name !== undefined) mapped.nombre = client.name;
  if (client.phone !== undefined) mapped.telefono = client.phone;
  if (client.whatsapp !== undefined) mapped.whatsapp = client.whatsapp;
  if (client.email !== undefined) mapped.correo = client.email;
  if (client.address !== undefined) mapped.direccion = client.address;
  if (client.city !== undefined) mapped.ciudad = client.city;
  if (client.notes !== undefined) mapped.notas = client.notes;
  if (createdBy) mapped.creado_por = createdBy;
  return mapped;
};

// === PERFIL DE NEGOCIO ===
export interface ApiBusinessProfile {
  id: string;
  nombre_negocio: string;
  nombre_propietario: string;
  telefono: string;
  whatsapp?: string;
  correo: string;
  direccion: string;
  ciudad: string;
  estado: string;
  rfc?: string;
  logo_url?: string;
  facebook?: string;
  instagram?: string;
  color_primario?: string;
  color_secundario?: string;
}

export const mapApiBusinessProfile = (apiProfile: ApiBusinessProfile): BusinessProfile => ({
  id: apiProfile.id,
  businessName: apiProfile.nombre_negocio,
  ownerName: apiProfile.nombre_propietario,
  phone: apiProfile.telefono,
  whatsapp: apiProfile.whatsapp,
  email: apiProfile.correo,
  address: apiProfile.direccion,
  city: apiProfile.ciudad,
  state: apiProfile.estado,
  rfc: apiProfile.rfc,
  logo: apiProfile.logo_url,
  facebook: apiProfile.facebook,
  instagram: apiProfile.instagram,
  primaryColor: apiProfile.color_primario || '#8B4513',
  secondaryColor: apiProfile.color_secundario || '#D2691E'
});

export const mapBusinessProfileToApi = (profile: Partial<BusinessProfile>): Partial<ApiBusinessProfile> => {
  const mapped: Partial<ApiBusinessProfile> = {};
  if (profile.businessName !== undefined) mapped.nombre_negocio = profile.businessName;
  if (profile.ownerName !== undefined) mapped.nombre_propietario = profile.ownerName;
  if (profile.phone !== undefined) mapped.telefono = profile.phone;
  if (profile.whatsapp !== undefined) mapped.whatsapp = profile.whatsapp;
  if (profile.email !== undefined) mapped.correo = profile.email;
  if (profile.address !== undefined) mapped.direccion = profile.address;
  if (profile.city !== undefined) mapped.ciudad = profile.city;
  if (profile.state !== undefined) mapped.estado = profile.state;
  if (profile.rfc !== undefined) mapped.rfc = profile.rfc;
  if (profile.logo !== undefined) mapped.logo_url = profile.logo;
  if (profile.facebook !== undefined) mapped.facebook = profile.facebook;
  if (profile.instagram !== undefined) mapped.instagram = profile.instagram;
  if (profile.primaryColor !== undefined) mapped.color_primario = profile.primaryColor;
  if (profile.secondaryColor !== undefined) mapped.color_secundario = profile.secondaryColor;
  return mapped;
};

// === ITEM DE COTIZACIÓN (Detalle) ===
export interface ApiQuotationItem {
  id: string;
  id_cotizacion: string;
  id_producto?: string;
  id_categoria?: string;
  nombre: string;
  descripcion?: string;
  alto?: number;
  ancho?: number;
  profundidad?: number;
  id_unidad_medida?: string;
  id_material?: string;
  cantidad_hojas?: number;
  id_color?: string;
  id_acabado?: string;
  precio_unitario: number;
  cantidad: number;
  subtotal?: number;
  notas?: string;
}

export const mapApiQuotationItem = (apiItem: ApiQuotationItem): FurnitureItem => ({
  id: apiItem.id,
  category: 'otro' as FurnitureCategory, // Se mapea con catálogo
  name: apiItem.nombre,
  description: apiItem.descripcion,
  height: apiItem.alto,
  width: apiItem.ancho,
  depth: apiItem.profundidad,
  measureUnit: 'cm', // Default, se puede mapear con catálogo
  material: apiItem.id_material || '',
  sheetCount: apiItem.cantidad_hojas || 0,
  sheetColor: apiItem.id_color || '',
  finish: apiItem.id_acabado,
  unitPrice: Number(apiItem.precio_unitario),
  quantity: Number(apiItem.cantidad),
  subtotal: apiItem.subtotal ? Number(apiItem.subtotal) : Number(apiItem.precio_unitario) * Number(apiItem.cantidad),
  notes: apiItem.notas
});

export const mapQuotationItemToApi = (item: FurnitureItem, quotationId: string): ApiQuotationItem => ({
  id: item.id,
  id_cotizacion: quotationId,
  nombre: item.name,
  descripcion: item.description,
  alto: item.height,
  ancho: item.width,
  profundidad: item.depth,
  id_material: item.material,
  cantidad_hojas: item.sheetCount,
  id_color: item.sheetColor,
  id_acabado: item.finish,
  precio_unitario: item.unitPrice,
  cantidad: item.quantity,
  notas: item.notes
});

// === COTIZACIÓN ===
export interface ApiQuotation {
  id: string;
  folio: string;
  id_cliente: string;
  subtotal: number;
  descuento?: number;
  tipo_descuento?: string;
  total: number;
  dias_entrega: number;
  dias_vigencia: number;
  forma_pago: string;
  porcentaje_anticipo?: number;
  observaciones?: string;
  estado: string;
  creado_por?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export const mapApiQuotation = (
  apiQuotation: ApiQuotation, 
  items: FurnitureItem[], 
  client: Client
): Quotation => ({
  id: apiQuotation.id,
  folio: apiQuotation.folio,
  clientId: apiQuotation.id_cliente,
  client: client,
  items: items,
  subtotal: Number(apiQuotation.subtotal),
  discount: apiQuotation.descuento ? Number(apiQuotation.descuento) : undefined,
  discountType: apiQuotation.tipo_descuento as 'percentage' | 'fixed' | undefined,
  total: Number(apiQuotation.total),
  deliveryDays: Number(apiQuotation.dias_entrega),
  validityDays: Number(apiQuotation.dias_vigencia),
  paymentTerms: apiQuotation.forma_pago,
  advancePercentage: apiQuotation.porcentaje_anticipo ? Number(apiQuotation.porcentaje_anticipo) : undefined,
  observations: apiQuotation.observaciones,
  status: STATUS_MAP[apiQuotation.estado] || 'borrador',
  createdAt: apiQuotation.fecha_creacion ? new Date(apiQuotation.fecha_creacion) : new Date(),
  updatedAt: apiQuotation.fecha_actualizacion ? new Date(apiQuotation.fecha_actualizacion) : new Date()
});

export const mapQuotationToApi = (
  quotation: Omit<Quotation, 'id' | 'folio' | 'createdAt' | 'updatedAt'>,
  folio: string,
  createdBy?: string
): Omit<ApiQuotation, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> => ({
  folio: folio,
  id_cliente: quotation.clientId,
  subtotal: quotation.subtotal,
  descuento: quotation.discount,
  tipo_descuento: quotation.discountType,
  total: quotation.total,
  dias_entrega: quotation.deliveryDays,
  dias_vigencia: quotation.validityDays,
  forma_pago: quotation.paymentTerms,
  porcentaje_anticipo: quotation.advancePercentage,
  observaciones: quotation.observations,
  estado: STATUS_REVERSE_MAP[quotation.status],
  creado_por: createdBy
});

export { STATUS_MAP, STATUS_REVERSE_MAP, ROLE_MAP, ROLE_REVERSE_MAP };
