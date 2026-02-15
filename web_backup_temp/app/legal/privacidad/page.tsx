import { CLINIC_NAME } from "@/lib/constants";

export default function PrivacidadPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidad</h1>
      <div className="prose prose-blue max-w-none text-gray-600 space-y-4">
        <p>En {CLINIC_NAME}, nos tomamos muy en serio la privacidad de sus datos.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-8">1. Recolección de Datos</h2>
        <p>Solo recolectamos datos mínimos de contacto (nombre y teléfono) a través de nuestro formulario de contacto para fines de agendamiento y consulta.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-8">2. Uso de la Información</h2>
        <p>La información recolectada se utiliza exclusivamente para contactar al paciente y gestionar su solicitud de cita.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-8">3. Terceros</h2>
        <p>No compartimos sus datos con terceros, excepto con la plataforma de agendamiento Dentalink si usted decide realizar una reserva.</p>
      </div>
    </div>
  );
}
