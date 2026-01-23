// Endpoint para consultar citas
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
  try {
    const supabase = getSupabaseClient();
    
    if (req.method === 'GET') {
      const phoneNumber = req.query.phoneNumber;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Se requiere phoneNumber' });
      }
      
      // Obtener citas del paciente
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('phone_number', phoneNumber)
        .in('status', ['scheduled', 'confirmed'])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      
      if (error) {
        console.error('[Appointments] Error obteniendo citas:', error);
        return res.status(500).json({ error: 'Error obteniendo citas', details: error.message });
      }
      
      return res.status(200).json({
        phoneNumber,
        appointments: appointments || []
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Appointments] Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}
