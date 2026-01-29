// Endpoint para consultar citas desde Dentalink
const DENTALINK_API_URL = 'https://api.dentalink.healthatom.com/api/v1';
const DENTALINK_API_TOKEN = process.env.DENTALINK_API_TOKEN || '';

// Cache para configuración de Dentalink
let dentalinkConfig = null;
let dentalinkConfigLastFetch = null;
const DENTALINK_CONFIG_CACHE_TTL = 3600000; // 1 hora

// Generic Dentalink API request
async function dentalinkRequest(endpoint, method = 'GET', body = null) {
  if (!DENTALINK_API_TOKEN) {
    console.warn('[Appointments] DENTALINK_API_TOKEN no configurado');
    return null;
  }
  
  try {
    const url = `${DENTALINK_API_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Token ${DENTALINK_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    console.log(`[Appointments] ${method} ${endpoint}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Appointments] Error ${response.status}: ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Appointments] Error en request:', error);
    return null;
  }
}

// Fetch and cache Dentalink configuration (sucursales)
async function getDentalinkConfig() {
  if (dentalinkConfig && dentalinkConfigLastFetch && 
      (Date.now() - dentalinkConfigLastFetch) < DENTALINK_CONFIG_CACHE_TTL) {
    return dentalinkConfig;
  }
  
  const sucursalesResponse = await dentalinkRequest('/sucursales/');
  const sucursales = sucursalesResponse?.data || [];
  
  // Create location mapping
  const locationMapping = {};
  sucursales.forEach(sucursal => {
    const isManzanares = sucursal.nombre.toLowerCase().includes('manzanares');
    locationMapping[sucursal.id] = isManzanares ? 'manzanares' : 'rodadero';
  });
  
  dentalinkConfig = { sucursales, locationMapping };
  dentalinkConfigLastFetch = Date.now();
  
  return dentalinkConfig;
}

// Map Dentalink appointment to calendar format
function mapDentalinkAppointment(cita, locationMapping) {
  return {
    id: cita.id,
    appointment_date: cita.fecha,
    appointment_time: cita.hora_inicio.substring(0, 5), // "HH:MM" format
    location: locationMapping[cita.id_sucursal] || 'rodadero',
    service: cita.nombre_tratamiento || 'Consulta',
    status: mapDentalinkStatus(cita.id_estado),
    phone_number: '',
    patient: {
      name: cita.nombre_paciente || cita.nombre_social_paciente || 'Sin nombre',
      document: '',
      email: ''
    },
    dentalink_id: cita.id,
    dentist_name: cita.nombre_dentista,
    branch_name: cita.nombre_sucursal,
    duration: cita.duracion
  };
}

// Map Dentalink status to local status
function mapDentalinkStatus(idEstado) {
  const statusMap = {
    1: 'cancelled',      // Anulado
    2: 'confirmed',      // Confirmado
    3: 'completed',      // Atendido
    4: 'scheduled',      // Agendado
    5: 'no_show',        // No asistió
    6: 'waiting',        // En espera
    7: 'scheduled',      // No confirmado
    8: 'rescheduled'     // Reagendado
  };
  return statusMap[idEstado] || 'scheduled';
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    if (!DENTALINK_API_TOKEN) {
      return res.status(500).json({ error: 'DENTALINK_API_TOKEN no configurado' });
    }
    
    const config = await getDentalinkConfig();
    
    // Si hay startDate y endDate, obtener todas las citas en ese rango
    if (req.query.startDate && req.query.endDate) {
      const params = {
        fecha: { 
          gte: req.query.startDate, 
          lte: req.query.endDate 
        }
      };
      
      const response = await dentalinkRequest(`/citas/?q=${encodeURIComponent(JSON.stringify(params))}`);
      
      if (!response || !response.data) {
        console.error('[Appointments] Error obteniendo citas de Dentalink');
        return res.status(500).json({ error: 'Error obteniendo citas de Dentalink' });
      }
      
      // Filter active appointments (not cancelled)
      const activeAppointments = response.data.filter(cita => 
        cita.id_estado !== 1 // Not cancelled
      );
      
      // Map to calendar format
      const appointments = activeAppointments.map(cita => 
        mapDentalinkAppointment(cita, config.locationMapping)
      );
      
      console.log(`[Appointments] Citas cargadas desde Dentalink: ${appointments.length}`);
      
      return res.status(200).json({
        appointments,
        source: 'dentalink'
      });
    }
    
    // Si hay phoneNumber, obtener citas de un paciente específico
    const phoneNumber = req.query.phoneNumber;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Se requiere phoneNumber o startDate/endDate' });
    }
    
    // Search patient by phone in Dentalink
    let celular = phoneNumber;
    if (celular.startsWith('57')) {
      celular = celular.substring(2);
    }
    
    const patientParams = { celular };
    const patientResponse = await dentalinkRequest(`/pacientes/?q=${encodeURIComponent(JSON.stringify(patientParams))}`);
    
    if (!patientResponse?.data || patientResponse.data.length === 0) {
      return res.status(200).json({
        phoneNumber,
        appointments: [],
        source: 'dentalink'
      });
    }
    
    const dentalinkPatientId = patientResponse.data[0].id;
    
    // Get patient appointments
    const citasResponse = await dentalinkRequest(`/pacientes/${dentalinkPatientId}/citas`);
    
    if (!citasResponse?.data) {
      return res.status(200).json({
        phoneNumber,
        appointments: [],
        source: 'dentalink'
      });
    }
    
    // Filter active appointments and map
    const activeAppointments = citasResponse.data.filter(cita => 
      cita.id_estado !== 1 && // Not cancelled
      new Date(cita.fecha) >= new Date() // Future appointments
    );
    
    const appointments = activeAppointments.map(cita => 
      mapDentalinkAppointment(cita, config.locationMapping)
    );
    
    return res.status(200).json({
      phoneNumber,
      appointments,
      source: 'dentalink'
    });
    
  } catch (error) {
    console.error('[Appointments] Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}
