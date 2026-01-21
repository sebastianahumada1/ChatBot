// Token de acceso de Meta
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';

// WABA ID (WhatsApp Business Account ID)
const WABA_ID = '1600231760978205'; // Test WhatsApp Business Account

// App ID
const APP_ID = '1215452880142905'; // Del token info anterior

// Endpoint para suscribir la app al WABA
export default async function handler(req, res) {
  try {
    const accessToken = process.env.META_ACCESS_TOKEN || META_ACCESS_TOKEN;
    
    if (!accessToken) {
      return res.status(500).json({ error: 'META_ACCESS_TOKEN no configurado' });
    }

    const results = {
      wabaCheck: null,
      currentSubscription: null,
      subscriptionAttempt: null,
      errors: []
    };

    // Paso 1: Verificar el WABA
    try {
      const wabaUrl = `https://graph.facebook.com/v22.0/${WABA_ID}?fields=id,name&access_token=${accessToken}`;
      const wabaResponse = await fetch(wabaUrl);
      const wabaData = await wabaResponse.json();
      
      if (wabaData.error) {
        results.errors.push(`Error verificando WABA: ${wabaData.error.message}`);
      } else {
        results.wabaCheck = { success: true, data: wabaData };
      }
    } catch (error) {
      results.errors.push(`Error verificando WABA: ${error.message}`);
    }

    // Paso 2: Verificar suscripciones actuales
    try {
      const subscribedUrl = `https://graph.facebook.com/v22.0/${WABA_ID}/subscribed_apps?access_token=${accessToken}`;
      const subscribedResponse = await fetch(subscribedUrl);
      const subscribedData = await subscribedResponse.json();
      
      if (subscribedData.error) {
        results.errors.push(`Error verificando suscripciones: ${subscribedData.error.message}`);
      } else {
        results.currentSubscription = subscribedData;
        const isSubscribed = subscribedData.data?.some(app => app.id === APP_ID);
        
        if (!isSubscribed) {
          // Paso 3: Suscribir la app al WABA
          try {
            const subscribeUrl = `https://graph.facebook.com/v22.0/${WABA_ID}/subscribed_apps`;
            const subscribeResponse = await fetch(subscribeUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                subscribed_fields: ['messages']
              })
            });
            
            const subscribeData = await subscribeResponse.json();
            
            if (subscribeResponse.ok) {
              results.subscriptionAttempt = { success: true, data: subscribeData };
            } else {
              results.subscriptionAttempt = { success: false, error: subscribeData };
              results.errors.push(`Error suscribiendo app: ${subscribeData.error?.message || 'Unknown error'}`);
            }
          } catch (error) {
            results.errors.push(`Error al intentar suscribir: ${error.message}`);
          }
        } else {
          results.subscriptionAttempt = { success: true, message: 'App ya está suscrita al WABA' };
        }
      }
    } catch (error) {
      results.errors.push(`Error verificando suscripciones: ${error.message}`);
    }

    return res.status(200).json({
      success: results.errors.length === 0,
      ...results,
      instructions: {
        step1: 'Verifica que tu app esté suscrita al WABA',
        step2: 'Si no está suscrita, este endpoint intentará suscribirla automáticamente',
        step3: 'Después de suscribir, espera 2-3 minutos y prueba enviar un mensaje',
        step4: 'El webhook debería empezar a funcionar'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
