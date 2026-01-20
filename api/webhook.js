// Token de verificación de Meta (configurado en variables de entorno de Vercel)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '1234';

// Token de acceso de Meta para enviar mensajes
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAARRcq0pgjkBQgHCZCsTMXtEoxccqdTZBNnGDpmOf0so5o1l6YgaFNSZBZBAni1WC4pF6kiHlYOZBrUOUrkrsLlx61bO025Kx6OfZCuaVlY4XkXu7apw8nHh7oK4Dd1zKCZA2auXc3dS5yHKlUEpUnxZCbYDX7vhWPCnZCDaXUGRpB5tKXmZBhSBpFtvczdBpaVwZDZD';

// ID del número de teléfono de WhatsApp Business (se obtiene de la configuración de Meta)
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';

// Función para manejar mensajes de Messenger
function handleMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text;

  console.log(`[Chatbot] Mensaje recibido de ${senderId}: ${messageText}`);

  // Aquí puedes agregar tu lógica de respuesta
  // Por ejemplo, enviar una respuesta automática
  // sendMessage(senderId, "Gracias por tu mensaje!");
}

// Función para enviar mensajes de WhatsApp usando la API de Meta
async function sendWhatsAppMessage(to, message) {
  try {
    // Si no hay PHONE_NUMBER_ID, intentamos obtenerlo del webhook o usar el valor por defecto
    const phoneNumberId = PHONE_NUMBER_ID || process.env.PHONE_NUMBER_ID || '';
    
    if (!phoneNumberId) {
      console.error('[Chatbot] PHONE_NUMBER_ID no configurado');
      return { success: false, error: 'PHONE_NUMBER_ID no configurado' };
    }

    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`[Chatbot] Mensaje enviado exitosamente a ${to}`);
      return { success: true, data };
    } else {
      console.error(`[Chatbot] Error al enviar mensaje:`, data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error(`[Chatbot] Error al enviar mensaje:`, error);
    return { success: false, error: error.message };
  }
}

// Función para manejar mensajes de WhatsApp Business API
async function handleWhatsAppMessage(message, value) {
  const from = message.from;
  const messageText = message.text?.body || '';
  const messageId = message.id;

  console.log(`[Chatbot] Mensaje de WhatsApp recibido de ${from}: ${messageText}`);

  // Obtener el PHONE_NUMBER_ID del webhook si no está configurado
  if (!PHONE_NUMBER_ID && value.metadata?.phone_number_id) {
    process.env.PHONE_NUMBER_ID = value.metadata.phone_number_id;
  }

  // Ejemplo: responder automáticamente
  // await sendWhatsAppMessage(from, "Gracias por tu mensaje!");
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
          // Guardar el PHONE_NUMBER_ID si está disponible
          if (change.value.metadata?.phone_number_id && !PHONE_NUMBER_ID) {
            process.env.PHONE_NUMBER_ID = change.value.metadata.phone_number_id;
            console.log(`[Chatbot] PHONE_NUMBER_ID detectado: ${change.value.metadata.phone_number_id}`);
          }
          
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
