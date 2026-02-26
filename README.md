```markdown
# 🎲 Dominoes | Tu mesa de juegos

Aplicación de ecommerce moderna construida con **Next.js**, **Convex**, **Clerk** y **Mercado Pago**. Diseñada con arquitectura escalable y enfoque en seguridad.

## ✨ Características Principales

- 🛒 **Compra directa** de un solo producto
- 🛍️ **Checkout completo** desde carrito
- 🔐 **Autenticación segura** con Clerk (roles admin/cliente)
- 💳 **Pagos reales** con Mercado Pago (Checkout Pro)
- 📦 **Gestión de órdenes** en backend con validación de precios
- 👑 **Panel de administración** para gestión de productos
- ⚡ **Actualizaciones en tiempo real** con Convex

## 🚀 Tecnologías

| Tecnología | Uso |
|------------|-----|
| [Next.js](https://nextjs.org/) (App Router) | Framework principal |
| [Clerk](https://clerk.com/) | Autenticación y usuarios |
| [Convex](https://www.convex.dev/) | Backend serverless + BD en tiempo real |
| [Mercado Pago](https://www.mercadopago.com.ar/) | Procesamiento de pagos |
| [Zustand](https://github.com/pmndrs/zustand) | Estado temporal (checkout) |
| [Context API](https://react.dev/reference/react/useContext) | Estado del carrito |

## 🏗️ Arquitectura

### Flujo de Compra Directa

```mermaid
graph LR
    A[Click Comprar] --> B[Zustand: guarda producto]
    B --> C[Redirige a /checkout]
    C --> D[Convex: consulta producto]
    D --> E[Convex: crea orden]
    E --> F[Mercado Pago: genera preferencia]
    F --> G[Usuario paga]
    G --> H[Webhook confirma]
```

### Flujo de Compra desde Carrito

```mermaid
graph LR
    A[Agregar al carrito] --> B[Context API]
    B --> C[Click Checkout]
    C --> D[Limpia compra directa]
    D --> E[Usa productos del carrito]
    E --> F[Convex: valida precios]
    F --> G[Convex: crea orden]
    G --> H[Mercado Pago: genera preferencia]
```

## 📁 Estructura del Proyecto

```
📦 dominoes
├── 📱 app/                    # Next.js App Router
│   ├── 🏠 page.tsx            # Home
│   ├── 📦 product/            # Página de producto
│   ├── 💳 checkout/           # Checkout
│   ├── 👑 dashboard/          # Panel admin
│   └── 📡 api/                 # API routes
├── ⚡ convex/                  # Backend Convex
│   ├── 📄 products.ts          # Productos
│   ├── 📄 orders.ts            # Órdenes
│   └── 📄 users.ts             # Usuarios + sync con Clerk
├── 🗂️ stores/                  # Zustand stores
│   └── checkoutStore.ts
├── 🛒 context/                  # Context API
│   └── cartContext.tsx
├── 🪝 hooks/                    # Custom hooks
│   ├── useUser.ts              # Hook de usuario + admin
│   └── useCheckout.ts
└── 📦 components/               # Componentes reutilizables
```


## 🛠️ Instalación y Uso

```bash
# Clonar repositorio
git clone https://github.com/TiendaDominoes/Dominoes

# Instalar dependencias
npm install

# Iniciar Convex (desarrollo)
npx convex dev

# Iniciar app
npm run dev
```

La app estará disponible en `http://localhost:3000`

## 👑 Roles de Usuario

### Admin
- Crear y gestionar productos
- Ver todas las órdenes
- Acceso al dashboard

### Cliente
- Navegar productos
- Agregar al carrito
- Realizar compras
- Ver historial de órdenes

## 📦 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Iniciar producción
npm run lint         # Linter
npx convex dev       # Desarrollar Convex
npx convex deploy    # Deploy Convex
```