/* Configuración de la reunión gratuita. Edita aquí tus reglas; no contiene secretos. */
module.exports = {
  timeZone: "America/Lima",
  utcOffsetHours: -5,            /* Lima no tiene horario de verano */
  durationMin: 20,               /* duración de la reunión exploratoria */
  bufferMin: 10,                 /* colchón antes y después de cada reunión */
  stepMin: 30,                   /* separación entre horarios ofrecidos */
  minNoticeHours: 12,            /* anticipación mínima para reservar */
  maxDaysAhead: 45,              /* hasta cuántos días adelante se puede reservar */

  /* Ventanas en las que ACEPTAS reuniones gratuitas (hora de Lima). 0 = domingo … 6 = sábado.
     Los horarios que se muestran salen de estas ventanas MENOS lo que ya tengas ocupado en Google Calendar.
     ⚠️ Valores de ejemplo: ajústalos a tu disponibilidad real. */
  weekly: {
    1: [["10:00", "13:00"], ["15:00", "18:00"]],
    2: [["10:00", "13:00"], ["15:00", "18:00"]],
    3: [["10:00", "13:00"], ["15:00", "18:00"]],
    4: [["10:00", "13:00"], ["15:00", "18:00"]],
    5: [["10:00", "13:00"]]
  },

  /* Orígenes autorizados a llamar a la API (además de los de la variable ALLOWED_ORIGINS) */
  allowedOrigins: ["https://angelafarfane.com", "https://www.angelafarfane.com"],

  eventTitle: { es: "Reunión exploratoria", en: "Exploratory meeting" }
};
