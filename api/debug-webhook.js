// Endpoint para debug del webhook
export default async function handler(req, res) {
  return res.status(200).json({
    message: 'Debug del webhook',
    observations: {
      testDeMeta: 'Funciona - recibe webhook cuando pruebas desde Meta',
      mensajesReales: 'NO funciona - no recibe webhook cuando envías desde WhatsApp',
      conclusion: 'El webhook está configurado pero Meta no está enviando mensajes reales'
    },
    posiblesSoluciones: [
      {
        paso: 1,
        titulo: 'Verificar que el número de WhatsApp esté correcto',
        descripcion: 'Asegúrate de que el número desde el que envías (573502053858) esté exactamente como está en la lista blanca',
        accion: 'Verifica en Meta → WhatsApp → API Setup → "To" (Phone number list)'
      },
      {
        paso: 2,
        titulo: 'Re-suscribir el evento messages',
        descripcion: 'A veces re-suscribir el evento soluciona problemas',
        accion: 'Desmarca "messages", guarda, luego vuelve a marcar y guarda'
      },
      {
        paso: 3,
        titulo: 'Verificar el número de WhatsApp Business',
        descripcion: 'Asegúrate de estar enviando mensajes AL número correcto de WhatsApp Business',
        accion: 'Verifica que estás enviando al número que aparece en Meta → WhatsApp → API Setup'
      },
      {
        paso: 4,
        titulo: 'Verificar que el webhook esté en producción/activo',
        descripcion: 'Algunas veces el webhook solo funciona en modo de prueba pero no en producción',
        accion: 'Verifica el estado del webhook en Meta Developer Console'
      },
      {
        paso: 5,
        titulo: 'Probar con otro número',
        descripcion: 'Si tienes otro número en la lista blanca, prueba enviar desde ese',
        accion: 'Agrega otro número a la lista blanca y prueba'
      }
    ],
    notaImportante: 'Si el test de Meta funciona pero los mensajes reales no, generalmente es un problema de configuración o verificación en Meta, no del código. El webhook está configurado correctamente.'
  });
}
