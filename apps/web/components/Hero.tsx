import { DENTALINK_URL, CLINIC_NAME } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-white dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Disponibilidad para Urgencias y Valoración Hoy
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-slate-900 dark:text-white">
              Cuidado Dental Avanzado con <span className="text-primary underline decoration-primary/20 underline-offset-8">Excelencia</span> Médica.
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
              Experimenta la odontología de precisión con tecnología de vanguardia y especialistas expertos. Tu sonrisa merece el futuro del cuidado dental.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={DENTALINK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all text-center"
              >
                Agendar Valoración Gratis
              </a>
              <div className="flex items-center gap-4 px-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                <div className="flex -space-x-2">
                  <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900" src="https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=100" alt="Patient 1" />
                  <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100" alt="Patient 2" />
                  <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100" alt="Patient 3" />
                </div>
                <div className="text-sm font-medium">
                  <span className="block text-slate-900 dark:text-white">+5,000 Pacientes Felices</span>
                  <div className="flex text-amber-400 text-xs">
                    <span className="material-icons text-xs">star</span>
                    <span className="material-icons text-xs">star</span>
                    <span className="material-icons text-xs">star</span>
                    <span className="material-icons text-xs">star</span>
                    <span className="material-icons text-xs">star</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="relative rounded-[2rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl">
              <img 
                className="w-full h-full object-cover aspect-[4/5]" 
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070" 
                alt="Professional dentist in modern clinic" 
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-6 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-icons text-white">verified_user</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Dr. Albeiro García</p>
                    <p className="text-xs text-slate-500">Rehabilitación Oral • 15+ Años Exp.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
