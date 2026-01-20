// Handler para verificar el estado de los mensajes
export default async function handler(req, res) {
  return res.status(200).json({
    message: 'Verifica lo siguiente:',
    checklist: [
      '1. El número 573502053858 debe estar en la lista blanca en Meta Developer Console',
      '2. Ve a WhatsApp → API Setup → "To" (Phone number list)',
      '3. Agrega el número si no está',
      '4. En modo de prueba, solo puedes enviar a números en la lista blanca',
      '5. Si es la primera vez, primero debes enviar un mensaje de template',
      '6. El mensaje de texto libre solo funciona después de que el usuario te haya escrito'
    ],
    instructions: {
      step1: 'Ve a Meta Developer Console → Tu App → WhatsApp → API Setup',
      step2: 'En "To" (Phone number list), agrega: 573502053858',
      step3: 'Guarda los cambios',
      step4: 'Intenta enviar de nuevo'
    },
    note: 'En modo de prueba de WhatsApp Business API, solo puedes recibir mensajes de números en la lista blanca, y para enviar por primera vez necesitas usar templates.'
  });
}
