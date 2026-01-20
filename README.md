# Chatbot para Meta (WhatsApp/Messenger)

## 🚀 Despliegue en Vercel

### Pasos para subir a Vercel:

1. **Instalar Vercel CLI (si no lo tienes):**
   ```bash
   npm i -g vercel
   ```

2. **Iniciar sesión en Vercel:**
   ```bash
   vercel login
   ```

3. **Desplegar el proyecto:**
   ```bash
   vercel
   ```
   O si prefieres hacerlo desde la interfaz web:
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub/GitLab/Bitbucket
   - O arrastra la carpeta del proyecto

4. **Configurar variables de entorno en Vercel:**
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Environment Variables
   - Agrega las siguientes variables:
     - `VERIFY_TOKEN` = `1234` (token de verificación del webhook)
     - `META_ACCESS_TOKEN` = (token de acceso continuo de Meta - ver instrucciones abajo)
     - `PHONE_NUMBER_ID` = `893259217214880` (ID del número de teléfono de WhatsApp Business)
   - Guarda y redepleya si es necesario

### 🔑 Generar Token de Acceso Continuo (Larga Duración)

Para usar un token que no expire, sigue estos pasos:

1. **Ve a Meta Developer Console:**
   - [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
   - Selecciona tu aplicación

2. **Genera un System User Token:**
   - Ve a **Tools** → **System Users**
   - Si no tienes uno, crea un System User nuevo
   - Click en **Generate New Token**
   - Selecciona los permisos:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
   - Click en **Generate Token**
   - **IMPORTANTE:** Copia el token inmediatamente (solo se muestra una vez)

3. **O usa Graph API Explorer:**
   - Ve a **Tools** → **Graph API Explorer**
   - Selecciona tu aplicación
   - En "Permissions", selecciona:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
   - Click en **Generate Access Token**
   - Copia el token generado

4. **Para tokens de larga duración:**
   - El token de System User puede durar hasta 60 días sin expirar
   - O puedes configurarlo para que no expire en **Settings** → **Advanced** → **Access Tokens**
   - Los tokens de System User son ideales para producción

5. **Actualiza el token en Vercel:**
   - Copia el nuevo token
   - Ve a Vercel → Settings → Environment Variables
   - Actualiza `META_ACCESS_TOKEN` con el nuevo token
   - Guarda y redeploya

5. **Obtener la URL del webhook:**
   Después del despliegue, Vercel te dará una URL como:
   ```
   https://chat-bot-beta-ten.vercel.app/webhook
   ```

6. **Configurar en Meta Developer Console:**
   - Ve a tu app en [Meta for Developers](https://developers.facebook.com/)
   - Ve a la sección de Webhooks
   - Ingresa la URL: `https://chat-bot-beta-ten.vercel.app/webhook`
   - Ingresa el `VERIFY_TOKEN`: `1234`
   - Selecciona los eventos que quieres suscribir (messages, messaging_postbacks, etc.)

### URL del Webhook para Meta:

```
https://chat-bot-beta-ten.vercel.app/webhook
```

## 📤 Enviar Mensajes

### Endpoint para enviar mensajes:

```
GET o POST https://chat-bot-beta-ten.vercel.app/send-message
```

**Parámetros:**
- `to` (opcional): Número de teléfono (por defecto: `573502053858`)
- `message` (opcional): Mensaje a enviar (por defecto: `hola`)

**Ejemplos:**

```bash
# Enviar "hola" al número por defecto
curl https://chat-bot-beta-ten.vercel.app/send-message

# Enviar mensaje personalizado
curl "https://chat-bot-beta-ten.vercel.app/send-message?to=573502053858&message=Hola desde el chatbot"

# Usando POST
curl -X POST https://chat-bot-beta-ten.vercel.app/send-message \
  -H "Content-Type: application/json" \
  -d '{"to": "573502053858", "message": "Hola desde el chatbot"}'
```

## 🛠️ Desarrollo Local

Si quieres probar localmente antes de desplegar:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   - Crea un archivo `.env` con: `VERIFY_TOKEN=tu_token_secreto_aqui`

3. **Iniciar el servidor:**
   ```bash
   npm start
   ```
   O para desarrollo con auto-reload:
   ```bash
   npm run dev
   ```

4. **Para desarrollo local, usar ngrok:**
   ```bash
   ngrok http 3000
   ```
   Esto te dará una URL pública como: `https://xxxx.ngrok.io/webhook`

### Estructura de Endpoints:

- **GET /webhook**: Verificación del webhook por parte de Meta
- **POST /webhook**: Recibe los mensajes y eventos de Meta
- **GET /send-message**: Envía un mensaje de WhatsApp (parámetros: `to`, `message`)
- **POST /send-message**: Envía un mensaje de WhatsApp (body: `{to, message}`)

### Notas:

- El webhook debe ser HTTPS (Vercel lo proporciona automáticamente)
- El token de verificación debe coincidir exactamente
- El servidor debe responder rápidamente (menos de 20 segundos)
- Vercel usa serverless functions, perfecto para webhooks
