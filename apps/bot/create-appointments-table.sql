-- Script para crear la tabla de citas (appointments)
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla: appointments
-- Almacena las citas agendadas por los pacientes
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL, -- Redundante pero útil para consultas rápidas
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  location TEXT, -- 'rodadero' o 'manzanares'
  service TEXT, -- Servicio solicitado
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  -- Evitar citas duplicadas en el mismo slot
  CONSTRAINT unique_slot UNIQUE (appointment_date, appointment_time, location, status)
    DEFERRABLE INITIALLY DEFERRED
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_phone_number ON appointments(phone_number);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_location ON appointments(location);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER trigger_update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE appointments IS 'Almacena las citas agendadas por los pacientes';
COMMENT ON COLUMN appointments.patient_id IS 'ID del paciente (referencia a tabla patients)';
COMMENT ON COLUMN appointments.phone_number IS 'Número de WhatsApp del paciente (redundante para consultas rápidas)';
COMMENT ON COLUMN appointments.appointment_date IS 'Fecha de la cita';
COMMENT ON COLUMN appointments.appointment_time IS 'Hora de la cita';
COMMENT ON COLUMN appointments.location IS 'Ubicación de la cita (rodadero o manzanares)';
COMMENT ON COLUMN appointments.service IS 'Servicio solicitado';
COMMENT ON COLUMN appointments.status IS 'Estado de la cita: scheduled, confirmed, completed, cancelled, rescheduled';
