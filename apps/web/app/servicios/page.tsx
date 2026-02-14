import Link from "next/navigation";
import { CLINIC_NAME } from "@/lib/constants";

const services = [
  {
    title: "Diseño de Sonrisa",
    description: "Carillas de porcelana y resina de alta estética para una sonrisa perfecta.",
    slug: "diseno-de-sonrisa",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070"
  },
  {
    title: "Implantes Dentales",
    description: "Soluciones permanentes para la pérdida de dientes con tecnología de carga inmediata.",
    slug: "implantes-dentales",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070"
  },
  {
    title: "Ortodoncia Invisible",
    description: "Alineadores transparentes para corregir tu mordida sin brackets metálicos.",
    slug: "ortodoncia-invisible",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2070"
  },
  {
    title: "Blanqueamiento Dental",
    description: "Aclara varios tonos el color de tus dientes en una sola sesión.",
    slug: "blanqueamiento-dental",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070"
  },
  {
    title: "Armonización Facial",
    description: "Tratamientos estéticos para complementar tu sonrisa y rejuvenecer tu rostro.",
    slug: "armonizacion-facial",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=2070"
  },
  {
    title: "Odontología General",
    description: "Limpiezas, calzas y prevención para mantener tu salud oral al día.",
    slug: "odontologia-general",
    image: "https://images.unsplash.com/photo-1507208773393-4019ce380d0b?q=80&w=2070"
  }
];

export const metadata = {
  title: "Servicios",
  description: `Conoce todos los tratamientos odontológicos que ofrecemos en ${CLINIC_NAME}.`,
};

export default function ServiciosPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-4 text-center">Nuestros Servicios</h1>
      <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
        Especialidades odontológicas con tecnología de punta y un equipo humano excepcional.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((s) => (
          <Link 
            key={s.slug} 
            href={`/servicios/${s.slug}`}
            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition border border-gray-100"
          >
            <div className="h-64 overflow-hidden">
              <img 
                src={s.image} 
                alt={s.title} 
                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
              <p className="text-gray-600 mb-6">{s.description}</p>
              <span className="text-blue-600 font-bold group-hover:underline">Ver detalles &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
