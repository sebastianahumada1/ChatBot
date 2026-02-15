import { notFound } from "next/navigation";
import { DENTALINK_URL, CLINIC_NAME } from "@/lib/constants";

const servicesData: Record<string, any> = {
  "diseno-de-sonrisa": {
    title: "Diseño de Sonrisa",
    description: "Transformamos tu sonrisa combinando arte y ciencia.",
    content: "El diseño de sonrisa es un conjunto de procedimientos que buscan mejorar la estética dental, ajustando el color, tamaño y forma de los dientes según las facciones de cada paciente.",
    faqs: [
      { q: "¿Cuánto dura el procedimiento?", a: "Depende del caso, pero generalmente entre 2 a 3 citas." },
      { q: "¿Es doloroso?", a: "No, utilizamos técnicas mínimamente invasivas y anestesia si es necesario." }
    ],
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070"
  },
  "implantes-dentales": {
    title: "Implantes Dentales",
    description: "La solución definitiva para recuperar tus dientes.",
    content: "Los implantes dentales son raíces artificiales de titanio que se colocan en el hueso maxilar para soportar coronas o prótesis, devolviendo la funcionalidad total.",
    faqs: [
      { q: "¿Soy candidato para implantes?", a: "Realizamos una tomografía previa para evaluar la calidad ósea." },
      { q: "¿Cuánto tiempo duran?", a: "Con buen cuidado, pueden durar toda la vida." }
    ],
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070"
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = servicesData[slug];
  if (!service) return { title: "Servicio no encontrado" };
  return {
    title: service.title,
    description: service.description,
  };
}

export default async function ServicioDetallePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = servicesData[slug];
  if (!service) notFound();

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <img 
          src={service.image} 
          alt={service.title} 
          className="w-full h-[400px] object-cover rounded-3xl mb-12 shadow-lg"
        />
        
        <h1 className="text-5xl font-bold mb-6">{service.title}</h1>
        <p className="text-xl text-gray-600 mb-12 leading-relaxed">
          {service.content}
        </p>
        
        <div className="bg-blue-50 p-12 rounded-3xl mb-20">
          <h2 className="text-3xl font-bold mb-8">Preguntas Frecuentes</h2>
          <div className="space-y-8">
            {service.faqs.map((faq: any, i: number) => (
              <div key={i}>
                <h3 className="text-xl font-bold mb-2 text-blue-900">{faq.q}</h3>
                <p className="text-gray-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">¿Interesado en este tratamiento?</h2>
          <a 
            href={DENTALINK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-12 py-4 rounded-full text-xl font-bold hover:bg-blue-700 transition shadow-xl inline-block"
          >
            Reservar Valoración
          </a>
        </div>
      </div>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": service.faqs.map((faq: any) => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />
    </div>
  );
}
