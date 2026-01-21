// Endpoint para probar que el webhook está funcionando
export default async function handler(req, res) {
  return res.status(200).json({
    message: 'Endpoint de prueba del webhook',
    webhookUrl: 'https://chat-bot-beta-ten.vercel.app/webhook',
    verifyToken: '1234',
    instructions: {
      step1: 'Ve a Meta Developer Console → Tu App → WhatsApp → Configuration',
      step2: 'En la sección "Webhook", verifica:',
      step3: {
        callbackUrl: 'https://chat-bot-beta-ten.vercel.app/webhook',
        verifyToken: '1234',
        subscription: 'Debe estar suscrito a "messages"'
      },
      step4: 'Haz clic en "Manage" o "Edit" en la suscripción',
      step5: 'Asegúrate de que "messages" esté marcado',
      step6: 'Guarda los cambios',
      step7: 'Envía un mensaje de prueba desde WhatsApp'
    },
    checkLogs: 'Después de enviar un mensaje, revisa los logs de Vercel para ver si llega el webhook',
    commonIssues: [
      'El webhook no está suscrito al evento "messages"',
      'El Verify Token no coincide',
      'El Callback URL está mal configurado',
      'Los eventos no están habilitados en Meta'
    ]
  });
}
