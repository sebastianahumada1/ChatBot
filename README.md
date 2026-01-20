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
   - Agrega: `VERIFY_TOKEN` = `tu_token_secreto_aqui`
   - Guarda y redepleya si es necesario

5. **Obtener la URL del webhook:**
   Después del despliegue, Vercel te dará una URL como:
   ```
   https://tu-proyecto.vercel.app/webhook
   ```

6. **Configurar en Meta Developer Console:**
   - Ve a tu app en [Meta for Developers](https://developers.facebook.com/)
   - Ve a la sección de Webhooks
   - Ingresa la URL: `https://tu-proyecto.vercel.app/webhook`
   - Ingresa el `VERIFY_TOKEN` que configuraste en Vercel
   - Selecciona los eventos que quieres suscribir (messages, messaging_postbacks, etc.)

### URL del Webhook para Meta:

```
https://tu-proyecto.vercel.app/webhook
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

### Estructura del Webhook:

- **GET /webhook**: Verificación del webhook por parte de Meta
- **POST /webhook**: Recibe los mensajes y eventos de Meta

### Notas:

- El webhook debe ser HTTPS (Vercel lo proporciona automáticamente)
- El token de verificación debe coincidir exactamente
- El servidor debe responder rápidamente (menos de 20 segundos)
- Vercel usa serverless functions, perfecto para webhooks
