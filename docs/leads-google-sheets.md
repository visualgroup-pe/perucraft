# Leads de la web → Google Sheet

Cada envío del **formulario de contacto** (`contact.html`) y cada **alta del
newsletter** (pie de página) se guarda como una fila nueva en un Google Sheet.
Si quieres, también llega un aviso por email.

Funciona con **Google Apps Script**: es gratis, no hace falta servidor y los
datos quedan en tu Google Drive.

## Instalación (una sola vez, unos 10 minutos)

1. **Crea la hoja.** En Google Drive: *Nuevo → Hojas de cálculo de Google*.
   Ponle un nombre, por ejemplo `PCE — Leads web`.
2. **Abre el editor de scripts.** Dentro de la hoja: *Extensiones → Apps Script*.
3. **Pega el código.** Borra lo que haya en `Código.gs` y pega todo el
   contenido de [`scripts/google-sheets-leads.gs`](../scripts/google-sheets-leads.gs).
   - Si quieres un email por cada lead, rellena `NOTIFY_EMAIL`, por ejemplo
     `const NOTIFY_EMAIL = "hello@perucraftedexperiences.com";`.
   - Guarda con el icono del disquete.
4. **Publícalo.** Pulsa *Implementar → Nueva implementación*, luego el engranaje
   y elige *Aplicación web*:
   - **Ejecutar como:** *Yo* (tu cuenta).
   - **Quién tiene acceso:** *Cualquier usuario*. Es obligatorio, porque los
     visitantes de la web envían sin iniciar sesión. Solo pueden *añadir*
     filas; nadie puede leer la hoja.
   - Pulsa *Implementar* y autoriza los permisos que pide Google: tu hoja y,
     si activaste el aviso, enviar emails. Si sale "Google no ha verificado esta
     aplicación", pulsa *Configuración avanzada → Ir a … (no seguro)*: la
     aplicación es tuya.
5. **Copia la URL** de la aplicación web. Termina en `/exec`.
   Para comprobarla, ábrela en el navegador: debe decir `PCE leads endpoint: OK`.
6. **Conéctala a la web.** Pega la URL en `main.js`:
   ```js
   var LEADS_SHEET_ENDPOINT = "https://script.google.com/macros/s/XXXX/exec";
   ```
   (o pásasela a quien mantenga la web) y publica el cambio.

La primera vez que llegue un lead, el script crea la pestaña **Leads** con
estas columnas: Fecha, Tipo, Nombre, Email, Ciudad / país, Fechas de viaje,
Viajeros, Intereses, Alojamiento, Viaje, Mensaje, Consentimiento, Página y
Estado. La columna *Estado* empieza en "Nuevo" y es para tu seguimiento.

## Cómo se comporta la web

| `LEADS_SHEET_ENDPOINT` | Formulario de contacto | Newsletter |
|---|---|---|
| vacío | abre WhatsApp con el mensaje (como antes) | abre un email a Patricia (como antes) |
| con la URL | guarda en la hoja y muestra "Thank you…" | guarda en la hoja como `newsletter` |

Si el envío falla, el visitante ve un mensaje con enlaces a WhatsApp y al
email, así que el lead no se pierde.

**Antispam:** los dos formularios llevan un campo oculto ("honeypot"). Los
bots lo rellenan y esos envíos se descartan sin guardarse.

## Cambiar el script más adelante

Edita el código en Apps Script y luego ve a *Implementar → Gestionar
implementaciones → editar (lápiz) → Versión: Nueva versión → Implementar*.
Así **la URL no cambia** y no hay que tocar la web.
