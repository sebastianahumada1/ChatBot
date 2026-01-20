// Token de verificación de Meta (configurado en variables de entorno de Vercel)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'tu_token_secreto_aqui';

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

// Handler principal del webhook (compatible con Vercel Serverless Functions)
export default async function handler(req, res) {
  // Webhook para verificación (GET)
  // Meta enviará una petición GET para verificar el webhook
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verifica que el token coincida
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Chatbot] Webhook verificado correctamente');
      return res.status(200).send(challenge);
    } else {
      console.log('[Chatbot] Error en la verificación del webhook');
      return res.status(403).send('Forbidden');
    }
  }

  // Webhook para recibir mensajes (POST)
  // Meta enviará los mensajes aquí
  if (req.method === 'POST') {
    const body = req.body;

    console.log('[Chatbot] Webhook recibido:', JSON.stringify(body, null, 2));

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

      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.status(404).send('Not Found');
    }
  }

  // Método no permitido
  return res.status(405).send('Method Not Allowed');
}
