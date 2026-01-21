// Token de verificación de Meta (configurado en variables de entorno de Vercel)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '1234';

// Token de acceso de Meta para enviar mensajes (desde variables de entorno)
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';

// ID del número de teléfono de WhatsApp Business
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '893259217214880';

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
    const accessToken = process.env.META_ACCESS_TOKEN || META_ACCESS_TOKEN;
    const phoneNumberId = process.env.PHONE_NUMBER_ID || PHONE_NUMBER_ID;
    
    if (!accessToken) {
      console.error('[Chatbot] META_ACCESS_TOKEN no configurado');
      return { success: false, error: 'META_ACCESS_TOKEN no configurado' };
    }
    
    if (!phoneNumberId) {
      console.error('[Chatbot] PHONE_NUMBER_ID no configurado');
      return { success: false, error: 'PHONE_NUMBER_ID no configurado' };
    }

    // Usar la versión v22.0 de la API
    const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
    
    console.log(`[Chatbot] Enviando mensaje a ${to}...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`[Chatbot] Mensaje enviado exitosamente a ${to}:`, data);
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
  const messageType = message.type;

  console.log(`[Chatbot] Mensaje de WhatsApp recibido:`);
  console.log(`  - De: ${from}`);
  console.log(`  - Tipo: ${messageType}`);
  console.log(`  - Contenido: ${messageText}`);
  console.log(`  - ID: ${messageId}`);

  // Obtener el PHONE_NUMBER_ID del webhook si está disponible
  if (value.metadata?.phone_number_id) {
    const detectedPhoneId = value.metadata.phone_number_id;
    if (!process.env.PHONE_NUMBER_ID) {
      process.env.PHONE_NUMBER_ID = detectedPhoneId;
      console.log(`[Chatbot] PHONE_NUMBER_ID detectado: ${detectedPhoneId}`);
    }
  }

  // Procesar solo mensajes de texto por ahora
  if (messageType === 'text' && messageText) {
    // Convertir el mensaje a minúsculas para comparación
    const lowerMessage = messageText.toLowerCase().trim();
    
    // Respuestas automáticas simples
    let response = null;
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      response = '¡Hola! ¿En qué puedo ayudarte?';
    } else if (lowerMessage.includes('adios') || lowerMessage.includes('bye') || lowerMessage.includes('chao')) {
      response = '¡Hasta luego! Que tengas un buen día.';
    } else if (lowerMessage.includes('gracias') || lowerMessage.includes('thank')) {
      response = '¡De nada! Estoy aquí para ayudarte.';
    } else {
      // Respuesta por defecto
      response = `Gracias por tu mensaje: "${messageText}". ¿En qué más puedo ayudarte?`;
    }
    
    // Enviar respuesta automática
    if (response) {
      console.log(`[Chatbot] Enviando respuesta a ${from}: ${response}`);
      const result = await sendWhatsAppMessage(from, response);
      
      if (result.success) {
        console.log(`[Chatbot] Respuesta enviada exitosamente`);
      } else {
        console.error(`[Chatbot] Error al enviar respuesta:`, result.error);
      }
    }
  } else if (messageType !== 'text') {
    console.log(`[Chatbot] Mensaje de tipo ${messageType} recibido (no procesado aún)`);
  }

  // Aquí puedes agregar más lógica personalizada
  // Por ejemplo: guardar en base de datos, integrar con IA, etc.
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

    console.log('[Chatbot] ===== WEBHOOK RECIBIDO =====');
    console.log('[Chatbot] Method:', req.method);
    console.log('[Chatbot] Body existe:', !!body);
    console.log('[Chatbot] Body type:', typeof body);
    console.log('[Chatbot] Body completo:', JSON.stringify(body, null, 2));
    console.log('[Chatbot] Object type:', body?.object);

    // Verifica que es un evento de webhook válido
    if (body.object === 'whatsapp_business_account' || body.object === 'page') {
      console.log('[Chatbot] Object válido detectado:', body.object);
      console.log('[Chatbot] Número de entries:', body.entry?.length || 0);
      
      // Procesa cada entrada del webhook
      body.entry?.forEach((entry, index) => {
        console.log(`[Chatbot] --- Procesando entry ${index + 1} ---`);
        console.log('[Chatbot] Entry ID:', entry.id);
        console.log('[Chatbot] Entry keys:', Object.keys(entry));
        
        // Procesa cada mensaje (para Messenger)
        if (entry.messaging) {
          console.log('[Chatbot] Entry tiene messaging:', entry.messaging.length);
          entry.messaging.forEach((event) => {
            if (event.message) {
              console.log('[Chatbot] Mensaje de Messenger detectado');
              handleMessage(event);
            }
          });
        } else {
          console.log('[Chatbot] Entry NO tiene messaging');
        }

        // Para WhatsApp Business API
        if (entry.changes && entry.changes.length > 0) {
          console.log('[Chatbot] Entry tiene', entry.changes.length, 'change(s)');
          entry.changes.forEach((change, changeIndex) => {
            console.log(`[Chatbot] --- Change ${changeIndex + 1} ---`);
            console.log('[Chatbot] Change field:', change.field);
            console.log('[Chatbot] Change value keys:', Object.keys(change.value || {}));
            console.log('[Chatbot] Change value completo:', JSON.stringify(change.value, null, 2));
            
            // Guardar el PHONE_NUMBER_ID si está disponible
            if (change.value.metadata?.phone_number_id) {
              const detectedPhoneId = change.value.metadata.phone_number_id;
              console.log(`[Chatbot] PHONE_NUMBER_ID detectado: ${detectedPhoneId}`);
            }
            
            // Procesar mensajes entrantes
            if (change.value.messages && Array.isArray(change.value.messages)) {
              console.log(`[Chatbot] ✓ ${change.value.messages.length} mensaje(s) detectado(s)`);
              change.value.messages.forEach((message, msgIndex) => {
                console.log(`[Chatbot] Procesando mensaje ${msgIndex + 1}`);
                handleWhatsAppMessage(message, change.value);
              });
            } else {
              console.log('[Chatbot] ✗ No se encontraron mensajes en change.value.messages');
              console.log('[Chatbot] Change.value tiene:', Object.keys(change.value || {}));
              
              // Verificar si hay mensajes en otro lugar
              if (change.value.messaging) {
                console.log('[Chatbot] Se encontró change.value.messaging');
                console.log('[Chatbot] Messaging:', JSON.stringify(change.value.messaging, null, 2));
              }
            }
            
            // También verificar statuses si existe
            if (change.value.statuses) {
              console.log('[Chatbot] Statuses detectados:', JSON.stringify(change.value.statuses, null, 2));
            }
            
            // Verificar contacts
            if (change.value.contacts) {
              console.log('[Chatbot] Contacts detectados:', JSON.stringify(change.value.contacts, null, 2));
            }
          });
        } else {
          console.log('[Chatbot] ✗ Entry NO tiene changes');
          console.log('[Chatbot] Entry completo:', JSON.stringify(entry, null, 2));
        }
      });

      console.log('[Chatbot] ===== FIN WEBHOOK =====');
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      console.log('[Chatbot] Webhook no reconocido. Object:', body.object);
      return res.status(404).send('Not Found');
    }
  }

  // Método no permitido
  return res.status(405).send('Method Not Allowed');
}
