-- Script de actualización para ai_config
-- Ejecuta este script en el SQL Editor de Supabase

-- Actualizar/Insertar configuración de IA
INSERT INTO ai_config (key, value, description, updated_at, updated_by)
VALUES
  (
    'system_prompt',
    '{"text": "Eres el asistente virtual de la Clínica Dr. Albeiro García — Diseño de Sonrisas & Armonización Facial[cite: 1]. Tu tono es cálido, empático y profesional, usando emojis como 😊, 💎 y 🌿[cite: 8, 11]. REGLA CRÍTICA: No inventes precios, servicios o datos médicos que no estén en tu base de conocimiento. Si no sabes algo, responde: '\''Lo siento, no tengo esa información exacta. 😊 ¿Te gustaría que te comunique con un asesor humano o nos escribas al WhatsApp?'\''[cite: 13]. Nunca asumas disponibilidad de citas sin validar."}'::jsonb,
    'Identidad, tono y reglas anti-alucinación',
    '2026-01-22 10:00:00'::timestamptz,
    NULL
  ),
  (
    'business_info',
    '{"legal_name": "Dr. Albeiro García Varela odontología estética avanzada", "brand": "Dr. Albeiro García — Diseño de Sonrisas & Armonización Facial", "locations": [{"sede": "Rodadero", "address": "Cra. 4 #12-55, Piso 3", "reference": "Frente a Olímpica Rodadero, cerca al C.C. Arrecife"}, {"sede": "Manzanares", "address": "Calle 30 #5-44, Local 7", "reference": "Cerca a la Iglesia de Manzanares"}], "contact": {"whatsapp": "+57 301 512 9925", "email": "dralbeirogarcia@gmail.com", "instagram": "@dr.albeirogarcia", "facebook": "Dr. Albeiro García"}}'::jsonb,
    'Información comercial y sedes [cite: 1, 2, 14]',
    '2026-01-22 10:00:00'::timestamptz,
    NULL
  ),
  (
    'business_hours',
    '{"rodadero": "L-V 08:00–18:00; Sáb 08:00–13:00; Festivos: cerrado", "manzanares": "L-V 08:00–17:00; Sáb 08:00–12:00; Festivos: cerrado"}'::jsonb,
    'Horarios por sede [cite: 6]',
    '2026-01-22 10:00:00'::timestamptz,
    NULL
  ),
  (
    'services_and_pricing',
    '{"policy": "Cada tratamiento es personalizado. No publicamos precios. Se requiere valoración para presupuesto exacto", "list": ["Diseño de Sonrisa", "Implantes dentales", "Cirugía oral", "Armonización facial", "Ortodoncia", "Blanqueamiento", "Limpieza profesional", "Sedación consciente", "Prótesis dentales", "Regeneración ósea"], "teleconsulta": {"cost": "$80.000 COP", "duration": "20-30 min", "hours": "L-V 09:00–17:00"}}'::jsonb,
    'Portafolio y política de precios [cite: 23, 24, 27-37, 65-67]',
    '2026-01-22 10:00:00'::timestamptz,
    NULL
  ),
  (
    'rules',
    '{"anti_hallucination": "Prohibido inventar costos, tiempos de recuperación o diagnósticos clínicos. Solo cita los requisitos del documento.", "habeas_data": "El consentimiento de la Ley 1581 de 2012 es obligatorio antes de agendar", "priorities": {"alta": "Urgencias, pacientes en tratamiento, primeras valoraciones", "media": "Consultas generales", "baja": "Administrativo"}, "health_restrictions": ["Embarazo 1er trimestre", "Alergia a anestésicos", "Enfermedades cardíacas/anticoagulantes", "Infecciones activas", "Diabetes/Hipertensión no controlada", "Bifosfonatos"]}'::jsonb,
    'Reglas de negocio, seguridad y restricciones médicas [cite: 15, 19, 22, 38-44]',
    '2026-01-22 10:00:00'::timestamptz,
    NULL
  ),
  (
    'urgency_protocol',
    '{"keywords": ["dolor agudo", "sangrado", "trauma", "fractura", "inflamación", "hinchazón", "diente flojo", "infección", "accidente"], "script": "Hola [Nombre], detectamos que podría tratarse de una urgencia. Contáctanos de inmediato al 📞 +57 301 512 9925 o acude a nuestras sedes. ¡Estamos listos para ayudarte!"}'::jsonb,
    'Detección y respuesta a urgencias [cite: 62, 64]',
    '2026-01-22 10:00:00'::timestamptz,
    NULL
  ),
  (
    'booking_requirements',
    '{"fields": {"nombre": "completo", "id": "6-12 dígitos numéricos", "email": "formato válido"}, "alternatives_rule": "Si la hora no está disponible, ofrecer 3 opciones cercanas en la misma sede"}'::jsonb,
    'Datos obligatorios para agendar [cite: 51-54, 55-61]',
    '2026-01-22 10:00:00'::timestamptz,
    NULL
  ),
  (
    'logistics_and_payments',
    '{"parking": {"rodadero": "6 cupos en edificio, C.C. Arrecife y zonas aledañas", "manzanares": "Parqueo público frente al local"}, "accessibility": "Sede Rodadero con ascensor/rampa; Sede Manzanares nivel del andén", "payment_methods": ["Efectivo", "Tarjeta crédito/débito", "Transferencia", "Nequi", "Daviplata", "PSE"]}'::jsonb,
    'Logística de llegada y métodos de pago [cite: 3, 4, 5, 70-77]',
    '2026-01-22 10:00:00'::timestamptz,
    NULL
  )
ON CONFLICT (key) 
DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = EXCLUDED.updated_at,
  updated_by = EXCLUDED.updated_by;
