import { CLINIC_NAME, ADDRESS, PHONE, EMAIL } from "@/lib/constants";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <span className="material-icons text-white">medical_services</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                {CLINIC_NAME.split(' ')[0]}<span className="text-primary">{CLINIC_NAME.split(' ').slice(1).join('')}</span>
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-icons text-primary text-xl">location_on</span>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {ADDRESS}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-icons text-primary text-xl">phone</span>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">{PHONE}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-icons text-primary text-xl">schedule</span>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Lun - Sáb: 8am - 6pm</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Clínica</h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/nosotros" className="hover:text-primary transition-colors">Nuestro Equipo</Link></li>
              <li><Link href="/servicios" className="hover:text-primary transition-colors">Tecnología Digital</Link></li>
              <li><Link href="/educacion" className="hover:text-primary transition-colors">Educación al Paciente</Link></li>
              <li><Link href="/contacto" className="hover:text-primary transition-colors">Urgencias</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Tratamientos</h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/servicios/implantes-dentales" className="hover:text-primary transition-colors">Implantes Dentales</Link></li>
              <li><Link href="/servicios/ortodoncia-invisible" className="hover:text-primary transition-colors">Ortodoncia Invisible</Link></li>
              <li><Link href="/servicios/diseno-de-sonrisa" className="hover:text-primary transition-colors">Diseño de Sonrisa</Link></li>
              <li><Link href="/servicios/blanqueamiento-dental" className="hover:text-primary transition-colors">Blanqueamiento</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Seguridad y Calidad</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-background-light dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="material-icons text-green-500 text-3xl">verified</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight text-slate-900 dark:text-white">SSL Seguro</p>
                  <p className="text-[10px] text-slate-500">Datos Protegidos</p>
                </div>
              </div>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-colors">
                  <span className="material-icons">facebook</span>
                </a>
                <a href="#" className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:text-primary transition-colors">
                  <span className="material-icons">camera_alt</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {CLINIC_NAME}. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <Link href="/legal/privacidad" className="hover:text-primary">Privacidad</Link>
            <Link href="/legal/cookies" className="hover:text-primary">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
