# Sección de reservas · notas de instalación

No necesitas servidor, credenciales ni variables de entorno: basta con subir el nuevo `index.html` a tu repositorio (GitHub → Vercel despliega solo).

## Cómo funciona cada tipo
| Tipo | Qué ocurre |
|---|---|
| **Conversemos sobre tu proyecto** (gratis, 20 min) | Muestra tu calendario de citas de Google (el iframe que me pasaste). Google muestra la disponibilidad real, pide nombre/correo/motivo y envía la confirmación con el enlace de Meet. |
| **Asesoría personalizada** (pago) | El visitante elige servicio, fecha y horario de preferencia; «Solicitar horario y coordinar pago» abre tu WhatsApp con el mensaje armado. No bloquea tu calendario ni crea Meet. |
| **Asesoría institucional** (pago) | Igual, con institución, tipo de organización, fecha y necesidad; botón «Coordinar consultoría por WhatsApp». |

## Ajustes en Google Calendar (en tu página de citas)
- Revisa que la cita dure **20 minutos** y tenga activado **Google Meet** y los **correos de confirmación**.
- Ahí defines tus días/horas disponibles, la anticipación mínima y los límites por día.
- La página de Google muestra los horarios en la zona horaria de cada visitante, útil para público internacional.
- Si cambias o recreas la cita, actualiza el enlace en `index.html` (constante `GCAL_URL` y el `src` del iframe dentro de `#rsv-gcal`).

## Datos que pide el formulario (solo asesorías de pago)
- **Personalizada:** nombre, apellido, correo, celular, cargo, empresa y motivo de la consulta.
- **Institucional:** nombre, apellido, cargo, correo, celular, institución, tipo de organización y necesidad.
- Todo viaja en el mensaje de WhatsApp. La reunión gratuita pide sus datos dentro del calendario de Google.
- Todos los textos, errores y mensajes están en español e inglés.

## Otros cambios en la web
- **Menú** reordenado según el orden de lectura de la página (Talleres → Servicios → Trabajo → Proyectos → Quién soy → Qué hago → Eventos → Recursos → Contacto), con la sección actual resaltada y ajuste de espaciado en pantallas medianas.
- **Beacons y Wattpad** eliminados de «Sígueme». El botón «Conocer Diverso» (enlaza a beacons.ai/educaciondiverso) no se tocó.

## Botones de la web conectados
- «Conversemos» (menú) y «Agendar una llamada» → reunión gratuita.
- «Mentoría uno a uno» y «Asesoría puntual» (Docentes) → asesoría personalizada.
- «Pedir una propuesta» (Instituciones) → asesoría institucional.
- Cualquier botón nuevo: `data-reserva="gratis|docente|instit"`. Los `href` originales quedan como respaldo si JavaScript falla.

## Notas
- El texto dentro del calendario de Google (botones, meses) lo muestra Google en el idioma del navegador del visitante; el resto de la sección sigue el selector ES/EN de tu web.
- Si antes subiste la carpeta `api/` de la versión anterior, puedes borrarla: ya no se usa.
