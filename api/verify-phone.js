// Token de acceso de Meta
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAARRcq0pgjkBQgHCZCsTMXtEoxccqdTZBNnGDpmOf0so5o1l6YgaFNSZBZBAni1WC4pF6kiHlYOZBrUOUrkrsLlx61bO025Kx6OfZCuaVlY4XkXu7apw8nHh7oK4Dd1zKCZA2auXc3dS5yHKlUEpUnxZCbYDX7vhWPCnZCDaXUGRpB5tKXmZBhSBpFtvczdBpaVwZDZD';

// Handler para verificar el número de teléfono
export default async function handler(req, res) {
  try {
    const accessToken = process.env.META_ACCESS_TOKEN || META_ACCESS_TOKEN;
    
    if (!accessToken) {
      return res.status(500).json({ error: 'META_ACCESS_TOKEN no configurado' });
    }

    // Intentar obtener información del número de teléfono
    // Esto puede ayudar a verificar que tenemos el ID correcto
    const url = `https://graph.facebook.com/v21.0/me?fields=name,id&access_token=${accessToken}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      accountInfo: data,
      phoneNumberId: process.env.PHONE_NUMBER_ID || '893259217214880',
      message: 'Verifica que el PHONE_NUMBER_ID sea correcto en tu Meta Developer Console'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
