/* Cliente mínimo de Google Calendar (sin dependencias). Credenciales SOLO desde variables de entorno. */
const CAL = "https://www.googleapis.com/calendar/v3";
let cache = null;

function env(k){
  const v = process.env[k];
  if (!v) throw Object.assign(new Error("Falta la variable de entorno " + k), {code: "config"});
  return v;
}
const calendarId = () => process.env.GOOGLE_CALENDAR_ID || "primary";

async function accessToken(){
  if (cache && cache.exp > Date.now() + 60000) return cache.token;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: new URLSearchParams({
      client_id: env("GOOGLE_CLIENT_ID"),
      client_secret: env("GOOGLE_CLIENT_SECRET"),
      refresh_token: env("GOOGLE_REFRESH_TOKEN"),
      grant_type: "refresh_token"
    })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw Object.assign(new Error("OAuth: " + (j.error || r.status)), {code: "auth"});
  cache = {token: j.access_token, exp: Date.now() + (j.expires_in || 3000) * 1000};
  return cache.token;
}

async function call(path, init){
  const r = await fetch(CAL + path, Object.assign({}, init, {
    headers: Object.assign({Authorization: "Bearer " + await accessToken(), "Content-Type": "application/json"}, init && init.headers)
  }));
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error("Calendar " + r.status + ": " + JSON.stringify(j.error || j)), {code: "calendar", status: r.status});
  return j;
}

/* Intervalos ocupados [{start:ms,end:ms}] entre dos instantes */
async function busy(minISO, maxISO){
  const id = calendarId();
  const j = await call("/freeBusy", {method: "POST", body: JSON.stringify({timeMin: minISO, timeMax: maxISO, items: [{id}]})});
  const c = j.calendars && j.calendars[id];
  if (!c || (c.errors && c.errors.length)) throw Object.assign(new Error("freeBusy sin acceso al calendario"), {code: "calendar"});
  return (c.busy || []).map(b => ({start: Date.parse(b.start), end: Date.parse(b.end)}));
}

async function insertEvent(body){
  return call(`/calendars/${encodeURIComponent(calendarId())}/events?conferenceDataVersion=1&sendUpdates=all`, {method: "POST", body: JSON.stringify(body)});
}

module.exports = {busy, insertEvent};
