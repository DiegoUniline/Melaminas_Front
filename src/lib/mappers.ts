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
  creado_en?: string;
  actualizado_en?: string;
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
  createdAt: apiClient.creado_en ? new Date(apiClient.creado_en) : new Date()
});

// Helper para formatear fecha a ISO (solo fecha YYYY-MM-DD) usando componentes locales
// Evita usar toISOString() que convierte a UTC y puede cambiar la fecha
const formatDateToISO = (date?: Date): string => {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const result = `${year}-${month}-${day}`;
  console.log('[formatDateToISO] Input:', d, '-> Output:', result);
  return result;
};

export const mapClientToApi = (client: Partial<Client> & { id?: string }, createdBy?: string, isUpdate: boolean = false): Partial<ApiClient> => {
  const mapped: Partial<ApiClient> = {};
  if (client.id !== undefined) mapped.id = client.id;
  if (client.name !== undefined) mapped.nombre = client.name;
  
  // Telefono: use whatsapp as fallback if phone is empty (API requires it)
  mapped.telefono = client.phone || client.whatsapp || '-';
  
  if (client.address !== undefined) mapped.direccion = client.address;
  
  // WhatsApp: siempre incluir, usar teléfono como fallback (API lo requiere)
  mapped.whatsapp = client.whatsapp || client.phone || '';
  
  // Campos requeridos por la API - siempre incluirlos con valores por defecto
  mapped.correo = client.email || '';
  mapped.ciudad = client.city || '';
  mapped.notas = client.notes || '';
  mapped.colonia = '-';  // Campo requerido por API (no acepta vacío)
  mapped.estado = '-';   // Campo requerido por API (no acepta vacío)
  mapped.codigo_postal = '-';  // Campo requerido por API (no acepta vacío)
  mapped.rfc = '-';      // Campo requerido por API (no acepta vacío)
  if (createdBy) mapped.creado_por = createdBy;
  
  // Siempre incluir fecha de actualización en formato ISO
  mapped.actualizado_en = formatDateToISO();
  
  // Solo incluir fecha de creación al crear, no al actualizar
  if (!isUpdate) {
    mapped.creado_en = formatDateToISO();
    mapped.activo = 'Y'; // Nuevo cliente siempre activo
  }
  
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
  logo?: string;
  facebook?: string;
  instagram?: string;
  color_primario?: string;
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
  logo: apiProfile.logo,
  facebook: apiProfile.facebook,
  instagram: apiProfile.instagram,
  primaryColor: apiProfile.color_primario || '#8B4513'
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
  if (profile.logo !== undefined) mapped.logo = profile.logo;
  if (profile.facebook !== undefined) mapped.facebook = profile.facebook;
  if (profile.instagram !== undefined) mapped.instagram = profile.instagram;
  if (profile.primaryColor !== undefined) mapped.color_primario = profile.primaryColor;
  return mapped;
};

// === ITEM DE COTIZACIÓN (Detalle) ===
export interface ApiQuotationItem {
  id: string;
  id_cotizacion: string;
  id_producto: number;
  id_categoria: number;
  nombre: string;
  descripcion: string;
  alto: number;
  ancho: number;
  profundidad: number;
  id_unidad_medida: number;
  id_material: number;
  cantidad_hojas: number;
  id_color: number;
  id_acabado: number;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  notas: string;
  Imagen: string;
}

// Helper para parseo seguro de números - evita NaN
const safeParseInt = (value: string | undefined | null, defaultValue: number = 0): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper para serializar sheets a JSON para notas
const serializeSheetsToNotes = (sheets: FurnitureItem['sheets'], existingNotes?: string): string => {
  if (!sheets || sheets.length === 0) return existingNotes || '';
  const sheetsJson = JSON.stringify(sheets);
  const marker = '<!--SHEETS:';
  const endMarker = ':SHEETS-->';
  const sheetsData = `${marker}${sheetsJson}${endMarker}`;
  
  // Si ya hay notas, combinarlas
  if (existingNotes) {
    // Remover cualquier marcador existente primero
    const cleanNotes = existingNotes.replace(/<!--SHEETS:.*?:SHEETS-->/gs, '').trim();
    return cleanNotes ? `${cleanNotes}\n${sheetsData}` : sheetsData;
  }
  return sheetsData;
};

// Helper para deserializar sheets desde notas
const deserializeSheetsFromNotes = (notas: string): { sheets: FurnitureItem['sheets']; cleanNotes: string } => {
  const marker = '<!--SHEETS:';
  const endMarker = ':SHEETS-->';
  const startIdx = notas.indexOf(marker);
  const endIdx = notas.indexOf(endMarker);
  
  if (startIdx === -1 || endIdx === -1) {
    return { sheets: [], cleanNotes: notas };
  }
  
  try {
    const jsonStr = notas.substring(startIdx + marker.length, endIdx);
    const sheets = JSON.parse(jsonStr);
    const cleanNotes = notas.replace(/<!--SHEETS:.*?:SHEETS-->/gs, '').trim();
    return { sheets, cleanNotes };
  } catch {
    return { sheets: [], cleanNotes: notas };
  }
};

export const mapApiQuotationItem = (apiItem: ApiQuotationItem): FurnitureItem => {
  // Intentar extraer sheets desde notas
  const { sheets: parsedSheets, cleanNotes } = deserializeSheetsFromNotes(apiItem.notas || '');
  
  // Si no hay sheets serializados, crear uno desde los campos legacy
  const sheets = parsedSheets.length > 0 ? parsedSheets : [{
    id: `sheet-${apiItem.id}`,
    materialId: String(apiItem.id_material || ''),
    colorId: String(apiItem.id_color || ''),
    finishId: apiItem.id_acabado ? String(apiItem.id_acabado) : undefined,
    quantity: apiItem.cantidad_hojas || 1,
  }];

  return {
    id: apiItem.id,
    category: 'otro' as FurnitureCategory,
    name: apiItem.nombre,
    description: apiItem.descripcion,
    height: apiItem.alto,
    width: apiItem.ancho,
    depth: apiItem.profundidad,
    measureUnit: 'cm',
    sheets,
    // Legacy fields for backward compatibility
    material: String(apiItem.id_material || ''),
    sheetCount: apiItem.cantidad_hojas || 0,
    sheetColor: String(apiItem.id_color || ''),
    finish: apiItem.id_acabado ? String(apiItem.id_acabado) : undefined,
    unitPrice: Number(apiItem.precio_unitario),
    quantity: Number(apiItem.cantidad),
    subtotal: apiItem.subtotal ? Number(apiItem.subtotal) : Number(apiItem.precio_unitario) * Number(apiItem.cantidad),
    notes: cleanNotes,
    imageUrl: apiItem.Imagen
  };
};

export const mapQuotationItemToApi = (item: FurnitureItem, quotationId: string): ApiQuotationItem => {
  // Usar el primer sheet como valores principales (para compatibilidad API)
  const primarySheet = item.sheets?.[0];
  const materialId = primarySheet?.materialId || item.material || '';
  const colorId = primarySheet?.colorId || item.sheetColor || '';
  const finishId = primarySheet?.finishId || item.finish;
  const totalSheets = item.sheets?.reduce((sum, s) => sum + (s.quantity || 0), 0) || item.sheetCount || 1;
  
  // Serializar todos los sheets en notas si hay múltiples
  const notesWithSheets = item.sheets && item.sheets.length > 1 
    ? serializeSheetsToNotes(item.sheets, item.notes)
    : item.notes || '';

  const mapped: ApiQuotationItem = {
    id: item.id,
    id_cotizacion: quotationId,
    id_producto: safeParseInt(item.productId, 1),
    id_categoria: safeParseInt(item.categoryId, 1),
    nombre: item.name || 'Sin nombre',
    descripcion: item.description || '',
    alto: item.height || 0,
    ancho: item.width || 0,
    profundidad: item.depth || 0,
    id_unidad_medida: 1,
    id_material: safeParseInt(materialId, 1),
    cantidad_hojas: totalSheets,
    id_color: safeParseInt(colorId, 1),
    id_acabado: safeParseInt(finishId, 1),
    precio_unitario: item.unitPrice || 0,
    cantidad: item.quantity || 1,
    subtotal: item.subtotal || (item.unitPrice || 0) * (item.quantity || 1),
    notas: notesWithSheets,
    Imagen: item.imageUrl || ''
  };
  
  console.log('[mapQuotationItemToApi] Input:', item);
  console.log('[mapQuotationItemToApi] Output:', mapped);
  
  return mapped;
};

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
  creado_en?: string;
  actualizado_en?: string;
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
  createdAt: apiQuotation.creado_en ? new Date(apiQuotation.creado_en) : new Date(),
  updatedAt: apiQuotation.actualizado_en ? new Date(apiQuotation.actualizado_en) : new Date()
});

export const mapQuotationToApi = (
  quotation: Omit<Quotation, 'id' | 'folio' | 'createdAt' | 'updatedAt'>,
  folio: string,
  createdBy?: string,
  isUpdate: boolean = false
): Partial<ApiQuotation> => {
  const result: Partial<ApiQuotation> = {
    folio: folio,
    id_cliente: quotation.clientId,
    subtotal: quotation.subtotal,
    descuento: quotation.discount ?? 0, // Default 0 si no hay descuento
    tipo_descuento: quotation.discountType || 'fixed',
    total: quotation.total,
    dias_entrega: quotation.deliveryDays,
    dias_vigencia: quotation.validityDays,
    forma_pago: quotation.paymentTerms,
    porcentaje_anticipo: quotation.advancePercentage ?? 0, // Default 0
    observaciones: quotation.observations || '',
    estado: STATUS_REVERSE_MAP[quotation.status],
    creado_por: createdBy,
    actualizado_en: formatDateToISO()
  };
  
  // Solo incluir fecha de creación al crear, no al actualizar
  if (!isUpdate) {
    result.creado_en = formatDateToISO();
  }
  
  return result;
};

export { STATUS_MAP, STATUS_REVERSE_MAP, ROLE_MAP, ROLE_REVERSE_MAP };
