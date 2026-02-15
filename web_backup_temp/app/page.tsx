import Hero from "@/components/Hero";
import Treatments from "@/components/Treatments";
import Cases from "@/components/Cases";
import Team from "@/components/Team";
import { DENTALINK_URL } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <Hero />
      <Treatments />
      <Cases />
      <Team />
      
      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">¿Listo para transformar tu sonrisa?</h2>
          <p className="text-xl mb-8 opacity-90">Agenda tu cita de valoración hoy mismo de forma online.</p>
          <a 
            href={DENTALINK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-600 px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition shadow-xl inline-block"
          >
            Reservar en Dentalink
          </a>
        </div>
      </section>
    </>
  );
}
