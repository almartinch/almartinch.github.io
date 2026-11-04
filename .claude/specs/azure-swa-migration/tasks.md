# Tareas: migración de almartin.ch a Azure Static Web Apps

- **Requisitos:** [requirements.md](./requirements.md)
- **Diseño:** [design.md](./design.md)

Cada tarea indica quién la ejecuta (Claude o Martin) y qué requisitos cubre. Los cambios al repo se dejan sin commitear hasta la revisión de Martin.

## Fase 0: preparación

- [x] 0.1 Inventariar los DNS actuales — Claude, en el equipo de Martin. _R2.1_
  ```bash
  dig +short almartin.ch A
  dig +short www.almartin.ch CNAME
  dig +short almartin.ch TXT
  dig +short almartin.ch NS
  ```
  Guardar el resultado en `.claude/specs/azure-swa-migration/dns-inventory.md`.
- [ ] 0.2 Exportar la zona desde GoDaddy y compararla con 0.1 — Martin. _R2.1_
- [ ] 0.3 Comprobar si DNSSEC está activo en GoDaddy — Martin. _R2.3_
- [x] 0.4 Bajar el TTL de los registros A a 600 s, un día antes de la Fase 4 — Martin. _R6_
  - El TTL ya era 600 s (ver [dns-inventory.md](./dns-inventory.md)); no hubo que cambiarlo.
- [x] 0.5 Verificar sesiones: `az account show` y `cf zones list` — Claude.

## Fase 1: cambios en el repo

- [x] 1.1 Crear `.github/workflows/azure-static-web-apps.yml` según el diseño. _R1.1, R1.2, R1.4, R4.2_
- [x] 1.2 Crear `staticwebapp.config.json` con cabeceras, caché y 404. _R5.1, R5.2, R5.3_
- [x] 1.3 Crear `404.html` con el estilo del sitio. _R5.3_
- [x] 1.4 Crear `api/` con la Function `GET /api/hello` (Node.js, modelo v4). _R4.1_
- [x] 1.5 Probar en local con la CLI de Static Web Apps (`npx @azure/static-web-apps-cli start . --api-location api`) — Claude. _R4.1, R5_
  - Antes de usar el emulador: copiar `api/local.settings.example.json` a `api/local.settings.json` (ignorado).
- [ ] 1.6 Revisar los cambios en staged y hacer el commit — Martin.

## Fase 2: recursos en Azure

- [x] 2.1 Crear grupo de recursos y Static Web App — Claude. _R1.3, R1.5_
  ```bash
  az group create --name rg-almartin --location westeurope
  az provider register --namespace Microsoft.Web --wait   # solo la primera vez en la suscripción
  az staticwebapp create --name almartin-ch --resource-group rg-almartin \
    --location eastus2 --sku Free   # West Europe no acepta clientes nuevos (D5)
  az staticwebapp show -n almartin-ch -g rg-almartin --query defaultHostname -o tsv
  ```
- [x] 2.2 Guardar el token de despliegue como secreto del repo — Claude. _R1.5_
  ```bash
  az staticwebapp secrets list -n almartin-ch -g rg-almartin \
    --query properties.apiKey -o tsv \
    | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -R almartinch/almartinch.github.io
  ```
- [x] 2.3 Push de la rama y PR contra `main` — Claude, tras el commit de Martin. _R1.2_
- [x] 2.4 Verificar en la URL de vista previa del PR: páginas, CSS, tema claro/oscuro, service worker, `/api/hello`, cabeceras y ausencia de errores CSP — Claude. _R1.2, R4, R5_
- [x] 2.5 Fusionar el PR en GitHub — Martin. _R1.1_
- [x] 2.6 Verificar producción en `https://<defaultHostname>` — Claude. _R1.1_

## Fase 3: DNS en Cloudflare

- [ ] 3.1 Añadir `almartin.ch` a Cloudflare (plan Free) con `cf` y anotar el `ZONE_ID` y los nameservers asignados — Claude. _R2.1_
  ```bash
  cf cli search "add a zone"     # confirmar el comando exacto (cf está en beta)
  cf zones list
  ```
- [ ] 3.2 Comparar los registros con el inventario y crear los que falten — Claude. _R2.1_
  ```bash
  cf dns records list --zone <ZONE_ID>
  cf dns records create --zone <ZONE_ID> --body '{"type":"A","name":"@","content":"185.199.108.153","proxied":false}' --dry-run
  ```
- [ ] 3.3 Poner todos los registros en DNS only (`"proxied":false`) — Claude. _R2.4_
- [ ] 3.4 Desactivar DNSSEC en GoDaddy si está activo — Martin. _R2.3_
- [ ] 3.5 Cambiar los nameservers en GoDaddy por los de Cloudflare — Martin. _R2.2_
- [ ] 3.6 Verificar que la zona está Active y que el sitio sigue en GitHub Pages — Claude. _R2.2_
  ```bash
  dig +short almartin.ch NS
  dig +short almartin.ch A
  ```

## Fase 4: dominio propio

- [ ] 4.1 Registrar el dominio raíz en Azure con validación TXT — Claude. _R3.3_
  ```bash
  az staticwebapp hostname set -n almartin-ch -g rg-almartin \
    --hostname almartin.ch --validation-method dns-txt-token --no-wait
  az staticwebapp hostname show -n almartin-ch -g rg-almartin \
    --hostname almartin.ch --query validationToken -o tsv
  ```
- [ ] 4.2 Crear el TXT en `@` en Cloudflare con el token — Claude. _R3.3_
  ```bash
  cf dns records create --zone <ZONE_ID> --body '{"type":"TXT","name":"@","content":"<TOKEN>"}'
  ```
- [ ] 4.3 Esperar a estado Ready (`az staticwebapp hostname list -n almartin-ch -g rg-almartin`) — Claude. _R3.1_
- [ ] 4.4 Sustituir los 4 A de GitHub Pages por `CNAME @ → <defaultHostname>` (DNS only) — Claude, con OK de Martin. _R3.1_
  ```bash
  cf dns records delete <RECORD_ID>   # x4, uno por cada A de GitHub Pages
  cf dns records create --zone <ZONE_ID> --body '{"type":"CNAME","name":"@","content":"<defaultHostname>","proxied":false}'
  ```
- [ ] 4.5 Crear `CNAME www → <defaultHostname>` y registrarlo en Azure — Claude. _R3.2_
  ```bash
  az staticwebapp hostname set -n almartin-ch -g rg-almartin --hostname www.almartin.ch
  ```
- [ ] 4.6 Marcar `almartin.ch` como dominio predeterminado en el portal — Martin. _R3.2_

## Fase 5: verificación y cierre

- [ ] 5.1 Verificar producción — Claude. _R3, R4, R5_
  ```bash
  curl -sI https://almartin.ch | head -n 5
  curl -sI https://www.almartin.ch | grep -i location
  curl -s https://almartin.ch/api/hello
  ```
- [ ] 5.2 Tras 2 días sin incidencias, desactivar GitHub Pages en Settings → Pages — Martin. _R6.1_
- [ ] 5.3 En otra rama chore: eliminar `CNAME` — Claude, para revisión de Martin. _R7_
- [ ] 5.4 Hacer el repo privado y comprobar que el siguiente despliegue funciona — Martin. _R7.1_
- [ ] 5.5 Restaurar TTL a Auto en Cloudflare — Claude.

## Vuelta atrás

Hasta 5.2 basta con restaurar en Cloudflare los registros A de GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153). _R6.2_
