// Endpoint para servir la interfaz de calendario con vistas de día, semana y mes
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const html = `<!DOCTYPE html>
<html class="light" lang="es">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Calendario - Clínica Dr. Albeiro García</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet"/>
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
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    body { font-family: 'Inter', sans-serif; }
    .timeline-scroll::-webkit-scrollbar { width: 6px; }
    .timeline-scroll::-webkit-scrollbar-track { background: transparent; }
    .timeline-scroll::-webkit-scrollbar-thumb { background: #dbe0e6; border-radius: 10px; }
    .calendar-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .calendar-scroll::-webkit-scrollbar-track { background: transparent; }
    .calendar-scroll::-webkit-scrollbar-thumb { background: #dbe0e6; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #dbe0e6; border-radius: 10px; }
    .calendar-grid { display: grid; grid-template-columns: 80px repeat(7, 1fr); }
    .time-slot-height { height: 80px; }
    .month-grid { display: grid; grid-template-columns: repeat(7, 1fr); grid-auto-rows: minmax(120px, 1fr); }
  </style>
</head>
<body class="bg-background-light text-[#111418] font-display overflow-hidden">
  <div class="flex h-screen overflow-hidden">
    <main class="flex-1 flex flex-col bg-background-light overflow-hidden">
      <!-- Header -->
      <header class="h-16 flex-shrink-0 flex items-center justify-between px-8 bg-white border-b border-[#dbe0e6] shadow-sm z-20">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3">
            <div class="bg-primary size-8 rounded-lg flex items-center justify-center text-white">
              <span class="material-symbols-outlined text-xl">health_and_safety</span>
            </div>
            <h1 class="text-base font-bold leading-tight hidden md:block">Clínica Dr. Albeiro García</h1>
          </div>
          <div class="h-4 w-px bg-gray-300"></div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <button id="prevBtn" class="p-1 hover:bg-gray-100 rounded">
                <span class="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <h2 id="dateTitle" class="text-lg font-bold">Cargando...</h2>
              <button id="nextBtn" class="p-1 hover:bg-gray-100 rounded">
                <span class="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
          <div class="relative hidden lg:block ml-4">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input id="searchInput" class="pl-10 pr-4 py-1.5 text-sm bg-gray-50 border-gray-200 rounded-lg w-64 focus:ring-primary focus:border-primary" placeholder="Buscar citas..." type="text"/>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex bg-gray-100 p-1 rounded-lg border border-[#dbe0e6]">
            <button id="viewMonth" class="px-4 py-1.5 text-xs font-bold rounded-md hover:bg-white/50" onclick="changeView('month')">Mes</button>
            <button id="viewWeek" class="px-4 py-1.5 text-xs font-bold rounded-md hover:bg-white/50" onclick="changeView('week')">Semana</button>
            <button id="viewDay" class="px-4 py-1.5 text-xs font-bold rounded-md hover:bg-white/50" onclick="changeView('day')">Día</button>
          </div>
          <button class="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors" onclick="goToToday()">
            <span class="material-symbols-outlined text-sm">today</span> Hoy
          </button>
        </div>
      </header>

      <!-- Calendar Views -->
      <div class="flex-1 overflow-hidden">
        <!-- Day View -->
        <div id="dayView" class="hidden flex-1 overflow-y-auto timeline-scroll p-8 bg-[#fdfdfe]">
          <div class="max-w-7xl mx-auto space-y-0 relative">
            <div id="dayTimeline" class="space-y-0">
              <!-- Se generará dinámicamente -->
            </div>
          </div>
        </div>

        <!-- Week View -->
        <div id="weekView" class="hidden flex-1 overflow-auto calendar-scroll bg-white">
          <div class="min-w-[1000px] h-full flex flex-col">
            <div id="weekHeader" class="calendar-grid border-b border-[#dbe0e6] sticky top-0 bg-white z-10">
              <div class="h-12"></div>
              <!-- Se generará dinámicamente -->
            </div>
            <div id="weekGrid" class="relative flex-1">
              <!-- Se generará dinámicamente -->
            </div>
          </div>
        </div>

        <!-- Month View -->
        <div id="monthView" class="flex-1 overflow-hidden flex flex-col">
          <div class="grid grid-cols-7 border-b border-[#dbe0e6] bg-white">
            <div class="py-3 text-center text-xs font-bold text-[#617589] uppercase tracking-wider">Dom</div>
            <div class="py-3 text-center text-xs font-bold text-[#617589] uppercase tracking-wider">Lun</div>
            <div class="py-3 text-center text-xs font-bold text-[#617589] uppercase tracking-wider">Mar</div>
            <div class="py-3 text-center text-xs font-bold text-[#617589] uppercase tracking-wider">Mié</div>
            <div class="py-3 text-center text-xs font-bold text-[#617589] uppercase tracking-wider">Jue</div>
            <div class="py-3 text-center text-xs font-bold text-[#617589] uppercase tracking-wider">Vie</div>
            <div class="py-3 text-center text-xs font-bold text-[#617589] uppercase tracking-wider">Sáb</div>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <div id="monthGrid" class="month-grid border-l border-[#dbe0e6]">
              <!-- Se generará dinámicamente -->
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script>
    let currentDate = new Date();
    let currentView = 'month';
    let appointments = [];

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
      updateDateTitle();
      loadAppointments();
      changeView('month');
      
      document.getElementById('prevBtn').addEventListener('click', () => navigateDate(-1));
      document.getElementById('nextBtn').addEventListener('click', () => navigateDate(1));
      document.getElementById('searchInput').addEventListener('input', filterAppointments);
    });

    // Cambiar vista
    function changeView(view) {
      currentView = view;
      
      // Actualizar botones
      document.getElementById('viewMonth').classList.toggle('bg-white', view === 'month');
      document.getElementById('viewMonth').classList.toggle('shadow-sm', view === 'month');
      document.getElementById('viewWeek').classList.toggle('bg-white', view === 'week');
      document.getElementById('viewWeek').classList.toggle('shadow-sm', view === 'week');
      document.getElementById('viewDay').classList.toggle('bg-white', view === 'day');
      document.getElementById('viewDay').classList.toggle('shadow-sm', view === 'day');
      
      // Ocultar todas las vistas
      document.getElementById('dayView').classList.add('hidden');
      document.getElementById('weekView').classList.add('hidden');
      document.getElementById('monthView').classList.add('hidden');
      
      // Mostrar vista seleccionada
      if (view === 'day') {
        document.getElementById('dayView').classList.remove('hidden');
        renderDayView();
      } else if (view === 'week') {
        document.getElementById('weekView').classList.remove('hidden');
        renderWeekView();
      } else {
        document.getElementById('monthView').classList.remove('hidden');
        renderMonthView();
      }
    }

    // Navegar fechas
    function navigateDate(direction) {
      if (currentView === 'day') {
        currentDate.setDate(currentDate.getDate() + direction);
      } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() + (direction * 7));
      } else {
        currentDate.setMonth(currentDate.getMonth() + direction);
      }
      updateDateTitle();
      loadAppointments();
    }

    // Ir a hoy
    function goToToday() {
      currentDate = new Date();
      updateDateTitle();
      loadAppointments();
    }

    // Actualizar título de fecha
    function updateDateTitle() {
      const title = document.getElementById('dateTitle');
      if (currentView === 'day') {
        title.textContent = currentDate.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      } else if (currentView === 'week') {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weekStartStr = weekStart.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
        const weekEndStr = weekEnd.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' });
        title.textContent = weekStartStr + ' - ' + weekEndStr;
      } else {
        title.textContent = currentDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
      }
    }

    // Cargar citas
    async function loadAppointments() {
      try {
        const startDate = new Date(currentDate);
        if (currentView === 'month') {
          startDate.setDate(1);
        } else if (currentView === 'week') {
          startDate.setDate(currentDate.getDate() - currentDate.getDay());
        }
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        if (currentView === 'month') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (currentView === 'week') {
          endDate.setDate(startDate.getDate() + 7);
        } else {
          endDate.setDate(startDate.getDate() + 1);
        }
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        const response = await fetch('/api/appointments-all?startDate=' + startDateStr + '&endDate=' + endDateStr);
        const data = await response.json();
        appointments = data.appointments || [];
        if (currentView === 'day') {
          renderDayView();
        } else if (currentView === 'week') {
          renderWeekView();
        } else {
          renderMonthView();
        }
      } catch (error) {
        console.error('Error cargando citas:', error);
        appointments = [];
      }
    }

    // Renderizar vista de día
    function renderDayView() {
      const container = document.getElementById('dayTimeline');
      const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM a 9 PM
      
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.toDateString() === currentDate.toDateString();
      });
      
      container.innerHTML = hours.map(hour => {
        const hourAppointments = dayAppointments.filter(apt => {
          const time = apt.appointment_time.split(':');
          return parseInt(time[0]) === hour;
        });
        
        const hourStr = hour.toString().padStart(2, '0');
        let appointmentsHtml = '';
        
        if (hourAppointments.length > 0) {
          appointmentsHtml = hourAppointments.map(apt => {
            const patient = apt.patient || {};
            const color = apt.location === 'rodadero' ? 'blue' : 'green';
            const patientName = patient.name || apt.phone_number;
            const service = apt.service || 'Consulta';
            const location = apt.location || 'rodadero';
            return '<div class="bg-' + color + '-50 border-l-4 border-' + color + '-500 p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all border border-' + color + '-100/50 mb-2">' +
              '<div class="flex justify-between items-start">' +
              '<div>' +
              '<div class="flex items-center gap-3 mb-2">' +
              '<h4 class="font-bold text-lg text-' + color + '-900">' + escapeHtml(patientName) + '</h4>' +
              '<span class="text-[10px] bg-' + color + '-100 text-' + color + '-700 px-2 py-0.5 rounded font-bold uppercase">' + escapeHtml(service) + '</span>' +
              '</div>' +
              '<p class="text-sm text-' + color + '-700/70 font-medium">' + escapeHtml(location) + '</p>' +
              '</div>' +
              '<div class="text-right">' +
              '<p class="text-sm font-bold text-' + color + '-900">' + apt.appointment_time + '</p>' +
              '</div>' +
              '</div>' +
              '</div>';
          }).join('');
        } else {
          appointmentsHtml = '<div class="text-xs text-gray-400 italic">Sin citas programadas</div>';
        }
        
        return '<div class="flex gap-8 group">' +
          '<div class="w-20 text-right py-4">' +
          '<span class="text-xs font-bold text-[#617589]">' + hourStr + ':00</span>' +
          '</div>' +
          '<div class="flex-1 border-t border-[#f0f2f4] pt-4 pb-12 min-h-[100px]">' +
          appointmentsHtml +
          '</div>' +
          '</div>';
      }).join('');
    }

    // Renderizar vista de semana
    function renderWeekView() {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        return day;
      });
      
      // Header de días
      const header = document.getElementById('weekHeader');
      header.innerHTML = '<div class="h-12"></div>' + days.map(day => {
        const isToday = day.toDateString() === new Date().toDateString();
        const dayName = day.toLocaleDateString('es-CO', { weekday: 'short' });
        const dayNum = day.getDate();
        return '<div class="h-12 flex flex-col items-center justify-center border-l border-[#f0f2f4]' + (isToday ? ' bg-primary/10' : '') + '">' +
          '<span class="text-[10px] font-bold' + (isToday ? ' text-primary' : ' text-[#617589]') + ' uppercase tracking-tighter">' + dayName + '</span>' +
          '<span class="text-sm font-bold' + (isToday ? ' text-primary' : '') + '">' + dayNum + '</span>' +
          '</div>';
      }).join('');
      
      // Grid de horas
      const grid = document.getElementById('weekGrid');
      const hours = Array.from({ length: 14 }, (_, i) => i + 8);
      
      let gridHtml = '<div class="calendar-grid"><div class="flex flex-col">';
      gridHtml += hours.map(hour => {
        const hourStr = hour.toString().padStart(2, '0');
        return '<div class="time-slot-height border-b border-transparent flex justify-center pt-2">' +
          '<span class="text-[10px] font-bold text-[#617589]">' + hourStr + ':00</span>' +
          '</div>';
      }).join('');
      gridHtml += '</div>';
      
      gridHtml += days.map(day => {
        const dayAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate.toDateString() === day.toDateString();
        });
        
        let dayHtml = '<div class="relative border-l border-[#f0f2f4]">' +
          '<div class="absolute inset-0 grid grid-rows-[repeat(14,80px)] divide-y divide-[#f0f2f4]">' +
          hours.map(() => '<div></div>').join('') +
          '</div>';
        
        dayHtml += dayAppointments.map(apt => {
          const time = apt.appointment_time.split(':');
          const hour = parseInt(time[0]);
          const minute = parseInt(time[1]);
          const top = ((hour - 8) * 80) + (minute / 60 * 80);
          const patient = apt.patient || {};
          const color = apt.location === 'rodadero' ? 'blue' : 'green';
          const patientName = patient.name || apt.phone_number;
          const service = apt.service || 'Consulta';
          return '<div class="absolute left-1 right-1 bg-' + color + '-500 text-white rounded p-1.5 shadow-sm text-[10px] overflow-hidden cursor-pointer hover:bg-' + color + '-600 z-[2]" style="top: ' + top + 'px;" title="' + escapeHtml(patientName) + ' - ' + apt.appointment_time + '">' +
            '<p class="font-bold truncate">' + escapeHtml(patientName.substring(0, 15)) + '</p>' +
            '<p class="opacity-80 truncate">' + escapeHtml(service) + '</p>' +
            '</div>';
        }).join('');
        
        dayHtml += '</div>';
        return dayHtml;
      }).join('');
      
      gridHtml += '</div>';
      grid.innerHTML = gridHtml;
    }

    // Renderizar vista de mes
    function renderMonthView() {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      
      const grid = document.getElementById('monthGrid');
      const days = [];
      
      // Días del mes anterior
      const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
      for (let i = startDate.getDay(); i > 0; i--) {
        days.push({ date: prevMonthLastDay - i + 1, isCurrentMonth: false, fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i + 1) });
      }
      
      // Días del mes actual
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({ date: i, isCurrentMonth: true, fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), i) });
      }
      
      // Días del mes siguiente
      const remaining = 42 - days.length;
      for (let i = 1; i <= remaining; i++) {
        days.push({ date: i, isCurrentMonth: false, fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i) });
      }
      
      grid.innerHTML = days.map(day => {
        const dayAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate.toDateString() === day.fullDate.toDateString();
        });
        
        const isToday = day.fullDate.toDateString() === new Date().toDateString();
        const bgClass = day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-50';
        const todayClass = isToday ? ' bg-primary/5 ring-1 ring-inset ring-primary/20' : '';
        const dateClass = isToday ? 'text-primary bg-white size-6 flex items-center justify-center rounded-full shadow-sm' : 'text-[#617589]';
        
        let dayHtml = '<div class="' + bgClass + ' border-r border-b border-[#dbe0e6] p-2 min-h-[140px]' + todayClass + '">' +
          '<div class="flex justify-between items-start">' +
          '<span class="text-sm font-semibold ' + dateClass + '">' + day.date + '</span>';
        
        if (isToday) {
          dayHtml += '<span class="text-[10px] font-bold text-primary uppercase">Hoy</span>';
        }
        
        dayHtml += '</div><div class="mt-2 space-y-1">';
        
        dayHtml += dayAppointments.slice(0, 3).map(apt => {
          const patient = apt.patient || {};
          const color = apt.location === 'rodadero' ? 'blue' : 'green';
          const patientName = patient.name || apt.phone_number;
          return '<div class="text-[10px] bg-' + color + '-50 text-' + color + '-700 p-1 rounded font-medium truncate" title="' + escapeHtml(patientName) + ' - ' + apt.appointment_time + '">' +
            apt.appointment_time + ' ' + escapeHtml(patientName.substring(0, 12)) +
            '</div>';
        }).join('');
        
        if (dayAppointments.length > 3) {
          dayHtml += '<div class="text-[10px] text-[#617589] font-bold pl-1">+' + (dayAppointments.length - 3) + ' más</div>';
        }
        
        dayHtml += '</div></div>';
        return dayHtml;
      }).join('');
    }

    // Filtrar citas
    function filterAppointments() {
      // Implementar filtro si es necesario
      changeView(currentView);
    }

    // Escapar HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
