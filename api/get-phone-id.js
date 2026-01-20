// Token de acceso de Meta
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAARRcq0pgjkBQgHCZCsTMXtEoxccqdTZBNnGDpmOf0so5o1l6YgaFNSZBZBAni1WC4pF6kiHlYOZBrUOUrkrsLlx61bO025Kx6OfZCuaVlY4XkXu7apw8nHh7oK4Dd1zKCZA2auXc3dS5yHKlUEpUnxZCbYDX7vhWPCnZCDaXUGRpB5tKXmZBhSBpFtvczdBpaVwZDZD';

// Función para obtener el PHONE_NUMBER_ID correcto desde el WABA
async function getPhoneNumberId(accessToken) {
  try {
    // Obtener el WhatsApp Business Account ID
    const wabaUrl = `https://graph.facebook.com/v21.0/me?fields=whatsapp_business_accounts&access_token=${accessToken}`;
    console.log('[Chatbot] Obteniendo WABA...');
    const wabaResponse = await fetch(wabaUrl);
    const wabaData = await wabaResponse.json();
    
    if (wabaData.error) {
      return { error: wabaData.error };
    }
    
    if (wabaData.whatsapp_business_accounts?.data?.length > 0) {
      const wabaId = wabaData.whatsapp_business_accounts.data[0].id;
      console.log(`[Chatbot] WABA ID encontrado: ${wabaId}`);
      
      // Obtener los números de teléfono del WABA
      const phoneUrl = `https://graph.facebook.com/v21.0/${wabaId}?fields=phone_numbers{id,display_phone_number,verified_name}&access_token=${accessToken}`;
      console.log('[Chatbot] Obteniendo números de teléfono...');
      const phoneResponse = await fetch(phoneUrl);
      const phoneData = await phoneResponse.json();
      
      if (phoneData.error) {
        return { error: phoneData.error };
      }
      
      if (phoneData.phone_numbers?.data?.length > 0) {
        return { 
          success: true, 
          phoneNumbers: phoneData.phone_numbers.data,
          phoneNumberId: phoneData.phone_numbers.data[0].id
        };
      } else {
        return { error: 'No se encontraron números de teléfono' };
      }
    } else {
      return { error: 'No se encontró WhatsApp Business Account' };
    }
  } catch (error) {
    return { error: error.message };
  }
}

export default async function handler(req, res) {
  try {
    const accessToken = process.env.META_ACCESS_TOKEN || META_ACCESS_TOKEN;
    
    if (!accessToken) {
      return res.status(500).json({ error: 'META_ACCESS_TOKEN no configurado' });
    }

    const result = await getPhoneNumberId(accessToken);
    
    return res.status(200).json({
      success: result.success || false,
      ...result,
      currentEnvPhoneNumberId: process.env.PHONE_NUMBER_ID || 'No configurado'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
