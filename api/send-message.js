// Token de acceso de Meta para enviar mensajes (token de 60 minutos)
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAARRcq0pgjkBQnRUjZBxM2vlMMlyhEGrTcDkjNUhd0ZBYYpjeby2nZALPZAOFCUTMwakRaCu6O2dJgR0NY0cpwsMld8Si7QaQK06muFPRa0bVVzJtcWqq2sR0RB82krmZBDU0NPiAKqnrvnth1vipnBnEfGA5la3fqCUX7DP2dxLrm41Af9iAFcZBS8H7aC8HlQssBExHBoe4GupgJXhDsduRldUW2GlvZCbMLZCD8W086KLGpJJwOPghZBZCaITl8qC2rjuMt7ZAx5lASZCZATZCkrlBbUV4nu5xePRCAZDZD';

// ID del número de teléfono de WhatsApp Business
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '976313762231753';


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

    // Usar la versión v24.0 de la API (coincide con la configuración del webhook)
    const url = `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`;
    
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
      
      // Mensajes de error más claros
      let errorMessage = `Error ${data.error?.code}: ${data.error?.message}`;
      if (data.error?.code === 190) {
        errorMessage += ' - El token de acceso expiró o es inválido. Actualiza META_ACCESS_TOKEN en Vercel.';
      } else if (data.error?.code === 100) {
        errorMessage += ' - Verifica que el PHONE_NUMBER_ID sea correcto y que el token tenga permisos.';
      }
      
      return { 
        success: false, 
        error: data,
        details: errorMessage,
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
