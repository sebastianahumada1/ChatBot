// Token de acceso de Meta
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAARRcq0pgjkBQgHCZCsTMXtEoxccqdTZBNnGDpmOf0so5o1l6YgaFNSZBZBAni1WC4pF6kiHlYOZBrUOUrkrsLlx61bO025Kx6OfZCuaVlY4XkXu7apw8nHh7oK4Dd1zKCZA2auXc3dS5yHKlUEpUnxZCbYDX7vhWPCnZCDaXUGRpB5tKXmZBhSBpFtvczdBpaVwZDZD';

// Handler para verificar el número de teléfono y obtener información
export default async function handler(req, res) {
  try {
    const accessToken = process.env.META_ACCESS_TOKEN || META_ACCESS_TOKEN;
    
    if (!accessToken) {
      return res.status(500).json({ error: 'META_ACCESS_TOKEN no configurado' });
    }

    const results = {
      accountInfo: null,
      phoneNumbers: null,
      currentPhoneNumberId: process.env.PHONE_NUMBER_ID || '893259217214880',
      errors: []
    };

    // Obtener información de la cuenta
    try {
      const accountUrl = `https://graph.facebook.com/v21.0/me?fields=name,id&access_token=${accessToken}`;
      const accountResponse = await fetch(accountUrl);
      results.accountInfo = await accountResponse.json();
    } catch (error) {
      results.errors.push(`Error al obtener cuenta: ${error.message}`);
    }

    // Intentar obtener números de teléfono de WhatsApp Business
    try {
      // Obtener el WhatsApp Business Account ID primero
      const wabaUrl = `https://graph.facebook.com/v21.0/me?fields=whatsapp_business_accounts&access_token=${accessToken}`;
      const wabaResponse = await fetch(wabaUrl);
      const wabaData = await wabaResponse.json();
      
      if (wabaData.whatsapp_business_accounts?.data?.length > 0) {
        const wabaId = wabaData.whatsapp_business_accounts.data[0].id;
        
        // Obtener los números de teléfono del WABA
        const phoneUrl = `https://graph.facebook.com/v21.0/${wabaId}?fields=phone_numbers&access_token=${accessToken}`;
        const phoneResponse = await fetch(phoneUrl);
        const phoneData = await phoneResponse.json();
        
        results.phoneNumbers = phoneData.phone_numbers?.data || [];
      }
    } catch (error) {
      results.errors.push(`Error al obtener números: ${error.message}`);
    }

    // Intentar verificar el PHONE_NUMBER_ID actual
    const verifyUrl = `https://graph.facebook.com/v21.0/${results.currentPhoneNumberId}?fields=id,display_phone_number,verified_name&access_token=${accessToken}`;
    try {
      const verifyResponse = await fetch(verifyUrl);
      if (verifyResponse.ok) {
        results.phoneNumberInfo = await verifyResponse.json();
      } else {
        const errorData = await verifyResponse.json();
        results.errors.push(`PHONE_NUMBER_ID ${results.currentPhoneNumberId} inválido: ${errorData.error?.message || 'No se puede acceder'}`);
      }
    } catch (error) {
      results.errors.push(`Error al verificar PHONE_NUMBER_ID: ${error.message}`);
    }
    
    return res.status(200).json({
      success: true,
      ...results,
      message: results.phoneNumbers?.length > 0 
        ? `Encontrados ${results.phoneNumbers.length} número(s) de teléfono. Usa el 'id' como PHONE_NUMBER_ID.`
        : 'No se pudieron obtener los números automáticamente. Verifica manualmente en Meta Developer Console.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
