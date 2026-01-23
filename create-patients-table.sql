-- Script para crear la tabla de pacientes
-- Ejecuta este script en el SQL Editor de Supabase

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

-- Comentarios para documentación
COMMENT ON TABLE patients IS 'Almacena información de los pacientes que agendan citas';
COMMENT ON COLUMN patients.phone_number IS 'Número de WhatsApp del paciente (único)';
COMMENT ON COLUMN patients.name IS 'Nombre completo del paciente';
COMMENT ON COLUMN patients.document IS 'Documento de identidad (cédula, pasaporte, etc.)';
COMMENT ON COLUMN patients.email IS 'Correo electrónico del paciente';
