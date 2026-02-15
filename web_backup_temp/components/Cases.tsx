export default function Cases() {
  return (
    <section className="py-24 bg-background-light dark:bg-background-dark" id="cases">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-4xl font-bold leading-tight">Transformaciones de Pacientes y <span className="text-primary">Resultados Reales</span></h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Dejamos que nuestro trabajo y nuestros pacientes hablen por nosotros. Explora nuestra galería de casos de éxito.</p>
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="material-icons text-primary">google</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">4.9 / 5.0 Rating</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Reseñas Verificadas</p>
                  </div>
                </div>
                <span className="material-icons text-amber-400">stars</span>
              </div>
              <div className="space-y-6">
                <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-amber-400 text-xs">
                      <span className="material-icons text-xs">star</span>
                      <span className="material-icons text-xs">star</span>
                      <span className="material-icons text-xs">star</span>
                      <span className="material-icons text-xs">star</span>
                      <span className="material-icons text-xs">star</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">Hace 2 días</span>
                  </div>
                  <p className="text-sm italic text-slate-700 dark:text-slate-300">"La tecnología que usan es increíble. Pude ver un escaneo 3D de mis dientes antes del procedimiento. ¡Altamente recomendado!"</p>
                  <p className="mt-2 text-xs font-bold">— Michael Chen</p>
                </div>
                <div className="text-center">
                  <a className="text-primary text-sm font-bold hover:underline" href="/testimonios">Ver todas las reseñas</a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              <div className="relative group h-[500px] rounded-3xl overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 relative h-full">
                    <img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1000" alt="Antes" />
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur px-3 py-1 rounded text-[10px] uppercase font-bold text-white tracking-widest">Antes</div>
                  </div>
                  <div className="w-1/2 relative h-full">
                    <img className="h-full w-full object-cover border-l-4 border-white dark:border-slate-900 shadow-2xl" src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000" alt="Después" />
                    <div className="absolute top-4 right-4 bg-primary px-3 py-1 rounded text-[10px] uppercase font-bold text-white tracking-widest">Después</div>
                  </div>
                </div>
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white flex items-center justify-center cursor-ew-resize -translate-x-1/2">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full shadow-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <span className="material-icons text-primary">unfold_more</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center px-4 pb-2 text-slate-900 dark:text-white">
                <div>
                  <h4 className="font-bold">Restauración Oral Completa</h4>
                  <p className="text-sm text-slate-500">Duración: 3 Meses • Procedimiento: Carillas e Implantes</p>
                </div>
                <button className="bg-slate-900 dark:bg-primary text-white p-3 rounded-full flex items-center justify-center">
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
