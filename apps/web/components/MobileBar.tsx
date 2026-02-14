import { PHONE, WHATSAPP_LINK, DENTALINK_URL } from "@/lib/constants";

export default function MobileBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark border-t border-primary/20 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.1)] md:hidden">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <a 
          href={`tel:${PHONE}`}
          className="flex flex-col items-center justify-center text-slate-500 hover:text-primary transition-colors"
        >
          <span className="material-icons">phone</span>
          <span className="text-[10px] font-bold uppercase mt-1">Llamar</span>
        </a>

        <div className="flex-1 flex items-center justify-center gap-2 px-4 border-x border-slate-100 dark:border-slate-800">
          <a 
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center text-[#25D366] hover:opacity-80 transition-opacity"
          >
            <span className="material-icons">chat</span>
            <span className="text-[10px] font-bold uppercase mt-1 text-slate-500">WhatsApp</span>
          </a>
        </div>

        <a 
          href={DENTALINK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          Reservar <span className="material-icons text-sm">arrow_forward</span>
        </a>
      </div>
    </div>
  );
}
