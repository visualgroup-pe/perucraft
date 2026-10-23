/* ============================================================================
   google-sheets-leads.gs — Perú Crafted Experiences
   Guarda en un Google Sheet cada lead que llega desde la web
   (formulario de contacto y altas del newsletter) y, opcionalmente,
   avisa por email.

   Se pega en el editor de Apps Script DEL PROPIO Google Sheet
   (Extensiones → Apps Script) y se publica como "Aplicación web".
   Paso a paso: docs/leads-google-sheets.md
   ========================================================================== */

// Email que recibe un aviso por cada lead nuevo. Déjalo vacío ("") para no avisar.
const NOTIFY_EMAIL = "";

// Nombre de la pestaña donde se guardan los leads (se crea sola si no existe).
const SHEET_NAME = "Leads";

// Columnas de la hoja: [título visible, nombre del campo que envía la web].
const COLUMNS = [
  ["Fecha",            null],          // la pone el script
  ["Tipo",             "type"],        // enquiry | newsletter
  ["Nombre",           "name"],
  ["Email",            "email"],
  ["Ciudad / país",    "location"],
  ["Fechas de viaje",  "when"],
  ["Viajeros",         "party"],
  ["Intereses",        "interests"],
  ["Alojamiento",      "accommodation"],
  ["Viaje",            "journey"],
  ["Mensaje",          "message"],
  ["Consentimiento",   "consent"],
  ["Página",           "page"],
  ["Estado",           null],          // para tu seguimiento (Nuevo, Contactado, …)
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const p = (e && e.parameter) || {};
    const multi = (e && e.parameters) || {};

    // honeypot: los bots rellenan el campo oculto "website" → se ignora en silencio
    if (p.website) return json_({ ok: true });

    const email = String(p.email || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json_({ ok: false, error: "invalid_email" });

    const value = function (field) {
      if (field === "interests") return (multi.interests || []).join(", ");
      if (field === "consent") return p.consent ? "Sí" : "";
      if (field === "email") return email;
      return p[field] || "";
    };
    const row = COLUMNS.map(function (c, i) {
      if (i === 0) return new Date();
      if (c[0] === "Estado") return "Nuevo";
      return clean_(value(c[1]));
    });
    sheet_().appendRow(row);

    if (NOTIFY_EMAIL) notify_(row, email);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "server_error" });
  } finally {
    lock.releaseLock();
  }
}

// Abrir la URL /exec en el navegador muestra esto: sirve para comprobar que está publicada.
function doGet() {
  return ContentService.createTextOutput("PCE leads endpoint: OK");
}

/* ---------- helpers ---------- */
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS.map(function (c) { return c[0]; }));
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

// Recorta textos larguísimos y evita que un texto que empieza por = + - @
// se interprete como fórmula de la hoja (inyección de fórmulas).
function clean_(v) {
  let s = String(v).slice(0, 5000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function notify_(row, email) {
  const lines = COLUMNS.map(function (c, i) {
    const v = i === 0 ? Utilities.formatDate(row[0], "Europe/London", "dd/MM/yyyy HH:mm") : row[i];
    return v ? c[0] + ": " + v : null;
  }).filter(Boolean);
  const name = row[2] || email;
  const type = row[1] === "newsletter" ? "Nueva alta al newsletter" : "Nuevo lead";
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: email,
    subject: type + " — " + name,
    body: lines.join("\n") + "\n\nHoja: " + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
