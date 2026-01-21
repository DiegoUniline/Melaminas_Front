# 🪵 El Melaminas - Sistema de Cotizaciones para Carpintería

Sistema web responsive para gestión de cotizaciones de muebles de carpintería. Diseñado mobile-first con vista desktop estilo Odoo (colores sólidos, sin degradados).

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modelos de Datos](#-modelos-de-datos)
- [Roles de Usuario](#-roles-de-usuario)
- [Páginas y Rutas](#-páginas-y-rutas)
- [Módulo de Cotizaciones](#-módulo-de-cotizaciones)
- [Formulario de Muebles](#-formulario-de-muebles)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Credenciales de Prueba](#-credenciales-de-prueba)

---

## ✨ Características

### 🎨 Diseño
- **Mobile-first**: Bottom navigation + menú hamburguesa
- **Desktop Odoo-style**: Sidebar colapsable, colores sólidos sin degradados
- **Paleta profesional**: Púrpura/rosado tipo Odoo
- **Tema claro/oscuro**: Soporte completo

### 📊 Funcionalidades
- ✅ Módulo de cotizaciones tipo Odoo (lista + detalle con tabs)
- ✅ Gestión completa de cotizaciones (CRUD)
- ✅ Formulario de muebles mejorado con secciones organizadas
- ✅ Catálogo de clientes
- ✅ Administración de usuarios con roles
- ✅ Generación de PDF de cotizaciones
- ✅ Compartir por WhatsApp
- ✅ Dashboard con estadísticas
- ✅ Reportes con gráficas (Recharts)
- ✅ Panel de Super Administrador

---

## 🛠 Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | React 18.3 + Vite |
| **Lenguaje** | TypeScript 5.0 |
| **Estilos** | Tailwind CSS 3.4 |
| **Componentes UI** | shadcn/ui + Radix UI |
| **Routing** | React Router DOM 6.30 |
| **Formularios** | React Hook Form + Zod |
| **Gráficas** | Recharts 2.15 |
| **PDF** | jsPDF + jspdf-autotable |
| **Fechas** | date-fns |
| **Notificaciones** | Sonner |
| **Estado** | React Context + localStorage |

---

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx      # Rutas protegidas
│   ├── business/
│   │   └── BusinessProfileForm.tsx # Formulario de negocio
│   ├── layout/
│   │   ├── MobileLayout.tsx        # Layout móvil (bottom nav)
│   │   ├── DesktopLayout.tsx       # Layout desktop (sidebar Odoo)
│   │   └── ResponsiveLayout.tsx    # Selector automático de layout
│   ├── quotation/
│   │   ├── ClientSelector.tsx      # Selector de cliente
│   │   └── FurnitureItemForm.tsx   # Formulario de mueble (mejorado)
│   └── ui/                         # Componentes shadcn/ui
├── contexts/
│   ├── AuthContext.tsx             # Autenticación
│   └── DataContext.tsx             # Datos globales
├── data/
│   └── mockData.ts                 # Datos de prueba
├── hooks/
│   ├── use-mobile.tsx              # Detector de móvil (< 768px)
│   ├── use-toast.ts                # Hook de notificaciones
│   └── useLocalStorage.ts          # Persistencia local
├── pages/
│   ├── Dashboard.tsx               # Inicio
│   ├── QuotationsPage.tsx          # Módulo cotizaciones (lista + detalle)
│   ├── QuotationDetailPage.tsx     # Detalle de cotización (legacy)
│   ├── HistoryPage.tsx             # Historial
│   ├── ClientsPage.tsx             # Clientes
│   ├── UsersPage.tsx               # Usuarios
│   ├── ReportsPage.tsx             # Reportes y estadísticas
│   ├── SuperAdminPage.tsx          # Panel admin
│   ├── BusinessProfilePage.tsx     # Perfil de negocio
│   └── LoginPage.tsx               # Login
├── types/
│   └── index.ts                    # Definiciones TypeScript
├── utils/
│   └── pdfGenerator.ts             # Generador de PDF
└── App.tsx                         # Rutas principales
```

---

## 📊 Base de Datos (Esquemas)

> **Nota**: Actualmente los datos se almacenan en `localStorage` del navegador. La estructura está preparada para migración futura a base de datos real (PostgreSQL/Supabase).

---

### 👤 Tabla: `users` (Usuarios)

Almacena los usuarios del sistema con sus credenciales y roles.

| Campo | Tipo | Descripción | Requerido | Ejemplo |
|-------|------|-------------|-----------|---------|
| `id` | `string` | Identificador único | ✅ | `"1"` |
| `name` | `string` | Nombre completo | ✅ | `"Carlos Ramírez"` |
| `email` | `string` | Correo electrónico (único) | ✅ | `"carlos@elmelaminas.com"` |
| `password` | `string` | Contraseña | ✅ | `"admin123"` |
| `phone` | `string` | Teléfono | ✅ | `"555-123-4567"` |
| `role` | `enum` | Rol del usuario | ✅ | `"admin"` |
| `avatar` | `string` | URL de imagen de perfil | ❌ | `"https://..."` |
| `isActive` | `boolean` | Estado activo/inactivo | ✅ | `true` |
| `createdAt` | `Date` | Fecha de creación | ✅ | `2024-01-01` |

**Valores permitidos para `role`:**
- `superadmin` - Super Administrador (acceso total)
- `admin` - Administrador
- `vendedor` - Vendedor
- `instalador` - Instalador

**Clave localStorage:** `carpinteria_users` (no implementado aún, usa mockData)

---

### 🏢 Tabla: `business_profile` (Perfil del Negocio)

Configuración del negocio que aparece en cotizaciones y PDF.

| Campo | Tipo | Descripción | Requerido | Ejemplo |
|-------|------|-------------|-----------|---------|
| `id` | `string` | Identificador único | ✅ | `"1"` |
| `logo` | `string` | Logo en base64 o URL | ❌ | `"data:image/png;base64,..."` |
| `businessName` | `string` | Nombre del negocio | ✅ | `"El Melaminas"` |
| `ownerName` | `string` | Nombre del propietario | ✅ | `"Carlos Ramírez"` |
| `phone` | `string` | Teléfono principal | ✅ | `"555-123-4567"` |
| `whatsapp` | `string` | Número de WhatsApp (sin guiones) | ❌ | `"5551234567"` |
| `email` | `string` | Correo electrónico | ✅ | `"contacto@elmelaminas.com"` |
| `address` | `string` | Dirección completa | ✅ | `"Av. Principal #456, Col. Centro"` |
| `city` | `string` | Ciudad | ✅ | `"Ciudad de México"` |
| `state` | `string` | Estado/Provincia | ✅ | `"CDMX"` |
| `rfc` | `string` | RFC fiscal (México) | ❌ | `"RAMC850201XYZ"` |
| `facebook` | `string` | Usuario de Facebook | ❌ | `"elmelaminas"` |
| `instagram` | `string` | Usuario de Instagram | ❌ | `"@elmelaminas"` |
| `primaryColor` | `string` | Color primario (formato HSL) | ✅ | `"25 70% 35%"` |
| `secondaryColor` | `string` | Color secundario (formato HSL) | ✅ | `"40 60% 50%"` |

**Clave localStorage:** `carpinteria_business_profile`

---

### 👥 Tabla: `clients` (Clientes)

Catálogo de clientes para cotizaciones.

| Campo | Tipo | Descripción | Requerido | Ejemplo |
|-------|------|-------------|-----------|---------|
| `id` | `string` | Identificador único | ✅ | `"1"` |
| `name` | `string` | Nombre completo | ✅ | `"María García López"` |
| `phone` | `string` | Teléfono | ✅ | `"555-987-6543"` |
| `whatsapp` | `string` | Número de WhatsApp (sin guiones) | ❌ | `"5559876543"` |
| `email` | `string` | Correo electrónico | ❌ | `"maria.garcia@email.com"` |
| `address` | `string` | Dirección completa | ✅ | `"Av. Reforma #456, Depto 12"` |
| `city` | `string` | Ciudad | ❌ | `"Ciudad de México"` |
| `notes` | `string` | Notas adicionales | ❌ | `"Prefiere contacto por WhatsApp"` |
| `createdAt` | `Date` | Fecha de registro | ✅ | `2024-01-15` |

**Clave localStorage:** `carpinteria_clients`

---

### 🪑 Tabla: `furniture_items` (Artículos de Mueble)

Muebles individuales dentro de una cotización (embedded en `quotations.items`).

| Campo | Tipo | Descripción | Requerido | Ejemplo |
|-------|------|-------------|-----------|---------|
| `id` | `string` | Identificador único | ✅ | `"1"` |
| `category` | `enum` | Categoría del mueble | ✅ | `"cocinas-closets"` |
| `customCategory` | `string` | Categoría personalizada (si es "otro") | ❌ | `"Mueble de baño"` |
| `name` | `string` | Nombre del mueble | ✅ | `"Closet principal"` |
| `description` | `string` | Descripción detallada | ❌ | `"Closet con puertas corredizas"` |
| `height` | `number` | Altura | ❌ | `240` |
| `width` | `number` | Ancho | ❌ | `300` |
| `depth` | `number` | Profundidad | ❌ | `60` |
| `measureUnit` | `enum` | Unidad de medida | ✅ | `"cm"` |
| `material` | `string` | Tipo de material | ✅ | `"Melamina"` |
| `sheetCount` | `number` | Cantidad de hojas/láminas | ✅ | `8` |
| `sheetColor` | `string` | Color de la lámina | ✅ | `"Nogal"` |
| `finish` | `string` | Acabado | ❌ | `"Mate"` |
| `unitPrice` | `number` | Precio unitario (MXN) | ✅ | `15000` |
| `quantity` | `number` | Cantidad | ✅ | `1` |
| `subtotal` | `number` | Subtotal calculado (unitPrice × quantity) | ✅ | `15000` |
| `notes` | `string` | Notas del artículo | ❌ | `"Incluye herrajes de calidad"` |

**Valores permitidos para `category`:**
| Valor | Etiqueta | Ejemplos de muebles |
|-------|----------|---------------------|
| `cocinas-closets` | Cocinas y Closets | Gabinete, Alacena, Closet, Vestidor, Despensero, Isla, Barra |
| `recamara` | Muebles de Recámara | Cama, Cabecera, Buró, Cómoda, Tocador, Ropero, Zapatera |
| `oficina` | Muebles de Oficina | Escritorio, Librero, Archivero, Mesa de juntas, Recepción |
| `otro` | Otro | Personalizado |

**Valores permitidos para `measureUnit`:** `cm`, `m`, `pulgadas`

**Materiales comunes:** MDF, Melamina, Triplay, Madera de pino, Madera de encino, Madera de cedro, Aglomerado, Formaica, Otro

**Colores de hoja comunes:** Blanco, Negro, Chocolate, Nogal, Encino, Cerezo, Caoba, Gris, Arena, Natural, Otro

---

### 📄 Tabla: `quotations` (Cotizaciones)

Cotizaciones principales con todos los datos del cliente, muebles y condiciones.

| Campo | Tipo | Descripción | Requerido | Ejemplo |
|-------|------|-------------|-----------|---------|
| `id` | `string` | Identificador único | ✅ | `"1"` |
| `folio` | `string` | Número de folio único | ✅ | `"COT-2025-001"` |
| `clientId` | `string` | ID del cliente (FK) | ✅ | `"1"` |
| `client` | `Client` | Objeto cliente completo (denormalizado) | ✅ | `{name: "María...", ...}` |
| `items` | `FurnitureItem[]` | Lista de muebles cotizados | ✅ | `[{...}, {...}]` |
| `subtotal` | `number` | Subtotal antes de descuento (MXN) | ✅ | `32000` |
| `discount` | `number` | Monto o porcentaje de descuento | ❌ | `10` |
| `discountType` | `enum` | Tipo de descuento | ❌ | `"percentage"` |
| `total` | `number` | Total final (MXN) | ✅ | `28800` |
| `deliveryDays` | `number` | Días de entrega estimados | ✅ | `15` |
| `validityDays` | `number` | Días de vigencia de la cotización | ✅ | `30` |
| `paymentTerms` | `string` | Condiciones de pago | ✅ | `"50% anticipo, 50% contra entrega"` |
| `advancePercentage` | `number` | Porcentaje de anticipo | ❌ | `50` |
| `observations` | `string` | Observaciones adicionales | ❌ | `"Instalación incluida"` |
| `status` | `enum` | Estado de la cotización | ✅ | `"enviada"` |
| `createdAt` | `Date` | Fecha de creación | ✅ | `2024-12-01` |
| `updatedAt` | `Date` | Fecha de última actualización | ✅ | `2024-12-05` |

**Valores permitidos para `discountType`:** `percentage`, `fixed`

**Valores permitidos para `status`:**
| Valor | Etiqueta | Descripción | Color |
|-------|----------|-------------|-------|
| `borrador` | Borrador | En proceso de creación | Gris |
| `enviada` | Enviada | Enviada al cliente | Azul |
| `aceptada` | Aceptada | Cliente aceptó | Verde |
| `rechazada` | Rechazada | Cliente rechazó | Rojo |

**Clave localStorage:** `carpinteria_quotations`

**Formato de folio:** `COT-{AÑO}-{NÚMERO}` (ej: COT-2025-001, COT-2025-002)

---

## 🔐 Roles de Usuario

| Rol | Etiqueta | Permisos |
|-----|----------|----------|
| `superadmin` | Super Admin | Acceso total: gestión de usuarios, clientes, cotizaciones, reportes globales, reset de datos |
| `admin` | Administrador | Gestión de cotizaciones y clientes |
| `vendedor` | Vendedor | Crear y gestionar cotizaciones propias |
| `instalador` | Instalador | Ver cotizaciones asignadas |

---

## 🗺 Páginas y Rutas

| Ruta | Página | Descripción | Protegida |
|------|--------|-------------|-----------|
| `/login` | LoginPage | Inicio de sesión | ❌ |
| `/` | Dashboard | Panel principal con estadísticas | ✅ |
| `/cotizaciones` | QuotationsPage | Lista de cotizaciones (tabla Odoo) | ✅ |
| `/cotizaciones/nueva` | QuotationsPage | Crear nueva cotización (detalle con tabs) | ✅ |
| `/cotizaciones/:id` | QuotationsPage | Editar cotización (detalle con tabs) | ✅ |
| `/cotizacion/:id` | QuotationDetailPage | Ver detalle de cotización (legacy) | ✅ |
| `/historial` | HistoryPage | Historial de cotizaciones (cards) | ✅ |
| `/clientes` | ClientsPage | Gestión de clientes | ✅ |
| `/usuarios` | UsersPage | Gestión de usuarios | ✅ |
| `/reportes` | ReportsPage | Reportes y estadísticas | ✅ |
| `/perfil` | BusinessProfilePage | Perfil del negocio | ✅ |
| `/superadmin` | SuperAdminPage | Panel de super administrador | ✅ (solo superadmin) |

---

## 📝 Módulo de Cotizaciones

### Vista Desktop (Odoo-style)

El módulo de cotizaciones en desktop sigue el patrón de Odoo:

#### Vista Lista
- **Tabla profesional** con columnas: Folio, Cliente, Fecha, Total, Estado, Acciones
- **Búsqueda** por cliente o folio
- **Badge** con contador de cotizaciones
- Click en fila para editar

#### Vista Detalle
- **Header** con botón "Volver", título y acciones (Guardar, PDF)
- **Layout 2/3 + 1/3**: Contenido principal + Panel de resumen

**Tabs del contenido principal:**

| Tab | Contenido |
|-----|-----------|
| **Cliente y Muebles** | Selector de cliente, tabla de muebles con acciones |
| **Condiciones** | Descuento, días de entrega, vigencia, forma de pago, observaciones |

**Panel de resumen (sticky):**
- Información del cliente seleccionado
- Contador de muebles
- Subtotal, descuento, total
- Acciones rápidas: Marcar como enviada, Descargar PDF

### Vista Móvil

- Lista de cotizaciones con cards
- Detalle con formularios apilados verticalmente
- Bottom navigation para acceso rápido

---

## 🪑 Formulario de Muebles

### Diseño Mejorado

El formulario de agregar/editar muebles está organizado en **5 secciones** con iconos distintivos:

| Sección | Icono | Campos |
|---------|-------|--------|
| **Información General** | 📦 Package | Categoría, Nombre, Descripción |
| **Dimensiones** | 📏 Ruler | Alto, Ancho, Profundo, Unidad de medida |
| **Material y Acabado** | 🎨 Palette | Material, Color, Cantidad de hojas, Acabado |
| **Precio** | 💰 DollarSign | Precio unitario, Cantidad, Subtotal (calculado) |
| **Notas Adicionales** | 📄 FileText | Observaciones, instrucciones especiales |

### Comportamiento Responsivo

| Dispositivo | Componente |
|-------------|------------|
| **Desktop** | Dialog modal (max-w-2xl) |
| **Móvil** | Sheet desde abajo (95vh) |

### Características
- Inputs de altura consistente (h-11)
- Separadores visuales entre secciones
- Card de subtotal con cálculo en tiempo real
- Indicadores de campos requeridos (*)
- Botones de acción claros (Cancelar/Agregar)

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ o Bun
- npm, yarn, pnpm o bun

### Pasos

```bash
# Clonar el repositorio
git clone <repo-url>
cd el-melaminas

# Instalar dependencias
npm install
# o
bun install

# Iniciar en modo desarrollo
npm run dev
# o
bun dev

# Build para producción
npm run build
# o
bun run build
```

---

## 💻 Uso

### Flujo de Trabajo Típico

1. **Iniciar sesión** con credenciales
2. **Ir a Cotizaciones** en el menú lateral/inferior
3. **Click en "Nueva Cotización"** para abrir el detalle con tabs
4. **Tab 1**: Seleccionar cliente y agregar muebles
5. **Tab 2**: Configurar condiciones (entrega, pago, descuento)
6. **Guardar** como borrador o **Generar PDF**
7. **Actualizar estado** según respuesta del cliente

### Agregar un Mueble

1. En el tab "Cliente y Muebles", click en **"Agregar Mueble"**
2. **Información General**: Seleccionar categoría y tipo
3. **Dimensiones**: Ingresar alto × ancho × profundidad
4. **Material**: Seleccionar material y color
5. **Precio**: Establecer precio unitario y cantidad
6. Click en **"Agregar Mueble"** para confirmar

---

## 🔑 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Super Admin** | `diego.leon@uniline.mx` | `12345` |
| **Admin** | `carlos@elmelaminas.com` | `admin123` |
| **Vendedor** | `maria@elmelaminas.com` | `vendedor123` |
| **Instalador** | `roberto@elmelaminas.com` | `instalador123` |

> ⚠️ **Nota**: Los datos se almacenan en `localStorage` del navegador. Al limpiar datos del navegador se reinician a los valores por defecto.

---

## 📱 Responsive Design

### Móvil (< 768px)
- Bottom navigation con 4 ítems: Inicio, Cotizaciones, Historial, Reportes
- Menú hamburguesa lateral para: Clientes, Mi Perfil, Panel Admin
- Cards apiladas verticalmente
- Formulario de muebles en Sheet de pantalla completa

### Desktop (≥ 768px)
- Sidebar colapsable estilo Odoo (240px → 64px)
- Header con título de página actual
- Módulo de cotizaciones con tabla + detalle
- Formulario de muebles en Dialog modal
- Grids de 2-4 columnas según contenido

---

## 🎨 Sistema de Diseño

### Tokens de Color (CSS Variables)

```css
/* Modo Claro - Estilo Odoo (colores sólidos) */
--primary: 340 30% 45%;        /* Púrpura/rosado principal */
--secondary: 220 15% 95%;      /* Gris claro */
--accent: 340 25% 50%;         /* Acento */
--destructive: 0 70% 55%;      /* Rojo para errores/eliminar */
--success: 145 60% 40%;        /* Verde para éxito/aceptado */
--warning: 40 90% 50%;         /* Amarillo para advertencias */
--info: 200 80% 50%;           /* Azul para información/enviado */
--background: 0 0% 98%;        /* Fondo general */
--card: 0 0% 100%;             /* Fondo de tarjetas */
--border: 220 15% 90%;         /* Bordes */
```

### Componentes UI Utilizados

Basados en [shadcn/ui](https://ui.shadcn.com/):

| Componente | Uso |
|------------|-----|
| `Button` | Acciones principales y secundarias |
| `Input` | Campos de texto (h-11 para mejor touch) |
| `Label` | Etiquetas de formulario |
| `Textarea` | Áreas de texto multilínea |
| `Card` | Contenedores de contenido |
| `Badge` | Estados, roles, contadores |
| `Separator` | Divisores visuales entre secciones |
| `Dialog` | Modales (formulario mueble desktop) |
| `Sheet` | Paneles laterales/inferiores (formulario mueble móvil) |
| `AlertDialog` | Confirmaciones destructivas |
| `Select` | Dropdowns de selección |
| `Switch` | Toggles on/off |
| `Checkbox` | Casillas de verificación |
| `Tabs` | Navegación por pestañas (detalle cotización) |
| `Table` | Tablas de datos (lista cotizaciones, muebles) |
| `DropdownMenu` | Menús contextuales |
| `Sonner` | Notificaciones toast |

---

## 📈 Reportes y Estadísticas

### Métricas Disponibles

| Métrica | Descripción |
|---------|-------------|
| **Ingresos totales** | Suma de cotizaciones aceptadas |
| **Número de cotizaciones** | Total en el período seleccionado |
| **Ticket promedio** | Ingresos / cotizaciones aceptadas |
| **Tasa de conversión** | (Aceptadas / Total) × 100 |

### Gráficas

- **Ingresos por mes**: Gráfica de barras con tendencia mensual
- **Distribución por estado**: Gráfica de pastel (aceptadas, enviadas, borradores, rechazadas)

### Filtros Disponibles

| Filtro | Opciones |
|--------|----------|
| **Usuario** | Todos, o usuario específico (solo superadmin) |
| **Período** | Último mes, 3 meses, 6 meses, año |

---

## 🔧 Configuración Adicional

### Formato de Folio

```
COT-{AÑO}-{NÚMERO_SECUENCIAL}
Ejemplo: COT-2025-001, COT-2025-002, ...
```

### Generación de PDF

El PDF generado incluye:

1. **Encabezado**
   - Logo del negocio
   - Datos de contacto
   - Folio y fecha

2. **Datos del Cliente**
   - Nombre
   - Teléfono
   - Dirección

3. **Tabla de Artículos**
   - Nombre del mueble
   - Medidas (Alto × Ancho × Prof)
   - Material y color
   - Cantidad de hojas
   - Precio unitario
   - Cantidad
   - Subtotal

4. **Resumen de Materiales**
   - Agrupado por material y color
   - Total de hojas necesarias

5. **Condiciones Comerciales**
   - Tiempo de entrega
   - Vigencia de la cotización
   - Términos de pago
   - Porcentaje de anticipo

6. **Totales**
   - Subtotal
   - Descuento (si aplica)
   - **Total Final**

---

## 🗄 Almacenamiento de Datos

Actualmente el sistema usa **localStorage** para persistencia:

```javascript
// Claves utilizadas
'elmelaminas_clients'      // Lista de clientes
'elmelaminas_quotations'   // Lista de cotizaciones
'elmelaminas_business'     // Perfil del negocio
'carpinteria_auth_user'    // Sesión del usuario
```

### Migración a Backend

La arquitectura está preparada para migrar a un backend en la nube:
- Todos los datos pasan por `DataContext`
- Las operaciones CRUD están centralizadas
- Compatible con REST API

---

## 📄 Licencia

Este proyecto es de uso privado para **El Melaminas**.

---

## 🤝 Soporte

Para soporte técnico o preguntas sobre el sistema, contactar al equipo de desarrollo.

---

<p align="center">
  Desarrollado con ❤️ por <a href="https://uniline.cloud">Uniline - Innovación en la Nube</a>
</p>
