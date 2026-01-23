// Endpoint para servir la interfaz de chats
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
  <title>Chats - Clínica Dr. Albeiro García</title>
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
            "background-dark": "#101922",
          },
          fontFamily: {
            "display": ["Inter"]
          },
        },
      },
    }
  </script>
  <style>
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-background-light font-display text-[#111418] h-screen overflow-hidden">
  <div class="flex flex-col h-full">
    <!-- Header -->
    <header class="flex items-center justify-between border-b border-[#e5e7eb] bg-white px-6 py-3 shrink-0">
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-3 text-primary">
          <div class="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
            <span class="material-symbols-outlined text-primary">medical_services</span>
          </div>
          <h2 class="text-[#111418] text-lg font-bold">WhatsApp Supervisor</h2>
        </div>
        <label class="flex flex-col min-w-80 h-10">
          <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div class="text-[#617589] flex border-none bg-[#f0f2f4] items-center justify-center pl-4 rounded-l-lg">
              <span class="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input id="searchInput" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f4] focus:border-none h-full placeholder:text-[#617589] px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal" placeholder="Buscar pacientes o conversaciones..." type="text"/>
          </div>
        </label>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex flex-1 overflow-hidden">
      <!-- Sidebar - Lista de conversaciones -->
      <aside class="w-80 flex flex-col bg-white border-r border-[#e5e7eb]">
        <div class="px-4 pt-2 shrink-0">
          <div class="flex border-b border-[#e5e7eb] gap-4">
            <a class="flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3 pt-4 px-2" href="#" onclick="filterConversations('all'); return false;">
              <p class="text-xs font-bold whitespace-nowrap">Todas</p>
            </a>
            <a class="flex flex-col items-center justify-center border-b-2 border-transparent text-[#617589] pb-3 pt-4 px-2 hover:text-primary transition-colors" href="#" onclick="filterConversations('active'); return false;">
              <p class="text-xs font-bold whitespace-nowrap">Activas</p>
            </a>
          </div>
        </div>
        <div id="conversationsList" class="flex-1 overflow-y-auto custom-scrollbar">
          <div class="p-4 text-center text-[#617589]">Cargando conversaciones...</div>
        </div>
      </aside>

      <!-- Chat Area -->
      <section class="flex-1 flex flex-col bg-[#f0f2f4] relative">
        <div id="chatHeader" class="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e5e7eb] shrink-0 hidden">
          <div class="flex items-center gap-3">
            <div class="bg-primary/10 aspect-square rounded-full size-10 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">person</span>
            </div>
            <div>
              <p id="chatPatientName" class="text-base font-bold"></p>
              <p id="chatPhoneNumber" class="text-xs text-[#617589]"></p>
            </div>
          </div>
        </div>
        <div id="chatMessages" class="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          <div class="flex items-center justify-center h-full text-[#617589]">
            <p>Selecciona una conversación para ver los mensajes</p>
          </div>
        </div>
      </section>

      <!-- Right Sidebar - Patient Info -->
      <aside id="patientInfo" class="w-80 flex flex-col bg-white border-l border-[#e5e7eb] overflow-y-auto custom-scrollbar hidden">
        <div class="p-6 flex-1">
          <div class="flex flex-col items-center mb-6">
            <div class="bg-primary/10 aspect-square rounded-full size-24 mb-4 ring-4 ring-gray-50 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-4xl">person</span>
            </div>
            <h3 id="patientName" class="text-lg font-bold"></h3>
            <p id="patientPhone" class="text-sm text-[#617589]"></p>
          </div>
          <div class="space-y-6">
            <div class="h-[1px] bg-gray-100"></div>
            <div class="space-y-4">
              <h4 class="text-xs font-bold uppercase tracking-widest text-[#617589]">Información del Paciente</h4>
              <div class="flex justify-between items-center">
                <span class="text-sm text-[#617589]">Documento</span>
                <span id="patientDocument" class="text-sm font-semibold">-</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-[#617589]">Correo</span>
                <span id="patientEmail" class="text-sm font-semibold">-</span>
              </div>
            </div>
            <div class="h-[1px] bg-gray-100"></div>
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-widest text-[#617589]">Próximas Citas</h4>
              <div id="patientAppointments" class="space-y-2">
                <p class="text-sm text-[#617589]">No hay citas programadas</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>

  <script>
    let conversations = [];
    let currentPhoneNumber = null;

    // Cargar conversaciones
    async function loadConversations() {
      try {
        const response = await fetch('/conversations');
        const data = await response.json();
        conversations = data.conversations || [];
        renderConversations(conversations);
      } catch (error) {
        console.error('Error cargando conversaciones:', error);
        document.getElementById('conversationsList').innerHTML = '<div class="p-4 text-center text-red-500">Error cargando conversaciones</div>';
      }
    }

    // Renderizar lista de conversaciones
    function renderConversations(convs) {
      const list = document.getElementById('conversationsList');
      if (convs.length === 0) {
        list.innerHTML = '<div class="p-4 text-center text-[#617589]">No hay conversaciones</div>';
        return;
      }

      list.innerHTML = convs.map(conv => {
        const name = conv.patientName || conv.phoneNumber;
        const lastMsg = conv.lastMessage || 'Sin mensajes';
        const time = formatTime(conv.lastMessageAt);
        const isActive = isRecent(conv.lastMessageAt);
        
        return \`<div class="flex items-center gap-4 bg-white px-4 min-h-[80px] py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100" onclick="loadChat('\${conv.phoneNumber}')">
          <div class="relative shrink-0">
            <div class="bg-primary/10 aspect-square rounded-full h-12 w-12 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">person</span>
            </div>
            \${isActive ? '<div class="absolute bottom-0 right-0 size-3.5 rounded-full bg-[#078838] border-2 border-white"></div>' : ''}
          </div>
          <div class="flex flex-col justify-center flex-1 min-w-0">
            <div class="flex justify-between items-baseline">
              <p class="text-[#111418] text-sm font-bold truncate">\${name}</p>
              <span class="text-[10px] text-[#617589]">\${time}</span>
            </div>
            <p class="text-[#617589] text-xs line-clamp-1 mt-0.5">\${lastMsg}</p>
            <div class="mt-2 flex">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold \${conv.lastMessageRole === 'assistant' ? 'bg-[#078838]/10 text-[#078838]' : 'bg-primary/10 text-primary'} flex items-center gap-1 uppercase tracking-wider">
                <span class="material-symbols-outlined text-[12px]">\${conv.lastMessageRole === 'assistant' ? 'smart_toy' : 'person'}</span>
                \${conv.lastMessageRole === 'assistant' ? 'Bot' : 'Usuario'}
              </span>
            </div>
          </div>
        </div>\`;
      }).join('');
    }

    // Cargar chat específico
    async function loadChat(phoneNumber) {
      currentPhoneNumber = phoneNumber;
      const conv = conversations.find(c => c.phoneNumber === phoneNumber);
      
      // Mostrar header
      document.getElementById('chatHeader').classList.remove('hidden');
      document.getElementById('chatPatientName').textContent = conv?.patientName || phoneNumber;
      document.getElementById('chatPhoneNumber').textContent = phoneNumber;
      
      // Mostrar info del paciente
      document.getElementById('patientInfo').classList.remove('hidden');
      document.getElementById('patientName').textContent = conv?.patientName || phoneNumber;
      document.getElementById('patientPhone').textContent = phoneNumber;
      document.getElementById('patientDocument').textContent = conv?.document || '-';
      document.getElementById('patientEmail').textContent = conv?.email || '-';
      
      // Cargar mensajes
      try {
        const response = await fetch(\`/conversations?phoneNumber=\${phoneNumber}&limit=100\`);
        const data = await response.json();
        renderMessages(data.messages || []);
        loadAppointments(phoneNumber);
      } catch (error) {
        console.error('Error cargando mensajes:', error);
        document.getElementById('chatMessages').innerHTML = '<div class="text-red-500">Error cargando mensajes</div>';
      }
    }

    // Renderizar mensajes
    function renderMessages(messages) {
      const container = document.getElementById('chatMessages');
      if (messages.length === 0) {
        container.innerHTML = '<div class="text-[#617589]">No hay mensajes</div>';
        return;
      }

      // Ordenar por fecha (más antiguos primero)
      messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      // Agrupar por fecha
      const grouped = {};
      messages.forEach(msg => {
        const date = new Date(msg.created_at).toLocaleDateString('es-CO');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(msg);
      });

      container.innerHTML = Object.keys(grouped).map(date => {
        const dayMessages = grouped[date];
        return \`<div class="flex justify-center">
          <span class="text-[10px] font-bold text-[#617589] bg-[#e5e7eb] px-3 py-1 rounded-full uppercase tracking-wider">\${date}</span>
        </div>
        \${dayMessages.map(msg => {
          const isBot = msg.role === 'assistant';
          const time = new Date(msg.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
          return \`<div class="flex flex-col gap-1 \${isBot ? 'items-start' : 'items-end ml-auto'} max-w-[80%]">
            <div class="flex items-center gap-2 mb-1">
              \${isBot ? '<div class="size-6 rounded-full bg-gray-200 flex items-center justify-center"><span class="material-symbols-outlined text-[14px] text-gray-600">smart_toy</span></div><span class="text-xs font-bold text-gray-500">Bot</span>' : '<span class="text-xs font-bold text-gray-500">Usuario</span>'}
              <span class="text-[10px] text-gray-400">\${time}</span>
            </div>
            <div class="\${isBot ? 'bg-white p-4 rounded-xl rounded-tl-none shadow-sm border border-gray-100' : 'bg-primary text-white p-4 rounded-xl rounded-tr-none shadow-sm'}">
              <p class="text-sm leading-relaxed \${isBot ? 'text-[#111418]' : ''}">\${escapeHtml(msg.content)}</p>
            </div>
          </div>\`;
        }).join('')}\`;
      }).join('');
      
      // Scroll al final
      container.scrollTop = container.scrollHeight;
    }

    // Cargar citas del paciente
    async function loadAppointments(phoneNumber) {
      try {
        const response = await fetch(\`/api/appointments?phoneNumber=\${phoneNumber}\`);
        const data = await response.json();
        const appointments = data.appointments || [];
        
        const container = document.getElementById('patientAppointments');
        if (appointments.length === 0) {
          container.innerHTML = '<p class="text-sm text-[#617589]">No hay citas programadas</p>';
          return;
        }
        
        container.innerHTML = appointments.map(apt => {
          const date = new Date(apt.appointment_date);
          const month = date.toLocaleDateString('es-CO', { month: 'short' });
          const day = date.getDate();
          return \`<div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div class="flex items-center gap-3">
              <div class="size-10 bg-white rounded flex flex-col items-center justify-center border border-gray-200">
                <span class="text-[10px] font-bold text-primary uppercase">\${month}</span>
                <span class="text-sm font-bold">\${day}</span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-bold">\${apt.service || 'Consulta'}</p>
                <p class="text-[11px] text-[#617589]">\${apt.appointment_time} • \${apt.location}</p>
              </div>
            </div>
          </div>\`;
        }).join('');
      } catch (error) {
        console.error('Error cargando citas:', error);
      }
    }

    // Funciones auxiliares
    function formatTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (minutes < 1) return 'Ahora';
      if (minutes < 60) return \`\${minutes}m\`;
      if (hours < 24) return \`\${hours}h\`;
      if (days === 1) return 'Ayer';
      if (days < 7) return \`\${days}d\`;
      return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    }

    function isRecent(dateString) {
      if (!dateString) return false;
      const date = new Date(dateString);
      const now = new Date();
      return (now - date) < 3600000; // Última hora
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function filterConversations(type) {
      // Implementar filtros si es necesario
      renderConversations(conversations);
    }

    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = conversations.filter(conv => 
        (conv.patientName || '').toLowerCase().includes(query) ||
        conv.phoneNumber.includes(query)
      );
      renderConversations(filtered);
    });

    // Inicializar
    loadConversations();
    setInterval(loadConversations, 30000); // Actualizar cada 30 segundos
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
