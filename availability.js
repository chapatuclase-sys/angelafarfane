/* GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD → horarios reales libres de la reunión gratuita */
const cfg = require("./_config");
const {busy} = require("./_google");
const {generate, limaToDate, dateLima, addDays, validDate} = require("./_slots");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "public, s-maxage=20, stale-while-revalidate=40");
  if (req.method !== "GET") return res.status(405).json({error: "method"});
  try {
    const hoy = dateLima(new Date());
    const max = addDays(hoy, cfg.maxDaysAhead);
    let {from, to} = req.query || {};
    if (!validDate(from) || !validDate(to)) return res.status(400).json({error: "fechas"});
    if (from < hoy) from = hoy;
    if (to > max) to = max;
    if (from > to) return res.status(200).json({tz: cfg.timeZone, duration: cfg.durationMin, maxDate: max, slots: {}});
    if (Date.parse(to) - Date.parse(from) > 62 * 86400000) return res.status(400).json({error: "rango"});

    const ocupado = await busy(limaToDate(from, "00:00").toISOString(), limaToDate(addDays(to, 1), "00:00").toISOString());
    return res.status(200).json({tz: cfg.timeZone, duration: cfg.durationMin, maxDate: max, slots: generate(from, to, ocupado)});
  } catch (e) {
    console.error("availability:", e.code || "", e.message);
    return res.status(503).json({error: "unavailable"});
  }
};
