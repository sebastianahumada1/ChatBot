import { DENTALINK_URL, WHATSAPP_LINK, CLINIC_NAME } from "@/lib/constants";

export const metadata = {
  title: "Reservar Cita",
  description: `Agenda tu cita en ${CLINIC_NAME} a través de Dentalink o WhatsApp.`,
};

export default function ReservarPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-4xl font-bold mb-6">Reserva tu Cita</h1>
        <p className="text-gray-600 mb-12 text-lg">
          Para tu comodidad, ofrecemos dos canales para agendar tu próxima visita. 
          Recomendamos usar Dentalink para ver disponibilidad en tiempo real.
        </p>
        
        <div className="space-y-6">
          <a 
            href={DENTALINK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-600 text-white py-5 rounded-2xl text-xl font-bold hover:bg-blue-700 transition shadow-lg"
          >
            Reservar en Dentalink
          </a>
          
          <div className="flex items-center justify-center space-x-4 py-4">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-gray-400 font-medium">O TAMBIÉN</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>
          
          <a 
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-500 text-white py-5 rounded-2xl text-xl font-bold hover:bg-green-600 transition shadow-lg"
          >
            Escribir por WhatsApp
          </a>
        </div>
        
        <p className="mt-12 text-sm text-gray-500">
          Si tienes una urgencia, por favor llámanos directamente o escríbenos por WhatsApp para atención prioritaria.
        </p>
      </div>
    </div>
  );
}
