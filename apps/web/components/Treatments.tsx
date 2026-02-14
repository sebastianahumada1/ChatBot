import Link from "next/link";

const treatments = [
  {
    title: "Implantes Dentales",
    description: "Soluciones permanentes y naturales para dientes perdidos utilizando titanio de grado médico y precisión 3D.",
    slug: "implantes-dentales",
    icon: "biotech"
  },
  {
    title: "Ortodoncia Invisible",
    description: "Alinea tus dientes de forma discreta con alineadores personalizados que se adaptan a tu estilo de vida.",
    slug: "ortodoncia-invisible",
    icon: "auto_fix_high"
  },
  {
    title: "Diseño de Sonrisa",
    description: "Diseño digital para carillas, blanqueamiento y estética dental. Logra el equilibrio perfecto que siempre quisiste.",
    slug: "diseno-de-sonrisa",
    icon: "face_retouching_natural"
  }
];

export default function Treatments() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950" id="treatments">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Nuestras Especialidades</h2>
          <p className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Cuidado Experto para Cada Sonrisa</p>
          <p className="text-slate-600 dark:text-slate-400">Combinamos excelencia clínica con tecnología de punta para brindar soluciones dentales integrales adaptadas a tus necesidades.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {treatments.map((t) => (
            <Link 
              key={t.slug}
              href={`/servicios/${t.slug}`}
              className="group p-8 rounded-2xl bg-background-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer"
            >
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-icons text-3xl">{t.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{t.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{t.description}</p>
              <div className="flex items-center text-primary font-semibold text-sm">
                Saber más <span className="material-icons text-sm ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
