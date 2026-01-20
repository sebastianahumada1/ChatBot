// Página de inicio/información del webhook
export default function handler(req, res) {
  const webhookUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/webhook`
    : 'https://tu-proyecto.vercel.app/webhook';

  return res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Chatbot Meta - Webhook Activo</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #1877f2;
          margin-top: 0;
        }
        .webhook-url {
          background: #f0f0f0;
          padding: 15px;
          border-radius: 5px;
          font-family: monospace;
          word-break: break-all;
          margin: 20px 0;
        }
        .status {
          color: #42b72a;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 Chatbot Meta - Webhook Activo</h1>
        <p class="status">✅ El webhook está funcionando correctamente.</p>
        <p><strong>URL del Webhook para Meta:</strong></p>
        <div class="webhook-url">${webhookUrl}</div>
        <p>Usa esta URL en la configuración de tu app de Meta.</p>
      </div>
    </body>
    </html>
  `);
}
