const cfg = require("./_config");

const pad = n => String(n).padStart(2, "0");
const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const parts = s => s.split("-").map(Number);
const limaToDate = (fecha, hhmm) => {
  const [y, m, d] = parts(fecha), [h, mi] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, h - cfg.utcOffsetHours, mi));
};
const dateLima = date => { const t = new Date(date.getTime() + cfg.utcOffsetHours * 3600000); return ymd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); };
const addDays = (s, n) => { const [y, m, d] = parts(s); const t = new Date(Date.UTC(y, m - 1, d + n)); return ymd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); };
const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && dateLima(limaToDate(s, "12:00")) === s;

/* Horarios libres (ISO UTC) por fecha de Lima, entre `from` y `to` (inclusive). `busy` = [{start,end}] en ms. */
function generate(from, to, busy, now){
  const out = {}, dur = cfg.durationMin * 60000, buf = cfg.bufferMin * 60000;
  const earliest = (now || Date.now()) + cfg.minNoticeHours * 3600000;
  for (let f = from; f <= to; f = addDays(f, 1)){
    const dow = new Date(Date.UTC(...parts(f).map((v, i) => i === 1 ? v - 1 : v))).getUTCDay();
    const list = [];
    for (const [a, b] of (cfg.weekly[dow] || [])){
      const end = limaToDate(f, b).getTime();
      for (let t = limaToDate(f, a).getTime(); t + dur <= end; t += cfg.stepMin * 60000){
        if (t < earliest) continue;
        if (busy.some(x => t < x.end + buf && t + dur + buf > x.start)) continue;
        list.push(new Date(t).toISOString());
      }
    }
    if (list.length) out[f] = list;
  }
  return out;
}

module.exports = {generate, limaToDate, dateLima, addDays, validDate};
