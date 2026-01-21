# 🪵 El Melaminas - Sistema de Cotizaciones para Carpintería

Sistema web responsive para gestión de cotizaciones de muebles de carpintería. Diseñado mobile-first con vista desktop tipo Odoo.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
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
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Credenciales de Prueba](#-credenciales-de-prueba)

---

## ✨ Características

### 🎨 Diseño
- **Mobile-first**: Bottom navigation + menú hamburguesa
- **Desktop**: Sidebar colapsable estilo Odoo
- **Colores profesionales**: Paleta púrpura/rosado tipo Odoo
- **Tema claro/oscuro**: Soporte completo

### 📊 Funcionalidades
- ✅ Gestión completa de cotizaciones (CRUD)
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
│   │   ├── MobileLayout.tsx        # Layout móvil
│   │   ├── DesktopLayout.tsx       # Layout desktop (sidebar)
│   │   └── ResponsiveLayout.tsx    # Selector de layout
│   ├── quotation/
│   │   ├── ClientSelector.tsx      # Selector de cliente
│   │   └── FurnitureItemForm.tsx   # Formulario de mueble
│   └── ui/                         # Componentes shadcn/ui
├── contexts/
│   ├── AuthContext.tsx             # Autenticación
│   └── DataContext.tsx             # Datos globales
├── data/
│   └── mockData.ts                 # Datos de prueba
├── hooks/
│   ├── use-mobile.tsx              # Detector de móvil
│   ├── use-toast.ts                # Hook de notificaciones
│   └── useLocalStorage.ts          # Persistencia local
├── pages/
│   ├── Dashboard.tsx               # Inicio
│   ├── NewQuotationPage.tsx        # Nueva/Editar cotización
│   ├── QuotationDetailPage.tsx     # Detalle de cotización
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

## 📊 Modelos de Datos

### 👤 User (Usuario)

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | `string` | Identificador único | ✅ |
| `name` | `string` | Nombre completo | ✅ |
| `email` | `string` | Correo electrónico (único) | ✅ |
| `password` | `string` | Contraseña | ✅ |
| `phone` | `string` | Teléfono | ✅ |
| `role` | `'superadmin' \| 'admin' \| 'vendedor' \| 'instalador'` | Rol del usuario | ✅ |
| `avatar` | `string` | URL de imagen de perfil | ❌ |
| `isActive` | `boolean` | Estado activo/inactivo | ✅ |
| `createdAt` | `Date` | Fecha de creación | ✅ |

> **Nota**: Al crear nuevos usuarios, se asigna la contraseña temporal `temp123` por defecto.

---

### 🏢 BusinessProfile (Perfil de Negocio)

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | `string` | Identificador único | ✅ |
| `logo` | `string` | URL del logo | ❌ |
| `businessName` | `string` | Nombre del negocio | ✅ |
| `ownerName` | `string` | Nombre del propietario | ✅ |
| `phone` | `string` | Teléfono principal | ✅ |
| `whatsapp` | `string` | Número de WhatsApp | ❌ |
| `email` | `string` | Correo electrónico | ✅ |
| `address` | `string` | Dirección completa | ✅ |
| `city` | `string` | Ciudad | ✅ |
| `state` | `string` | Estado/Provincia | ✅ |
| `rfc` | `string` | RFC fiscal | ❌ |
| `facebook` | `string` | Usuario de Facebook | ❌ |
| `instagram` | `string` | Usuario de Instagram | ❌ |
| `primaryColor` | `string` | Color primario (HSL) | ✅ |
| `secondaryColor` | `string` | Color secundario (HSL) | ✅ |

---

### 👥 Client (Cliente)

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | `string` | Identificador único | ✅ |
| `name` | `string` | Nombre completo | ✅ |
| `phone` | `string` | Teléfono | ✅ |
| `whatsapp` | `string` | Número de WhatsApp | ❌ |
| `email` | `string` | Correo electrónico | ❌ |
| `address` | `string` | Dirección | ✅ |
| `city` | `string` | Ciudad | ❌ |
| `notes` | `string` | Notas adicionales | ❌ |
| `createdAt` | `Date` | Fecha de registro | ✅ |

---

### 🪑 FurnitureItem (Artículo de Mueble)

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | `string` | Identificador único | ✅ |
| `category` | `FurnitureCategory` | Categoría del mueble | ✅ |
| `customCategory` | `string` | Categoría personalizada | ❌ |
| `name` | `string` | Nombre del mueble | ✅ |
| `description` | `string` | Descripción detallada | ❌ |
| `height` | `number` | Altura | ❌ |
| `width` | `number` | Ancho | ❌ |
| `depth` | `number` | Profundidad | ❌ |
| `measureUnit` | `'cm' \| 'm' \| 'pulgadas'` | Unidad de medida | ✅ |
| `material` | `string` | Tipo de material | ✅ |
| `sheetCount` | `number` | Cantidad de hojas/láminas | ✅ |
| `sheetColor` | `string` | Color de la lámina | ✅ |
| `finish` | `string` | Acabado (mate, brillante, etc.) | ❌ |
| `unitPrice` | `number` | Precio unitario | ✅ |
| `quantity` | `number` | Cantidad | ✅ |
| `subtotal` | `number` | Subtotal calculado | ✅ |
| `notes` | `string` | Notas del artículo | ❌ |

#### Categorías de Muebles (`FurnitureCategory`)

| Valor | Etiqueta | Ejemplos |
|-------|----------|----------|
| `cocinas-closets` | Cocinas y Closets | Gabinete, Alacena, Closet, Vestidor, Despensero, Isla, Barra |
| `recamara` | Muebles de Recámara | Cama, Cabecera, Buró, Cómoda, Tocador, Ropero, Zapatera |
| `oficina` | Muebles de Oficina | Escritorio, Librero, Archivero, Mesa de juntas, Recepción, Credenza |
| `otro` | Otro | Personalizado |

#### Materiales Comunes

```
MDF, Melamina, Triplay, Madera de pino, Madera de encino, 
Madera de cedro, Aglomerado, Formaica, Otro
```

#### Colores de Hoja Comunes

```
Blanco, Negro, Chocolate, Nogal, Encino, Cerezo, 
Caoba, Gris, Arena, Natural, Otro
```

---

### 📄 Quotation (Cotización)

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | `string` | Identificador único | ✅ |
| `folio` | `string` | Número de folio (ej: COT-2025-001) | ✅ |
| `clientId` | `string` | ID del cliente | ✅ |
| `client` | `Client` | Objeto cliente completo | ✅ |
| `items` | `FurnitureItem[]` | Lista de muebles cotizados | ✅ |
| `subtotal` | `number` | Subtotal antes de descuento | ✅ |
| `discount` | `number` | Monto o porcentaje de descuento | ❌ |
| `discountType` | `'percentage' \| 'fixed'` | Tipo de descuento | ❌ |
| `total` | `number` | Total final | ✅ |
| `deliveryDays` | `number` | Días de entrega | ✅ |
| `validityDays` | `number` | Días de vigencia | ✅ |
| `paymentTerms` | `string` | Condiciones de pago | ✅ |
| `advancePercentage` | `number` | Porcentaje de anticipo | ❌ |
| `observations` | `string` | Observaciones adicionales | ❌ |
| `status` | `QuotationStatus` | Estado de la cotización | ✅ |
| `createdAt` | `Date` | Fecha de creación | ✅ |
| `updatedAt` | `Date` | Fecha de actualización | ✅ |

#### Estados de Cotización (`QuotationStatus`)

| Valor | Etiqueta | Descripción |
|-------|----------|-------------|
| `borrador` | Borrador | En proceso de creación |
| `enviada` | Enviada | Enviada al cliente |
| `aceptada` | Aceptada | Cliente aceptó |
| `rechazada` | Rechazada | Cliente rechazó |

---

## 🔐 Roles de Usuario

| Rol | Etiqueta | Permisos |
|-----|----------|----------|
| `superadmin` | Super Admin | Acceso total: gestión de usuarios, clientes, cotizaciones, reset de datos |
| `admin` | Administrador | Gestión de cotizaciones y clientes |
| `vendedor` | Vendedor | Crear y gestionar cotizaciones propias |
| `instalador` | Instalador | Ver cotizaciones asignadas |

---

## 🗺 Páginas y Rutas

| Ruta | Página | Descripción | Protegida |
|------|--------|-------------|-----------|
| `/login` | LoginPage | Inicio de sesión | ❌ |
| `/` | Dashboard | Panel principal con estadísticas | ✅ |
| `/cotizacion/nueva` | NewQuotationPage | Crear nueva cotización | ✅ |
| `/cotizacion/:id` | QuotationDetailPage | Ver detalle de cotización | ✅ |
| `/cotizacion/:id/editar` | NewQuotationPage | Editar cotización existente | ✅ |
| `/historial` | HistoryPage | Historial de cotizaciones | ✅ |
| `/clientes` | ClientsPage | Gestión de clientes | ✅ |
| `/usuarios` | UsersPage | Gestión de usuarios | ✅ |
| `/reportes` | ReportsPage | Reportes y estadísticas | ✅ |
| `/perfil` | BusinessProfilePage | Perfil del negocio | ✅ |
| `/superadmin` | SuperAdminPage | Panel de super administrador | ✅ (solo superadmin) |

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
2. **Crear/seleccionar cliente** desde la página de clientes
3. **Nueva cotización**: agregar muebles con medidas, materiales y precios
4. **Revisar y guardar** la cotización
5. **Enviar por WhatsApp** o descargar PDF
6. **Actualizar estado** según respuesta del cliente

### Crear Nueva Cotización

1. Click en "Nueva Cotización" o icono `+`
2. Seleccionar cliente existente o crear nuevo
3. Agregar artículos:
   - Seleccionar categoría
   - Ingresar medidas (alto x ancho x profundidad)
   - Seleccionar material y color
   - Indicar cantidad de hojas
   - Establecer precio y cantidad
4. Configurar condiciones:
   - Días de entrega
   - Vigencia de la cotización
   - Términos de pago
   - Descuento (opcional)
5. Guardar como borrador o enviar

---

## 🔑 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Super Admin** | `super@elmelaminas.com` | `super123` |
| **Admin** | `carlos@elmelaminas.com` | `admin123` |
| **Vendedor** | `maria@elmelaminas.com` | `vendedor123` |
| **Instalador** | `roberto@elmelaminas.com` | `instalador123` |

> ⚠️ **Nota**: Los datos se almacenan en `localStorage` del navegador. Al limpiar datos del navegador se reinician a los valores por defecto.

---

## 📱 Responsive Design

### Móvil (< 768px)
- Bottom navigation con 4 ítems principales
- Menú hamburguesa lateral para opciones secundarias
- Cards apiladas verticalmente
- Formularios en sheets de pantalla completa

### Desktop (≥ 768px)
- Sidebar colapsable estilo Odoo (240px → 64px)
- Header con título de página actual
- Contenido en área principal con padding
- Grids de 2-4 columnas según contenido

---

## 🎨 Sistema de Diseño

### Tokens de Color (CSS Variables)

```css
/* Modo Claro */
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
| `Input` | Campos de texto |
| `Label` | Etiquetas de formulario |
| `Textarea` | Áreas de texto multilínea |
| `Card` | Contenedores de contenido |
| `Badge` | Estados, roles, contadores |
| `Separator` | Divisores visuales |
| `Dialog` | Modales de confirmación |
| `Sheet` | Paneles laterales/inferiores |
| `AlertDialog` | Confirmaciones destructivas |
| `Select` | Dropdowns de selección |
| `Switch` | Toggles on/off |
| `Checkbox` | Casillas de verificación |
| `Tabs` | Navegación por pestañas |
| `Table` | Tablas de datos |
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
'elmelaminas_auth'         // Sesión del usuario
```

### Migración a Backend

La arquitectura está preparada para migrar a un backend real:
- Todos los datos pasan por `DataContext`
- Las operaciones CRUD están centralizadas
- Compatible con REST API o Supabase

---

## 📄 Licencia

Este proyecto es de uso privado para **El Melaminas**.

---

## 🤝 Soporte

Para soporte técnico o preguntas sobre el sistema, contactar al equipo de desarrollo.

---

<p align="center">
  Desarrollado con ❤️ usando <a href="https://lovable.dev">Lovable</a>
</p>
