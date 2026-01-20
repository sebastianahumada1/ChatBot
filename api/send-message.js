// Token de acceso de Meta para enviar mensajes
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAARRcq0pgjkBQgHCZCsTMXtEoxccqdTZBNnGDpmOf0so5o1l6YgaFNSZBZBAni1WC4pF6kiHlYOZBrUOUrkrsLlx61bO025Kx6OfZCuaVlY4XkXu7apw8nHh7oK4Dd1zKCZA2auXc3dS5yHKlUEpUnxZCbYDX7vhWPCnZCDaXUGRpB5tKXmZBhSBpFtvczdBpaVwZDZD';

// ID del número de teléfono de WhatsApp Business
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '893259217214880';

// Función para obtener el PHONE_NUMBER_ID correcto desde el WABA
async function getPhoneNumberId(accessToken) {
  try {
    // Para System User tokens, obtener desde cuentas de negocio
    const businessUrl = `https://graph.facebook.com/v21.0/me/businesses?access_token=${accessToken}`;
    const businessResponse = await fetch(businessUrl);
    const businessData = await businessResponse.json();
    
    if (businessData.data?.length > 0) {
      for (const business of businessData.data) {
        // Intentar obtener cuentas de WhatsApp Business (owned)
        const wabaUrl = `https://graph.facebook.com/v21.0/${business.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`;
        const wabaResponse = await fetch(wabaUrl);
        const wabaData = await wabaResponse.json();
        
        if (wabaData.data?.length > 0) {
          for (const waba of wabaData.data) {
            const wabaId = waba.id;
            const phoneUrl = `https://graph.facebook.com/v21.0/${wabaId}?fields=phone_numbers{id}&access_token=${accessToken}`;
            const phoneResponse = await fetch(phoneUrl);
            const phoneData = await phoneResponse.json();
            
            if (phoneData.phone_numbers?.data?.length > 0) {
              console.log(`[Chatbot] PHONE_NUMBER_ID encontrado: ${phoneData.phone_numbers.data[0].id}`);
              return phoneData.phone_numbers.data[0].id;
            }
          }
        }
        
        // También intentar whatsapp_business_accounts (no owned)
        const directWabaUrl = `https://graph.facebook.com/v21.0/${business.id}/whatsapp_business_accounts?access_token=${accessToken}`;
        const directWabaResponse = await fetch(directWabaUrl);
        const directWabaData = await directWabaResponse.json();
        
        if (directWabaData.data?.length > 0) {
          for (const waba of directWabaData.data) {
            const wabaId = waba.id;
            const phoneUrl = `https://graph.facebook.com/v21.0/${wabaId}?fields=phone_numbers{id}&access_token=${accessToken}`;
            const phoneResponse = await fetch(phoneUrl);
            const phoneData = await phoneResponse.json();
            
            if (phoneData.phone_numbers?.data?.length > 0) {
              console.log(`[Chatbot] PHONE_NUMBER_ID encontrado: ${phoneData.phone_numbers.data[0].id}`);
              return phoneData.phone_numbers.data[0].id;
            }
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('[Chatbot] Error al obtener PHONE_NUMBER_ID:', error);
    return null;
  }
}

// Función para enviar mensajes de WhatsApp usando la API de Meta
async function sendWhatsAppMessage(to, message) {
  try {
    const accessToken = process.env.META_ACCESS_TOKEN || META_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.error('[Chatbot] META_ACCESS_TOKEN no configurado');
      return { success: false, error: 'META_ACCESS_TOKEN no configurado.' };
    }

    // Siempre intentar obtener el PHONE_NUMBER_ID automáticamente primero
    console.log('[Chatbot] Obteniendo PHONE_NUMBER_ID automáticamente desde WABA...');
    let phoneNumberId = await getPhoneNumberId(accessToken);
    
    // Si no se pudo obtener automáticamente, usar el configurado o el hardcodeado
    if (!phoneNumberId) {
      phoneNumberId = process.env.PHONE_NUMBER_ID || PHONE_NUMBER_ID;
      console.log(`[Chatbot] Usando PHONE_NUMBER_ID configurado: ${phoneNumberId}`);
    } else {
      console.log(`[Chatbot] PHONE_NUMBER_ID obtenido automáticamente: ${phoneNumberId}`);
    }
    
    if (!phoneNumberId) {
      console.error('[Chatbot] PHONE_NUMBER_ID no configurado');
      return { success: false, error: 'PHONE_NUMBER_ID no configurado y no se pudo obtener automáticamente.' };
    }

    // Usar la versión más reciente de la API
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    
    console.log(`[Chatbot] Enviando mensaje a ${to} usando PHONE_NUMBER_ID: ${phoneNumberId}...`);
    
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
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`[Chatbot] Mensaje enviado exitosamente a ${to}:`, data);
      return { success: true, data, phoneNumberId };
    } else {
      console.error(`[Chatbot] Error al enviar mensaje:`, JSON.stringify(data, null, 2));
      return { 
        success: false, 
        error: data,
        details: `Error ${data.error?.code}: ${data.error?.message}`,
        phoneNumberId
      };
    }
  } catch (error) {
    console.error(`[Chatbot] Error al enviar mensaje:`, error);
    return { success: false, error: error.message };
  }
}

// Handler para enviar mensaje "hola" al número especificado
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { to, message } = req.body;
    
    const phoneNumber = to || '573502053858';
    const messageText = message || 'hola';
    
    console.log(`[Chatbot] Enviando "${messageText}" a ${phoneNumber}...`);
    
    const result = await sendWhatsAppMessage(phoneNumber, messageText);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Mensaje "${messageText}" enviado exitosamente a ${phoneNumber}`,
        data: result.data
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  }
  
  // GET request - enviar "hola" al número por defecto
  if (req.method === 'GET') {
    const phoneNumber = req.query.to || '573502053858';
    const messageText = req.query.message || 'hola';
    
    console.log(`[Chatbot] Enviando "${messageText}" a ${phoneNumber}...`);
    
    const result = await sendWhatsAppMessage(phoneNumber, messageText);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Mensaje "${messageText}" enviado exitosamente a ${phoneNumber}`,
        data: result.data
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
