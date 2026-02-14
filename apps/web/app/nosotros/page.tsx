import { CLINIC_NAME } from "@/lib/constants";

export const metadata = {
  title: "Nosotros",
  description: `Conoce al equipo y los valores de ${CLINIC_NAME}.`,
};

export default function NosotrosPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Nuestra Clínica</h1>
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
          <p>
            En {CLINIC_NAME}, nos dedicamos a transformar sonrisas y mejorar la calidad de vida de nuestros pacientes. 
            Con más de 15 años de experiencia, hemos consolidado un equipo de especialistas apasionados por la excelencia.
          </p>
          <img 
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070" 
            alt="Nuestra Clínica" 
            className="rounded-3xl shadow-xl w-full h-[400px] object-cover my-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div>
              <h2 className="text-2xl font-bold text-blue-600 mb-4">Nuestra Misión</h2>
              <p>Brindar atención odontológica integral con calidez humana, utilizando tecnología de vanguardia para garantizar resultados estéticos y funcionales duraderos.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-600 mb-4">Nuestra Visión</h2>
              <p>Ser reconocidos como la clínica dental líder en innovación y estética dental en la región, transformando la experiencia de ir al dentista.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
