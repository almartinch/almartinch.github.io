# Requisitos: migración de almartin.ch a Azure Static Web Apps

- **Tipo:** chore
- **Rama:** `chore/azure-swa-migration`
- **Fecha:** 2026-11-04
- **Estado:** borrador para revisión

## Contexto

almartin.ch es un sitio estático (HTML, CSS con Pico, JS, PWA con service worker) servido hoy por GitHub Pages desde un repo público. El dominio está registrado en GoDaddy, que también gestiona sus DNS. Se quiere aprovechar el plan gratuito de Azure para tener API serverless, repo privado y más control sobre cabeceras, sin coste mensual.

## Objetivos

- Servir el sitio desde Azure Static Web Apps (plan Free).
- Gestionar los DNS en Cloudflare (plan Free), manteniendo GoDaddy como registrador.
- Habilitar una API en `/api` con Azure Functions gestionadas.
- Poder hacer privado el repositorio sin perder el despliegue.

## Fuera de alcance

- Cambios de diseño o contenido del sitio.
- Cambiar de registrador o transferir el dominio.
- Usar el proxy o la CDN de Cloudflare (los registros quedan en modo DNS only).
- Funcionalidades reales de la API más allá de un endpoint de prueba.

## Historias de usuario y criterios de aceptación

Los criterios usan formato EARS (CUANDO / SI / EL SISTEMA DEBERÁ).

### R1. Hosting en Azure Static Web Apps

**Historia:** Como dueño del sitio, quiero servirlo desde Azure Static Web Apps para tener API, cabeceras propias y despliegue desde un repo privado.

1. CUANDO se haga push a `main`, EL SISTEMA DEBERÁ desplegar el sitio en Azure Static Web Apps mediante GitHub Actions.
2. CUANDO se abra un pull request contra `main`, EL SISTEMA DEBERÁ crear un entorno de vista previa y eliminarlo al cerrarlo. El plan Free admite hasta 3 vistas previas simultáneas, públicas para quien tenga la URL.
3. EL SISTEMA DEBERÁ usar el plan Free, sin cargos mensuales.
4. EL SISTEMA DEBERÁ desplegar los archivos tal como están en el repo, sin paso de build.
5. EL SISTEMA NO DEBERÁ crear commits en `main` desde Azure; el workflow vive en el repo y pasa por revisión.

### R2. DNS en Cloudflare

**Historia:** Como dueño del dominio, quiero que Cloudflare gestione los DNS para poder apuntar el dominio raíz a Azure, sin dejar de tener el dominio en GoDaddy.

1. EL SISTEMA DEBERÁ conservar en Cloudflare todos los registros DNS existentes en GoDaddy.
2. CUANDO se cambien los nameservers, EL SISTEMA DEBERÁ seguir sirviendo el sitio desde GitHub Pages hasta el cambio de registro de la tarea de dominio.
3. SI DNSSEC está activo en GoDaddy, ENTONCES se DEBERÁ desactivar antes del cambio de nameservers.
4. EL SISTEMA DEBERÁ dejar los registros del sitio en modo DNS only.

### R3. Dominio propio con HTTPS

**Historia:** Como visitante, quiero entrar por `almartin.ch` o `www.almartin.ch` con HTTPS válido.

1. EL SISTEMA DEBERÁ servir el sitio en `https://almartin.ch` con certificado gestionado por Azure.
2. CUANDO un visitante entre por `www.almartin.ch`, EL SISTEMA DEBERÁ redirigirlo a `almartin.ch`.
3. EL SISTEMA DEBERÁ validar el dominio raíz con un registro TXT antes de mover el tráfico, para que el certificado exista antes del cambio.

### R4. API serverless

**Historia:** Como desarrollador, quiero una API en el mismo dominio para añadir funciones dinámicas al portafolio y al playground.

1. CUANDO se haga `GET /api/hello`, EL SISTEMA DEBERÁ responder 200 con un JSON.
2. EL SISTEMA DEBERÁ desplegar la API junto con el sitio, en el mismo workflow.

### R5. Configuración del sitio

1. EL SISTEMA DEBERÁ enviar cabeceras de seguridad: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options` y `Referrer-Policy`.
2. EL SISTEMA DEBERÁ servir `service-worker.js` y `manifest.json` sin caché larga, para que las actualizaciones de la PWA lleguen.
3. CUANDO se pida una ruta inexistente, EL SISTEMA DEBERÁ responder 404.

### R6. Continuidad y vuelta atrás

1. EL SISTEMA DEBERÁ mantener GitHub Pages activo hasta verificar el sitio en Azure durante al menos 2 días.
2. SI el sitio en Azure falla tras el cambio de DNS, ENTONCES se DEBERÁ poder volver a GitHub Pages restaurando los 4 registros A en Cloudflare.

### R7. Repositorio privado

1. CUANDO GitHub Pages esté desactivado, el repo PODRÁ pasar a privado y EL SISTEMA DEBERÁ seguir desplegando.

## Restricciones

- Coste: 0 USD al mes (Static Web Apps Free, Cloudflare Free).
- Límites del plan Free: 100 GB al mes de tráfico, 2 dominios propios, 250 MB por app, sin SLA.
- Flujo de trabajo: rama por tipo (`chore/...`); Claude deja los cambios en staged con mensaje Conventional Commits; Martin revisa y hace el commit; Claude hace push de la rama y abre un PR contra `main`; Martin revisa la vista previa y fusiona el PR.

## Preguntas resueltas

- ¿Hay correo con `@almartin.ch`? No. No hay registros MX, SPF, DKIM ni DMARC que preservar.
- ¿Qué CLI de Cloudflare se usa? `cf`, la CLI oficial basada en npm (beta). Gestiona zonas y registros DNS.
