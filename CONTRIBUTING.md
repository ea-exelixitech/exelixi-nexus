# Contribuir a Exélixi Nexus Admin

Gracias por colaborar en el panel de administración de Nexus.

## Requisitos

- Node.js 20+
- API [exelixi-nexus-services](https://github.com/jsotoexelixitech/exelixi-nexus-services) en local

## Flujo de trabajo

1. Crea una rama desde `main`: `feat/descripcion-corta` o `fix/descripcion-corta`
2. `npm install` y `npm run dev`
3. Verifica build: `npm run build`
4. Abre un Pull Request con descripción clara y pasos de prueba

## Estilo

- TypeScript en componentes nuevos cuando sea posible
- Usar tokens y clases del design system en `src/styles/index.css`
- No commitear `.env` ni secretos

## Commits

Preferir [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`.
