// Token de acceso de Meta
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAARRcq0pgjkBQgHCZCsTMXtEoxccqdTZBNnGDpmOf0so5o1l6YgaFNSZBZBAni1WC4pF6kiHlYOZBrUOUrkrsLlx61bO025Kx6OfZCuaVlY4XkXu7apw8nHh7oK4Dd1zKCZA2auXc3dS5yHKlUEpUnxZCbYDX7vhWPCnZCDaXUGRpB5tKXmZBhSBpFtvczdBpaVwZDZD';

// Función para obtener el PHONE_NUMBER_ID correcto desde el WABA
async function getPhoneNumberId(accessToken) {
  try {
    // Para System User tokens, primero obtener las cuentas de negocio
    const businessUrl = `https://graph.facebook.com/v21.0/me/businesses?access_token=${accessToken}`;
    console.log('[Chatbot] Obteniendo cuentas de negocio...');
    const businessResponse = await fetch(businessUrl);
    const businessData = await businessResponse.json();
    
    if (businessData.error) {
      // Si falla, intentar directamente obtener el WABA desde la app
      console.log('[Chatbot] Intentando obtener WABA directamente desde la app...');
      const appId = '1215452880142905'; // Del token info anterior
      
      // Intentar obtener WABA usando diferentes métodos
      const methods = [
        // Método 1: Buscar WABA por app_id y luego obtener números
        async () => {
          // Intentar usar el ID del número directamente que conocemos
          const testUrl = `https://graph.facebook.com/v21.0/893259217214880?fields=id,display_phone_number&access_token=${accessToken}`;
          const testResponse = await fetch(testUrl);
          if (testResponse.ok) {
            const testData = await testResponse.json();
            return { success: true, phoneNumberId: testData.id, method: 'direct' };
          }
          return null;
        },
        // Método 2: Buscar en todos los negocios
        async () => {
          if (businessData.data?.length > 0) {
            for (const business of businessData.data) {
              const wabaUrl = `https://graph.facebook.com/v21.0/${business.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`;
              const wabaResponse = await fetch(wabaUrl);
              const wabaData = await wabaResponse.json();
              
              if (wabaData.data?.length > 0) {
                const wabaId = wabaData.data[0].id;
                const phoneUrl = `https://graph.facebook.com/v21.0/${wabaId}?fields=phone_numbers{id,display_phone_number,verified_name}&access_token=${accessToken}`;
                const phoneResponse = await fetch(phoneUrl);
                const phoneData = await phoneResponse.json();
                
                if (phoneData.phone_numbers?.data?.length > 0) {
                  return {
                    success: true,
                    phoneNumbers: phoneData.phone_numbers.data,
                    phoneNumberId: phoneData.phone_numbers.data[0].id,
                    method: 'business_owned'
                  };
                }
              }
            }
          }
          return null;
        }
      ];
      
      for (const method of methods) {
        const result = await method();
        if (result) return result;
      }
      
      return { error: businessData.error };
    }
    
    // Si obtuvimos negocios, buscar WABA en ellos
    if (businessData.data?.length > 0) {
      for (const business of businessData.data) {
        // Obtener cuentas de WhatsApp Business asociadas
        const wabaUrl = `https://graph.facebook.com/v21.0/${business.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`;
        const wabaResponse = await fetch(wabaUrl);
        const wabaData = await wabaResponse.json();
        
        if (wabaData.data?.length > 0) {
          // Probar todas las cuentas de WhatsApp Business
          for (const waba of wabaData.data) {
            const wabaId = waba.id;
            console.log(`[Chatbot] Probando WABA: ${wabaId}`);
            
            // Obtener los números de teléfono del WABA
            const phoneUrl = `https://graph.facebook.com/v21.0/${wabaId}?fields=phone_numbers{id,display_phone_number,verified_name}&access_token=${accessToken}`;
            const phoneResponse = await fetch(phoneUrl);
            const phoneData = await phoneResponse.json();
            
            if (phoneData.phone_numbers?.data?.length > 0) {
              return {
                success: true,
                wabaId: wabaId,
                phoneNumbers: phoneData.phone_numbers.data,
                phoneNumberId: phoneData.phone_numbers.data[0].id,
                method: 'business_accounts'
              };
            }
          }
        }
        
        // También intentar obtener WABA directamente
        const directWabaUrl = `https://graph.facebook.com/v21.0/${business.id}/whatsapp_business_accounts?access_token=${accessToken}`;
        const directWabaResponse = await fetch(directWabaUrl);
        const directWabaData = await directWabaResponse.json();
        
        if (directWabaData.data?.length > 0) {
          for (const waba of directWabaData.data) {
            const wabaId = waba.id;
            const phoneUrl = `https://graph.facebook.com/v21.0/${wabaId}?fields=phone_numbers{id,display_phone_number,verified_name}&access_token=${accessToken}`;
            const phoneResponse = await fetch(phoneUrl);
            const phoneData = await phoneResponse.json();
            
            if (phoneData.phone_numbers?.data?.length > 0) {
              return {
                success: true,
                wabaId: wabaId,
                phoneNumbers: phoneData.phone_numbers.data,
                phoneNumberId: phoneData.phone_numbers.data[0].id,
                method: 'direct_waba'
              };
            }
          }
        }
      }
    }
    
    return { error: 'No se pudo obtener el WABA o números de teléfono' };
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
