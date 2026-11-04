# Inventario DNS de almartin.ch

- **Fecha:** 2026-11-04
- **Tareas:** 0.1, 0.2 y 0.3 de [tasks.md](./tasks.md) (_R2.1, R2.3_)
- **Método:** solo lectura. `nslookup` contra 1.1.1.1 y los servidores de `.ch`; DNS over HTTPS de Cloudflare (`cloudflare-dns.com`) y Google (`dns.google`); Certificate Transparency en crt.sh. `dig` no está instalado en el equipo.
- **Sin exportación de GoDaddy:** la zona no se exportó (no hay acceso a GoDaddy). La sustituyen el sondeo de nombres comunes y Certificate Transparency (ver abajo). Además, Cloudflare escanea e importa la zona al añadirla en 3.1, y se compara con esta tabla en 3.2.

## Zona

| Dato | Valor |
| --- | --- |
| Registrador y DNS | GoDaddy |
| NS | `ns03.domaincontrol.com`, `ns04.domaincontrol.com` |
| SOA | `ns03.domaincontrol.com. dns.jomax.net. 2024122305 28800 7200 604800 600` |
| TTL por defecto (SOA) | 600 s |
| Comodín (`*`) | No hay: un nombre aleatorio da NXDOMAIN |
| Transferencia de zona (AXFR) | Rechazada por `ns03.domaincontrol.com` (tiempo de espera), como se esperaba |

## DNSSEC (0.3)

- **DS en `.ch`:** no existe. Los servidores de `.ch` (`a.nic.ch`) solo devuelven la delegación a GoDaddy, y los resolvers validadores de Cloudflare y Google responden sin DS con `AD=true`: `.ch` está firmado y prueba que no hay DS.
- **DNSKEY en GoDaddy:** no existe (respuesta vacía, `AD=false` en las respuestas de la zona).
- **Conclusión:** DNSSEC no está activo, ni en el registro ni en la zona. Se puede cambiar de nameservers sin desactivar nada antes.

## Registros

| Nombre | Tipo | Valor | TTL | Nota |
| --- | --- | --- | --- | --- |
| `@` | A | 185.199.108.153 | 600 | GitHub Pages |
| `@` | A | 185.199.109.153 | 600 | GitHub Pages |
| `@` | A | 185.199.110.153 | 600 | GitHub Pages |
| `@` | A | — | — | **Falta 185.199.111.153**, la cuarta IP de GitHub Pages. Añadirla en Cloudflare para que la vuelta atrás sea completa |
| `@` | AAAA | — | — | Sin registros |
| `@` | MX | — | — | Sin registros (no hay correo) |
| `@` | TXT | — | — | Sin registros (sin SPF ni verificaciones en el raíz) |
| `@` | CAA | — | — | Sin registros: cualquier CA puede emitir, incluida la de Azure |
| `www` | CNAME | `almartinch.github.io` | — | GitHub Pages (resuelve a las 4 IPv4 y 4 IPv6 de GitHub) |
| `_github-pages-challenge-almartinch` | TXT | `2c130ac8906fce8de3bee7cac27ae3` | 3600 | **Verificación del dominio en GitHub Pages** para la cuenta almartinch. Conservarlo: impide que otra cuenta de GitHub use almartin.ch en Pages |

## Sondeo de nombres comunes (0.2)

Se consultaron A, AAAA, CNAME y TXT. Todos dan NXDOMAIN salvo `www` y `_github-pages-challenge-almartinch`:

`mail`, `smtp`, `imap`, `pop`, `webmail`, `email`, `autodiscover`, `autoconfig`, `ftp`, `blog`, `api`, `app`, `dev`, `staging`, `test`, `cdn`, `shop`, `portal`, `admin`, `m`, `status`, `docs`, `_dmarc`, `_acme-challenge`, `_domainconnect`, `default._domainkey`, `google._domainkey`, `selector1._domainkey`, `k1._domainkey`.

## Certificate Transparency (0.2)

crt.sh solo registra certificados para `almartin.ch` y `www.almartin.ch`, desde 2024-07-20, emitidos por Let's Encrypt (los de GitHub Pages). El último caduca el 2026-11-14 y GitHub lo renueva solo mientras siga sirviendo el sitio. No aparecen otros subdominios.

## Para la Fase 3

- Registros a recrear en Cloudflare antes de cambiar nameservers, todos en DNS only:
  - Los 3 A de `@`, más el A de 185.199.111.153.
  - El CNAME de `www`.
  - El TXT `_github-pages-challenge-almartinch`.
- No hay MX, CAA ni DNSSEC que migrar o desactivar.

## Zona en Cloudflare (Fase 3)

- **Creada:** 2026-11-04 con `cf zones create --type full`. Plan Free Website. Estado: `pending` hasta el cambio de nameservers (3.5).
- **ZONE_ID:** `fbe00e9a0c87f5abceca980e90da049a`
- **Nameservers asignados** (para poner en GoDaddy en 3.5):
  - `lila.ns.cloudflare.com`
  - `thomas.ns.cloudflare.com`
- **Escaneo de Cloudflare** (`cf dns records scan-trigger`): encontró los 3 A de `@` y el CNAME de `www`, sin nada inesperado. No se aceptó el escaneo: los registros se crearon a mano.
- **DNSSEC en Cloudflare:** sin activar.

| Nombre | Tipo | Valor | TTL | Proxy | ID |
| --- | --- | --- | --- | --- | --- |
| `@` | A | 185.199.108.153 | 600 | DNS only | `b500a8ccba57b467bd81e53862f711c7` |
| `@` | A | 185.199.109.153 | 600 | DNS only | `53271767bd97295ed9d75a3cb8bf12e8` |
| `@` | A | 185.199.110.153 | 600 | DNS only | `b9973ae6067180581f3f814d05ba22f7` |
| `@` | A | 185.199.111.153 | 600 | DNS only | `555ed1e457190bea759e069787424824` |
| `www` | CNAME | `almartinch.github.io` | 600 | DNS only | `7c13a2cfb54cbb482598df3c26bd7683` |
| `_github-pages-challenge-almartinch` | TXT | `2c130ac8906fce8de3bee7cac27ae3` | 600 | — | `c1a170cffb193cfec8c80b7c261ba3cd` |

Verificado consultando directamente `lila.ns.cloudflare.com` y `thomas.ns.cloudflare.com`: devuelven los 4 A, el CNAME y el TXT. El TTL del TXT baja de 3600 a 600 s, sin efecto práctico.
