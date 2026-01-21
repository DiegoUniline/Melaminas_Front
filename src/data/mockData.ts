import { BusinessProfile, Client, Quotation, FurnitureItem, User } from '@/types';

// Perfil de negocio - El Melaminas
export const mockBusinessProfile: BusinessProfile = {
  id: '1',
  businessName: 'El Melaminas',
  ownerName: 'Carlos Ramírez',
  phone: '555-123-4567',
  whatsapp: '5551234567',
  email: 'contacto@elmelaminas.com',
  address: 'Av. Principal #456, Col. Centro',
  city: 'Ciudad de México',
  state: 'CDMX',
  rfc: 'RAMC850201XYZ',
  facebook: 'elmelaminas',
  instagram: '@elmelaminas',
  primaryColor: '25 70% 35%',
  secondaryColor: '40 60% 50%'
};

// Usuarios del sistema
export const mockUsers: User[] = [
  {
    id: '0',
    name: 'Super Administrador',
    email: 'super@elmelaminas.com',
    password: 'super123',
    phone: '555-000-0000',
    role: 'superadmin',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '1',
    name: 'Carlos Ramírez',
    email: 'carlos@elmelaminas.com',
    password: 'admin123',
    phone: '555-123-4567',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'María López',
    email: 'maria@elmelaminas.com',
    password: 'vendedor123',
    phone: '555-234-5678',
    role: 'vendedor',
    isActive: true,
    createdAt: new Date('2024-02-15')
  },
  {
    id: '3',
    name: 'Roberto García',
    email: 'roberto@elmelaminas.com',
    password: 'instalador123',
    phone: '555-345-6789',
    role: 'instalador',
    isActive: true,
    createdAt: new Date('2024-03-10')
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana@elmelaminas.com',
    password: 'vendedor456',
    phone: '555-456-7890',
    role: 'vendedor',
    isActive: false,
    createdAt: new Date('2024-04-20')
  }
];

// Clientes de ejemplo
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'María García López',
    phone: '555-987-6543',
    whatsapp: '5559876543',
    email: 'maria.garcia@email.com',
    address: 'Av. Reforma #456, Depto 12',
    city: 'Ciudad de México',
    notes: 'Prefiere contacto por WhatsApp',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Roberto Hernández',
    phone: '555-456-7890',
    email: 'roberto.h@email.com',
    address: 'Calle Palmas #789',
    city: 'Guadalajara',
    createdAt: new Date('2024-02-20')
  },
  {
    id: '3',
    name: 'Ana Martínez Ruiz',
    phone: '555-321-0987',
    whatsapp: '5553210987',
    address: 'Blvd. Centro #234',
    city: 'Monterrey',
    notes: 'Cliente frecuente, dar 5% descuento',
    createdAt: new Date('2024-03-10')
  }
];

// Items de ejemplo para cotizaciones
export const mockFurnitureItems: FurnitureItem[] = [
  {
    id: '1',
    category: 'cocinas-closets',
    name: 'Closet principal',
    description: 'Closet con puertas corredizas y cajones',
    height: 240,
    width: 300,
    depth: 60,
    measureUnit: 'cm',
    material: 'Melamina',
    sheetCount: 8,
    sheetColor: 'Nogal',
    finish: 'Mate',
    unitPrice: 15000,
    quantity: 1,
    subtotal: 15000,
    notes: 'Incluye herrajes de calidad'
  },
  {
    id: '2',
    category: 'cocinas-closets',
    name: 'Gabinetes de cocina',
    description: 'Set de gabinetes superiores e inferiores',
    height: 90,
    width: 400,
    depth: 35,
    measureUnit: 'cm',
    material: 'MDF',
    sheetCount: 12,
    sheetColor: 'Blanco',
    finish: 'Brillante',
    unitPrice: 8500,
    quantity: 2,
    subtotal: 17000
  }
];

// Cotizaciones de ejemplo
export const mockQuotations: Quotation[] = [
  {
    id: '1',
    folio: 'COT-2024-001',
    clientId: '1',
    client: mockClients[0],
    items: [mockFurnitureItems[0]],
    subtotal: 15000,
    discount: 10,
    discountType: 'percentage',
    total: 13500,
    deliveryDays: 15,
    validityDays: 30,
    paymentTerms: '50% anticipo, 50% contra entrega',
    advancePercentage: 50,
    observations: 'Instalación incluida',
    status: 'enviada',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '2',
    folio: 'COT-2024-002',
    clientId: '2',
    client: mockClients[1],
    items: [mockFurnitureItems[1]],
    subtotal: 17000,
    total: 17000,
    deliveryDays: 20,
    validityDays: 15,
    paymentTerms: '100% anticipo',
    advancePercentage: 100,
    status: 'aceptada',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-12')
  },
  {
    id: '3',
    folio: 'COT-2024-003',
    clientId: '3',
    client: mockClients[2],
    items: [...mockFurnitureItems],
    subtotal: 32000,
    discount: 1600,
    discountType: 'fixed',
    total: 30400,
    deliveryDays: 25,
    validityDays: 30,
    paymentTerms: '40% anticipo, 30% a mitad, 30% contra entrega',
    advancePercentage: 40,
    observations: 'Proyecto completo cocina + recámara',
    status: 'borrador',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: '4',
    folio: 'COT-2025-001',
    clientId: '1',
    client: mockClients[0],
    items: [mockFurnitureItems[1]],
    subtotal: 17000,
    total: 17000,
    deliveryDays: 12,
    validityDays: 15,
    paymentTerms: '50% anticipo, 50% contra entrega',
    advancePercentage: 50,
    status: 'aceptada',
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-08')
  },
  {
    id: '5',
    folio: 'COT-2025-002',
    clientId: '2',
    client: mockClients[1],
    items: [mockFurnitureItems[0]],
    subtotal: 15000,
    total: 15000,
    deliveryDays: 18,
    validityDays: 30,
    paymentTerms: '100% anticipo',
    advancePercentage: 100,
    status: 'enviada',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10')
  }
];

// Generar folio automático
export const generateFolio = (): string => {
  const year = new Date().getFullYear();
  const count = mockQuotations.length + 1;
  return `COT-${year}-${count.toString().padStart(3, '0')}`;
};
