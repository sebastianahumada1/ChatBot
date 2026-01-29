-- Script para agregar columna dentalink_patient_id a la tabla patients
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar columna para almacenar el ID del paciente en Dentalink
ALTER TABLE patients ADD COLUMN IF NOT EXISTS dentalink_patient_id INTEGER;

-- Crear índice para búsquedas rápidas por dentalink_patient_id
CREATE INDEX IF NOT EXISTS idx_patients_dentalink_id ON patients(dentalink_patient_id);

-- Comentario para documentación
COMMENT ON COLUMN patients.dentalink_patient_id IS 'ID del paciente en el sistema Dentalink (sincronización externa)';
