const API_URL = '/api/manager/leave-requests/calendar';
const statusSelect = document.getElementById('filter-status');
const leaveTypeSelect = document.getElementById('filter-leave-type');
const searchInput = document.getElementById('filter-search');

function getExtraParams() {
  return { status: statusSelect.value };
}

const calendar = initLeaveCalendar({
  elementId: 'leave-calendar',
  apiUrl: API_URL,
  getExtraParams,
  legendElementId: 'calendar-legend',
  leaveTypeSelectId: 'filter-leave-type',
});

function refresh() {
  refreshLeaveCalendar(calendar, API_URL, getExtraParams);
}

statusSelect.addEventListener('change', refresh);
leaveTypeSelect.addEventListener('change', refresh);
searchInput.addEventListener('input', debounceCalendar(refresh, 300));

/* ---------- Aylik izin cizelgesi PDF cikti ---------- */

const CALENDAR_PDF_STATUS_LABELS = { pending: 'Bekliyor', approved: 'Onaylandi' };

function countBusinessDays(startDateStr, endDateStr) {
  let count = 0;
  const cur = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${endDateStr}T00:00:00`);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count += 1;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

async function exportMonthlySchedulePDF() {
  const refDate = calendar.getDate();
  const year = refDate.getFullYear();
  const month = refDate.getMonth() + 1;
  const monthStr = String(month).padStart(2, '0');
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthStart = `${year}-${monthStr}-01`;
  const monthEnd = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;
  const monthLabel = refDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  try {
    const rawEvents = await fetchCalendarEvents(API_URL, monthStart, monthEnd, getExtraParams);
    const events = applyClientSideFilters(rawEvents)
      .slice()
      .sort((a, b) => (a.extendedProps.startDate < b.extendedProps.startDate ? -1 : 1));

    if (!events.length) {
      Swal.fire({
        title: 'Veri Yok',
        text: 'Secili ay icin izin kaydi bulunamadi.',
        icon: 'info',
        confirmButtonColor: '#3E2522',
      });
      return;
    }

    const headers = ['Personel', 'Izin Turu', 'Baslangic', 'Bitis', 'Is Gunu', 'Durum'];
    const rows = events.map((event) => {
      const props = event.extendedProps;
      return [
        props.employeeName,
        props.leaveTypeName,
        formatCalendarDateTR(props.startDate),
        formatCalendarDateTR(props.endDate),
        String(countBusinessDays(props.startDate, props.endDate)),
        CALENDAR_PDF_STATUS_LABELS[props.status] || props.status,
      ];
    });

    exportReportToPDF({
      filename: `aylik-izin-cizelgesi-${year}-${monthStr}.pdf`,
      title: 'Aylik Izin Cizelgesi',
      subtitle: `Ekip Takvimi - ${monthLabel} - Olusturulma: ${new Date().toLocaleString('tr-TR')}`,
      headers,
      rows,
    });
  } catch (err) {
    Swal.fire({
      title: 'Hata',
      text: 'PDF olusturulurken bir sorun olustu.',
      icon: 'error',
      confirmButtonColor: '#3E2522',
    });
  }
}

document.getElementById('btn-schedule-pdf').addEventListener('click', exportMonthlySchedulePDF);
