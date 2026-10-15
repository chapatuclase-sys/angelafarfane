/* POST /api/book → crea la reunión GRATUITA en Google Calendar con enlace de Meet e invitación por correo.
   Las asesorías de pago NO pasan por aquí: se coordinan por WhatsApp y no bloquean horarios. */
const crypto = require("crypto");
const cfg = require("./_config");
const {busy, insertEvent} = require("./_google");
const {generate, limaToDate, dateLima, addDays} = require("./_slots");

const hits = new Map();                 /* límite simple por IP (por instancia; ver README para el Firewall de Vercel) */
function limitado(ip){
  const now = Date.now(), v = (hits.get(ip) || []).filter(t => now - t < 600000);
  v.push(now); hits.set(ip, v);
  if (hits.size > 5000) hits.clear();
  return v.length > 6;
}
const limpiar = (s, max) => String(s == null ? "" : s).replace(/[\u0000-\u001F\u007F]+/g, " ").trim().slice(0, max);
function origenOk(req){
  const o = req.headers.origin || "";
  const ok = cfg.allowedOrigins.concat((process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean));
  if (process.env.VERCEL_URL) ok.push("https://" + process.env.VERCEL_URL);
  return ok.includes(o);
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({error: "method"});
  if (!origenOk(req)) return res.status(403).json({error: "origin"});
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
  if (limitado(ip)) return res.status(429).json({error: "rate"});

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== "object") return res.status(400).json({error: "body"});
  if (b.website) return res.status(400).json({error: "spam"});

  const name = limpiar(b.name, 80), email = limpiar(b.email, 120).toLowerCase(), reason = limpiar(b.reason, 600);
  const lang = b.lang === "en" ? "en" : "es", tz = limpiar(b.tz, 60);
  if (name.length < 2 || reason.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({error: "datos"});
  const start = new Date(String(b.start));
  if (isNaN(start)) return res.status(400).json({error: "fecha"});

  try {
    /* El horario debe seguir siendo uno de los que realmente se ofrecen y estar libre AHORA */
    const dia = dateLima(start);
    if (dia > addDays(dateLima(new Date()), cfg.maxDaysAhead)) return res.status(400).json({error: "fecha"});
    const ocupado = await busy(limaToDate(dia, "00:00").toISOString(), limaToDate(addDays(dia, 1), "00:00").toISOString());
    const libres = (generate(dia, dia, ocupado)[dia] || []).map(Date.parse);
    if (!libres.includes(start.getTime())) return res.status(409).json({error: "taken"});

    const end = new Date(start.getTime() + cfg.durationMin * 60000);
    const ev = await insertEvent({
      summary: `${cfg.eventTitle[lang]} · ${name}`,
      description: `Reunión exploratoria gratuita (reserva web)\n\nNombre: ${name}\nCorreo: ${email}\nIdioma: ${lang}\nZona horaria del visitante: ${tz || "—"}\n\nMotivo:\n${reason}`,
      start: {dateTime: start.toISOString(), timeZone: cfg.timeZone},
      end: {dateTime: end.toISOString(), timeZone: cfg.timeZone},
      attendees: [{email, displayName: name}],
      guestsCanModify: false, guestsCanInviteOthers: false,
      reminders: {useDefault: true},
      extendedProperties: {private: {origen: "web-reservas", tipo: "gratuita"}},
      conferenceData: {createRequest: {requestId: crypto.randomUUID(), conferenceSolutionKey: {type: "hangoutsMeet"}}}
    });
    const meet = ev.hangoutLink || ((ev.conferenceData && ev.conferenceData.entryPoints) || []).filter(p => p.entryPointType === "video").map(p => p.uri)[0] || null;
    return res.status(200).json({ok: true, meetLink: meet});
  } catch (e) {
    console.error("book:", e.code || "", e.message);
    return res.status(503).json({error: "unavailable"});
  }
};
