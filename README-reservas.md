# Sistema de reservas · guía de configuración (Vercel + Google Calendar)

## Qué hace cada tipo de reunión
| Tipo | Qué ocurre | ¿Toca tu Google Calendar? |
|---|---|---|
| Conversemos sobre tu proyecto (gratis, 20 min) | Muestra horarios **reales** (tus ventanas de `api/_config.js` menos lo ocupado en tu calendario). Al confirmar, crea el evento con Google Meet y envía la invitación por correo. | Sí |
| Asesoría personalizada (pago) | Arma un mensaje de WhatsApp con servicio, fecha, horario preferido, nombre y motivo. | **No** |
| Asesoría institucional (pago) | Igual, con institución, tipo de organización, fecha y necesidad. | **No** |

Los horarios de pago son solo **preferencias**: no bloquean tu calendario ni generan Meet. Confirmas tú, tras verificar el pago.

## Archivos
```
index.html            ← sección #reservas (HTML + CSS + JS, ES/EN)
api/_config.js        ← tus reglas: días, horas, duración, anticipación (sin secretos)
api/_google.js        ← cliente de Google Calendar (lee credenciales de variables de entorno)
api/_slots.js         ← cálculo de horarios libres
api/availability.js   ← GET /api/availability
api/book.js           ← POST /api/book
```
Sube la carpeta `api/` a la **raíz** del repositorio (junto a `index.html`). Vercel la publica como funciones serverless (Node 18+). Los archivos que empiezan con `_` no se exponen como rutas.
Si tu repo ya tiene un `package.json` con `"type": "module"`, avísame y convierto las funciones a ESM.

## 1) Ajusta tu disponibilidad
Edita `api/_config.js` → `weekly`. **Los horarios incluidos son de ejemplo** (lun–jue 10–13 y 15–18, vie 10–13, hora de Lima). Si algo no aparece en `allowedOrigins`, la reserva responde 403: agrega tu dominio o usa la variable `ALLOWED_ORIGINS`.

## 2) Credenciales de Google (una sola vez)
Se usa OAuth con *refresh token* (tu cuenta Gmail no permite que una cuenta de servicio invite asistentes ni cree Meet).
1. [Google Cloud Console](https://console.cloud.google.com) → crea un proyecto → **APIs y servicios → Biblioteca → Google Calendar API → Habilitar**.
2. **Pantalla de consentimiento OAuth**: tipo *Externo*, agrega tu correo como usuario de prueba y **publícala (“En producción”)**. En modo *Testing* el refresh token caduca a los 7 días y las reservas dejarían de funcionar. Al ser solo para ti, no necesitas verificación de Google (verás una advertencia “app no verificada” solo tú al autorizar).
3. **Credenciales → Crear → ID de cliente OAuth → Aplicación web**. URI de redireccionamiento autorizado: `https://developers.google.com/oauthplayground`. Guarda *Client ID* y *Client secret*.
4. Entra a [OAuth Playground](https://developers.google.com/oauthplayground) → ⚙️ **Use your own OAuth credentials** → pega tus datos. En el paso 1 escribe estos scopes y autoriza con tu cuenta de Calendar:
   `https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy`
5. **Exchange authorization code for tokens** → copia el **Refresh token**.

## 3) Variables de entorno en Vercel
Proyecto → Settings → Environment Variables (Production y Preview):

| Variable | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | del paso 3 |
| `GOOGLE_CLIENT_SECRET` | del paso 3 |
| `GOOGLE_REFRESH_TOKEN` | del paso 5 |
| `GOOGLE_CALENDAR_ID` | opcional; por defecto `primary` |
| `ALLOWED_ORIGINS` | opcional; dominios extra separados por coma |

Luego haz **Redeploy**. Prueba: `https://angelafarfane.com/api/availability?from=2026-10-20&to=2026-10-31` debe devolver `{"slots":{…}}`.

## 4) Seguridad
- Ningún secreto está en `index.html` ni en el repo: solo en variables de entorno de Vercel. No subas archivos `.env`.
- La API valida origen, datos y que el horario siga **libre y ofrecido** justo antes de crear el evento (si alguien lo tomó, devuelve 409 y el sitio pide elegir otro).
- Hay campo trampa anti‑spam y un límite básico por IP. Para más protección activa **Vercel Firewall → Rate Limiting** sobre `/api/book`.
- Permisos mínimos: `calendar.events` (crear eventos) y `calendar.freebusy` (solo ocupado/libre).
- Si sospechas una filtración: revoca el acceso en https://myaccount.google.com/permissions y genera un refresh token nuevo.

## Integración en la web
- «Conversemos» (menú), «Agendar una llamada» → reunión gratuita.
- «Mentoría uno a uno» y «Asesoría puntual» (Docentes) → asesoría personalizada.
- «Pedir una propuesta» (Instituciones) → asesoría institucional.
- Cualquier botón nuevo: `data-reserva="gratis|docente|instit"`. Los `href` originales se conservan como respaldo si JavaScript falla.
