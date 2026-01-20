// Token de acceso de Meta
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAARRcq0pgjkBQgHCZCsTMXtEoxccqdTZBNnGDpmOf0so5o1l6YgaFNSZBZBAni1WC4pF6kiHlYOZBrUOUrkrsLlx61bO025Kx6OfZCuaVlY4XkXu7apw8nHh7oK4Dd1zKCZA2auXc3dS5yHKlUEpUnxZCbYDX7vhWPCnZCDaXUGRpB5tKXmZBhSBpFtvczdBpaVwZDZD';

// Handler para verificar permisos del token
export default async function handler(req, res) {
  try {
    const accessToken = process.env.META_ACCESS_TOKEN || META_ACCESS_TOKEN;
    const phoneNumberId = process.env.PHONE_NUMBER_ID || '893259217214880';
    
    if (!accessToken) {
      return res.status(500).json({ error: 'META_ACCESS_TOKEN no configurado' });
    }

    const results = {
      tokenInfo: null,
      permissions: [],
      phoneNumberCheck: null,
      recommendations: []
    };

    // Verificar información del token
    try {
      const debugUrl = `https://graph.facebook.com/v21.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
      const debugResponse = await fetch(debugUrl);
      const debugData = await debugResponse.json();
      
      if (debugData.data) {
        results.tokenInfo = {
          app_id: debugData.data.app_id,
          type: debugData.data.type,
          valid: debugData.data.is_valid,
          expires_at: debugData.data.expires_at ? new Date(debugData.data.expires_at * 1000).toISOString() : 'Never',
          scopes: debugData.data.scopes || []
        };
        results.permissions = debugData.data.scopes || [];
      }
    } catch (error) {
      results.errors = [`Error al verificar token: ${error.message}`];
    }

    // Verificar acceso al número de teléfono
    try {
      const phoneUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}?fields=id,display_phone_number,verified_name&access_token=${accessToken}`;
      const phoneResponse = await fetch(phoneUrl);
      
      if (phoneResponse.ok) {
        results.phoneNumberCheck = {
          success: true,
          data: await phoneResponse.json()
        };
      } else {
        const errorData = await phoneResponse.json();
        results.phoneNumberCheck = {
          success: false,
          error: errorData.error
        };
        
        if (errorData.error?.code === 100) {
          results.recommendations.push('El token no tiene permisos para acceder a este número. Necesitas regenerar el token con permisos de WhatsApp Business.');
        }
      }
    } catch (error) {
      results.phoneNumberCheck = {
        success: false,
        error: error.message
      };
    }

    // Verificar permisos requeridos
    const requiredPermissions = [
      'whatsapp_business_messaging',
      'whatsapp_business_management'
    ];
    
    const missingPermissions = requiredPermissions.filter(
      perm => !results.permissions.includes(perm)
    );
    
    if (missingPermissions.length > 0) {
      results.recommendations.push(
        `Faltan permisos: ${missingPermissions.join(', ')}. Ve a Meta Developer Console → App Settings → Permissions and Features para agregarlos.`
      );
    }

    return res.status(200).json({
      success: true,
      ...results,
      requiredPermissions,
      missingPermissions,
      message: missingPermissions.length > 0 
        ? 'El token necesita permisos adicionales de WhatsApp Business'
        : 'Verifica los resultados arriba'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
