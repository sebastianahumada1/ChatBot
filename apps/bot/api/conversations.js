// Endpoint para consultar conversaciones
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

// Handler principal
export default async function handler(req, res) {
  try {
    const supabase = getSupabaseClient();
    
    // GET /api/conversations?phoneNumber=XXX - Obtener conversación de un número
    if (req.method === 'GET' && req.query.phoneNumber) {
      const phoneNumber = req.query.phoneNumber;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      
      const { data, error, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('[Conversations] Error obteniendo conversación:', error);
        return res.status(500).json({ error: 'Error obteniendo conversación', details: error.message });
      }
      
      return res.status(200).json({
        phoneNumber,
        total: count || 0,
        limit,
        offset,
        messages: data || []
      });
    }
    
    // GET /api/conversations - Listar todas las conversaciones (con paginación)
    if (req.method === 'GET' && !req.query.phoneNumber) {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      
      // Usar una consulta SQL más eficiente para obtener conversaciones únicas
      // Obtener el último mensaje de cada número de teléfono
      const { data: lastMessages, error: lastError } = await supabase
        .from('messages')
        .select('phone_number, created_at')
        .order('created_at', { ascending: false });
      
      if (lastError) {
        console.error('[Conversations] Error obteniendo mensajes:', lastError);
        return res.status(500).json({ error: 'Error obteniendo conversaciones', details: lastError.message });
      }
      
      // Agrupar por número de teléfono y obtener estadísticas
      const conversationsMap = new Map();
      
      if (lastMessages) {
        for (const item of lastMessages) {
          const phone = item.phone_number;
          if (!conversationsMap.has(phone)) {
            conversationsMap.set(phone, {
              phoneNumber: phone,
              messageCount: 0,
              lastMessageAt: item.created_at
            });
          }
          conversationsMap.get(phone).messageCount++;
        }
      }
      
      // Obtener información completa de cada conversación
      const conversations = Array.from(conversationsMap.values());
      
      // Obtener información de pacientes y últimos mensajes
      for (const conv of conversations) {
        // Obtener paciente
        const { data: patient } = await supabase
          .from('patients')
          .select('name, document, email')
          .eq('phone_number', conv.phoneNumber)
          .single();
        
        if (patient) {
          conv.patientName = patient.name;
          conv.document = patient.document;
          conv.email = patient.email;
        }
        
        // Obtener último mensaje
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, role, created_at')
          .eq('phone_number', conv.phoneNumber)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (lastMessage) {
          conv.lastMessage = lastMessage.content;
          conv.lastMessageRole = lastMessage.role;
          conv.lastMessageAt = lastMessage.created_at;
        }
        
        // Obtener conteo de mensajes
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('phone_number', conv.phoneNumber);
        
        if (count !== null) {
          conv.messageCount = count;
        }
      }
      
      // Ordenar por último mensaje
      conversations.sort((a, b) => {
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
      });
      
      // Aplicar paginación
      const paginatedConversations = conversations.slice(offset, offset + limit);
      
      return res.status(200).json({
        total: conversations.length,
        limit,
        offset,
        conversations: paginatedConversations
      });
    }
    
    // Método no permitido
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('[Conversations] Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}
