// Endpoint para servir la interfaz de configuración del bot (estilo Vapi)
export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Servir la página HTML
  const html = `<!DOCTYPE html>
<html class="light" lang="es">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Configurar Bot - Clínica Dr. Albeiro García</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <link href="https://fonts.googleapis.com" rel="preconnect"/>
  <link crossorigin href="https://fonts.gstatic.com" rel="preconnect"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            "primary": "#137fec",
            "background-light": "#f6f7f8",
            "accent": "#10b981",
            "warning": "#f59e0b",
            "danger": "#ef4444",
          },
          fontFamily: {
            "display": ["Inter"],
          },
        },
      },
    }
  </script>
  <style>
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
    body { font-family: 'Inter', sans-serif; }
    .prompt-textarea {
      font-family: 'Inter', sans-serif;
      line-height: 1.8;
      font-size: 14px;
    }
    .saving-indicator {
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .toast {
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
</head>
<body class="bg-background-light font-display text-[#111418] h-screen overflow-hidden">
  <div class="flex flex-col h-full">
    <!-- Header -->
    <header class="flex items-center justify-between border-b border-[#e5e7eb] bg-white px-6 py-4 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3 text-primary">
          <div class="size-10 flex items-center justify-center bg-primary/10 rounded-xl">
            <span class="material-symbols-outlined text-primary text-2xl">smart_toy</span>
          </div>
          <div>
            <h2 class="text-[#111418] text-lg font-bold">Configurar Asistente</h2>
            <p class="text-xs text-gray-500">Edita el prompt completo del bot</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div id="saveStatus" class="flex items-center gap-2 text-sm text-accent hidden">
          <span class="material-symbols-outlined text-[18px]">check_circle</span>
          Guardado
        </div>
        <div id="lastSaved" class="text-xs text-gray-400"></div>
        <button onclick="savePrompt()" id="saveBtn" class="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-symbols-outlined text-[18px]">save</span>
          Guardar
        </button>
      </div>
    </header>

    <!-- Toast Notification -->
    <div id="toast" class="fixed top-4 right-4 z-50 hidden">
      <div class="toast flex items-center gap-3 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3">
        <span id="toastIcon" class="material-symbols-outlined text-accent">check_circle</span>
        <span id="toastMessage" class="text-sm font-medium">Cambios guardados</span>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Editor Principal -->
      <div class="flex-1 flex flex-col p-6 overflow-hidden">
        <div class="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-gray-400">psychology</span>
              <span class="text-sm font-semibold text-gray-700">System Prompt</span>
            </div>
            <div class="flex items-center gap-4">
              <span id="charCount" class="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">0 caracteres</span>
            </div>
          </div>
          <textarea id="promptTextarea" class="prompt-textarea flex-1 w-full p-6 resize-none focus:outline-none focus:ring-0 border-none text-gray-800 custom-scrollbar" placeholder="Escribe el prompt completo del asistente aquí...

Ejemplo de estructura:

## IDENTIDAD Y TONO
- Describe quién es el asistente
- Define el tono (formal, amigable, etc.)

## INFORMACIÓN DEL NEGOCIO
- Nombre del negocio
- Direcciones
- Horarios
- Contactos

## SERVICIOS
- Lista de servicios ofrecidos
- Política de precios

## REGLAS
- Qué puede y no puede hacer
- Restricciones importantes

## FLUJO CONVERSACIONAL
- Pasos a seguir con nuevos pacientes
- Proceso de agendamiento"></textarea>
        </div>
      </div>

      <!-- Sidebar de ayuda -->
      <aside class="w-80 border-l border-gray-200 bg-white p-6 overflow-y-auto custom-scrollbar shrink-0">
        <h4 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
          Guía del Prompt
        </h4>
        
        <div class="space-y-4">
          <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p class="text-sm text-blue-800 font-medium mb-2">1. Identidad</p>
            <p class="text-xs text-blue-600">Define quién es el asistente, para qué empresa trabaja y su rol.</p>
          </div>
          
          <div class="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
            <p class="text-sm text-emerald-800 font-medium mb-2">2. Información del negocio</p>
            <p class="text-xs text-emerald-600">Incluye nombre, sedes, horarios, contactos y servicios.</p>
          </div>
          
          <div class="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <p class="text-sm text-amber-800 font-medium mb-2">3. Reglas críticas</p>
            <p class="text-xs text-amber-600">Qué NO debe hacer: inventar precios, dar diagnósticos, etc.</p>
          </div>
          
          <div class="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <p class="text-sm text-purple-800 font-medium mb-2">4. Flujo conversacional</p>
            <p class="text-xs text-purple-600">Pasos para nuevos pacientes: saludo → nombre → servicio → datos.</p>
          </div>
          
          <div class="bg-rose-50 border border-rose-100 rounded-lg p-4">
            <p class="text-sm text-rose-800 font-medium mb-2">5. Agendamiento</p>
            <p class="text-xs text-rose-600">Flujo: fecha/hora → sede → resumen → confirmación explícita.</p>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-100">
          <h4 class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-gray-400 text-[18px]">info</span>
            Información automática
          </h4>
          <p class="text-xs text-gray-500 mb-3">El sistema agrega automáticamente:</p>
          <ul class="space-y-2 text-xs text-gray-600">
            <li class="flex items-start gap-2">
              <span class="material-symbols-outlined text-[14px] text-accent mt-0.5">check</span>
              Contexto del paciente (nombre si está registrado)
            </li>
            <li class="flex items-start gap-2">
              <span class="material-symbols-outlined text-[14px] text-accent mt-0.5">check</span>
              Fecha actual en Colombia
            </li>
            <li class="flex items-start gap-2">
              <span class="material-symbols-outlined text-[14px] text-accent mt-0.5">check</span>
              Historial de conversación
            </li>
            <li class="flex items-start gap-2">
              <span class="material-symbols-outlined text-[14px] text-accent mt-0.5">check</span>
              Disponibilidad de citas (cuando se solicita)
            </li>
          </ul>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-100">
          <h4 class="text-sm font-bold text-gray-900 mb-3">Formato Markdown</h4>
          <div class="space-y-2 text-xs font-mono bg-gray-50 p-3 rounded-lg">
            <p class="text-gray-600">## Encabezado</p>
            <p class="text-gray-600">### Sub-encabezado</p>
            <p class="text-gray-600">- Lista de items</p>
            <p class="text-gray-600">**Texto en negrita**</p>
            <p class="text-gray-600">*Texto en cursiva*</p>
          </div>
        </div>
      </aside>
    </main>
  </div>

  <script>
    let originalPrompt = '';
    let hasChanges = false;

    // Cargar prompt inicial
    async function loadPrompt() {
      try {
        const response = await fetch('/api/bot-prompt');
        if (!response.ok) throw new Error('Error cargando prompt');
        
        const data = await response.json();
        const textarea = document.getElementById('promptTextarea');
        textarea.value = data.prompt || '';
        originalPrompt = data.prompt || '';
        updateCharCount();
        
        if (data.updated_at) {
          const date = new Date(data.updated_at);
          document.getElementById('lastSaved').textContent = 
            'Última edición: ' + date.toLocaleDateString('es-CO', { 
              day: 'numeric', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            });
        }
        
      } catch (error) {
        console.error('Error:', error);
        showToast('Error cargando el prompt', 'error');
      }
    }

    // Guardar prompt
    async function savePrompt() {
      const saveBtn = document.getElementById('saveBtn');
      const prompt = document.getElementById('promptTextarea').value;
      
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] saving-indicator">sync</span> Guardando...';
      
      try {
        const response = await fetch('/api/bot-prompt', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': getApiKey()
          },
          body: JSON.stringify({
            prompt: prompt,
            updated_by: 'admin_ui'
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error guardando');
        }
        
        originalPrompt = prompt;
        hasChanges = false;
        
        // Actualizar timestamp
        const now = new Date();
        document.getElementById('lastSaved').textContent = 
          'Última edición: ' + now.toLocaleDateString('es-CO', { 
            day: 'numeric', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        
        // Mostrar indicador de guardado
        const saveStatus = document.getElementById('saveStatus');
        saveStatus.classList.remove('hidden');
        setTimeout(() => saveStatus.classList.add('hidden'), 3000);
        
        showToast('Prompt guardado correctamente', 'success');
        
      } catch (error) {
        console.error('Error guardando:', error);
        showToast(error.message || 'Error al guardar', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">save</span> Guardar';
      }
    }

    // Obtener API key
    function getApiKey() {
      let apiKey = localStorage.getItem('config_api_key');
      if (!apiKey) {
        apiKey = prompt('Ingresa la API key para guardar cambios:');
        if (apiKey) {
          localStorage.setItem('config_api_key', apiKey);
        }
      }
      return apiKey || '';
    }

    // Actualizar contador de caracteres
    function updateCharCount() {
      const textarea = document.getElementById('promptTextarea');
      const count = textarea.value.length;
      document.getElementById('charCount').textContent = count.toLocaleString() + ' caracteres';
      
      // Detectar cambios
      hasChanges = textarea.value !== originalPrompt;
    }

    // Mostrar toast
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      const icon = document.getElementById('toastIcon');
      const msg = document.getElementById('toastMessage');
      
      msg.textContent = message;
      icon.textContent = type === 'success' ? 'check_circle' : 'error';
      icon.className = 'material-symbols-outlined ' + (type === 'success' ? 'text-accent' : 'text-danger');
      
      toast.classList.remove('hidden');
      
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }

    // Event listeners
    document.getElementById('promptTextarea').addEventListener('input', updateCharCount);

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S para guardar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        savePrompt();
      }
    });

    // Advertir antes de salir con cambios sin guardar
    window.addEventListener('beforeunload', (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // Exponer función al scope global
    window.savePrompt = savePrompt;

    // Inicializar
    loadPrompt();
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
