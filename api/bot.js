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
            "mono": ["'JetBrains Mono'", "monospace"]
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
      line-height: 1.7;
    }
    .json-textarea {
      font-family: monospace;
      font-size: 13px;
      line-height: 1.5;
    }
    .section-card {
      transition: all 0.2s ease;
    }
    .section-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .tab-active {
      background: white;
      color: #137fec;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
    <header class="flex items-center justify-between border-b border-[#e5e7eb] bg-white px-6 py-3 shrink-0">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3 text-primary">
          <div class="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
            <span class="material-symbols-outlined text-primary">smart_toy</span>
          </div>
          <h2 class="text-[#111418] text-lg font-bold">Configurar Asistente</h2>
        </div>
        <!-- Tabs -->
        <div class="flex bg-gray-100 rounded-lg p-1 gap-1">
          <button onclick="switchTab('prompt')" id="tabPrompt" class="px-4 py-2 rounded-md text-sm font-medium transition-all tab-active">
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">edit_note</span>
              Prompt
            </span>
          </button>
          <button onclick="switchTab('config')" id="tabConfig" class="px-4 py-2 rounded-md text-sm font-medium text-gray-600 transition-all hover:text-gray-900">
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">tune</span>
              Configuraciones
            </span>
          </button>
          <button onclick="switchTab('preview')" id="tabPreview" class="px-4 py-2 rounded-md text-sm font-medium text-gray-600 transition-all hover:text-gray-900">
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
              Vista Previa
            </span>
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span id="saveStatus" class="text-sm text-gray-500 hidden">
          <span class="material-symbols-outlined text-[16px] align-middle">check_circle</span>
          Guardado
        </span>
        <button onclick="saveAllChanges()" id="saveBtn" class="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-symbols-outlined text-[18px]">save</span>
          Guardar Cambios
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
    <main class="flex-1 overflow-hidden">
      <!-- Tab: Prompt -->
      <div id="panelPrompt" class="h-full flex">
        <!-- Editor Principal -->
        <div class="flex-1 flex flex-col p-6 overflow-hidden">
          <div class="mb-4">
            <h3 class="text-lg font-bold text-gray-900 mb-1">System Prompt</h3>
            <p class="text-sm text-gray-500">Define la personalidad, tono y comportamiento del asistente. Este es el prompt principal que guía todas las respuestas.</p>
          </div>
          <div class="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-gray-400 text-[18px]">code</span>
                <span class="text-sm font-medium text-gray-600">system_prompt</span>
              </div>
              <div class="flex items-center gap-2">
                <span id="charCount" class="text-xs text-gray-400">0 caracteres</span>
              </div>
            </div>
            <textarea id="systemPrompt" class="prompt-textarea flex-1 w-full p-5 resize-none focus:outline-none focus:ring-0 border-none text-gray-800 text-[15px]" placeholder="Escribe el prompt del sistema aquí..."></textarea>
          </div>
        </div>

        <!-- Sidebar de ayuda -->
        <aside class="w-80 border-l border-gray-200 bg-white p-6 overflow-y-auto custom-scrollbar">
          <h4 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
            Tips para el Prompt
          </h4>
          <div class="space-y-4">
            <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p class="text-sm text-blue-800 font-medium mb-2">Identidad clara</p>
              <p class="text-xs text-blue-600">Define quién es el asistente, para qué empresa trabaja y cuál es su rol principal.</p>
            </div>
            <div class="bg-green-50 border border-green-100 rounded-lg p-4">
              <p class="text-sm text-green-800 font-medium mb-2">Tono y estilo</p>
              <p class="text-xs text-green-600">Especifica si debe ser formal, amigable, usar emojis, etc.</p>
            </div>
            <div class="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <p class="text-sm text-amber-800 font-medium mb-2">Restricciones</p>
              <p class="text-xs text-amber-600">Indica qué NO debe hacer: inventar precios, dar diagnósticos médicos, etc.</p>
            </div>
            <div class="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <p class="text-sm text-purple-800 font-medium mb-2">Flujo conversacional</p>
              <p class="text-xs text-purple-600">Describe los pasos que debe seguir en la conversación (saludo, preguntas, etc.)</p>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-100">
            <h4 class="text-sm font-bold text-gray-900 mb-3">Variables disponibles</h4>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <code class="text-primary font-mono">{business_info}</code>
                <span class="text-gray-500">Info del negocio</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <code class="text-primary font-mono">{business_hours}</code>
                <span class="text-gray-500">Horarios</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <code class="text-primary font-mono">{services}</code>
                <span class="text-gray-500">Servicios</span>
              </div>
              <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <code class="text-primary font-mono">{rules}</code>
                <span class="text-gray-500">Reglas</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- Tab: Configuraciones -->
      <div id="panelConfig" class="h-full p-6 overflow-y-auto custom-scrollbar hidden">
        <div class="max-w-5xl mx-auto">
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-1">Configuraciones del Bot</h3>
            <p class="text-sm text-gray-500">Edita la información del negocio, horarios, servicios y reglas que el bot utiliza para responder.</p>
          </div>
          
          <div class="grid grid-cols-2 gap-6" id="configSections">
            <!-- Las secciones se cargan dinámicamente -->
            <div class="col-span-2 text-center py-12 text-gray-400">
              <span class="material-symbols-outlined text-4xl mb-2">hourglass_empty</span>
              <p>Cargando configuraciones...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Vista Previa -->
      <div id="panelPreview" class="h-full p-6 overflow-y-auto custom-scrollbar hidden">
        <div class="max-w-4xl mx-auto">
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-1">Vista Previa del Prompt Final</h3>
            <p class="text-sm text-gray-500">Así es como se ve el prompt completo que recibe la IA, incluyendo todas las configuraciones.</p>
          </div>
          
          <div class="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
            <div class="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div class="flex gap-1.5">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span class="text-gray-400 text-sm ml-2">system_prompt_preview.txt</span>
            </div>
            <pre id="previewContent" class="p-6 text-green-400 text-sm overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[calc(100vh-280px)]">Cargando vista previa...</pre>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script>
    // Estado global
    let config = {};
    let originalConfig = {};
    let hasChanges = false;

    // Configuración de secciones
    const sectionMeta = {
      system_prompt: {
        title: 'Prompt del Sistema',
        description: 'Personalidad y comportamiento del asistente',
        icon: 'psychology',
        color: 'blue'
      },
      business_info: {
        title: 'Información del Negocio',
        description: 'Nombre, sedes, contactos',
        icon: 'business',
        color: 'emerald'
      },
      business_hours: {
        title: 'Horarios de Atención',
        description: 'Horarios por sede',
        icon: 'schedule',
        color: 'amber'
      },
      services_and_pricing: {
        title: 'Servicios y Precios',
        description: 'Lista de servicios y política de precios',
        icon: 'medical_services',
        color: 'purple'
      },
      rules: {
        title: 'Reglas del Bot',
        description: 'Restricciones y prioridades',
        icon: 'gavel',
        color: 'red'
      },
      urgency_protocol: {
        title: 'Protocolo de Urgencias',
        description: 'Palabras clave y respuesta a emergencias',
        icon: 'emergency',
        color: 'rose'
      },
      booking_requirements: {
        title: 'Requisitos de Agendamiento',
        description: 'Datos necesarios para agendar',
        icon: 'event_available',
        color: 'cyan'
      },
      logistics_and_payments: {
        title: 'Logística y Pagos',
        description: 'Parqueo, accesibilidad, métodos de pago',
        icon: 'payments',
        color: 'indigo'
      }
    };

    // Cargar configuración inicial
    async function loadConfig() {
      try {
        const response = await fetch('/ai-config');
        if (!response.ok) throw new Error('Error cargando configuración');
        
        config = await response.json();
        originalConfig = JSON.parse(JSON.stringify(config));
        
        // Cargar prompt principal
        if (config.system_prompt?.value?.text) {
          document.getElementById('systemPrompt').value = config.system_prompt.value.text;
          updateCharCount();
        }
        
        // Renderizar secciones de configuración
        renderConfigSections();
        
        // Actualizar vista previa
        updatePreview();
        
      } catch (error) {
        console.error('Error:', error);
        showToast('Error cargando configuración', 'error');
      }
    }

    // Renderizar secciones de configuración
    function renderConfigSections() {
      const container = document.getElementById('configSections');
      const sections = Object.keys(config).filter(key => key !== 'system_prompt');
      
      if (sections.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-center py-12 text-gray-400">No hay configuraciones disponibles</div>';
        return;
      }

      container.innerHTML = sections.map(key => {
        const meta = sectionMeta[key] || { title: key, description: '', icon: 'settings', color: 'gray' };
        const value = config[key]?.value || {};
        const jsonString = JSON.stringify(value, null, 2);
        
        return \`
          <div class="section-card bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-lg bg-\${meta.color}-100 flex items-center justify-center">
                  <span class="material-symbols-outlined text-\${meta.color}-600">\${meta.icon}</span>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">\${meta.title}</h4>
                  <p class="text-xs text-gray-500">\${meta.description}</p>
                </div>
              </div>
              <button onclick="toggleSection('\${key}')" class="text-gray-400 hover:text-gray-600 transition-colors">
                <span class="material-symbols-outlined" id="icon-\${key}">expand_more</span>
              </button>
            </div>
            <div id="content-\${key}" class="p-4 hidden">
              <textarea 
                id="textarea-\${key}" 
                class="json-textarea w-full h-64 p-4 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                onchange="markAsChanged('\${key}')"
              >\${jsonString}</textarea>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-xs text-gray-400">Formato: JSON</span>
                <button onclick="formatJson('\${key}')" class="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">auto_fix_high</span>
                  Formatear JSON
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Toggle sección expandida/colapsada
    function toggleSection(key) {
      const content = document.getElementById(\`content-\${key}\`);
      const icon = document.getElementById(\`icon-\${key}\`);
      
      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.textContent = 'expand_less';
      } else {
        content.classList.add('hidden');
        icon.textContent = 'expand_more';
      }
    }

    // Formatear JSON
    function formatJson(key) {
      const textarea = document.getElementById(\`textarea-\${key}\`);
      try {
        const parsed = JSON.parse(textarea.value);
        textarea.value = JSON.stringify(parsed, null, 2);
        showToast('JSON formateado correctamente', 'success');
      } catch (e) {
        showToast('Error: JSON inválido', 'error');
      }
    }

    // Marcar como cambiado
    function markAsChanged(key) {
      hasChanges = true;
      document.getElementById('saveBtn').classList.add('animate-pulse');
    }

    // Actualizar contador de caracteres
    function updateCharCount() {
      const textarea = document.getElementById('systemPrompt');
      const count = textarea.value.length;
      document.getElementById('charCount').textContent = \`\${count.toLocaleString()} caracteres\`;
    }

    // Cambiar tab
    function switchTab(tab) {
      // Ocultar todos los paneles
      document.getElementById('panelPrompt').classList.add('hidden');
      document.getElementById('panelConfig').classList.add('hidden');
      document.getElementById('panelPreview').classList.add('hidden');
      
      // Quitar estilo activo de todos los tabs
      document.getElementById('tabPrompt').classList.remove('tab-active');
      document.getElementById('tabConfig').classList.remove('tab-active');
      document.getElementById('tabPreview').classList.remove('tab-active');
      document.getElementById('tabPrompt').classList.add('text-gray-600');
      document.getElementById('tabConfig').classList.add('text-gray-600');
      document.getElementById('tabPreview').classList.add('text-gray-600');
      
      // Mostrar panel seleccionado
      document.getElementById(\`panel\${tab.charAt(0).toUpperCase() + tab.slice(1)}\`).classList.remove('hidden');
      
      // Activar tab seleccionado
      const activeTab = document.getElementById(\`tab\${tab.charAt(0).toUpperCase() + tab.slice(1)}\`);
      activeTab.classList.add('tab-active');
      activeTab.classList.remove('text-gray-600');
      
      // Actualizar vista previa si es necesario
      if (tab === 'preview') {
        updatePreview();
      }
    }

    // Actualizar vista previa
    function updatePreview() {
      const systemPrompt = document.getElementById('systemPrompt').value;
      
      let preview = '=== SYSTEM PROMPT ===\\n\\n';
      preview += systemPrompt || '(Sin prompt definido)';
      preview += '\\n\\n';
      
      // Agregar otras configuraciones
      const sections = Object.keys(config).filter(key => key !== 'system_prompt');
      sections.forEach(key => {
        const meta = sectionMeta[key] || { title: key };
        const value = config[key]?.value;
        if (value) {
          preview += \`=== \${meta.title.toUpperCase()} ===\\n\`;
          preview += JSON.stringify(value, null, 2);
          preview += '\\n\\n';
        }
      });
      
      document.getElementById('previewContent').textContent = preview;
    }

    // Guardar todos los cambios
    async function saveAllChanges() {
      const saveBtn = document.getElementById('saveBtn');
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] saving-indicator">sync</span> Guardando...';
      
      try {
        // Guardar system_prompt
        const systemPromptText = document.getElementById('systemPrompt').value;
        await saveConfig('system_prompt', { text: systemPromptText });
        
        // Guardar otras configuraciones modificadas
        const sections = Object.keys(config).filter(key => key !== 'system_prompt');
        for (const key of sections) {
          const textarea = document.getElementById(\`textarea-\${key}\`);
          if (textarea) {
            try {
              const value = JSON.parse(textarea.value);
              await saveConfig(key, value);
            } catch (e) {
              showToast(\`Error en JSON de \${sectionMeta[key]?.title || key}\`, 'error');
              throw e;
            }
          }
        }
        
        hasChanges = false;
        showToast('Todos los cambios guardados correctamente', 'success');
        
        // Mostrar indicador de guardado
        const saveStatus = document.getElementById('saveStatus');
        saveStatus.classList.remove('hidden');
        setTimeout(() => saveStatus.classList.add('hidden'), 3000);
        
      } catch (error) {
        console.error('Error guardando:', error);
        showToast('Error al guardar los cambios', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">save</span> Guardar Cambios';
        saveBtn.classList.remove('animate-pulse');
      }
    }

    // Guardar configuración individual
    async function saveConfig(key, value) {
      const response = await fetch(\`/ai-config?key=\${key}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': getApiKey()
        },
        body: JSON.stringify({
          key: key,
          value: value,
          updated_by: 'admin_ui'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error guardando');
      }
      
      // Actualizar config local
      if (!config[key]) config[key] = {};
      config[key].value = value;
      
      return response.json();
    }

    // Obtener API key (almacenada en localStorage o prompt)
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

    // Mostrar toast
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      const icon = document.getElementById('toastIcon');
      const msg = document.getElementById('toastMessage');
      
      msg.textContent = message;
      icon.textContent = type === 'success' ? 'check_circle' : 'error';
      icon.className = \`material-symbols-outlined \${type === 'success' ? 'text-accent' : 'text-danger'}\`;
      
      toast.classList.remove('hidden');
      
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }

    // Event listeners
    document.getElementById('systemPrompt').addEventListener('input', () => {
      updateCharCount();
      markAsChanged('system_prompt');
    });

    // Exponer funciones al scope global
    window.switchTab = switchTab;
    window.toggleSection = toggleSection;
    window.formatJson = formatJson;
    window.saveAllChanges = saveAllChanges;

    // Advertir antes de salir con cambios sin guardar
    window.addEventListener('beforeunload', (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // Inicializar
    loadConfig();
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
