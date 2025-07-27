# Bodegapp Next - POS para Abarrotes

Sistema de Punto de Venta moderno y modular para bodegas y abarrotes, basado en Next.js + Firebase. Ideal para operación monotienda, con despliegue aislado por cliente y soporte para ventas, inventario, reportes y más.

---

## 🚀 Características Principales

- **Dashboard en tiempo real:** Ventas, ingresos, productos más vendidos, resumen semanal, gráficos animados y widgets interactivos.
- **Gestión de Inventario:** Altas, bajas, ajustes, historial de movimientos, control de stock mínimo, alertas de bajo stock, ingreso masivo y edición avanzada.
- **POS (Punto de Venta):** Venta rápida con lector de código de barras, búsqueda inteligente, carrito, descuentos, métodos de pago, generación de tickets y exportación a PDF.
- **Clientes y Proveedores:** Registro y gestión de clientes y proveedores, historial de compras y ventas.
- **Reportes avanzados:** Ventas por fecha, método de pago, productos más vendidos, exportación a Excel/PDF, historial de movimientos de inventario.
- **Animaciones y UX moderna:** Animaciones de entrada y hover en widgets, gráficos con colores personalizados, interfaz responsiva y amigable.
- **Seguridad:** Autenticación con Firebase Auth, protección de acciones críticas (borrar producto, ajustes de stock, etc.) con contraseña.
- **Configuración y backup:** Panel de configuración, exportación de datos, backup manual, personalización de tienda.
- **Modo Kill (en desarrollo):** Modo de emergencia para bloqueo total de la app.

---

## 📁 Estructura de Carpetas

```
src/
  components/
    Auth/           # Login, registro, recuperación
    Customers/      # Gestión de clientes
    Dashboard/      # Dashboard y widgets
    Inventory/      # Inventario y movimientos
    Layout/         # Navbar, Sidebar, UI base
    LowStock/       # Alertas de bajo stock
    POS/            # Punto de venta (ventas)
    Products/       # Catálogo de productos
    Reports/        # Reportes y gráficos
    Settings/       # Configuración, backup
    Suppliers/      # Gestión de proveedores
    common/         # Utilidades y componentes comunes
  contexts/         # Contextos globales (auth, carrito, toast)
  hooks/            # Custom hooks
  lib/              # Lógica de negocio y acceso a Firebase
  types/            # Tipos y modelos TypeScript
  utils/            # Utilidades varias
  app/              # Rutas Next.js 13/14
```

---

## 🛠️ Tecnologías y Librerías

- **Next.js 15** (App Router, SSR, CSR)
- **React 19**
- **Firebase** (Auth, Firestore)
- **TailwindCSS** (UI moderna y responsiva)
- **Framer Motion** (animaciones)
- **Recharts** (gráficos)
- **Lucide React** (iconos)
- **JSPDF + Autotable** (exportación PDF)
- **XLSX** (exportación Excel)

---

## ⚡ Instalación y Uso

1. Clona el repositorio o la plantilla base.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Configura el archivo `.env` con tus credenciales de Firebase.
4. Ejecuta en desarrollo:
   ```bash
   npm run dev
   ```
5. Accede a `http://localhost:3000` y comienza a operar.

---

## ☁️ Despliegue recomendado

- **Vercel**: Integración directa, soporta subdominios por cliente.
- **Firebase Hosting**: Alternativa para despliegue rápido.
- Cada instancia es monotienda y aislada (sin lógica multi-company).

---

## 👤 Soporte y Créditos

- Sistema desarrollado por RevistaOnline para bodegas y tiendas de abarrotes.
- Soporte: [revistaonline.com](https://revistaonline.com) | contacto@revistaonline.com
- Actualizado: Julio 2025

---

## 🧪 Roadmap y Notas

- [x] Animaciones modernas en dashboard y widgets
- [x] Filtros y búsqueda avanzada en inventario y POS
- [x] Exportación de reportes a Excel y PDF
- [x] Control de stock y alertas inteligentes
- [x] Backup y restauración manual de datos
- [ ] Implementación de "Modo Kill" (bloqueo de emergencia)

¿Ideas o mejoras? ¡Contribuye o sugiere en el canal de soporte!

### ¿Cómo escalar después?
Cuando tengas muchos clientes, puedes migrar a una arquitectura multi-tenant real, pero este modelo es ideal para crecer rápido y sin complicaciones.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
