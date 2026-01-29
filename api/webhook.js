// Supabase
import { createClient } from '@supabase/supabase-js';

// Token de verificación de Meta (configurado en variables de entorno de Vercel)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '1234';

// Token de acceso de Meta para enviar mensajes (desde variables de entorno)
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';

// Token de OpenAI para respuestas dinámicas
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// ID del número de teléfono de WhatsApp Business
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '976313762231753';

// ==================== DENTALINK API CONFIGURATION ====================
const DENTALINK_API_URL = 'https://api.dentalink.healthatom.com/api/v1';
const DENTALINK_API_TOKEN = process.env.DENTALINK_API_TOKEN || '';

// Cache para configuración de Dentalink (sucursales, dentistas)
let dentalinkConfig = null;
let dentalinkConfigLastFetch = null;
const DENTALINK_CONFIG_CACHE_TTL = 3600000; // 1 hora

// Cliente Supabase
let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Chatbot] SUPABASE_URL o SUPABASE_ANON_KEY no configurados. Las funciones de base de datos no estarán disponibles.');
      return null;
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

// ==================== DENTALINK API HELPER FUNCTIONS ====================

// Generic Dentalink API request
async function dentalinkRequest(endpoint, method = 'GET', body = null) {
  if (!DENTALINK_API_TOKEN) {
    console.warn('[Dentalink] DENTALINK_API_TOKEN no configurado');
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
    
    console.log(`[Dentalink] ${method} ${endpoint}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Dentalink] Error ${response.status}: ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Dentalink] Error en request:', error);
    return null;
  }
}

// Fetch and cache Dentalink configuration (sucursales, dentistas)
async function getDentalinkConfig() {
  // Return cached config if still valid
  if (dentalinkConfig && dentalinkConfigLastFetch && 
      (Date.now() - dentalinkConfigLastFetch) < DENTALINK_CONFIG_CACHE_TTL) {
    return dentalinkConfig;
  }
  
  console.log('[Dentalink] Fetching configuration (sucursales, dentistas)...');
  
  // Fetch sucursales
  const sucursalesResponse = await dentalinkRequest('/sucursales/');
  const sucursales = sucursalesResponse?.data || [];
  console.log(`[Dentalink] Sucursales fetched: ${sucursales.length}`, sucursales.map(s => ({ id: s.id, nombre: s.nombre })));
  
  // Fetch dentistas
  const dentistasResponse = await dentalinkRequest('/dentistas/');
  const dentistas = dentistasResponse?.data || [];
  console.log(`[Dentalink] Dentistas fetched: ${dentistas.length}`, dentistas.map(d => ({ id: d.id, nombre: d.nombre, email: d.email })));
  
  // Create location mapping: name contains "Manzanares" -> manzanares, otherwise -> rodadero
  const locationMapping = {};
  const sucursalIdMapping = {};
  
  sucursales.forEach(sucursal => {
    const isManzanares = sucursal.nombre.toLowerCase().includes('manzanares');
    const locationKey = isManzanares ? 'manzanares' : 'rodadero';
    locationMapping[sucursal.id] = locationKey;
    sucursalIdMapping[locationKey] = sucursal.id;
    console.log(`[Dentalink] Sucursal mapping: ${sucursal.id} (${sucursal.nombre}) -> ${locationKey}`);
  });
  
  // Find default dentist (Dr. Albeiro Garcia)
  let defaultDentistaId = null;
  
  // First check environment variable
  if (process.env.DENTALINK_DEFAULT_DENTISTA_ID) {
    defaultDentistaId = parseInt(process.env.DENTALINK_DEFAULT_DENTISTA_ID);
    console.log(`[Dentalink] Using dentist ID from env: ${defaultDentistaId}`);
  } else {
    // Try to find by name
    for (const dentista of dentistas) {
      const nombre = (dentista.nombre || '').toLowerCase();
      const email = (dentista.email || '').toLowerCase();
      if (nombre.includes('albeiro') || email.includes('albeiro') || email.includes('dralbeirogarcia')) {
        defaultDentistaId = dentista.id;
        console.log(`[Dentalink] Default dentist found by name: ${dentista.nombre} (ID: ${dentista.id})`);
        break;
      }
    }
    
    // If not found by name, use the first one
    if (!defaultDentistaId && dentistas.length > 0) {
      defaultDentistaId = dentistas[0].id;
      console.log(`[Dentalink] Using first dentist as default: ID ${defaultDentistaId}`);
    }
  }
  
  if (!defaultDentistaId) {
    console.warn('[Dentalink] WARNING: No dentista ID available. Agendas endpoint will not work.');
  }
  
  dentalinkConfig = {
    sucursales,
    dentistas,
    locationMapping,        // { sucursalId: 'rodadero' | 'manzanares' }
    sucursalIdMapping,      // { 'rodadero': sucursalId, 'manzanares': sucursalId }
    defaultDentistaId
  };
  
  dentalinkConfigLastFetch = Date.now();
  console.log(`[Dentalink] Config loaded: ${sucursales.length} sucursales, ${dentistas.length} dentistas, defaultDentistaId: ${defaultDentistaId}`);
  
  return dentalinkConfig;
}

// Search patient in Dentalink by phone (celular)
async function searchDentalinkPatientByPhone(phone) {
  // Format phone number - remove country code prefix if present
  let celular = phone;
  if (celular.startsWith('57')) {
    celular = celular.substring(2); // Remove Colombia country code
  }
  
  const params = { celular };
  const response = await dentalinkRequest(`/pacientes/?q=${encodeURIComponent(JSON.stringify(params))}`);
  
  if (response?.data && response.data.length > 0) {
    console.log(`[Dentalink] Patient found by phone ${phone}: ID ${response.data[0].id}`);
    return response.data[0];
  }
  
  // Also try with full number including country code
  const paramsWithCode = { celular: phone };
  const responseWithCode = await dentalinkRequest(`/pacientes/?q=${encodeURIComponent(JSON.stringify(paramsWithCode))}`);
  
  if (responseWithCode?.data && responseWithCode.data.length > 0) {
    console.log(`[Dentalink] Patient found by full phone ${phone}: ID ${responseWithCode.data[0].id}`);
    return responseWithCode.data[0];
  }
  
  return null;
}

// Search patient in Dentalink by name
async function searchDentalinkPatientByName(name) {
  if (!name) return null;
  
  const params = { nombre: name };
  const response = await dentalinkRequest(`/pacientes/?q=${encodeURIComponent(JSON.stringify(params))}`);
  
  if (response?.data && response.data.length > 0) {
    console.log(`[Dentalink] Patient found by name "${name}": ID ${response.data[0].id}`);
    return response.data[0];
  }
  
  return null;
}

// Create patient in Dentalink
async function createDentalinkPatient(patientData) {
  const { name, phone, email } = patientData;
  
  if (!name) {
    console.warn('[Dentalink] Cannot create patient without name');
    return null;
  }
  
  // Split name into nombre and apellidos
  const nameParts = name.trim().split(' ');
  const nombre = nameParts[0] || 'Sin nombre';
  const apellidos = nameParts.slice(1).join(' ') || 'Sin apellido';
  
  // Format phone
  let celular = phone || '';
  if (celular.startsWith('57')) {
    celular = celular.substring(2);
  }
  
  const body = {
    nombre,
    apellidos,
    celular,
    email: email || ''
  };
  
  console.log(`[Dentalink] Creating patient: ${nombre} ${apellidos}`);
  const response = await dentalinkRequest('/pacientes/', 'POST', body);
  
  if (response?.data) {
    console.log(`[Dentalink] Patient created: ID ${response.data.id}`);
    return response.data;
  }
  
  return null;
}

// Get available slots from Dentalink for a specific date and location
async function getDentalinkAvailableSlots(date, location = null, daysAhead = 7) {
  const config = await getDentalinkConfig();
  if (!config) {
    console.warn('[Dentalink] Config not available');
    return [];
  }
  
  // Check if we have a valid dentista ID
  if (!config.defaultDentistaId) {
    console.warn('[Dentalink] No dentista ID configured, cannot query agendas');
    return [];
  }
  
  // Check if we have sucursales
  if (Object.keys(config.sucursalIdMapping).length === 0) {
    console.warn('[Dentalink] No sucursales configured, cannot query agendas');
    return [];
  }
  
  console.log(`[Dentalink] Querying slots with dentistaId: ${config.defaultDentistaId}, sucursales: ${JSON.stringify(config.sucursalIdMapping)}`);
  
  const slots = [];
  const startDate = new Date(date);
  
  // Query for each day in the range
  for (let i = 0; i < daysAhead; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Query for each location (or specific location if provided)
    const locationsToQuery = location 
      ? [location] 
      : Object.keys(config.sucursalIdMapping);
    
    for (const loc of locationsToQuery) {
      const sucursalId = config.sucursalIdMapping[loc];
      if (!sucursalId) continue;
      
      const params = {
        id_sucursal: sucursalId,
        fecha: dateStr,
        duracion: 30, // 30 minutes default
        id_dentista: config.defaultDentistaId
      };
      
      console.log(`[Dentalink] Querying agendas: ${JSON.stringify(params)}`);
      const response = await dentalinkRequest(`/agendas/?q=${encodeURIComponent(JSON.stringify(params))}`);
      
      if (response?.data) {
        console.log(`[Dentalink] Got ${response.data.length} slots for ${dateStr} at ${loc}`);
        // Filter available slots (id_paciente === 0 means available)
        const availableSlots = response.data.filter(slot => slot.id_paciente === 0);
        
        availableSlots.forEach(slot => {
          slots.push({
            date: dateStr,
            time: slot.hora_inicio.substring(0, 5), // "09:00" format
            location: loc,
            dentistaId: slot.id_dentista,
            dentistaNombre: slot.nombre_dentista,
            sucursalId: sucursalId
          });
        });
      }
    }
  }
  
  console.log(`[Dentalink] Found ${slots.length} available slots total`);
  return slots;
}

// Create appointment in Dentalink
async function createDentalinkAppointment(appointmentData) {
  const { patientId, date, time, location, service } = appointmentData;
  
  const config = await getDentalinkConfig();
  if (!config) {
    console.warn('[Dentalink] Config not available');
    return null;
  }
  
  const sucursalId = config.sucursalIdMapping[location] || Object.values(config.sucursalIdMapping)[0];
  
  const body = {
    id_paciente: patientId,
    id_dentista: config.defaultDentistaId,
    id_sucursal: sucursalId,
    id_estado: 7, // "No confirmado"
    id_sillon: 1, // Default chair
    fecha: date,
    hora_inicio: time,
    duracion: 30,
    comentario: service || 'Cita agendada via WhatsApp'
  };
  
  console.log(`[Dentalink] Creating appointment: ${date} ${time} at ${location}`);
  const response = await dentalinkRequest('/citas/', 'POST', body);
  
  if (response?.data) {
    console.log(`[Dentalink] Appointment created: ID ${response.data.id}`);
    return response.data;
  }
  
  return null;
}

// Get appointments from Dentalink for a date range
async function getDentalinkAppointments(startDate, endDate) {
  const params = {
    fecha: { gte: startDate, lte: endDate }
  };
  
  const response = await dentalinkRequest(`/citas/?q=${encodeURIComponent(JSON.stringify(params))}`);
  
  if (response?.data) {
    console.log(`[Dentalink] Found ${response.data.length} appointments`);
    return response.data;
  }
  
  return [];
}

// ==================== END DENTALINK API FUNCTIONS ====================

// Guardar mensaje en Supabase
async function saveMessage(phoneNumber, role, content, messageId = null) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Chatbot] Supabase no disponible, no se guardará el mensaje');
      return;
    }
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        phone_number: phoneNumber,
        role: role, // 'user' o 'assistant'
        content: content,
        message_id: messageId
      });
    
    if (error) {
      console.error('[Chatbot] Error guardando mensaje:', error);
    } else {
      console.log(`[Chatbot] Mensaje guardado: ${role} de ${phoneNumber}`);
    }
  } catch (error) {
    console.error('[Chatbot] Error guardando mensaje:', error);
  }
}

// Obtener historial de conversación (últimos 20 mensajes)
async function getConversationHistory(phoneNumber, limit = 20) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Chatbot] Supabase no disponible, no se recuperará historial');
      return [];
    }
    
    const { data, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('[Chatbot] Error obteniendo historial:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('[Chatbot] Error obteniendo historial:', error);
    return [];
  }
}

// Obtener prompt del bot desde Supabase (tabla bot_prompt)
async function getBotPrompt() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Chatbot] Supabase no disponible, usando prompt por defecto');
      return 'Eres un asistente virtual amable y profesional. Responde de manera breve y útil.';
    }
    
    const { data, error } = await supabase
      .from('bot_prompt')
      .select('prompt')
      .eq('id', 'main')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[Chatbot] Prompt no encontrado, usando por defecto');
        return 'Eres un asistente virtual amable y profesional. Responde de manera breve y útil.';
      }
      console.error('[Chatbot] Error obteniendo prompt:', error);
      return 'Eres un asistente virtual amable y profesional. Responde de manera breve y útil.';
    }
    
    return data?.prompt || 'Eres un asistente virtual amable y profesional. Responde de manera breve y útil.';
  } catch (error) {
    console.error('[Chatbot] Error obteniendo prompt:', error);
    return 'Eres un asistente virtual amable y profesional. Responde de manera breve y útil.';
  }
}

// Obtener horarios de negocio del prompt (parsear si es necesario)
function extractBusinessHours(prompt) {
  // Horarios por defecto basados en el prompt estándar
  const defaultHours = {
    rodadero: 'L-V 08:00–18:00; Sáb 08:00–13:00; Festivos: cerrado',
    manzanares: 'L-V 08:00–17:00; Sáb 08:00–12:00; Festivos: cerrado'
  };
  
  // Intentar extraer horarios del prompt si están definidos
  // Buscar patrones como "Rodadero: L-V 08:00–18:00"
  const rodaderoMatch = prompt.match(/Rodadero[:\s]+([^;\n]+(?:;[^;\n]+)*)/i);
  const manzanaresMatch = prompt.match(/Manzanares[:\s]+([^;\n]+(?:;[^;\n]+)*)/i);
  
  return {
    rodadero: rodaderoMatch ? rodaderoMatch[1].trim() : defaultHours.rodadero,
    manzanares: manzanaresMatch ? manzanaresMatch[1].trim() : defaultHours.manzanares
  };
}

// Verificar si un paciente existe por número de teléfono
async function getPatientByPhone(phoneNumber) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Chatbot] Supabase no disponible, no se puede verificar paciente');
      return null;
    }
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el paciente
        return null;
      }
      console.error('[Chatbot] Error obteniendo paciente:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[Chatbot] Error obteniendo paciente:', error);
    return null;
  }
}

// Crear o actualizar un paciente (sync with Supabase and Dentalink)
async function createOrUpdatePatient(phoneNumber, patientData) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Chatbot] Supabase no disponible, no se puede crear/actualizar paciente');
      return null;
    }
    
    const { name, document, email } = patientData;
    
    // Verificar si el paciente ya existe en Supabase
    const existingPatient = await getPatientByPhone(phoneNumber);
    
    if (existingPatient) {
      // Actualizar paciente existente solo con datos nuevos
      const updateData = {
        updated_at: getColombiaDate().toISOString()
      };
      
      if (name && !existingPatient.name) updateData.name = name;
      if (document && !existingPatient.document) updateData.document = document;
      if (email && !existingPatient.email) updateData.email = email;
      
      // Solo actualizar si hay datos nuevos
      if (Object.keys(updateData).length > 1) {
        const { data, error } = await supabase
          .from('patients')
          .update(updateData)
          .eq('phone_number', phoneNumber)
          .select()
          .single();
        
        if (error) {
          console.error('[Chatbot] Error actualizando paciente:', error);
          return null;
        }
        
        console.log(`[Chatbot] ✓ Paciente actualizado: ${phoneNumber}`);
        return data;
      } else {
        console.log(`[Chatbot] Paciente ya existe y tiene todos los datos: ${phoneNumber}`);
        return existingPatient;
      }
    } else {
      // Crear nuevo paciente en Supabase
      const { data, error } = await supabase
        .from('patients')
        .insert({
          phone_number: phoneNumber,
          name: name || null,
          document: document || null,
          email: email || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('[Chatbot] Error creando paciente:', error);
        return null;
      }
      
      console.log(`[Chatbot] ✓ Paciente creado: ${phoneNumber}`);
      return data;
    }
  } catch (error) {
    console.error('[Chatbot] Error creando/actualizando paciente:', error);
    return null;
  }
}

// Ensure patient exists in Dentalink and sync IDs
async function ensureDentalinkPatient(phoneNumber, patientData) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const { name, email } = patientData;
    
    // Get local patient
    const localPatient = await getPatientByPhone(phoneNumber);
    
    // If already has Dentalink ID, return it
    if (localPatient?.dentalink_patient_id) {
      console.log(`[Chatbot] Patient already has Dentalink ID: ${localPatient.dentalink_patient_id}`);
      return localPatient.dentalink_patient_id;
    }
    
    // Search in Dentalink by phone
    let dentalinkPatient = await searchDentalinkPatientByPhone(phoneNumber);
    
    // If not found by phone, search by name
    if (!dentalinkPatient && name) {
      dentalinkPatient = await searchDentalinkPatientByName(name);
    }
    
    // If still not found, create in Dentalink
    if (!dentalinkPatient) {
      if (!name) {
        console.warn('[Chatbot] Cannot create Dentalink patient without name');
        return null;
      }
      
      dentalinkPatient = await createDentalinkPatient({
        name,
        phone: phoneNumber,
        email
      });
    }
    
    if (!dentalinkPatient) {
      console.error('[Chatbot] Failed to ensure Dentalink patient');
      return null;
    }
    
    // Update local patient with Dentalink ID
    if (localPatient) {
      const { error } = await supabase
        .from('patients')
        .update({ 
          dentalink_patient_id: dentalinkPatient.id,
          updated_at: getColombiaDate().toISOString()
        })
        .eq('phone_number', phoneNumber);
      
      if (error) {
        console.error('[Chatbot] Error updating dentalink_patient_id:', error);
      } else {
        console.log(`[Chatbot] ✓ Synced Dentalink ID ${dentalinkPatient.id} for ${phoneNumber}`);
      }
    }
    
    return dentalinkPatient.id;
  } catch (error) {
    console.error('[Chatbot] Error ensuring Dentalink patient:', error);
    return null;
  }
}

// ==================== FUNCIONES DE GESTIÓN DE CITAS ====================

// Configuración de huso horario: Colombia (GMT-5)
const COLOMBIA_TIMEZONE = 'America/Bogota';
const COLOMBIA_OFFSET = -5; // GMT-5

// Función para obtener fecha actual en Colombia
function getColombiaDate() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const colombiaTime = new Date(utc + (COLOMBIA_OFFSET * 3600000));
  return colombiaTime;
}

// Función para convertir fecha a Colombia
function toColombiaDate(date) {
  if (!date) return getColombiaDate();
  const d = new Date(date);
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (COLOMBIA_OFFSET * 3600000));
}

// Función para obtener fecha en formato YYYY-MM-DD en Colombia
function getColombiaDateString(date) {
  const colDate = toColombiaDate(date);
  const year = colDate.getFullYear();
  const month = String(colDate.getMonth() + 1).padStart(2, '0');
  const day = String(colDate.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// Generar slots disponibles basándose en horarios de negocio
function generateAvailableSlots(businessHours, startDate, daysAhead = 30) {
  const slots = [];
  const today = toColombiaDate(startDate);
  today.setHours(0, 0, 0, 0);
  
  // Mapeo de días de la semana
  const dayMap = {
    0: 'sunday',    // Domingo - cerrado
    1: 'monday',    // Lunes - L-V
    2: 'tuesday',   // Martes - L-V
    3: 'wednesday', // Miércoles - L-V
    4: 'thursday',  // Jueves - L-V
    5: 'friday',    // Viernes - L-V
    6: 'saturday'   // Sábado - horario especial
  };
  
  // Horarios específicos por sede y día
  // Formato esperado: "L-V 08:00–18:00; Sáb 08:00–13:00; Festivos y domingos: cerrado"
  const parseSchedule = (hoursString, location, dayOfWeek) => {
    if (!hoursString || typeof hoursString !== 'string') {
      return null;
    }
    
    // Domingo siempre cerrado
    if (dayOfWeek === 'sunday') {
      return null;
    }
    
    // Verificar si menciona "cerrado" o "festivos"
    if (hoursString.toLowerCase().includes('cerrado')) {
      // Si es domingo o festivo, retornar null
      if (dayOfWeek === 'sunday') {
        return null;
      }
    }
    
    // Lunes a Viernes (L-V)
    if (dayOfWeek !== 'saturday' && dayOfWeek !== 'sunday') {
      const lvMatch = hoursString.match(/L-V\s+(\d{2}:\d{2})[–-](\d{2}:\d{2})/);
      if (lvMatch) {
        return {
          start: lvMatch[1],
          end: lvMatch[2],
          interval: 30 // Intervalo de 30 minutos por defecto
        };
      }
    }
    
    // Sábado (Sáb)
    if (dayOfWeek === 'saturday') {
      const sabMatch = hoursString.match(/Sáb\s+(\d{2}:\d{2})[–-](\d{2}:\d{2})/);
      if (sabMatch) {
        return {
          start: sabMatch[1],
          end: sabMatch[2],
          interval: 30
        };
      }
    }
    
    return null;
  };
  
  // Horarios por defecto si no hay configuración (solo para L-V)
  const defaultHours = {
    rodadero: { start: '08:00', end: '18:00', interval: 30 },
    manzanares: { start: '08:00', end: '17:00', interval: 30 }
  };
  
  for (let day = 0; day < daysAhead; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day);
    const dayOfWeek = dayMap[currentDate.getDay()];
    
    // Domingo siempre cerrado (no generar slots)
    if (dayOfWeek === 'sunday') {
      continue;
    }
    
    // Procesar cada ubicación
    ['rodadero', 'manzanares'].forEach(location => {
      const hours = businessHours[location];
      
      // Parsear horarios según el día
      let schedule = null;
      if (hours) {
        schedule = parseSchedule(hours, location, dayOfWeek);
      }
      
      // Si no se pudo parsear y es día laboral (L-V), usar defaults
      if (!schedule && dayOfWeek !== 'saturday' && dayOfWeek !== 'sunday') {
        schedule = defaultHours[location];
      }
      
      // Si no hay schedule, no generar slots (día cerrado)
      if (!schedule) {
        return; // Continuar con la siguiente ubicación
      }
      
      // Generar slots para este día y ubicación
      const [startHour, startMin] = schedule.start.split(':').map(Number);
      const [endHour, endMin] = schedule.end.split(':').map(Number);
      const interval = schedule.interval || 30;
      
      let currentTime = new Date(currentDate);
      currentTime.setHours(startHour, startMin, 0, 0);
      
      const endTime = new Date(currentDate);
      endTime.setHours(endHour, endMin, 0, 0);
      
      // No generar slots si el horario de fin es antes del inicio
      if (endTime <= currentTime) {
        return;
      }
      
      while (currentTime < endTime) {
        const colDate = toColombiaDate(currentTime);
        slots.push({
          date: getColombiaDateString(colDate),
          time: `${String(colDate.getHours()).padStart(2, '0')}:${String(colDate.getMinutes()).padStart(2, '0')}`,
          location: location,
          datetime: colDate
        });
        
        currentTime.setMinutes(currentTime.getMinutes() + interval);
      }
    });
  }
  
  return slots;
}

// Consultar slots disponibles para una fecha y ubicación (using Dentalink API)
async function getAvailableSlots(date, location = null, daysAhead = 7) {
  try {
    // Use Dentalink API to get available slots
    const slots = await getDentalinkAvailableSlots(date, location, daysAhead);
    
    if (slots && slots.length > 0) {
      console.log(`[Chatbot] Slots disponibles desde Dentalink: ${slots.length}`);
      return slots;
    }
    
    // Fallback to local generation if Dentalink fails or returns empty
    console.warn('[Chatbot] Dentalink no disponible, usando generación local de slots');
    
    // Obtener horarios de negocio del prompt
    const botPrompt = await getBotPrompt();
    const businessHours = extractBusinessHours(botPrompt);
    
    // Generar todos los slots posibles
    const allSlots = generateAvailableSlots(businessHours, date, daysAhead);
    
    // Filtrar por ubicación si se especifica
    let filteredSlots = allSlots;
    if (location) {
      filteredSlots = allSlots.filter(slot => slot.location === location);
    }
    
    console.log(`[Chatbot] Slots generados localmente: ${filteredSlots.length}`);
    return filteredSlots;
  } catch (error) {
    console.error('[Chatbot] Error consultando slots disponibles:', error);
    return [];
  }
}

// Crear/reservar una cita (using Dentalink API)
async function createAppointment(phoneNumber, appointmentData) {
  try {
    const { date, time, location, service, notes } = appointmentData;
    
    // Obtener paciente local
    const patient = await getPatientByPhone(phoneNumber);
    if (!patient) {
      console.warn(`[Chatbot] Paciente no encontrado para ${phoneNumber}`);
      return null;
    }
    
    // Ensure patient exists in Dentalink and get their ID
    const dentalinkPatientId = await ensureDentalinkPatient(phoneNumber, {
      name: patient.name,
      email: patient.email
    });
    
    if (!dentalinkPatientId) {
      console.error('[Chatbot] No se pudo obtener/crear paciente en Dentalink');
      return { error: 'No se pudo vincular paciente con Dentalink' };
    }
    
    // Create appointment in Dentalink
    const dentalinkAppointment = await createDentalinkAppointment({
      patientId: dentalinkPatientId,
      date,
      time,
      location: location || 'rodadero',
      service: service || notes || 'Cita agendada via WhatsApp'
    });
    
    if (!dentalinkAppointment) {
      console.error('[Chatbot] Error creando cita en Dentalink');
      return { error: 'Error al crear cita en Dentalink' };
    }
    
    console.log(`[Chatbot] ✓ Cita creada en Dentalink: ${date} ${time} en ${location} para ${phoneNumber}`);
    
    // Return appointment data in a compatible format
    return {
      id: dentalinkAppointment.id,
      phone_number: phoneNumber,
      appointment_date: date,
      appointment_time: time,
      location: location || 'rodadero',
      service: service,
      status: dentalinkAppointment.estado_cita || 'scheduled',
      dentalink_id: dentalinkAppointment.id,
      patient_name: dentalinkAppointment.nombre_paciente
    };
  } catch (error) {
    console.error('[Chatbot] Error creando cita:', error);
    return null;
  }
}

// Obtener citas de un paciente (from Dentalink)
async function getPatientAppointments(phoneNumber, status = null) {
  try {
    // Get patient from local DB
    const patient = await getPatientByPhone(phoneNumber);
    if (!patient?.dentalink_patient_id) {
      console.log('[Chatbot] Patient has no Dentalink ID, searching...');
      // Try to find patient in Dentalink by phone
      const dentalinkPatient = await searchDentalinkPatientByPhone(phoneNumber);
      if (!dentalinkPatient) {
        return [];
      }
      // Get appointments for this Dentalink patient
      const response = await dentalinkRequest(`/pacientes/${dentalinkPatient.id}/citas`);
      if (!response?.data) return [];
      
      // Map to local format
      const config = await getDentalinkConfig();
      return response.data.map(cita => ({
        id: cita.id,
        appointment_date: cita.fecha,
        appointment_time: cita.hora_inicio.substring(0, 5),
        location: config.locationMapping[cita.id_sucursal] || 'rodadero',
        service: cita.nombre_tratamiento,
        status: mapDentalinkStatus(cita.id_estado),
        dentalink_id: cita.id
      })).filter(apt => !status || apt.status === status);
    }
    
    // Get appointments from Dentalink
    const response = await dentalinkRequest(`/pacientes/${patient.dentalink_patient_id}/citas`);
    if (!response?.data) return [];
    
    // Map to local format
    const config = await getDentalinkConfig();
    return response.data.map(cita => ({
      id: cita.id,
      appointment_date: cita.fecha,
      appointment_time: cita.hora_inicio.substring(0, 5),
      location: config.locationMapping[cita.id_sucursal] || 'rodadero',
      service: cita.nombre_tratamiento,
      status: mapDentalinkStatus(cita.id_estado),
      dentalink_id: cita.id
    })).filter(apt => !status || apt.status === status);
  } catch (error) {
    console.error('[Chatbot] Error obteniendo citas del paciente:', error);
    return [];
  }
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

// Modificar/reagendar una cita (in Dentalink)
async function rescheduleAppointment(appointmentId, newDate, newTime, newLocation = null) {
  try {
    // Verificar que el nuevo slot esté disponible
    const location = newLocation || 'rodadero';
    const availableSlots = await getAvailableSlots(newDate, location, 1);
    const slotKey = `${newDate}|${newTime}|${location}`;
    const isAvailable = availableSlots.some(slot => 
      `${slot.date}|${slot.time}|${slot.location}` === slotKey
    );
    
    if (!isAvailable) {
      console.warn(`[Chatbot] Nuevo slot no disponible: ${slotKey}`);
      return { error: 'Nuevo slot no disponible' };
    }
    
    // Get Dentalink config for sucursal mapping
    const config = await getDentalinkConfig();
    const sucursalId = config.sucursalIdMapping[location] || Object.values(config.sucursalIdMapping)[0];
    
    // Update appointment in Dentalink using PUT
    const updateBody = {
      fecha: newDate,
      hora_inicio: newTime,
      id_sucursal: sucursalId,
      id_estado: 8 // Reagendado
    };
    
    const response = await dentalinkRequest(`/citas/${appointmentId}`, 'PUT', updateBody);
    
    if (!response?.data) {
      console.error('[Chatbot] Error reagendando cita en Dentalink');
      return { error: 'Error al reagendar cita en Dentalink' };
    }
    
    console.log(`[Chatbot] ✓ Cita reagendada en Dentalink: ${appointmentId}`);
    return {
      id: response.data.id,
      appointment_date: newDate,
      appointment_time: newTime,
      location: location,
      status: 'rescheduled',
      dentalink_id: response.data.id
    };
  } catch (error) {
    console.error('[Chatbot] Error reagendando cita:', error);
    return null;
  }
}

// Cancelar una cita (in Dentalink)
async function cancelAppointment(appointmentId) {
  try {
    // Update appointment status to cancelled (id_estado = 1) in Dentalink
    const updateBody = {
      id_estado: 1 // Anulado
    };
    
    const response = await dentalinkRequest(`/citas/${appointmentId}`, 'PUT', updateBody);
    
    if (!response?.data) {
      console.error('[Chatbot] Error cancelando cita en Dentalink');
      return null;
    }
    
    console.log(`[Chatbot] ✓ Cita cancelada en Dentalink: ${appointmentId}`);
    return {
      id: response.data.id,
      status: 'cancelled',
      dentalink_id: response.data.id
    };
  } catch (error) {
    console.error('[Chatbot] Error cancelando cita:', error);
    return null;
  }
}

// Detectar agendamiento y extraer información del paciente en una sola llamada (optimizado)
async function detectBookingAndExtractPatientInfo(conversationHistory, currentMessage) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('[Chatbot] OPENAI_API_KEY no disponible');
      return { isBooking: false, patientInfo: null };
    }
    
    // Prompt combinado para detectar CONFIRMACIÓN explícita y extraer información
    const combinedPrompt = `Analiza la siguiente conversación y:
1. Determina si el usuario está CONFIRMANDO EXPLÍCITAMENTE una cita médica (NO solo expresando intención)
2. Si es confirmación, extrae la información del paciente Y de la cita

IMPORTANTE: Solo marca "isBooking": true si el usuario CONFIRMA EXPLÍCITAMENTE (dice "sí", "confirmo", "acepto", "correcto", "está bien", "de acuerdo", etc.)
NO marques true si solo está preguntando, consultando o expresando intención sin confirmar.

Responde SOLO con un JSON válido en este formato exacto:
{
  "isBooking": true o false,
  "patientInfo": {
    "name": "nombre completo o null",
    "document": "documento o null",
    "email": "correo o null"
  },
  "appointmentInfo": {
    "date": "YYYY-MM-DD o null (SIEMPRE con año completo, si no tiene año asume 2026)",
    "time": "HH:MM o null",
    "location": "rodadero o manzanares o null",
    "service": "servicio solicitado o null"
  }
}

Indicadores de CONFIRMACIÓN (isBooking: true):
- El usuario dice "sí", "confirmo", "acepto", "correcto", "está bien", "de acuerdo", "perfecto"
- El usuario confirma explícitamente después de ver un resumen de cita
- El usuario dice "agenda" o "reserva" después de proporcionar todos los datos

NO es confirmación (isBooking: false):
- El usuario solo pregunta por disponibilidad
- El usuario proporciona datos pero no confirma
- El usuario dice "quiero agendar" sin confirmar explícitamente
- El bot muestra un resumen pero el usuario no ha confirmado aún

Conversación:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
Usuario actual: ${currentMessage}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout para esta llamada

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: combinedPrompt },
            { role: 'user', content: 'Analiza la conversación y responde con el JSON.' }
          ],
          max_tokens: 150,
          temperature: 0.2
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('[Chatbot] Error en detección/extracción:', response.status);
        return { isBooking: false, patientInfo: null };
      }

      const data = await response.json();
      const extractedText = data.choices?.[0]?.message?.content?.trim();
      
      if (!extractedText) {
        return { isBooking: false, patientInfo: null };
      }

      // Limpiar el texto (puede venir con markdown code blocks)
      const cleanedText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const result = JSON.parse(cleanedText);
        
        const isBooking = result.isBooking === true;
        let patientInfo = null;
        let appointmentInfo = null;
        
        if (isBooking && result.patientInfo) {
          const info = result.patientInfo;
          // Validar que al menos un campo tenga valor
          if (info.name || info.document || info.email) {
            patientInfo = {
              name: info.name && info.name !== 'null' && info.name !== null ? info.name : null,
              document: info.document && info.document !== 'null' && info.document !== null ? info.document : null,
              email: info.email && info.email !== 'null' && info.email !== null ? info.email : null
            };
          }
        }
        
        if (isBooking && result.appointmentInfo) {
          const aptInfo = result.appointmentInfo;
          // Validar formato de fecha (YYYY-MM-DD) y hora (HH:MM)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          const dateRegexShort = /^\d{2}-\d{2}$/; // MM-DD sin año
          const timeRegex = /^\d{2}:\d{2}$/;
          
          let normalizedDate = null;
          if (aptInfo.date && aptInfo.date !== 'null' && aptInfo.date !== null) {
            // Si la fecha tiene año completo
            if (dateRegex.test(aptInfo.date)) {
              normalizedDate = aptInfo.date;
            } 
            // Si la fecha no tiene año, agregar 2026
            else if (dateRegexShort.test(aptInfo.date)) {
              normalizedDate = `2026-${aptInfo.date}`;
              console.log(`[Chatbot] Fecha sin año detectada, agregando 2026: ${aptInfo.date} -> ${normalizedDate}`);
            }
            // Intentar parsear otros formatos comunes
            else {
              // Intentar formatos como "25/01" o "25-01"
              const altMatch = aptInfo.date.match(/(\d{1,2})[\/\-](\d{1,2})/);
              if (altMatch) {
                const month = altMatch[2].padStart(2, '0');
                const day = altMatch[1].padStart(2, '0');
                normalizedDate = `2026-${month}-${day}`;
                console.log(`[Chatbot] Fecha parseada y año agregado: ${aptInfo.date} -> ${normalizedDate}`);
              }
            }
          }
          
          if (normalizedDate || 
              (aptInfo.time && timeRegex.test(aptInfo.time)) ||
              aptInfo.location || aptInfo.service) {
            appointmentInfo = {
              date: normalizedDate,
              time: aptInfo.time && aptInfo.time !== 'null' && aptInfo.time !== null ? aptInfo.time : null,
              location: aptInfo.location && aptInfo.location !== 'null' && aptInfo.location !== null ? aptInfo.location.toLowerCase() : null,
              service: aptInfo.service && aptInfo.service !== 'null' && aptInfo.service !== null ? aptInfo.service : null
            };
          }
        }
        
        console.log('[Chatbot] Detección/extracción:', { isBooking, patientInfo, appointmentInfo });
        return { isBooking, patientInfo, appointmentInfo };
      } catch (parseError) {
        console.error('[Chatbot] Error parseando resultado:', parseError);
        return { isBooking: false, patientInfo: null };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.warn('[Chatbot] Timeout en detección/extracción (5s)');
      } else {
        console.error('[Chatbot] Error en fetch:', fetchError);
      }
      return { isBooking: false, patientInfo: null };
    }
  } catch (error) {
    console.error('[Chatbot] Error en detección/extracción:', error);
    return { isBooking: false, patientInfo: null };
  }
}

// Función para manejar mensajes de Messenger
function handleMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text;

  console.log(`[Chatbot] Mensaje recibido de ${senderId}: ${messageText}`);

  // Aquí puedes agregar tu lógica de respuesta
  // Por ejemplo, enviar una respuesta automática
  // sendMessage(senderId, "Gracias por tu mensaje!");
}

// Función para enviar mensajes de WhatsApp usando la API de Meta
async function sendWhatsAppMessage(to, message, phoneNumberIdOverride = null) {
  const startTime = Date.now();
  
  try {
    const accessToken = process.env.META_ACCESS_TOKEN || META_ACCESS_TOKEN;
    // Usar el phoneNumberId del webhook si está disponible, sino el configurado
    const phoneNumberId = phoneNumberIdOverride || process.env.PHONE_NUMBER_ID || PHONE_NUMBER_ID;
    
    if (!accessToken) {
      console.error('[Chatbot] META_ACCESS_TOKEN no configurado');
      return { success: false, error: 'META_ACCESS_TOKEN no configurado' };
    }
    
    if (!phoneNumberId) {
      console.error('[Chatbot] PHONE_NUMBER_ID no configurado');
      return { success: false, error: 'PHONE_NUMBER_ID no configurado' };
    }
    
    console.log(`[Chatbot] Usando PHONE_NUMBER_ID para enviar: ${phoneNumberId}`);

    // Usar la versión v24.0 de la API (coincide con la configuración del webhook)
    const url = `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    };
    
    console.log(`[Chatbot] Enviando mensaje a ${to}...`);
    console.log(`[Chatbot] URL: ${url}`);
    console.log(`[Chatbot] Token presente: ${!!accessToken} (primeros 10 chars: ${accessToken?.substring(0, 10)}...)`);
    
    // Crear un AbortController para timeout (8 segundos)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`[Chatbot] ⏱ Timeout alcanzado después de 8 segundos`);
      controller.abort();
    }, 8000);
    
    try {
      console.log(`[Chatbot] Iniciando fetch...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const elapsedTime = Date.now() - startTime;
      console.log(`[Chatbot] Respuesta recibida en ${elapsedTime}ms`);
      console.log(`[Chatbot] Status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
    
      if (response.ok) {
        console.log(`[Chatbot] ✓ Mensaje enviado exitosamente a ${to} en ${elapsedTime}ms`);
        return { success: true, data };
      } else {
        console.error(`[Chatbot] ✗ Error al enviar mensaje (${elapsedTime}ms):`, JSON.stringify(data, null, 2));
        
        // Mensajes de error más específicos
        if (data.error?.code === 190) {
          console.error(`[Chatbot] Token expirado o inválido. Actualiza META_ACCESS_TOKEN en Vercel.`);
        } else if (data.error?.code === 100) {
          console.error(`[Chatbot] PHONE_NUMBER_ID incorrecto o sin permisos.`);
        }
        
        return { success: false, error: data };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const elapsedTime = Date.now() - startTime;
      
      if (fetchError.name === 'AbortError') {
        console.error(`[Chatbot] ⏱ Timeout: La petición tardó más de 8 segundos (${elapsedTime}ms)`);
        return { success: false, error: 'Timeout: La petición tardó más de 8 segundos' };
      }
      
      console.error(`[Chatbot] ✗ Error en fetch después de ${elapsedTime}ms:`, fetchError.message);
      console.error(`[Chatbot] Error type:`, fetchError.name);
      if (fetchError.stack) {
        console.error(`[Chatbot] Stack:`, fetchError.stack);
      }
      return { success: false, error: fetchError.message };
    }
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(`[Chatbot] ✗ Error general después de ${elapsedTime}ms:`, error.message);
    if (error.stack) {
      console.error(`[Chatbot] Stack:`, error.stack);
    }
    return { success: false, error: error.message };
  }
}

// Obtiene respuesta desde OpenAI (ChatGPT) con contexto y configuración
async function getAIResponse(userMessage, phoneNumber, userMessageId = null) {
  console.log(`[Chatbot] getAIResponse llamado con: "${userMessage}" para ${phoneNumber}${userMessageId ? ` (messageId: ${userMessageId})` : ''}`);
  
  const apiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[Chatbot] ✗ OPENAI_API_KEY no configurado');
    console.error('[Chatbot] Verifica que OPENAI_API_KEY esté configurado en Vercel');
    return 'Lo siento, no puedo responder ahora mismo. La configuración de IA no está disponible.';
  }
  
  console.log(`[Chatbot] OPENAI_API_KEY presente: ${apiKey.substring(0, 10)}...`);

  // Obtener historial de conversación
  const history = await getConversationHistory(phoneNumber, 20);
  const isNewConversation = history.length === 0;
  console.log(`[Chatbot] Historial recuperado: ${history.length} mensajes ${isNewConversation ? '(conversación nueva)' : '(conversación existente)'}`);
  
  // Verificar si el paciente ya está registrado (REGLA PRINCIPAL)
  const existingPatient = await getPatientByPhone(phoneNumber);
  const isPatientRegistered = existingPatient && existingPatient.name;
  console.log(`[Chatbot] Paciente registrado: ${isPatientRegistered ? `Sí (${existingPatient.name})` : 'No'}`);
  
  // Obtener prompt del bot desde la base de datos
  const botPrompt = await getBotPrompt();
  console.log(`[Chatbot] Prompt del bot obtenido: ${botPrompt ? 'Sí' : 'No'} (${botPrompt?.length || 0} caracteres)`);
  
  // El prompt completo viene de la tabla bot_prompt
  let systemPrompt = botPrompt;
  
  // Agregar contexto dinámico del paciente
  if (isPatientRegistered) {
    // Paciente ya registrado: personalizar saludo
    systemPrompt += `\n\n---\nCONTEXTO DEL PACIENTE ACTUAL:\n- Número: ${phoneNumber}\n- Nombre registrado: ${existingPatient.name}\n- IMPORTANTE: Este paciente YA está registrado. Salúdalo por su nombre y no le pidas datos que ya tenemos.`;
    if (existingPatient.document) systemPrompt += `\n- Documento: ${existingPatient.document}`;
    if (existingPatient.email) systemPrompt += `\n- Email: ${existingPatient.email}`;
  } else {
    // Paciente nuevo: recordar seguir el flujo de registro
    systemPrompt += `\n\n---\nCONTEXTO DEL PACIENTE ACTUAL:\n- Número: ${phoneNumber}\n- Estado: NUEVO (no registrado en la base de datos)\n- IMPORTANTE: Sigue el flujo conversacional para nuevos pacientes definido arriba.`;
  }
  
  // Agregar instrucciones sobre el contexto
  if (!isNewConversation) {
    systemPrompt += '\n\nINSTRUCCIONES DE CONTEXTO:\n- Revisa el historial de la conversación para recordar información previa.\n- Si el usuario menciona algo que ya hablaron antes, haz referencia a ello de manera natural.\n- Mantén la coherencia con mensajes anteriores.\n- Si el usuario pregunta algo que ya respondiste, puedes hacer referencia a la respuesta anterior de forma breve.';
  }
  
  // Agregar información técnica para gestión de citas
  const currentYear = 2026; // Año base para agendamiento
  const colombiaDate = getColombiaDate();
  const currentDateStr = getColombiaDateString(colombiaDate);
  
  systemPrompt += `\n\n---\nINFORMACIÓN TÉCNICA PARA CITAS:\n- Fecha actual (Colombia): ${currentDateStr}\n- Año base: ${currentYear}\n- Huso horario: Colombia (GMT-5)\n- Formato de fechas: YYYY-MM-DD (ejemplo: 2026-01-25)\n- RECUERDA: Siempre muestra un resumen y pide confirmación explícita antes de agendar.`;
  
  // Detectar si el usuario pregunta por disponibilidad o citas
  const appointmentKeywords = ['disponibilidad', 'disponible', 'cita', 'agendar', 'horario', 'fecha', 'cuando puedo', 'cuando hay', 'agenda'];
  const isAskingForAvailability = appointmentKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  // Si pregunta por disponibilidad, consultar slots disponibles
  let availabilityInfo = '';
  if (isAskingForAvailability) {
    console.log('[Chatbot] Usuario pregunta por disponibilidad, consultando slots...');
    const today = getColombiaDate();
    const availableSlots = await getAvailableSlots(getColombiaDateString(today), null, 7);
    
    if (availableSlots.length > 0) {
      // Agrupar por fecha y ubicación
      const slotsByDate = {};
      availableSlots.forEach(slot => {
        const dateKey = slot.date;
        if (!slotsByDate[dateKey]) {
          slotsByDate[dateKey] = { rodadero: [], manzanares: [] };
        }
        slotsByDate[dateKey][slot.location].push(slot.time);
      });
      
      // Formatear información de disponibilidad
      const availabilityLines = ['\n\nDISPONIBILIDAD DE CITAS (próximos 7 días):'];
      Object.keys(slotsByDate).sort().forEach(date => {
        const dateObj = toColombiaDate(date);
        const dateStr = dateObj.toLocaleDateString('es-CO', { timeZone: 'America/Bogota', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        availabilityLines.push(`\n${dateStr}:`);
        
        if (slotsByDate[date].rodadero.length > 0) {
          availabilityLines.push(`  Rodadero: ${slotsByDate[date].rodadero.slice(0, 5).join(', ')}${slotsByDate[date].rodadero.length > 5 ? ` (+${slotsByDate[date].rodadero.length - 5} más)` : ''}`);
        }
        if (slotsByDate[date].manzanares.length > 0) {
          availabilityLines.push(`  Manzanares: ${slotsByDate[date].manzanares.slice(0, 5).join(', ')}${slotsByDate[date].manzanares.length > 5 ? ` (+${slotsByDate[date].manzanares.length - 5} más)` : ''}`);
        }
      });
      
      availabilityInfo = availabilityLines.join('\n');
      console.log(`[Chatbot] Disponibilidad consultada: ${availableSlots.length} slots disponibles`);
    } else {
      availabilityInfo = '\n\nDISPONIBILIDAD: No hay slots disponibles en los próximos 7 días.';
      console.log('[Chatbot] No hay slots disponibles');
    }
  }
  
  // Construir mensajes con contexto
  const messages = [
    { role: 'system', content: systemPrompt + availabilityInfo }
  ];
  
  // Solo agregar historial si existe (evitar arrays vacíos)
  if (history.length > 0) {
    console.log(`[Chatbot] Agregando ${history.length} mensajes del historial al contexto`);
    // Asegurar que el historial tenga el formato correcto
    const formattedHistory = history.map(msg => ({
      role: msg.role || 'user',
      content: msg.content || ''
    })).filter(msg => msg.content.trim().length > 0);
    
    messages.push(...formattedHistory);
    console.log(`[Chatbot] Historial formateado: ${formattedHistory.length} mensajes válidos`);
  }
  
  // Agregar mensaje actual
  messages.push({ role: 'user', content: userMessage });
  
  console.log(`[Chatbot] Enviando petición a OpenAI con ${messages.length} mensajes (1 system + ${history.length} historial + 1 user actual)...`);
  if (history.length > 0) {
    console.log(`[Chatbot] Últimos mensajes del historial:`, history.slice(-3).map(m => `${m.role}: ${m.content.substring(0, 50)}...`));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s para dar más tiempo con contexto

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 400, // Aumentado para respuestas más completas
        temperature: 0.8 // Ligeramente más creativo para saludos más naturales
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`[Chatbot] Respuesta de OpenAI recibida: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[Chatbot] ✗ Error OpenAI:', JSON.stringify(err, null, 2));
      return 'Lo siento, hubo un error al contactar a la IA.';
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content?.trim();
    console.log(`[Chatbot] Mensaje de IA extraído: "${aiMessage}"`);
    
    // Guardar ambos mensajes en la base de datos (en orden: user primero, luego assistant)
    // Solo guardar el mensaje del usuario si no existe ya (evitar duplicados)
    await saveMessage(phoneNumber, 'user', userMessage, userMessageId);
    await saveMessage(phoneNumber, 'assistant', aiMessage);
    
    console.log(`[Chatbot] Mensajes guardados en base de datos para ${phoneNumber}`);
    
    // WORKFLOW: Detectar y guardar nombre del paciente (si es nuevo) + Detectar agendamiento
    // Ejecutar de forma asíncrona para no bloquear la respuesta (fire and forget)
    (async () => {
      try {
        // Obtener historial completo incluyendo el mensaje actual
        const fullHistory = await getConversationHistory(phoneNumber, 20);
        const fullHistoryWithCurrent = [
          ...fullHistory,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: aiMessage }
        ];
        
        // WORKFLOW 1: Si el paciente no está registrado, intentar extraer y guardar el nombre
        if (!isPatientRegistered) {
          console.log(`[Chatbot] Paciente no registrado, intentando extraer nombre...`);
          
          // Detectar si el usuario proporcionó su nombre
          const nameKeywords = ['me llamo', 'mi nombre es', 'soy', 'me nombre', 'nombre completo'];
          const mightBeProvidingName = nameKeywords.some(keyword => 
            userMessage.toLowerCase().includes(keyword)
          ) || (userMessage.split(' ').length <= 4 && !userMessage.includes('?') && !userMessage.includes('¿'));
          
          if (mightBeProvidingName) {
            // Intentar extraer el nombre usando IA
            const apiKey = process.env.OPENAI_API_KEY;
            if (apiKey) {
              try {
                const nameExtractionPrompt = `Extrae el nombre completo de la siguiente frase. Responde SOLO con el nombre completo o "null" si no hay nombre claro.

Frase: "${userMessage}"

Responde solo con el nombre o "null":`;

                const nameResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                  },
                  body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                      { role: 'system', content: nameExtractionPrompt },
                      { role: 'user', content: 'Extrae el nombre.' }
                    ],
                    max_tokens: 50,
                    temperature: 0.1
                  })
                });

                if (nameResponse.ok) {
                  const nameData = await nameResponse.json();
                  const extractedName = nameData.choices?.[0]?.message?.content?.trim();
                  
                  if (extractedName && extractedName.toLowerCase() !== 'null' && extractedName.length > 2) {
                    // Guardar solo el nombre por ahora
                    const patient = await createOrUpdatePatient(phoneNumber, { name: extractedName });
                    if (patient) {
                      console.log(`[Chatbot] ✓ Nombre guardado automáticamente: ${extractedName} para ${phoneNumber}`);
                    }
                  }
                }
              } catch (nameError) {
                console.error('[Chatbot] Error extrayendo nombre:', nameError);
              }
            }
          }
        }
        
        // WORKFLOW 2: Detectar agendamiento y extraer información en una sola llamada (optimizado)
        const { isBooking, patientInfo, appointmentInfo } = await detectBookingAndExtractPatientInfo(
          fullHistoryWithCurrent.slice(0, -2), // Sin los últimos 2 mensajes (user y assistant actuales)
          userMessage
        );
        
        if (isBooking) {
          console.log(`[Chatbot] 🎯 CONFIRMACIÓN de agendamiento detectada para ${phoneNumber}`);
          console.log(`[Chatbot] Información extraída:`, { patientInfo, appointmentInfo });
          
          // Verificar si el paciente ya existe
          const existingPatient = await getPatientByPhone(phoneNumber);
          
          if (!existingPatient || !existingPatient.name || !existingPatient.document || !existingPatient.email) {
            if (patientInfo && (patientInfo.name || patientInfo.document || patientInfo.email)) {
              // Crear o actualizar paciente
              const patient = await createOrUpdatePatient(phoneNumber, patientInfo);
              
              if (patient) {
                console.log(`[Chatbot] ✓ Paciente procesado: ${phoneNumber}`, {
                  name: patient.name,
                  document: patient.document,
                  email: patient.email
                });
              } else {
                console.warn(`[Chatbot] ⚠ No se pudo crear/actualizar paciente para ${phoneNumber}`);
              }
            } else {
              console.log(`[Chatbot] No se pudo extraer información suficiente del paciente`);
            }
          } else {
            console.log(`[Chatbot] Paciente ya existe con información completa: ${phoneNumber}`);
          }
          
          // Crear cita SOLO si hay información completa y el usuario confirmó explícitamente
          if (appointmentInfo && appointmentInfo.date && appointmentInfo.time) {
            // Validar formato de fecha (debe tener año)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(appointmentInfo.date)) {
              console.warn(`[Chatbot] ⚠ Fecha inválida o sin año: ${appointmentInfo.date}`);
            } else {
              const location = appointmentInfo.location || 'rodadero'; // Default a rodadero
              console.log(`[Chatbot] Creando cita: ${appointmentInfo.date} ${appointmentInfo.time} en ${location}`);
              
              const appointment = await createAppointment(phoneNumber, {
                date: appointmentInfo.date,
                time: appointmentInfo.time,
                location: location,
                service: appointmentInfo.service || null,
                notes: null
              });
              
              if (appointment && !appointment.error) {
                console.log(`[Chatbot] ✓✓✓ CITA CREADA EXITOSAMENTE: ${appointmentInfo.date} ${appointmentInfo.time} en ${location} (ID: ${appointment.id})`);
              } else if (appointment && appointment.error) {
                console.warn(`[Chatbot] ⚠ No se pudo crear cita: ${appointment.error}`);
              } else {
                console.warn(`[Chatbot] ⚠ No se pudo crear cita (error desconocido)`);
              }
            }
          } else {
            console.log(`[Chatbot] Información de cita incompleta (fecha: ${appointmentInfo?.date}, hora: ${appointmentInfo?.time}), no se crea automáticamente`);
          }
        } else {
          console.log(`[Chatbot] No se detectó confirmación explícita de agendamiento`);
        }
      } catch (workflowError) {
        // No fallar la respuesta si el workflow tiene un error
        console.error('[Chatbot] Error en workflow de paciente:', workflowError);
      }
    })(); // IIFE para ejecutar de forma asíncrona
    
    return aiMessage || 'Lo siento, no puedo responder ahora mismo.';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('[Chatbot] ✗ Timeout en OpenAI (más de 15 segundos)');
      return 'Lo siento, tardé demasiado en responder. Por favor intenta de nuevo.';
    }
    console.error('[Chatbot] ✗ Error llamando a OpenAI:', error.message);
    console.error('[Chatbot] Stack:', error.stack);
    return 'Lo siento, no pude obtener una respuesta de la IA.';
  }
}

// Función para manejar mensajes de WhatsApp Business API
async function handleWhatsAppMessage(message, value) {
  const from = message.from;
  const messageText = message.text?.body || '';
  const messageId = message.id;
  const messageType = message.type;

  console.log(`[Chatbot] Mensaje de WhatsApp recibido:`);
  console.log(`  - De: ${from}`);
  console.log(`  - Tipo: ${messageType}`);
  console.log(`  - Contenido: ${messageText}`);
  console.log(`  - ID: ${messageId}`);

  // Obtener el PHONE_NUMBER_ID del webhook si está disponible
  if (value.metadata?.phone_number_id) {
    const detectedPhoneId = value.metadata.phone_number_id;
    if (!process.env.PHONE_NUMBER_ID) {
      process.env.PHONE_NUMBER_ID = detectedPhoneId;
      console.log(`[Chatbot] PHONE_NUMBER_ID detectado: ${detectedPhoneId}`);
    }
  }

  // Procesar solo mensajes de texto por ahora
  if (messageType === 'text' && messageText) {
    console.log(`[Chatbot] Procesando mensaje de texto: "${messageText}"`);
    
    try {
      console.log(`[Chatbot] Llamando a getAIResponse con contexto...`);
      // Pasar phoneNumber y messageId para obtener contexto y guardar correctamente
      const response = await getAIResponse(messageText, from, messageId);
      console.log(`[Chatbot] Respuesta de IA recibida: "${response}"`);

      // Enviar respuesta automática
      if (response) {
        console.log(`[Chatbot] Enviando respuesta a ${from}: ${response}`);
        const phoneId = value.metadata?.phone_number_id || null;
        console.log(`[Chatbot] Usando phoneId: ${phoneId || 'null (usará el configurado)'}`);
        
        try {
          const result = await sendWhatsAppMessage(from, response, phoneId);
          
          if (result.success) {
            console.log(`[Chatbot] ✓ Respuesta enviada exitosamente a ${from}`);
            console.log(`[Chatbot] Datos de respuesta:`, JSON.stringify(result.data, null, 2));
            
            // Guardar el ID del mensaje enviado si está disponible
            if (result.data?.messages?.[0]?.id) {
              // Actualizar el mensaje assistant con el message_id
              // Nota: getAIResponse ya guarda el mensaje, pero podemos actualizarlo con el message_id
              // Por simplicidad, lo dejamos así ya que getAIResponse guarda antes de enviar
            }
          } else {
            console.error(`[Chatbot] ✗ Error al enviar respuesta a ${from}:`, JSON.stringify(result.error, null, 2));
            console.error(`[Chatbot] Detalles del error:`, result.details || 'Sin detalles adicionales');
          }
        } catch (error) {
          console.error(`[Chatbot] ✗ Excepción al enviar respuesta:`, error.message);
          console.error(`[Chatbot] Stack trace:`, error.stack);
        }
      } else {
        console.error(`[Chatbot] ✗ No se recibió respuesta de la IA`);
      }
    } catch (error) {
      console.error(`[Chatbot] ✗ Error al obtener respuesta de IA:`, error.message);
      console.error(`[Chatbot] Stack trace:`, error.stack);
      
      // Enviar mensaje de error al usuario
      try {
        await sendWhatsAppMessage(from, 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.', value.metadata?.phone_number_id || null);
      } catch (sendError) {
        console.error(`[Chatbot] ✗ Error al enviar mensaje de error:`, sendError.message);
      }
    }
  } else if (messageType !== 'text') {
    console.log(`[Chatbot] Mensaje de tipo ${messageType} recibido (no procesado aún)`);
  } else if (!messageText) {
    console.log(`[Chatbot] Mensaje de texto vacío recibido`);
  }

  // Aquí puedes agregar más lógica personalizada
  // Por ejemplo: guardar en base de datos, integrar con IA, etc.
}

// Handler principal del webhook (compatible con Vercel Serverless Functions)
export default async function handler(req, res) {
  // Webhook para verificación (GET)
  // Meta enviará una petición GET para verificar el webhook
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verifica que el token coincida
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Chatbot] Webhook verificado correctamente');
      return res.status(200).send(challenge);
    } else {
      console.log('[Chatbot] Error en la verificación del webhook');
      return res.status(403).send('Forbidden');
    }
  }

  // Webhook para recibir mensajes (POST)
  // Meta enviará los mensajes aquí
  if (req.method === 'POST') {
    const body = req.body;

    console.log('[Chatbot] ===== WEBHOOK RECIBIDO =====');
    console.log('[Chatbot] Timestamp:', getColombiaDate().toISOString());
    console.log('[Chatbot] Method:', req.method);
    console.log('[Chatbot] Body completo:', JSON.stringify(body, null, 2));

    // Verifica que es un evento de webhook válido
    if (body.object === 'whatsapp_business_account' || body.object === 'page') {
      console.log('[Chatbot] Object válido detectado:', body.object);
      console.log('[Chatbot] Número de entries:', body?.entry?.length || 0);
      
      // Procesar de forma síncrona (con await) para garantizar que el envío ocurra
      try {
        for (const entry of (body.entry || [])) {
          console.log(`[Chatbot] --- Procesando entry ---`);
          console.log('[Chatbot] Entry ID:', entry.id);
          
          if (entry.messaging) {
            for (const event of entry.messaging) {
              if (event.message) {
                console.log('[Chatbot] Mensaje de Messenger detectado');
                await handleMessage(event);
              }
            }
          }

          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              console.log(`[Chatbot] --- Change ---`);
              console.log('[Chatbot] Change field:', change.field);
              
              if (change.value.metadata?.phone_number_id) {
                const detectedPhoneId = change.value.metadata.phone_number_id;
                console.log(`[Chatbot] PHONE_NUMBER_ID detectado: ${detectedPhoneId}`);
              }
              
              if (change.value.messages && Array.isArray(change.value.messages)) {
                console.log(`[Chatbot] ✓ ${change.value.messages.length} mensaje(s) detectado(s)`);
                for (const message of change.value.messages) {
                  console.log(`[Chatbot] Procesando mensaje`);
                  console.log(`[Chatbot] Mensaje completo:`, JSON.stringify(message, null, 2));
                  await handleWhatsAppMessage(message, change.value);
                }
              } else {
                console.log('[Chatbot] No se encontraron mensajes en change.value.messages');
                console.log('[Chatbot] change.value keys:', Object.keys(change.value || {}));
              }
            }
          }
        }
        console.log('[Chatbot] ===== FIN PROCESAMIENTO WEBHOOK =====');
      } catch (error) {
        console.error('[Chatbot] Error procesando webhook:', error);
        console.error('[Chatbot] Stack trace:', error.stack);
      }
      
      // Responder a Meta después de procesar (dentro de los 20s permitidos)
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      console.log('[Chatbot] Webhook no reconocido. Object:', body.object);
      return res.status(404).send('Not Found');
    }
  }

  // Método no permitido
  return res.status(405).send('Method Not Allowed');
}
