import { CLINIC_NAME } from "@/lib/constants";

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Política de Cookies</h1>
      <div className="prose prose-blue max-w-none text-gray-600 space-y-4">
        <p>Este sitio web utiliza cookies para mejorar su experiencia de navegación.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-8">¿Qué son las cookies?</h2>
        <p>Las cookies son pequeños archivos de texto que se guardan en su navegador para recordar sus preferencias.</p>
        <h2 className="text-xl font-bold text-gray-900 mt-8">Cookies que utilizamos</h2>
        <ul className="list-disc pl-6">
          <li>Cookies esenciales: Necesarias para el funcionamiento del sitio.</li>
          <li>Cookies de análisis: Nos ayudan a entender cómo los usuarios interactúan con el sitio.</li>
        </ul>
      </div>
    </div>
  );
}
