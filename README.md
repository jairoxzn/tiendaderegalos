# GiftFlow

Sistema de gestión para tienda de regalos (POS, inventario, pedidos, caja, reportes y catálogo digital), construido con Next.js, TypeScript, Tailwind CSS, Prisma y NeonPostgreSQL.

## Stack

- **Frontend:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript estricto · Tailwind CSS v4
- **Backend:** Next.js Route Handlers · Prisma ORM 6 · NeonPostgreSQL
- **Auth:** Auth.js (NextAuth v5) · Credentials + JWT · bcrypt
- **Formularios:** React Hook Form + Zod (validación cliente y servidor)
- **UI:** Design system propio en `components/ui/` (sin librerías de componentes de terceros)

## Estructura del proyecto

```text
app/                    # Rutas (App Router)
  (auth)/login/         # Login público
  (app)/…                # Dashboard, POS, Productos, Pedidos, Caja, etc. (protegidas)
  catalogo/              # Catálogo digital público
  api/…                  # Route handlers (uno por recurso)
components/
  ui/                    # Design system (Button, Modal, Table, Toast, …)
  layout/                # Sidebar, Header, AppShell
  product/, order/       # Componentes específicos de dominio
features/                # Lógica de features complejas (ej. POS/checkout)
hooks/                   # Hooks reutilizables (useCart, useCrudList, …)
lib/                     # Prisma client, auth, utilidades, formatters
services/                # Capa de acceso a datos y reglas de negocio (usa Prisma)
schemas/                 # Esquemas Zod compartidos (cliente + servidor)
prisma/                  # schema.prisma y seed.ts
```

## Requisitos

- Node.js 20+
- Una base de datos PostgreSQL (el proyecto está configurado para NeonPostgreSQL)

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión *pooled* (usada en runtime) |
| `DATABASE_URL_UNPOOLED` | Cadena de conexión directa (usada por Prisma Migrate) |
| `AUTH_SECRET` | Secreto para firmar sesiones. Generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | URL base de la app (`http://localhost:3000` en desarrollo) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp usado en el catálogo público |
| `NEXT_PUBLIC_STORE_NAME` | Nombre de la tienda mostrado por defecto |

## Base de datos (Prisma)

```bash
npx prisma generate       # Genera el cliente de Prisma
npx prisma db push        # Sincroniza el schema con la base de datos
npx prisma db seed        # Carga datos de demostración
npx prisma studio         # Explorador visual de la base de datos (opcional)
```

### Seed de datos demo

El seed crea: 2 usuarios, 17 categorías, 30 productos, 10 clientes, 5 proveedores, 10 ventas, 5 pedidos, movimientos de caja y gastos de ejemplo. Es idempotente para usuarios/categorías/productos (usa `upsert`); los datos transaccionales (clientes, ventas, pedidos) solo se crean una vez.

**Usuarios de acceso:**

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@giftflow.pe` | `Admin123!` |
| Vendedor | `vendedor@giftflow.pe` | `Vendedor123!` |

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La ruta raíz redirige a `/login` o `/dashboard` según el estado de sesión.

## Build de producción

```bash
npm run build
npm run start
```

## Funcionalidades implementadas

- **Autenticación y roles** — Login, logout, sesión JWT, protección de rutas y de API por rol (`ADMIN` / `VENDEDOR`).
- **Dashboard** — KPIs en tiempo real, gráfico de ventas de 7 días, productos más vendidos, ventas y pedidos recientes, alertas de stock bajo.
- **Productos y Categorías** — CRUD completo, subida de imágenes (disco local en `public/uploads`), vista grid/tabla, activar/desactivar.
- **Inventario** — Stock actual con alertas, ajustes manuales (entrada/salida, daño, pérdida, devolución) con historial de movimientos.
- **POS** — Carrito, búsqueda y filtro por categoría, clientes, descuentos, pago único o mixto (efectivo/Yape/Plin/tarjeta/transferencia), actualización automática de stock.
- **Caja** — Apertura, movimientos (ingresos/gastos/retiros), cierre con cálculo de diferencia esperado vs. contado. Solo el monto en efectivo de una venta afecta el arqueo físico.
- **Pedidos** — Pedidos estándar y personalizados (texto, color, imágenes de referencia, diseño), timeline de estados, adelanto/saldo.
- **Delivery** — Programación de entregas vinculadas a pedidos, asignación de repartidor, seguimiento de estado.
- **Proveedores y Compras** — CRUD de proveedores, registro de compras que actualiza inventario y costo automáticamente (transacción Prisma).
- **Gastos** — Registro por categoría, afecta la caja abierta cuando el método de pago es efectivo.
- **Promociones** — Combos de productos con precio especial y vigencia por fechas.
- **Reportes** — Ventas (por día/usuario/método de pago), inventario (stock, valorizado, más/menos vendidos), clientes, pedidos y caja, con exportación a Excel y a PDF (impresión).
- **Catálogo digital** (`/catalogo`) — Página pública sin autenticación, con botón "Consultar por WhatsApp" por producto.
- **Usuarios** — Gestión de accesos del equipo (solo administradores).
- **Configuración** — Datos generales de la tienda (nombre, logo, RUC, contacto).

## Notas de seguridad

- Las contraseñas se almacenan con `bcrypt`.
- Todas las rutas de API validan sesión y rol con `requireSession()` (`lib/api-auth.ts`) y devuelven errores JSON genéricos al cliente; los detalles técnicos solo se registran en el servidor.
- Todos los formularios validan con Zod tanto en el cliente como en el servidor — el servidor nunca confía en datos del cliente (precios, totales y stock siempre se recalculan server-side).
