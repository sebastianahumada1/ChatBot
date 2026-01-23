-- Schema de base de datos para Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla: messages
-- Almacena todos los mensajes de las conversaciones
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_messages_phone_number ON messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_phone_created ON messages(phone_number, created_at DESC);

-- Tabla: ai_config
-- Almacena la configuración de la IA (prompt, reglas, datos estructurados)
CREATE TABLE IF NOT EXISTS ai_config (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Índice para búsquedas por clave
CREATE INDEX IF NOT EXISTS idx_ai_config_key ON ai_config(key);

-- Tabla: patients
-- Almacena información de los pacientes
CREATE TABLE IF NOT EXISTS patients (
  id BIGSERIAL PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT,
  document TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas de pacientes
CREATE INDEX IF NOT EXISTS idx_patients_phone_number ON patients(phone_number);
CREATE INDEX IF NOT EXISTS idx_patients_document ON patients(document);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- Configuración por defecto
INSERT INTO ai_config (key, value, description) VALUES
('system_prompt', '{"text": "Eres un asistente breve y útil para una clínica odontológica. Recuerdas el contexto de conversaciones anteriores y mantienes un tono profesional y amigable."}', 'Prompt principal del sistema'),
('business_info', '{"name": "", "phone": "", "address": "", "email": ""}', 'Información de contacto del negocio'),
('business_hours', '{"monday": "", "tuesday": "", "wednesday": "", "thursday": "", "friday": "", "saturday": "", "sunday": ""}', 'Horarios de atención'),
('services', '{"list": []}', 'Lista de servicios ofrecidos'),
('rules', '{"text": ""}', 'Reglas y políticas adicionales')
ON CONFLICT (key) DO NOTHING;

-- Habilitar Row Level Security (RLS) - Opcional pero recomendado
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas (ajusta según tus necesidades)
-- Permitir lectura pública de mensajes (solo para desarrollo, ajusta en producción)
-- CREATE POLICY "Allow public read access" ON messages FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON ai_config FOR SELECT USING (true);

-- Permitir inserción desde la aplicación (requiere autenticación en producción)
-- CREATE POLICY "Allow insert from app" ON messages FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow update from app" ON ai_config FOR UPDATE USING (true);
