# CLAUDE.md

Guía para trabajar con Claude en este repositorio.

## Qué es este proyecto

Código fuente de [almartin.ch](https://www.almartin.ch), el sitio personal de Martin:
portafolio, blog y "playground" para mostrar habilidades y hobbies.

- Hosting: **GitHub Pages** desde la rama `main` (dominio propio en `CNAME`).
- Sin build: HTML, CSS y JavaScript estáticos servidos tal cual.
  `.nojekyll` desactiva Jekyll, así que no hay plantillas ni front matter.
- Lo que se hace merge y push a `main` se publica en producción.

## Estructura

| Ruta | Contenido |
|------|-----------|
| `index.html` | Página principal (saludo con IP vía ipinfo.io, "verses" en tabla 4x4, selector de tema) |
| `css/pico.purple.css` | [Pico CSS](https://picocss.com) (tema púrpura). No editar: es una librería de terceros |
| `css/custom-style.css` | Estilos propios |
| `js/script.js` | Lógica del sitio (verses, cookie de IP, saludo) |
| `js/minimal-theme-switcher.js` | Selector de tema claro/oscuro/auto de Pico |
| `js/service-worker.js` | Service worker de la PWA (stale-while-revalidate) |
| `manifest.json` | Manifiesto PWA |
| `favicon_io/`, `screenshots/` | Iconos y capturas de la PWA |

## Convenciones

- Mantener el sitio sin paso de build ni dependencias npm salvo que Martin lo pida.
- Estilo visual: Pico CSS con HTML semántico (`header`/`main`/`footer` con `class="container"`).
  Preferir las clases y variables de Pico antes que CSS nuevo.
- El contenido del sitio está en inglés y en minúsculas, con tono personal y algún emoji.
- JavaScript vanilla, sin frameworks. Indentación de 4 espacios.
- Rutas relativas (`css/...`, `js/...`) para que funcione en GitHub Pages y en local.
- Si se añaden recursos de otros dominios que deban funcionar offline, revisar
  `HOSTNAME_WHITELIST` en `js/service-worker.js`.
- Al cambiar archivos cacheados, recordar que el service worker puede servir la versión
  anterior en la primera carga.

## Probar en local

No hace falta instalar nada. Desde la raíz del repo:

```bash
python -m http.server 8000
```

y abrir http://localhost:8000. (El service worker requiere `localhost` o HTTPS.)

## Flujo de trabajo con Claude (sin PRs)

1. Claude crea una **rama local** para cada cambio (por ejemplo `feature/<tema>`).
2. Claude hace los cambios en esa rama y los deja **en stage** (`git add`), sin commitear.
3. Claude redacta el mensaje de commit en formato
   [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`,
   `style:`, `refactor:`, `chore:`…), con el trailer `Co-Authored-By` de Claude al final,
   y lo deja listo en `.git/claude-commit-msg.txt`. Ese archivo está configurado como
   `commit.template` del repo, así que VS Code lo muestra en la caja de mensaje de Source Control.
4. Martin revisa los cambios en stage en **VS Code** (vista Source Control o `git diff --staged`)
   y **Martin hace el commit**. Claude nunca commitea.
5. Se repiten los pasos 2 a 4 hasta que la rama esté completa.
6. **Solo con el OK explícito de Martin**, Claude hace merge a `main` y `git push origin main`.
   Nunca hacer push a `main` sin ese OK, porque publica en producción.
7. Después del merge se puede borrar la rama local.

No crear pull requests salvo que Martin lo pida.
