// Supabase
import { createClient } from '@supabase/supabase-js';

// Token de verificación de Meta (configurado en variables de entorno de Vercel)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '1234';

// Token de acceso de Meta para enviar mensajes (desde variables de entorno)
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';

// Token de OpenAI para respuestas dinámicas
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// ID del número de teléfono de WhatsApp Business
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '976313762231753';

// Cliente Supabase
let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Chatbot] SUPABASE_URL o SUPABASE_ANON_KEY no configurados. Las funciones de base de datos no estarán disponibles.');
      return null;
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

// Guardar mensaje en Supabase
async function saveMessage(phoneNumber, role, content, messageId = null) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Chatbot] Supabase no disponible, no se guardará el mensaje');
      return;
    }
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        phone_number: phoneNumber,
        role: role, // 'user' o 'assistant'
        content: content,
        message_id: messageId
      });
    
    if (error) {
      console.error('[Chatbot] Error guardando mensaje:', error);
    } else {
      console.log(`[Chatbot] Mensaje guardado: ${role} de ${phoneNumber}`);
    }
  } catch (error) {
    console.error('[Chatbot] Error guardando mensaje:', error);
  }
}

// Obtener historial de conversación (últimos 20 mensajes)
async function getConversationHistory(phoneNumber, limit = 20) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Chatbot] Supabase no disponible, no se recuperará historial');
      return [];
    }
    
    const { data, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('[Chatbot] Error obteniendo historial:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('[Chatbot] Error obteniendo historial:', error);
    return [];
  }
}

// Obtener configuración de IA desde Supabase
async function getAIConfig() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Chatbot] Supabase no disponible, usando configuración por defecto');
      return {
        system_prompt: { text: 'Eres un asistente breve y útil.' },
        business_info: { name: '', phone: '', address: '', email: '' },
        business_hours: { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' },
        services: { list: [] },
        rules: { text: '' }
      };
    }
    
    const { data, error } = await supabase
      .from('ai_config')
      .select('key, value');
    
    if (error) {
      console.error('[Chatbot] Error obteniendo configuración:', error);
      return null;
    }
    
    // Convertir array de {key, value} a objeto
    const config = {};
    if (data) {
      data.forEach(item => {
        config[item.key] = item.value;
      });
    }
    
    return config;
  } catch (error) {
    console.error('[Chatbot] Error obteniendo configuración:', error);
    return null;
  }
}

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

// Obtiene respuesta desde OpenAI (ChatGPT) con contexto y configuración
async function getAIResponse(userMessage, phoneNumber) {
  console.log(`[Chatbot] getAIResponse llamado con: "${userMessage}" para ${phoneNumber}`);
  
  const apiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[Chatbot] ✗ OPENAI_API_KEY no configurado');
    console.error('[Chatbot] Verifica que OPENAI_API_KEY esté configurado en Vercel');
    return 'Lo siento, no puedo responder ahora mismo. La configuración de IA no está disponible.';
  }
  
  console.log(`[Chatbot] OPENAI_API_KEY presente: ${apiKey.substring(0, 10)}...`);

  // Obtener historial de conversación
  const history = await getConversationHistory(phoneNumber, 20);
  console.log(`[Chatbot] Historial recuperado: ${history.length} mensajes`);
  
  // Obtener configuración de IA
  const config = await getAIConfig();
  console.log(`[Chatbot] Configuración de IA obtenida: ${config ? 'Sí' : 'No'}`);
  
  // Construir system prompt con configuración
  let systemPrompt = 'Eres un asistente breve y útil.';
  if (config) {
    const systemPromptText = config.system_prompt?.text || 'Eres un asistente breve y útil.';
    const businessInfo = config.business_info || {};
    const businessHours = config.business_hours || {};
    const servicesAndPricing = config.services_and_pricing || {};
    const rules = config.rules || {};
    const urgencyProtocol = config.urgency_protocol || {};
    const bookingRequirements = config.booking_requirements || {};
    const logisticsAndPayments = config.logistics_and_payments || {};
    
    // Construir prompt completo
    let promptParts = [systemPromptText];
    
    // Información del negocio
    if (businessInfo.brand || businessInfo.legal_name) {
      promptParts.push('\n\nInformación del negocio:');
      if (businessInfo.brand) promptParts.push(`- Marca: ${businessInfo.brand}`);
      if (businessInfo.legal_name) promptParts.push(`- Nombre legal: ${businessInfo.legal_name}`);
      
      if (businessInfo.locations && Array.isArray(businessInfo.locations)) {
        promptParts.push('\nSedes:');
        businessInfo.locations.forEach(loc => {
          promptParts.push(`- ${loc.sede}: ${loc.address}${loc.reference ? ` (${loc.reference})` : ''}`);
        });
      }
      
      if (businessInfo.contact) {
        promptParts.push('\nContacto:');
        if (businessInfo.contact.whatsapp) promptParts.push(`- WhatsApp: ${businessInfo.contact.whatsapp}`);
        if (businessInfo.contact.email) promptParts.push(`- Email: ${businessInfo.contact.email}`);
        if (businessInfo.contact.instagram) promptParts.push(`- Instagram: ${businessInfo.contact.instagram}`);
        if (businessInfo.contact.facebook) promptParts.push(`- Facebook: ${businessInfo.contact.facebook}`);
      }
    }
    
    // Horarios por sede
    if (businessHours.rodadero || businessHours.manzanares) {
      promptParts.push('\n\nHorarios de atención:');
      if (businessHours.rodadero) promptParts.push(`- Rodadero: ${businessHours.rodadero}`);
      if (businessHours.manzanares) promptParts.push(`- Manzanares: ${businessHours.manzanares}`);
    }
    
    // Servicios y precios
    if (servicesAndPricing.list && servicesAndPricing.list.length > 0) {
      promptParts.push('\n\nServicios ofrecidos:');
      servicesAndPricing.list.forEach(service => {
        promptParts.push(`- ${service}`);
      });
      if (servicesAndPricing.policy) {
        promptParts.push(`\nPolítica de precios: ${servicesAndPricing.policy}`);
      }
      if (servicesAndPricing.teleconsulta) {
        promptParts.push(`\nTeleconsulta: ${servicesAndPricing.teleconsulta.cost} (${servicesAndPricing.teleconsulta.duration}) - ${servicesAndPricing.teleconsulta.hours}`);
      }
    }
    
    // Reglas
    if (rules.anti_hallucination) {
      promptParts.push(`\n\nREGLA CRÍTICA: ${rules.anti_hallucination}`);
    }
    if (rules.habeas_data) {
      promptParts.push(`\nHabeas Data: ${rules.habeas_data}`);
    }
    if (rules.priorities) {
      promptParts.push('\nPrioridades:');
      if (rules.priorities.alta) promptParts.push(`- Alta: ${rules.priorities.alta}`);
      if (rules.priorities.media) promptParts.push(`- Media: ${rules.priorities.media}`);
      if (rules.priorities.baja) promptParts.push(`- Baja: ${rules.priorities.baja}`);
    }
    if (rules.health_restrictions && Array.isArray(rules.health_restrictions)) {
      promptParts.push('\nRestricciones médicas:');
      rules.health_restrictions.forEach(restriction => {
        promptParts.push(`- ${restriction}`);
      });
    }
    
    // Protocolo de urgencias
    if (urgencyProtocol.keywords && urgencyProtocol.script) {
      promptParts.push(`\n\nProtocolo de urgencias: Si detectas palabras clave como "${urgencyProtocol.keywords.join(', ')}", usa este script: ${urgencyProtocol.script}`);
    }
    
    // Requisitos de agendamiento
    if (bookingRequirements.fields) {
      promptParts.push('\n\nRequisitos para agendar:');
      Object.entries(bookingRequirements.fields).forEach(([field, desc]) => {
        promptParts.push(`- ${field}: ${desc}`);
      });
      if (bookingRequirements.alternatives_rule) {
        promptParts.push(`\nRegla de alternativas: ${bookingRequirements.alternatives_rule}`);
      }
    }
    
    // Logística y pagos
    if (logisticsAndPayments.parking || logisticsAndPayments.payment_methods) {
      promptParts.push('\n\nLogística:');
      if (logisticsAndPayments.parking) {
        if (logisticsAndPayments.parking.rodadero) {
          promptParts.push(`- Parqueo Rodadero: ${logisticsAndPayments.parking.rodadero}`);
        }
        if (logisticsAndPayments.parking.manzanares) {
          promptParts.push(`- Parqueo Manzanares: ${logisticsAndPayments.parking.manzanares}`);
        }
      }
      if (logisticsAndPayments.accessibility) {
        promptParts.push(`- Accesibilidad: ${logisticsAndPayments.accessibility}`);
      }
      if (logisticsAndPayments.payment_methods && Array.isArray(logisticsAndPayments.payment_methods)) {
        promptParts.push(`\nMétodos de pago: ${logisticsAndPayments.payment_methods.join(', ')}`);
      }
    }
    
    systemPrompt = promptParts.join('\n');
  }
  
  // Construir mensajes con contexto
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history, // Agregar historial
    { role: 'user', content: userMessage } // Mensaje actual
  ];
  
  console.log(`[Chatbot] Enviando petición a OpenAI con ${messages.length} mensajes...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s para dar más tiempo con contexto

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 250,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`[Chatbot] Respuesta de OpenAI recibida: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[Chatbot] ✗ Error OpenAI:', JSON.stringify(err, null, 2));
      return 'Lo siento, hubo un error al contactar a la IA.';
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content?.trim();
    console.log(`[Chatbot] Mensaje de IA extraído: "${aiMessage}"`);
    
    // Guardar ambos mensajes en la base de datos
    await saveMessage(phoneNumber, 'user', userMessage);
    await saveMessage(phoneNumber, 'assistant', aiMessage);
    
    return aiMessage || 'Lo siento, no puedo responder ahora mismo.';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('[Chatbot] ✗ Timeout en OpenAI (más de 10 segundos)');
      return 'Lo siento, tardé demasiado en responder.';
    }
    console.error('[Chatbot] ✗ Error llamando a OpenAI:', error.message);
    console.error('[Chatbot] Stack:', error.stack);
    return 'Lo siento, no pude obtener una respuesta de la IA.';
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
    console.log(`[Chatbot] Procesando mensaje de texto: "${messageText}"`);
    
    // Guardar mensaje del usuario antes de procesar
    await saveMessage(from, 'user', messageText, messageId);
    
    try {
      console.log(`[Chatbot] Llamando a getAIResponse con contexto...`);
      // Pasar phoneNumber para obtener contexto
      const response = await getAIResponse(messageText, from);
      console.log(`[Chatbot] Respuesta de IA recibida: "${response}"`);

      // Enviar respuesta automática
      if (response) {
        console.log(`[Chatbot] Enviando respuesta a ${from}: ${response}`);
        const phoneId = value.metadata?.phone_number_id || null;
        console.log(`[Chatbot] Usando phoneId: ${phoneId || 'null (usará el configurado)'}`);
        
        try {
          const result = await sendWhatsAppMessage(from, response, phoneId);
          
          if (result.success) {
            console.log(`[Chatbot] ✓ Respuesta enviada exitosamente a ${from}`);
            console.log(`[Chatbot] Datos de respuesta:`, JSON.stringify(result.data, null, 2));
            
            // Guardar el ID del mensaje enviado si está disponible
            if (result.data?.messages?.[0]?.id) {
              // Actualizar el mensaje assistant con el message_id
              // Nota: getAIResponse ya guarda el mensaje, pero podemos actualizarlo con el message_id
              // Por simplicidad, lo dejamos así ya que getAIResponse guarda antes de enviar
            }
          } else {
            console.error(`[Chatbot] ✗ Error al enviar respuesta a ${from}:`, JSON.stringify(result.error, null, 2));
            console.error(`[Chatbot] Detalles del error:`, result.details || 'Sin detalles adicionales');
          }
        } catch (error) {
          console.error(`[Chatbot] ✗ Excepción al enviar respuesta:`, error.message);
          console.error(`[Chatbot] Stack trace:`, error.stack);
        }
      } else {
        console.error(`[Chatbot] ✗ No se recibió respuesta de la IA`);
      }
    } catch (error) {
      console.error(`[Chatbot] ✗ Error al obtener respuesta de IA:`, error.message);
      console.error(`[Chatbot] Stack trace:`, error.stack);
      
      // Enviar mensaje de error al usuario
      try {
        await sendWhatsAppMessage(from, 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.', value.metadata?.phone_number_id || null);
      } catch (sendError) {
        console.error(`[Chatbot] ✗ Error al enviar mensaje de error:`, sendError.message);
      }
    }
  } else if (messageType !== 'text') {
    console.log(`[Chatbot] Mensaje de tipo ${messageType} recibido (no procesado aún)`);
  } else if (!messageText) {
    console.log(`[Chatbot] Mensaje de texto vacío recibido`);
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
