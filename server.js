const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Token de verificación de Meta (debes configurarlo en tu app de Meta)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'tu_token_secreto_aqui';

// Webhook para verificación (GET)
// Meta enviará una petición GET para verificar el webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verifica que el token coincida
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado correctamente');
    res.status(200).send(challenge);
  } else {
    console.log('Error en la verificación del webhook');
    res.sendStatus(403);
  }
});

// Webhook para recibir mensajes (POST)
// Meta enviará los mensajes aquí
app.post('/webhook', (req, res) => {
  const body = req.body;

  console.log('Webhook recibido:', JSON.stringify(body, null, 2));

  // Verifica que es un evento de webhook válido
  if (body.object === 'whatsapp_business_account' || body.object === 'page') {
    // Procesa cada entrada del webhook
    body.entry?.forEach((entry) => {
      // Procesa cada mensaje
      entry.messaging?.forEach((event) => {
        if (event.message) {
          handleMessage(event);
        }
      });

      // Para WhatsApp Business API
      entry.changes?.forEach((change) => {
        if (change.value.messages) {
          change.value.messages.forEach((message) => {
            handleWhatsAppMessage(message, change.value);
          });
        }
      });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Función para manejar mensajes de Messenger
function handleMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text;

  console.log(`[Chatbot] Mensaje recibido de ${senderId}: ${messageText}`);

  // Aquí puedes agregar tu lógica de respuesta
  // Por ejemplo, enviar una respuesta automática
  // sendMessage(senderId, "Gracias por tu mensaje!");
}

// Función para manejar mensajes de WhatsApp Business API
function handleWhatsAppMessage(message, value) {
  const from = message.from;
  const messageText = message.text?.body || '';
  const messageId = message.id;

  console.log(`[Chatbot] Mensaje de WhatsApp recibido de ${from}: ${messageText}`);

  // Aquí puedes agregar tu lógica de respuesta
  // Por ejemplo, enviar una respuesta automática
  // sendWhatsAppMessage(from, "Gracias por tu mensaje!");
}

// Ruta de prueba
app.get('/', (req, res) => {
  res.send(`
    <h1>Chatbot Meta - Webhook Activo</h1>
    <p>El webhook está funcionando correctamente.</p>
    <p><strong>URL del Webhook:</strong> https://tu-dominio.com/webhook</p>
    <p><strong>Para desarrollo local con ngrok:</strong> https://xxxx.ngrok.io/webhook</p>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`[Chatbot] Servidor corriendo en el puerto ${PORT}`);
  console.log(`[Chatbot] Webhook URL: http://localhost:${PORT}/webhook`);
});
