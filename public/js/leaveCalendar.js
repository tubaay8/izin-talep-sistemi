const CALENDAR_STATUS_LABELS = {
  pending: 'Bekliyor',
  approved: 'Onaylandi',
};

function formatCalendarDateTR(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('tr-TR');
}

function getLeaveInitials(fullName) {
  return (fullName || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function debounceCalendar(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ---------- Hover tooltip ---------- */

let calendarTooltipEl = null;

function ensureCalendarTooltip() {
  if (!calendarTooltipEl) {
    calendarTooltipEl = document.createElement('div');
    calendarTooltipEl.className = 'leave-event-tooltip';
    calendarTooltipEl.hidden = true;
    document.body.appendChild(calendarTooltipEl);
  }
  return calendarTooltipEl;
}

function positionCalendarTooltip(mouseEvent) {
  const el = ensureCalendarTooltip();
  const offset = 14;
  let x = mouseEvent.clientX + offset;
  let y = mouseEvent.clientY + offset;
  const rect = el.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) x = mouseEvent.clientX - rect.width - offset;
  if (y + rect.height > window.innerHeight) y = mouseEvent.clientY - rect.height - offset;
  el.style.left = `${Math.max(8, x)}px`;
  el.style.top = `${Math.max(8, y)}px`;
}

function showCalendarTooltip(event, mouseEvent) {
  const props = event.extendedProps;
  const el = ensureCalendarTooltip();
  el.innerHTML = `
    <strong>${props.employeeName}</strong>
    <span>${props.departmentName}</span>
    <span class="leave-event-tooltip-type" style="color:${getLeaveTypeColor(props.leaveTypeName)}">${props.leaveTypeName}</span>
    <span>${formatCalendarDateTR(props.startDate)} - ${formatCalendarDateTR(props.endDate)}</span>
    <span class="leave-event-tooltip-status leave-event-tooltip-status--${props.status}">${CALENDAR_STATUS_LABELS[props.status] || props.status}</span>
  `;
  el.hidden = false;
  positionCalendarTooltip(mouseEvent);
}

function hideCalendarTooltip() {
  if (calendarTooltipEl) calendarTooltipEl.hidden = true;
}

function showLeaveEventDetails(event) {
  const props = event.extendedProps;
  Swal.fire({
    title: props.employeeName,
    html: `
      <p><strong>Departman:</strong> ${props.departmentName}</p>
      <p><strong>Izin Turu:</strong> ${props.leaveTypeName}</p>
      <p><strong>Tarih:</strong> ${formatCalendarDateTR(props.startDate)} - ${formatCalendarDateTR(props.endDate)}</p>
      <p><strong>Durum:</strong> ${CALENDAR_STATUS_LABELS[props.status] || props.status}</p>
      ${props.reason ? `<p><strong>Aciklama:</strong> ${props.reason}</p>` : ''}
    `,
    icon: 'info',
    confirmButtonText: 'Kapat',
    confirmButtonColor: '#3E2522',
  });
}

/* ---------- Tarih yardimcilari ---------- */

function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const toISO = (d) => d.toISOString().slice(0, 10);
  return { start: toISO(monday), end: toISO(sunday) };
}

function isTodayWithinRange(startDate, endDate) {
  const todayISO = new Date().toISOString().slice(0, 10);
  return startDate <= todayISO && endDate >= todayISO;
}

function buildDensityMap(events) {
  const map = {};
  events.forEach((event) => {
    const cur = new Date(`${event.start}T00:00:00`);
    const end = new Date(`${event.end}T00:00:00`);
    while (cur < end) {
      const key = cur.toISOString().slice(0, 10);
      map[key] = (map[key] || 0) + 1;
      cur.setDate(cur.getDate() + 1);
    }
  });
  return map;
}

function densityClassFor(count) {
  if (!count) return [];
  if (count <= 2) return ['fc-day-density-1'];
  if (count <= 4) return ['fc-day-density-2'];
  return ['fc-day-density-3'];
}

/* ---------- Istemci tarafi filtreler (izin turu + arama) ---------- */

function applyClientSideFilters(events) {
  const typeEl = document.getElementById('filter-leave-type');
  const searchEl = document.getElementById('filter-search');
  const typeFilter = typeEl ? typeEl.value : '';
  const searchFilter = searchEl ? searchEl.value.trim().toLowerCase() : '';

  return events.filter((event) => {
    if (typeFilter && event.extendedProps.leaveTypeName !== typeFilter) return false;
    if (searchFilter && !event.extendedProps.employeeName.toLowerCase().includes(searchFilter)) return false;
    return true;
  });
}

/* ---------- Veri cekme ---------- */

async function fetchCalendarEvents(apiUrl, start, end, getExtraParams) {
  const params = new URLSearchParams({ start, end });
  const extra = getExtraParams ? getExtraParams() : {};
  Object.entries(extra).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const res = await fetch(`${apiUrl}?${params.toString()}`);
  if (!res.ok) throw new Error('Takvim verisi alinamadi');
  const data = await res.json();
  return data.events;
}

async function updateCalendarSideInfo(apiUrl, getExtraParams) {
  const todayEl = document.getElementById('summary-today');
  const weekEl = document.getElementById('summary-week');
  const todayListEl = document.getElementById('today-leave-list');

  try {
    const { start, end } = getCurrentWeekRange();
    const events = applyClientSideFilters(await fetchCalendarEvents(apiUrl, start, end, getExtraParams));
    const todayEvents = events.filter((e) => isTodayWithinRange(e.extendedProps.startDate, e.extendedProps.endDate));

    if (todayEl) todayEl.textContent = todayEvents.length;
    if (weekEl) weekEl.textContent = events.length;
    if (todayListEl) renderTodayLeaveList(todayListEl, todayEvents);
  } catch (err) {
    if (todayEl) todayEl.textContent = '-';
    if (weekEl) weekEl.textContent = '-';
    if (todayListEl) todayListEl.innerHTML = '';
  }
}

function renderTodayLeaveList(container, events) {
  if (!events.length) {
    container.innerHTML = '<p class="empty-state">Bugun izinli personel bulunmuyor.</p>';
    return;
  }

  container.innerHTML = events
    .map((event) => {
      const props = event.extendedProps;
      const color = getLeaveTypeColor(props.leaveTypeName);
      return `
        <div class="today-leave-card">
          <span class="today-leave-avatar" style="background:${color}">${getLeaveInitials(props.employeeName)}</span>
          <div class="today-leave-info">
            <strong>${props.employeeName}</strong>
            <span>${props.departmentName}</span>
            <span class="today-leave-type" style="color:${color}">${props.leaveTypeName}</span>
            <span class="today-leave-dates">${formatCalendarDateTR(props.startDate)} - ${formatCalendarDateTR(props.endDate)}</span>
          </div>
        </div>`;
    })
    .join('');
}

async function renderLeaveTypeLegend(elementId, selectId) {
  const el = document.getElementById(elementId);
  const selectEl = selectId ? document.getElementById(selectId) : null;
  if (!el) return;

  try {
    const res = await fetch('/api/leave-types');
    const data = await res.json();

    el.innerHTML = data.leaveTypes
      .map((type) => {
        const color = getLeaveTypeColor(type.name);
        return `
        <li class="calendar-legend-item">
          <span class="calendar-legend-badge" style="background:${color}22;color:${color};border-color:${color}55">
            <span class="calendar-legend-dot" style="background:${color}"></span>
            ${type.name}
          </span>
        </li>`;
      })
      .join('');

    if (selectEl) {
      data.leaveTypes.forEach((type) => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name;
        selectEl.appendChild(option);
      });
    }
  } catch (err) {
    el.innerHTML = '';
  }
}

/* ---------- Takvim kurulumu ---------- */

function initLeaveCalendar({ elementId, apiUrl, getExtraParams, legendElementId, leaveTypeSelectId }) {
  const el = document.getElementById(elementId);
  if (!el) return null;

  let densityMap = {};

  const calendar = new FullCalendar.Calendar(el, {
    initialView: 'dayGridMonth',
    locale: 'tr',
    height: 'auto',
    dayMaxEvents: 3,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    buttonText: {
      today: 'Bugun',
      month: 'Ay',
      week: 'Hafta',
      day: 'Gun',
    },
    moreLinkText: (num) => `+${num} daha`,
    events: async (fetchInfo, successCallback, failureCallback) => {
      try {
        const rawEvents = await fetchCalendarEvents(
          apiUrl,
          fetchInfo.startStr.slice(0, 10),
          fetchInfo.endStr.slice(0, 10),
          getExtraParams
        );
        const events = applyClientSideFilters(rawEvents);
        densityMap = buildDensityMap(events);

        const totalEl = document.getElementById('summary-total');
        const pendingEl = document.getElementById('summary-pending');
        if (totalEl) totalEl.textContent = events.length;
        if (pendingEl) pendingEl.textContent = events.filter((e) => e.extendedProps.status === 'pending').length;

        successCallback(events);
        setTimeout(() => calendar.render(), 0);
      } catch (err) {
        failureCallback(err);
      }
    },
    dayCellClassNames: (arg) => densityClassFor(densityMap[arg.date.toISOString().slice(0, 10)]),
    eventDidMount: (info) => {
      const color = getLeaveTypeColor(info.event.extendedProps.leaveTypeName);
      info.el.style.backgroundColor = color;
      info.el.style.borderColor = color;
      if (info.event.extendedProps.status === 'pending') {
        info.el.classList.add('fc-event-pending');
      }
      info.el.addEventListener('mouseenter', (e) => showCalendarTooltip(info.event, e));
      info.el.addEventListener('mousemove', (e) => positionCalendarTooltip(e));
      info.el.addEventListener('mouseleave', hideCalendarTooltip);
    },
    eventClick: (info) => {
      hideCalendarTooltip();
      showLeaveEventDetails(info.event);
    },
  });

  calendar.render();

  if (legendElementId) renderLeaveTypeLegend(legendElementId, leaveTypeSelectId);
  updateCalendarSideInfo(apiUrl, getExtraParams);

  return calendar;
}

function refreshLeaveCalendar(calendar, apiUrl, getExtraParams) {
  if (calendar) calendar.refetchEvents();
  updateCalendarSideInfo(apiUrl, getExtraParams);
}
