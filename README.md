# Finance App

Frontend en **Next.js 14** con App Router para la gestión de autenticación y perfiles de Finance App.

## Pantallas incluidas

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión con JWT |
| `/registro` | Registro con validación de contraseña |
| `/verificar` | Verificación OTP de 6 dígitos por correo |
| `/dashboard` | Panel principal + edición de descripción de perfil |

## Stack

- **Next.js 14** — App Router + Server Components
- **TypeScript** — tipado completo
- **CSS puro** — sin Tailwind, sistema de diseño propio con variables CSS
- **Fuentes**: Cormorant Garamond (display) + DM Sans (body) + DM Mono (código)

## Instalación local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Deploy en Vercel

1. Sube el proyecto a un repositorio de GitHub
2. En [vercel.com](https://vercel.com), clic en **Add New Project**
3. Importa el repositorio
4. Vercel detecta Next.js automáticamente — clic en **Deploy**

No se requieren variables de entorno (la base URL de la API está en `src/lib/api.ts`).

> Si quieres parametrizar la base URL, crea un `.env.local` con:
> ```
> NEXT_PUBLIC_API_URL=http://98.84.30.134:8080/api/auth
> ```
> Y actualiza `src/lib/api.ts` para usar `process.env.NEXT_PUBLIC_API_URL`.

## Estructura

```
src/
├── app/
│   ├── layout.tsx          # Root layout + fuentes + AuthProvider
│   ├── globals.css         # Sistema de diseño completo
│   ├── page.tsx            # Redirect → /login
│   ├── login/page.tsx
│   ├── registro/page.tsx
│   ├── verificar/page.tsx
│   └── dashboard/page.tsx
├── components/
│   └── ui.tsx              # Componentes compartidos
├── hooks/
│   └── useAuth.tsx         # Contexto de sesión (localStorage)
└── lib/
    └── api.ts              # Cliente HTTP tipado
```
