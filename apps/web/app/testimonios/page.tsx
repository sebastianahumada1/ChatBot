import { CLINIC_NAME } from "@/lib/constants";

export const metadata = {
  title: "Testimonios y Casos",
  description: `Lo que nuestros pacientes dicen de ${CLINIC_NAME}.`,
};

export default function TestimoniosPage() {
  const reviews = [
    { name: "Juan Pérez", text: "Excelente atención, el diseño de mi sonrisa quedó increíble. Muy recomendados.", rating: 5 },
    { name: "María Rodríguez", text: "El Dr. Albeiro es un profesional excepcional. Me sentí muy segura en todo el proceso de mis implantes.", rating: 5 },
    { name: "Carlos Gómez", text: "La mejor clínica en Santa Marta. Puntualidad y resultados garantizados.", rating: 5 }
  ];

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-12 text-center">Testimonios</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {reviews.map((r, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex text-yellow-400 mb-4">
              {[...Array(r.rating)].map((_, j) => (
                <span key={j}>★</span>
              ))}
            </div>
            <p className="text-gray-600 italic mb-6">"{r.text}"</p>
            <p className="font-bold text-blue-600">{r.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
