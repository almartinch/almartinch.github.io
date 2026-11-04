# Inventario DNS de almartin.ch

- **Fecha:** 2026-11-04
- **Tarea:** 0.1 de [tasks.md](./tasks.md) (_R2.1_)
- **Método:** `nslookup` contra 1.1.1.1 y DNS over HTTPS de Cloudflare (`cloudflare-dns.com/dns-query`). `dig` no está instalado en el equipo.
- **Pendiente:** comparar con la exportación de la zona en GoDaddy (0.2). Esta consulta solo ve los nombres conocidos; la exportación puede mostrar subdominios que no se consultaron aquí.

## Zona

| Dato | Valor |
| --- | --- |
| Registrador y DNS | GoDaddy |
| NS | `ns03.domaincontrol.com`, `ns04.domaincontrol.com` |
| SOA | `ns03.domaincontrol.com. dns.jomax.net. 2024122305 28800 7200 604800 600` |
| TTL por defecto (SOA) | 600 s |
| DS en `.ch` (DNSSEC) | Ninguno: DNSSEC no parece activo. Confirmar en GoDaddy (0.3) |

## Registros

| Nombre | Tipo | Valor | TTL | Nota |
| --- | --- | --- | --- | --- |
| `@` | A | 185.199.108.153 | 600 | GitHub Pages |
| `@` | A | 185.199.109.153 | 600 | GitHub Pages |
| `@` | A | 185.199.110.153 | 600 | GitHub Pages |
| `@` | A | — | — | **Falta 185.199.111.153**, la cuarta IP de GitHub Pages. Añadirla en Cloudflare para que la vuelta atrás sea completa |
| `@` | AAAA | — | — | Sin registros |
| `@` | MX | — | — | Sin registros (no hay correo) |
| `@` | TXT | — | — | Sin registros (sin SPF ni verificaciones) |
| `_dmarc` | TXT | — | — | Sin registros |
| `@` | CAA | — | — | Sin registros: cualquier CA puede emitir, incluida la de Azure |
| `www` | CNAME | `almartinch.github.io` | — | GitHub Pages (resuelve a las 4 IPv4 y 4 IPv6 de GitHub) |

## Para la Fase 3

- Registros a recrear en Cloudflare antes de cambiar nameservers: los 3 A de `@`, más el A de 185.199.111.153, y el CNAME de `www`, todos en DNS only.
- No hay MX, TXT ni CAA que migrar.
