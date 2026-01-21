// Endpoint para información sobre configuración del webhook
export default async function handler(req, res) {
  return res.status(200).json({
    message: 'Información sobre configuración del webhook',
    webhook: {
      url: 'https://chat-bot-beta-ten.vercel.app/webhook',
      verifyToken: '1234',
      status: 'Configurado'
    },
    troubleshooting: {
      problem: 'Los mensajes de WhatsApp no llegan al webhook',
      solutions: [
        {
          step: 1,
          title: 'Verificar que el número esté en la lista blanca',
          description: 'En modo de prueba, solo puedes recibir mensajes de números en la lista blanca',
          action: 'Ve a Meta Developer Console → WhatsApp → API Setup → "To" (Phone number list)',
          check: 'Agrega tu número de teléfono (ej: 573502053858) a la lista blanca'
        },
        {
          step: 2,
          title: 'Verificar suscripción a eventos',
          description: 'El webhook debe estar suscrito al evento "messages"',
          action: 'Ve a WhatsApp → Configuration → Webhook → Manage',
          check: 'Asegúrate de que "messages" esté marcado'
        },
        {
          step: 3,
          title: 'Verificar que el webhook esté activo',
          description: 'El webhook debe estar habilitado y verificado',
          action: 'Ve a WhatsApp → Configuration → Webhook',
          check: 'Debe mostrar "Verified" y estar suscrito a "messages"'
        },
        {
          step: 4,
          title: 'Probar desde Meta Developer Console',
          description: 'Si la prueba de Meta funciona pero los mensajes reales no, es problema de lista blanca',
          action: 'Usa la función "Send test message" en Meta Developer Console',
          check: 'Si funciona ahí pero no desde WhatsApp real, agrega tu número a la lista blanca'
        }
      ]
    },
    testWebhook: {
      url: 'https://chat-bot-beta-ten.vercel.app/webhook',
      method: 'POST',
      note: 'Meta enviará los mensajes aquí automáticamente cuando lleguen'
    },
    important: 'En modo de prueba de WhatsApp Business API, SOLO puedes recibir mensajes de números que estén en tu lista blanca. Los mensajes de otros números serán ignorados por Meta y nunca llegarán al webhook.'
  });
}
