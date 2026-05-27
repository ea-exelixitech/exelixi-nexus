# Exélixi Nexus — Admin Panel

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

**Panel de administración multi-tenant para La Mundial de Seguros**

Gestión de empresas, usuarios, roles, módulos y flujo encadenado OCR → Formulario → Emisión → Pagos.

[Inicio rápido](#-inicio-rápido) · [Despliegue](#-despliegue-en-servidor) · [Variables de entorno](#-variables-de-entorno) · [Contribuir](CONTRIBUTING.md)

</div>

---

## Descripción

**Exélixi Nexus Admin** es la aplicación web (SPA) que opera el backoffice de la plataforma Nexus: alta de empresas, asignación de módulos y submódulos, control de accesos y panel operativo con verificación de salud de cada microfrontend.

Se integra con [exelixi-nexus-services](https://github.com/jsotoexelixitech/exelixi-nexus-services) (API REST + PostgreSQL + bridge `/api/flow`).

### Funcionalidades

- Autenticación de administradores (JWT cifrado vía API)
- CRUD de empresas, usuarios y roles
- Catálogo de módulos y submódulos con **URL de acceso** por submódulo
- Panel de control: activar/desactivar módulos por empresa y enlaces “en red”
- Diseño Exélixi (Oxford / Pumpkin / Sky)

---

## Stack

| Capa | Tecnología |
|------|------------|
| UI | React 18, React Router 7 |
| Build | Vite 5, TypeScript 5 |
| Estilos | Tailwind CSS 3 |
| HTTP | Axios |
| API backend | [exelixi-nexus-services](https://github.com/jsotoexelixitech/exelixi-nexus-services) |

---

## Requisitos

- Node.js **20+**
- npm **10+**
- API Nexus en ejecución (por defecto puerto **3091** o **3092**)

---

## Inicio rápido

```bash
git clone https://github.com/jsotoexelixitech/exelixi-nexus.git
cd exelixi-nexus
cp .env.example .env
# Editar VITE_API_URL → URL de exelixi-nexus-services

npm install
npm run dev
```

Abrir **http://localhost:5200**

En desarrollo, Vite hace proxy de `/api` hacia `VITE_API_URL`.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | Base de la API Nexus (proxy dev) | `http://localhost:3092` |
| `VITE_APP_ENV` | Entorno lógico | `production` |

Copiar desde `.env.example`. **No** commitear `.env`.

---

## Scripts

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo (:5200) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve `dist/` (proxy `/api` en preview) |

---

## Despliegue en servidor

Puertos recomendados en el mismo host que los módulos RCV:

| Servicio | Puerto |
|----------|--------|
| Admin (este repo) | **5200** |
| API Nexus | **3092** |
| Módulo Pagos web | 5180 |
| OCR / Form / Emisión | 5181–5183 |

```bash
npm ci
npm run build
pm2 start ecosystem.config.cjs --env production
```

El `ecosystem.config.js` usa `vite preview` con proxy `/api` → `127.0.0.1:3092`.

URLs de submódulos en la BD (vía panel): `http://<IP_SERVIDOR>:5181` … `5180`.

---

## Estructura del proyecto

```
src/
├── api.ts              # Cliente Axios (auth, empresas, módulos, usuarios)
├── App.tsx             # Rutas protegidas
├── components/         # Layout, UI compartida
└── pages/
    ├── panel/          # Panel de control operativo
    ├── empresas/
    ├── modulos/
    ├── usuarios/
    └── roles/
```

---

## Repos relacionados

| Repositorio | Rol |
|-------------|-----|
| [exelixi-nexus-services](https://github.com/jsotoexelixitech/exelixi-nexus-services) | API + Prisma + flow bridge |
| [ocr-documentos-modulo](https://github.com/jsotoexelixitech/ocr-documentos-modulo) | Paso 1 — OCR |
| [Formulario-modulo](https://github.com/jsotoexelixitech/Formulario-modulo) | Paso 2 |
| [Emision-Plan-modulo](https://github.com/jsotoexelixitech/Emision-Plan-modulo) | Paso 3 |
| [Pagos-Poliza-modulo](https://github.com/jsotoexelixitech/Pagos-Poliza-modulo) | Paso 4 — Pagos |

---

## Licencia

[MIT](LICENSE) © Exelixi Tech

---

<div align="center">
<sub>Exélixi Platform · La Mundial de Seguros</sub>
</div>
