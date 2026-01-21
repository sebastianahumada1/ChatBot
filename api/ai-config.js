// Endpoint para gestionar la configuración de la IA
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
    // Si no hay API key configurada, permitir acceso (no recomendado para producción)
    return true;
  }
  
  const providedKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  return providedKey === apiKey;
}

// Handler principal
export default async function handler(req, res) {
  try {
    const supabase = getSupabaseClient();
    
    // GET /api/ai-config - Obtener toda la configuración
    if (req.method === 'GET' && !req.query.key) {
      const { data, error } = await supabase
        .from('ai_config')
        .select('*')
        .order('key');
      
      if (error) {
        console.error('[AI Config] Error obteniendo configuración:', error);
        return res.status(500).json({ error: 'Error obteniendo configuración', details: error.message });
      }
      
      // Convertir a objeto con keys como propiedades
      const config = {};
      if (data) {
        data.forEach(item => {
          config[item.key] = {
            value: item.value,
            description: item.description,
            updated_at: item.updated_at,
            updated_by: item.updated_by
          };
        });
      }
      
      return res.status(200).json(config);
    }
    
    // GET /api/ai-config?key=system_prompt - Obtener configuración por clave
    if (req.method === 'GET' && req.query.key) {
      const { data, error } = await supabase
        .from('ai_config')
        .select('*')
        .eq('key', req.query.key)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Configuración no encontrada' });
        }
        console.error('[AI Config] Error obteniendo configuración:', error);
        return res.status(500).json({ error: 'Error obteniendo configuración', details: error.message });
      }
      
      return res.status(200).json(data);
    }
    
    // PUT /api/ai-config/:key - Actualizar configuración
    if (req.method === 'PUT') {
      if (!verifyApiKey(req)) {
        return res.status(401).json({ error: 'API key inválida o faltante' });
      }
      
      const key = req.query.key || req.body?.key;
      if (!key) {
        return res.status(400).json({ error: 'Se requiere el parámetro "key"' });
      }
      
      const { value, description } = req.body;
      if (!value) {
        return res.status(400).json({ error: 'Se requiere el campo "value"' });
      }
      
      // Validar que value sea un objeto JSON válido
      let jsonValue;
      try {
        jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
      } catch (e) {
        return res.status(400).json({ error: 'El campo "value" debe ser un JSON válido' });
      }
      
      const { data, error } = await supabase
        .from('ai_config')
        .upsert({
          key: key,
          value: jsonValue,
          description: description || null,
          updated_at: new Date().toISOString(),
          updated_by: req.body.updated_by || 'api'
        }, {
          onConflict: 'key'
        })
        .select()
        .single();
      
      if (error) {
        console.error('[AI Config] Error actualizando configuración:', error);
        return res.status(500).json({ error: 'Error actualizando configuración', details: error.message });
      }
      
      return res.status(200).json({ success: true, data });
    }
    
    // POST /api/ai-config - Crear nueva configuración
    if (req.method === 'POST') {
      if (!verifyApiKey(req)) {
        return res.status(401).json({ error: 'API key inválida o faltante' });
      }
      
      const { key, value, description } = req.body;
      
      if (!key || !value) {
        return res.status(400).json({ error: 'Se requieren los campos "key" y "value"' });
      }
      
      // Validar que value sea un objeto JSON válido
      let jsonValue;
      try {
        jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
      } catch (e) {
        return res.status(400).json({ error: 'El campo "value" debe ser un JSON válido' });
      }
      
      const { data, error } = await supabase
        .from('ai_config')
        .insert({
          key: key,
          value: jsonValue,
          description: description || null,
          updated_by: req.body.updated_by || 'api'
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'La clave ya existe. Usa PUT para actualizar.' });
        }
        console.error('[AI Config] Error creando configuración:', error);
        return res.status(500).json({ error: 'Error creando configuración', details: error.message });
      }
      
      return res.status(201).json({ success: true, data });
    }
    
    // Método no permitido
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('[AI Config] Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}
