// Token de verificación de Meta (configurado en variables de entorno de Vercel)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '1234';

// Token de acceso de Meta para enviar mensajes (desde variables de entorno)
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';

// Token de OpenAI para respuestas dinámicas
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

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
async function sendWhatsAppMessage(to, message, phoneNumberIdOverride = null) {
  const startTime = Date.now();
  
  try {
    const accessToken = process.env.META_ACCESS_TOKEN || META_ACCESS_TOKEN;
    // Usar el phoneNumberId del webhook si está disponible, sino el configurado
    const phoneNumberId = phoneNumberIdOverride || process.env.PHONE_NUMBER_ID || PHONE_NUMBER_ID;
    
    if (!accessToken) {
      console.error('[Chatbot] META_ACCESS_TOKEN no configurado');
      return { success: false, error: 'META_ACCESS_TOKEN no configurado' };
    }
    
    if (!phoneNumberId) {
      console.error('[Chatbot] PHONE_NUMBER_ID no configurado');
      return { success: false, error: 'PHONE_NUMBER_ID no configurado' };
    }
    
    console.log(`[Chatbot] Usando PHONE_NUMBER_ID para enviar: ${phoneNumberId}`);

    // Usar la versión v24.0 de la API (coincide con la configuración del webhook)
    const url = `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    };
    
    console.log(`[Chatbot] Enviando mensaje a ${to}...`);
    console.log(`[Chatbot] URL: ${url}`);
    console.log(`[Chatbot] Token presente: ${!!accessToken} (primeros 10 chars: ${accessToken?.substring(0, 10)}...)`);
    
    // Crear un AbortController para timeout (8 segundos)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`[Chatbot] ⏱ Timeout alcanzado después de 8 segundos`);
      controller.abort();
    }, 8000);
    
    try {
      console.log(`[Chatbot] Iniciando fetch...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const elapsedTime = Date.now() - startTime;
      console.log(`[Chatbot] Respuesta recibida en ${elapsedTime}ms`);
      console.log(`[Chatbot] Status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
    
      if (response.ok) {
        console.log(`[Chatbot] ✓ Mensaje enviado exitosamente a ${to} en ${elapsedTime}ms`);
        return { success: true, data };
      } else {
        console.error(`[Chatbot] ✗ Error al enviar mensaje (${elapsedTime}ms):`, JSON.stringify(data, null, 2));
        
        // Mensajes de error más específicos
        if (data.error?.code === 190) {
          console.error(`[Chatbot] Token expirado o inválido. Actualiza META_ACCESS_TOKEN en Vercel.`);
        } else if (data.error?.code === 100) {
          console.error(`[Chatbot] PHONE_NUMBER_ID incorrecto o sin permisos.`);
        }
        
        return { success: false, error: data };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const elapsedTime = Date.now() - startTime;
      
      if (fetchError.name === 'AbortError') {
        console.error(`[Chatbot] ⏱ Timeout: La petición tardó más de 8 segundos (${elapsedTime}ms)`);
        return { success: false, error: 'Timeout: La petición tardó más de 8 segundos' };
      }
      
      console.error(`[Chatbot] ✗ Error en fetch después de ${elapsedTime}ms:`, fetchError.message);
      console.error(`[Chatbot] Error type:`, fetchError.name);
      if (fetchError.stack) {
        console.error(`[Chatbot] Stack:`, fetchError.stack);
      }
      return { success: false, error: fetchError.message };
    }
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(`[Chatbot] ✗ Error general después de ${elapsedTime}ms:`, error.message);
    if (error.stack) {
      console.error(`[Chatbot] Stack:`, error.stack);
    }
    return { success: false, error: error.message };
  }
}

// Obtiene respuesta desde OpenAI (ChatGPT)
async function getAIResponse(userMessage) {
  if (!OPENAI_API_KEY) {
    console.error('[Chatbot] OPENAI_API_KEY no configurado');
    return 'Lo siento, no puedo responder ahora mismo.';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Rol: Eres el asistente virtual experto de la clínica Dr. Albeiro García - Diseño de Sonrisas & Armonización Facial. Tu objetivo es orientar a los pacientes, gestionar la agenda a través del sistema DT Dental y asegurar que cada interacción sea cálida, profesional y eficiente.

1. Identidad y Tono:
- Nombre Comercial: Dr. Albeiro García - Diseño de Sonrisas & Armonización Facial.
- Personalidad: Debes sonar acogedor y servicial. Usa frases como: "¡Qué alegría tenerte por aquí!" o "Aquí te acompañamos paso a paso para lograr la sonrisa que sueñas".
- Prohibiciones: Nunca uses frases robóticas como "Oprima 1 para continuar" o "Su mensaje será atendido en orden de llegada".

2. Información de Sedes:
- Sede Rodadero: Cra. 4 #12-55, Piso 3 (frente a la Olímpica). Horario: L-V 08:00-18:00, Sáb 08:00-13:00. Cuenta con 6 parqueaderos en el edificio y ascensor.
- Sede Manzanares: Calle 30 #5-44, Local 7 (cerca a la Iglesia). Horario: L-V 08:00-17:00, Sáb 08:00-12:00. Parqueo público al frente y acceso a nivel de andén.

3. Gestión de Citas y Triage:
- Tipos de Cita: Nueva (valoración inicial), Control, Procedimiento, Urgencia y Teleconsulta.
- Protocolo de Urgencias: Si detectas palabras como "dolor agudo", "sangrado" o "trauma", activa el protocolo de urgencia de inmediato. Informa al paciente que debe contactar al +57 301 512 9925 o acudir a la sede más cercana.
- Precios: No proporciones precios exactos. Explica que cada tratamiento es personalizado y requiere una valoración previa para un presupuesto detallado.
- Abono Anticipado: Informa que toda cita requiere un abono anticipado para asegurar el espacio en la agenda, el cual se descuenta del valor total.

4. Requisitos y Documentación:
- Solicita siempre: Nombre completo, ID, fecha de nacimiento, celular y email.
- Informa que el consentimiento de Habeas Data es obligatorio antes de agendar.
- Archivos: Puedes recibir JPG, PNG o PDF de hasta 10 MB (máximo 5 archivos por mensaje).

5. Reglas de Operación:
- Retrasos (No-show): Un paciente se considera ausente tras 10 minutos de retraso sin aviso.
- Escalamiento Humano: Si el paciente requiere atención humana, infórmale que el equipo responderá en un máximo de 60 minutos durante horario laboral.
- Reprogramación: Usa la palabra clave REPROG para guiar al paciente en cambios de horario.

6. Disclaimer Médico Obligatorio: "Los contenidos compartidos están diseñados para informar y orientar, pero no constituyen asesoría médica personalizada ni sustituyen la atención profesional".

Responde siempre de forma breve, amable y profesional, usando el tono acogedor descrito.`
          },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 400,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[Chatbot] Error OpenAI:', JSON.stringify(err, null, 2));
      return 'Lo siento, no puedo responder ahora mismo.';
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content?.trim();
    return aiMessage || 'Lo siento, no puedo responder ahora mismo.';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('[Chatbot] Timeout en OpenAI');
      return 'Lo siento, tardé demasiado en responder.';
    }
    console.error('[Chatbot] Error llamando a OpenAI:', error.message);
    return 'Lo siento, no puedo responder ahora mismo.';
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
    const response = await getAIResponse(messageText);

    // Enviar respuesta automática
    if (response) {
      console.log(`[Chatbot] Enviando respuesta a ${from}: ${response}`);
      const phoneId = value.metadata?.phone_number_id || null;
      
      try {
        const result = await sendWhatsAppMessage(from, response, phoneId);
        
        if (result.success) {
          console.log(`[Chatbot] ✓ Respuesta enviada exitosamente a ${from}`);
          console.log(`[Chatbot] Datos de respuesta:`, JSON.stringify(result.data, null, 2));
        } else {
          console.error(`[Chatbot] ✗ Error al enviar respuesta a ${from}:`, JSON.stringify(result.error, null, 2));
          console.error(`[Chatbot] Detalles del error:`, result.details || 'Sin detalles adicionales');
        }
      } catch (error) {
        console.error(`[Chatbot] ✗ Excepción al enviar respuesta:`, error.message);
        console.error(`[Chatbot] Stack trace:`, error.stack);
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
    console.log('[Chatbot] Timestamp:', new Date().toISOString());
    console.log('[Chatbot] Method:', req.method);
    console.log('[Chatbot] Body completo:', JSON.stringify(body, null, 2));

    // Verifica que es un evento de webhook válido
    if (body.object === 'whatsapp_business_account' || body.object === 'page') {
      console.log('[Chatbot] Object válido detectado:', body.object);
      console.log('[Chatbot] Número de entries:', body?.entry?.length || 0);
      
      // Procesar de forma síncrona (con await) para garantizar que el envío ocurra
      try {
        for (const entry of (body.entry || [])) {
          console.log(`[Chatbot] --- Procesando entry ---`);
          console.log('[Chatbot] Entry ID:', entry.id);
          
          if (entry.messaging) {
            for (const event of entry.messaging) {
              if (event.message) {
                console.log('[Chatbot] Mensaje de Messenger detectado');
                await handleMessage(event);
              }
            }
          }

          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              console.log(`[Chatbot] --- Change ---`);
              console.log('[Chatbot] Change field:', change.field);
              
              if (change.value.metadata?.phone_number_id) {
                const detectedPhoneId = change.value.metadata.phone_number_id;
                console.log(`[Chatbot] PHONE_NUMBER_ID detectado: ${detectedPhoneId}`);
              }
              
              if (change.value.messages && Array.isArray(change.value.messages)) {
                console.log(`[Chatbot] ✓ ${change.value.messages.length} mensaje(s) detectado(s)`);
                for (const message of change.value.messages) {
                  console.log(`[Chatbot] Procesando mensaje`);
                  console.log(`[Chatbot] Mensaje completo:`, JSON.stringify(message, null, 2));
                  await handleWhatsAppMessage(message, change.value);
                }
              } else {
                console.log('[Chatbot] No se encontraron mensajes en change.value.messages');
                console.log('[Chatbot] change.value keys:', Object.keys(change.value || {}));
              }
            }
          }
        }
        console.log('[Chatbot] ===== FIN PROCESAMIENTO WEBHOOK =====');
      } catch (error) {
        console.error('[Chatbot] Error procesando webhook:', error);
        console.error('[Chatbot] Stack trace:', error.stack);
      }
      
      // Responder a Meta después de procesar (dentro de los 20s permitidos)
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      console.log('[Chatbot] Webhook no reconocido. Object:', body.object);
      return res.status(404).send('Not Found');
    }
  }

  // Método no permitido
  return res.status(405).send('Method Not Allowed');
}
