import { BusinessProfile, Client, Quotation, FurnitureItem } from '@/types';

// Perfil de negocio de ejemplo
export const mockBusinessProfile: BusinessProfile = {
  id: '1',
  businessName: 'Carpintería Los Pinos',
  ownerName: 'Juan Carlos Martínez',
  phone: '555-123-4567',
  whatsapp: '5551234567',
  email: 'contacto@carpinteriapinos.com',
  address: 'Calle Roble #123, Col. Centro',
  city: 'Ciudad de México',
  state: 'CDMX',
  rfc: 'MAPJ800101ABC',
  facebook: 'carpinteriapinos',
  instagram: '@carpinteria_pinos',
  primaryColor: '25 95% 35%', // Marrón cálido
  secondaryColor: '45 80% 50%' // Dorado/Arena
};

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
  }
];

// Generar folio automático
export const generateFolio = (): string => {
  const year = new Date().getFullYear();
  const count = mockQuotations.length + 1;
  return `COT-${year}-${count.toString().padStart(3, '0')}`;
};
