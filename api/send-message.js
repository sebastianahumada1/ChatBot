// Token de acceso de Meta para enviar mensajes (token de 60 minutos)
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAARRcq0pgjkBQnRUjZBxM2vlMMlyhEGrTcDkjNUhd0ZBYYpjeby2nZALPZAOFCUTMwakRaCu6O2dJgR0NY0cpwsMld8Si7QaQK06muFPRa0bVVzJtcWqq2sR0RB82krmZBDU0NPiAKqnrvnth1vipnBnEfGA5la3fqCUX7DP2dxLrm41Af9iAFcZBS8H7aC8HlQssBExHBoe4GupgJXhDsduRldUW2GlvZCbMLZCD8W086KLGpJJwOPghZBZCaITl8qC2rjuMt7ZAx5lASZCZATZCkrlBbUV4nu5xePRCAZDZD';

// ID del número de teléfono de WhatsApp Business
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '893259217214880';

// WABA ID configurado (Test WhatsApp Business Account)
const WABA_ID = process.env.WABA_ID || '1600231760978205';

// Función para obtener el PHONE_NUMBER_ID correcto desde el WABA
async function getPhoneNumberId(accessToken) {
  try {
    // Usar el WABA ID configurado directamente
    const wabaId = process.env.WABA_ID || WABA_ID;
    console.log(`[Chatbot] Obteniendo números de teléfono del WABA: ${wabaId}`);
    
    const phoneUrl = `https://graph.facebook.com/v21.0/${wabaId}?fields=phone_numbers{id,display_phone_number,verified_name}&access_token=${accessToken}`;
    const phoneResponse = await fetch(phoneUrl);
    const phoneData = await phoneResponse.json();
    
    if (phoneData.error) {
      console.error(`[Chatbot] Error al obtener números:`, phoneData.error);
      
      // Si falla, intentar desde cuentas de negocio
      const businessUrl = `https://graph.facebook.com/v21.0/me/businesses?access_token=${accessToken}`;
      const businessResponse = await fetch(businessUrl);
      const businessData = await businessResponse.json();
      
      if (businessData.data?.length > 0) {
        for (const business of businessData.data) {
          const ownedWabaUrl = `https://graph.facebook.com/v21.0/${business.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`;
          const ownedWabaResponse = await fetch(ownedWabaUrl);
          const ownedWabaData = await ownedWabaResponse.json();
          
          if (ownedWabaData.data?.length > 0) {
            for (const waba of ownedWabaData.data) {
              const altPhoneUrl = `https://graph.facebook.com/v21.0/${waba.id}?fields=phone_numbers{id}&access_token=${accessToken}`;
              const altPhoneResponse = await fetch(altPhoneUrl);
              const altPhoneData = await altPhoneResponse.json();
              
              if (altPhoneData.phone_numbers?.data?.length > 0) {
                console.log(`[Chatbot] PHONE_NUMBER_ID encontrado desde negocio: ${altPhoneData.phone_numbers.data[0].id}`);
                return altPhoneData.phone_numbers.data[0].id;
              }
            }
          }
        }
      }
      
      return null;
    }
    
    if (phoneData.phone_numbers?.data?.length > 0) {
      const phoneNumberId = phoneData.phone_numbers.data[0].id;
      console.log(`[Chatbot] PHONE_NUMBER_ID encontrado: ${phoneNumberId}`);
      return phoneNumberId;
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

    // Usar el PHONE_NUMBER_ID configurado directamente (893259217214880)
    const phoneNumberId = process.env.PHONE_NUMBER_ID || PHONE_NUMBER_ID;
    console.log(`[Chatbot] Usando PHONE_NUMBER_ID: ${phoneNumberId}`);
    
    if (!phoneNumberId) {
      console.error('[Chatbot] PHONE_NUMBER_ID no configurado');
      return { success: false, error: 'PHONE_NUMBER_ID no configurado y no se pudo obtener automáticamente.' };
    }

    // Usar la versión v22.0 de la API (la que funciona)
    const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
    
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
