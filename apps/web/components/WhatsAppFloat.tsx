import { WHATSAPP_LINK } from "@/lib/constants";

export default function WhatsAppFloat() {
  return (
    <div className="fixed bottom-24 right-8 z-[100] group md:bottom-8">
      <div className="absolute bottom-full right-0 mb-4 scale-0 group-hover:scale-100 transition-all origin-bottom-right">
        <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-64">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-bold dark:text-white">Soporte en Línea</p>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">"¿Necesitas una cita? Respondemos en 2 min."</p>
        </div>
      </div>
      <a 
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/30 transform transition-transform hover:scale-110 active:scale-95"
      >
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.437 2.503 1.171 3.466L6.443 18.25l2.946-.97c.924.582 2.016.92 3.187.92 3.18 0 5.767-2.587 5.768-5.766 0-3.181-2.587-5.766-5.813-5.762zm4.226 8.203c-.15.424-.766.772-1.054.819-.279.046-.636.085-1.029-.042-.255-.081-.58-.19-.98-.363-1.704-.736-2.806-2.472-2.891-2.587-.084-.114-.689-.92-.689-1.755 0-.835.437-1.246.592-1.415.155-.17.338-.212.451-.212.113 0 .225.002.324.006.103.004.243-.039.38.29.155.372.535 1.312.582 1.411.047.098.077.213.011.346-.066.133-.1.213-.197.33-.099.117-.208.261-.297.35-.103.103-.211.215-.091.421.12.206.535.881 1.148 1.427.79.704 1.454.922 1.66.997.206.075.328.064.448-.075.12-.138.519-.605.657-.811.138-.206.275-.173.463-.103.188.07 1.189.561 1.396.665.206.104.346.154.397.241.052.086.052.5-.099.925z"></path>
        </svg>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
          <span className="text-[10px] font-bold text-white">1</span>
        </div>
      </a>
    </div>
  );
}
