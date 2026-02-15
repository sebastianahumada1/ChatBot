import { CLINIC_NAME } from "@/lib/constants";

export const metadata = {
  title: "Educación y FAQ",
  description: "Aprende sobre salud oral y resuelve tus dudas frecuentes.",
};

export default function EducacionPage() {
  const faqs = [
    {
      category: "Salud General",
      items: [
        { q: "¿Cada cuánto debo hacerme una limpieza?", a: "Recomendamos una limpieza profesional cada 6 meses para prevenir caries y enfermedades de las encías." },
        { q: "¿Cómo elegir el cepillo dental correcto?", a: "Lo ideal es un cepillo de cerdas suaves para no lastimar el esmalte ni las encías." }
      ]
    },
    {
      category: "Estética Dental",
      items: [
        { q: "¿El blanqueamiento daña el esmalte?", a: "No, siempre que sea realizado por profesionales con productos certificados." },
        { q: "¿Cuánto duran las carillas?", a: "Con buen cuidado, las carillas de porcelana pueden durar de 10 a 15 años." }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Educación y FAQ</h1>
        <p className="text-gray-600 text-center mb-16">Información valiosa para el cuidado de tu sonrisa.</p>
        
        <div className="space-y-16">
          {faqs.map((cat, i) => (
            <div key={i}>
              <h2 className="text-2xl font-bold mb-8 text-blue-600 border-b pb-2">{cat.category}</h2>
              <div className="space-y-8">
                {cat.items.map((item, j) => (
                  <div key={j}>
                    <h3 className="text-xl font-bold mb-2">{item.q}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
