# ProcesaLabWeb — notes for agents (Claude Code + Codex)

Este repo lo trabajan dos agentes distintos en sesiones separadas (Claude
Code y Codex), cada uno en su propia rama, que luego se mergean a `main`.
**Antes de construir algo nuevo, revisa `main` primero** — ya pasó una vez
que se planeó una feature ("directorio de clientes") sin darse cuenta de
que el otro agente ya la había construido en `main` mientras la rama local
estaba desactualizada. `git fetch origin main && git log origin/main
--oneline -20` para ver qué se agregó recientemente antes de empezar.

## Qué es esto

Landing pública de ProcesaLab + dashboard privado de negocio (`/privado.html`),
sitio estático (sin build step, sin framework) desplegado en Vercel, con
funciones serverless en `/api` para todo lo que necesita servidor. Deploy:
`https://procesa-lab-web.vercel.app`.

## Almacenamiento: solo Vercel Blob, sin base de datos

`lib/store.js` es el único helper de persistencia (`readJSON`/`writeJSON`),
usado por todos los endpoints de `/api`. Puntos importantes:

- El Blob store de esta cuenta es **privado únicamente** — `access:'public'`
  falla. `readJSON` usa `list()` + `getDownloadUrl()` + `fetch()` para leer
  un blob privado; `writeJSON` usa `put(..., { access:'private',
  allowOverwrite:true })`.
- **Blob tiene lag de consistencia read-after-write**: leer inmediatamente
  después de escribir la misma key puede no reflejar el cambio. Por eso el
  patrón en todo el frontend es: nunca volver a pedir la lista justo
  después de un POST/PUT/DELETE — se actualiza el estado en memoria del
  cliente (`currentEvents`, `currentClients`, etc.) con la respuesta que ya
  llegó, y se re-renderiza desde ahí.
- Archivos JSON actuales en el store: `data/calendar.json`,
  `data/stats.json`, `data/clients.json`.

## Límite de Vercel Hobby: máximo 12 funciones serverless

Cada archivo en `/api/*.js` cuenta como una función. Ya se rompió el deploy
una vez por pasarse de 12. Hoy hay 10 (`calendar.js`, `calendar-ics.js`,
`check.js`, `client-check.js`, `client-login.js`, `clients.js`, `login.js`,
`logout.js`, `stats.js`, `track.js`) — queda poco margen. Antes de agregar
un endpoint nuevo, revisa si puede vivir dentro de uno existente (mismo
archivo, distinto `req.method`) en vez de crear otro archivo.

## Sesiones / auth

- `lib/session.js` — cookie firmada `pl_session`, sesión del dueño
  (contraseña única, la comparten Emma y su socio). Gatea todo `/privado.html`
  y sus endpoints (`isValidSession(req.headers.cookie, process.env.SESSION_SECRET)`).
- `lib/clientSession.js` — cookie firmada por cliente `pl_client_<slug>`,
  para las zonas `/clientes/<slug>/`.
- `lib/clients.js` — **solo credenciales de login** por cliente (`name`,
  `password`), estático en código, NO es el CRM. No confundir con
  `data/clients.json` (el directorio/CRM editable desde `/privado.html`,
  servido por `api/clients.js`).

## `/privado.html` — estructura del dashboard

Una sola página con tarjetas (`.card`), cada una un bloque de negocio.
Orden actual: Sistemas de clientes, Directorio de clientes, Calendario,
Analítica, Presentaciones, Compartido con clientes, Proyectos de la
universidad. Patrón visual reutilizado en toda la página para listas:
`.files` (contenedor) > `.file` (fila) > `.name`/`.meta`/`.actions`
(CSS cerca del top del `<style>`). Nuevas tarjetas con listas deberían
seguir este mismo patrón en vez de inventar uno nuevo.

### Directorio de clientes (`api/clients.js` + tarjeta en `privado.html`)

CRM simple sobre `data/clients.json`: nombre, contacto, estado
(`active`/`paused`/`finished`/`possible` — "possible" = *Posible proyecto*,
para prospectos sin confirmar), valor estimado (`estimatedValue`, para
priorizar posibles proyectos), próximo pago, renovación de dominio/hosting,
notas. Guardar una fecha de renovación de dominio/hosting **crea sola** un
recordatorio en el calendario (dedupe por `sourceKey`, ver
`syncClientRenewals()` en `privado.html` y el manejo de `sourceKey` en
`api/calendar.js`) — no hace falta el botón manual salvo para
regenerar un recordatorio de un cliente que ya tenía la fecha guardada
antes de que existiera el auto-sync.

### Calendario (`api/calendar.js` + `lib/ics.js`/`api/calendar-ics.js`)

Eventos con título/fecha/hora/notas. El `.ics` para Apple Calendar se sirve
desde `api/calendar-ics.js` vía `lib/ics.js`. (Nota histórica: en un punto
se generó el `.ics` enteramente del lado del cliente para evitar el lag de
Blob al leer un evento recién creado — si vuelve a fallar con "Evento no
encontrado", ese es el origen del problema y esa fue la solución que
funcionó.)

### Analítica

Vercel Web Analytics (`<script defer src="/_vercel/insights/script.js">`
en cada página) + contador simple propio (`api/track.js` sin auth,
`api/stats.js` con auth) sobre `data/stats.json`.

## Testing local

No hay framework de test. Verificación manual: `python3 -m http.server`
desde la raíz del repo + Playwright, mockeando `/api/*` con `page.route()`
(las funciones reales de Blob no se pueden probar desde un sandbox sin
salida de red a Vercel — cualquier prueba de persistencia real necesita
hacerse después del deploy). Checks típicos: sin errores de consola, sin
overflow horizontal a 320px/390px de ancho.

## Flujo de git

Cada agente trabaja en su propia rama (`claude/...` para Claude Code,
`codex/...` para Codex), PR a `main`, squash merge. `main` es la fuente de
verdad — si tu rama lleva un rato sin tocarse, rebasea sobre `origin/main`
antes de seguir trabajando para no duplicar trabajo del otro agente.
