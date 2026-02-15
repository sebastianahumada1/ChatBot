// Endpoint para gestionar el prompt del bot
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Verificar API key para endpoints de escritura
function verifyApiKey(req) {
  const apiKey = process.env.CONFIG_API_KEY;
  if (!apiKey) {
    // Si no hay API key configurada, permitir acceso
    return true;
  }
  
  const providedKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  return providedKey === apiKey;
}

// Handler principal
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const supabase = getSupabaseClient();
    
    // GET /api/bot-prompt - Obtener el prompt actual
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('bot_prompt')
        .select('*')
        .eq('id', 'main')
        .single();
      
      if (error) {
        // Si no existe, retornar prompt vacío
        if (error.code === 'PGRST116') {
          return res.status(200).json({
            id: 'main',
            prompt: '',
            description: 'Prompt principal del asistente',
            updated_at: null,
            updated_by: null
          });
        }
        console.error('[Bot Prompt] Error obteniendo prompt:', error);
        return res.status(500).json({ error: 'Error obteniendo prompt', details: error.message });
      }
      
      return res.status(200).json(data);
    }
    
    // PUT /api/bot-prompt - Actualizar el prompt
    if (req.method === 'PUT') {
      if (!verifyApiKey(req)) {
        return res.status(401).json({ error: 'API key inválida o faltante' });
      }
      
      const { prompt, description } = req.body;
      
      if (prompt === undefined || prompt === null) {
        return res.status(400).json({ error: 'Se requiere el campo "prompt"' });
      }
      
      const { data, error } = await supabase
        .from('bot_prompt')
        .upsert({
          id: 'main',
          prompt: prompt,
          description: description || 'Prompt principal del asistente',
          updated_at: new Date().toISOString(),
          updated_by: req.body.updated_by || 'admin_ui'
        }, {
          onConflict: 'id'
        })
        .select()
        .single();
      
      if (error) {
        console.error('[Bot Prompt] Error actualizando prompt:', error);
        return res.status(500).json({ error: 'Error actualizando prompt', details: error.message });
      }
      
      console.log('[Bot Prompt] Prompt actualizado correctamente');
      return res.status(200).json({ success: true, data });
    }
    
    // Método no permitido
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('[Bot Prompt] Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}
