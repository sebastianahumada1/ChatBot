// Token de acceso de Meta
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAARRcq0pgjkBQgHCZCsTMXtEoxccqdTZBNnGDpmOf0so5o1l6YgaFNSZBZBAni1WC4pF6kiHlYOZBrUOUrkrsLlx61bO025Kx6OfZCuaVlY4XkXu7apw8nHh7oK4Dd1zKCZA2auXc3dS5yHKlUEpUnxZCbYDX7vhWPCnZCDaXUGRpB5tKXmZBhSBpFtvczdBpaVwZDZD';

// IDs de WABA conocidos de la imagen
const KNOWN_WABA_IDS = [
  '861200930158439',  // Albeiro García Odontólogia
  '1600231760978205', // Test WhatsApp Business Account
  '101851952500590'   // Dr Albeiro García Varela Odontología Estéti...
];

export default async function handler(req, res) {
  try {
    const accessToken = process.env.META_ACCESS_TOKEN || META_ACCESS_TOKEN;
    const results = {
      businesses: null,
      wabas: [],
      phoneNumbers: [],
      errors: []
    };

    // Método 1: Obtener negocios
    try {
      const businessUrl = `https://graph.facebook.com/v21.0/me/businesses?access_token=${accessToken}`;
      const businessResponse = await fetch(businessUrl);
      const businessData = await businessResponse.json();
      results.businesses = businessData;
    } catch (error) {
      results.errors.push(`Error obteniendo negocios: ${error.message}`);
    }

    // Método 2: Probar WABAs conocidos directamente
    for (const wabaId of KNOWN_WABA_IDS) {
      try {
        const phoneUrl = `https://graph.facebook.com/v21.0/${wabaId}?fields=phone_numbers{id,display_phone_number,verified_name}&access_token=${accessToken}`;
        const phoneResponse = await fetch(phoneUrl);
        const phoneData = await phoneResponse.json();
        
        if (phoneData.phone_numbers) {
          results.wabas.push({
            wabaId: wabaId,
            phoneNumbers: phoneData.phone_numbers.data || []
          });
        } else if (phoneData.error) {
          results.errors.push(`WABA ${wabaId}: ${phoneData.error.message}`);
        }
      } catch (error) {
        results.errors.push(`Error con WABA ${wabaId}: ${error.message}`);
      }
    }

    // Método 3: Si hay negocios, buscar WABAs en ellos
    if (results.businesses?.data?.length > 0) {
      for (const business of results.businesses.data) {
        try {
          // owned_whatsapp_business_accounts
          const ownedUrl = `https://graph.facebook.com/v21.0/${business.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`;
          const ownedResponse = await fetch(ownedUrl);
          const ownedData = await ownedResponse.json();
          
          if (ownedData.data) {
            for (const waba of ownedData.data) {
              const phoneUrl = `https://graph.facebook.com/v21.0/${waba.id}?fields=phone_numbers{id,display_phone_number,verified_name}&access_token=${accessToken}`;
              const phoneResponse = await fetch(phoneUrl);
              const phoneData = await phoneResponse.json();
              
              if (phoneData.phone_numbers?.data) {
                results.wabas.push({
                  wabaId: waba.id,
                  wabaName: waba.name,
                  phoneNumbers: phoneData.phone_numbers.data
                });
              }
            }
          }

          // whatsapp_business_accounts
          const wabaUrl = `https://graph.facebook.com/v21.0/${business.id}/whatsapp_business_accounts?access_token=${accessToken}`;
          const wabaResponse = await fetch(wabaUrl);
          const wabaData = await wabaResponse.json();
          
          if (wabaData.data) {
            for (const waba of wabaData.data) {
              const phoneUrl = `https://graph.facebook.com/v21.0/${waba.id}?fields=phone_numbers{id,display_phone_number,verified_name}&access_token=${accessToken}`;
              const phoneResponse = await fetch(phoneUrl);
              const phoneData = await phoneResponse.json();
              
              if (phoneData.phone_numbers?.data) {
                results.wabas.push({
                  wabaId: waba.id,
                  wabaName: waba.name,
                  phoneNumbers: phoneData.phone_numbers.data
                });
              }
            }
          }
        } catch (error) {
          results.errors.push(`Error procesando negocio ${business.id}: ${error.message}`);
        }
      }
    }

    // Recopilar todos los números de teléfono
    results.phoneNumbers = results.wabas
      .flatMap(waba => waba.phoneNumbers.map(phone => ({
        ...phone,
        wabaId: waba.wabaId,
        wabaName: waba.wabaName
      })));

    return res.status(200).json({
      success: results.phoneNumbers.length > 0,
      ...results,
      recommendedPhoneNumberId: results.phoneNumbers[0]?.id || null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
