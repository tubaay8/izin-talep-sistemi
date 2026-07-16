const dateFromInput = document.getElementById('stats-date-from');
const dateToInput = document.getElementById('stats-date-to');
const statsCardsEl = document.getElementById('stats-cards');
const topLeaveTypesBody = document.getElementById('top-leave-types-body');
const topEmployeesBody = document.getElementById('top-employees-body');
const topEmployeesPagination = document.getElementById('top-employees-pagination');
const donutLegendEl = document.getElementById('stats-donut-legend');
const donutTotalValueEl = document.getElementById('stats-donut-total-value');
const downloadBtn = document.getElementById('stats-download-btn');

const EMPLOYEE_PAGE_SIZE = 5;
let currentTopEmployees = [];
let currentEmployeePage = 1;

let employeeUsageChart = null;
let leaveTypeChart = null;
let dailyIntensityChart = null;

function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function chartTheme() {
  return isDarkTheme()
    ? { grid: 'rgba(255,255,255,0.08)', text: '#D9C6B5', accent: '#D3A376', tooltipBg: '#443426', tooltipText: '#F6EFE8' }
    : { grid: 'rgba(140,110,99,0.15)', text: '#8C6E63', accent: '#8C6E63', tooltipBg: '#3E2522', tooltipText: '#FFFFFF' };
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTR(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('tr-TR');
}

function defaultDateRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: formatDateInput(from), to: formatDateInput(to) };
}

function statCardHtml({ icon, tone, value, label, sub }) {
  return `
    <div class="stat-card ${tone}">
      <div class="stat-icon">${icon}</div>
      <div class="stat-body">
        <span class="stat-value">${value}</span>
        <span class="stat-label">${label}</span>
        ${sub ? `<span class="stat-sub">${sub}</span>` : ''}
      </div>
    </div>
  `;
}

const ICON_LIST = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>';
const ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>';

function percentageOf(value, total) {
  if (!total) return '%0';
  return `%${Math.round((value / total) * 1000) / 10}`;
}

function renderStatCards(overview) {
  statsCardsEl.innerHTML = [
    statCardHtml({ icon: ICON_LIST, tone: 'tone-info', value: overview.total, label: 'Toplam İzin Talebi', sub: 'Bu dönem' }),
    statCardHtml({ icon: ICON_CHECK, tone: 'tone-approved', value: overview.approved, label: 'Onaylanan İzin', sub: percentageOf(overview.approved, overview.total) }),
    statCardHtml({ icon: ICON_CLOCK, tone: 'tone-pending', value: overview.pending, label: 'Bekleyen Talep', sub: percentageOf(overview.pending, overview.total) }),
    statCardHtml({ icon: ICON_X, tone: 'tone-rejected', value: overview.rejected, label: 'Reddedilen İzin', sub: percentageOf(overview.rejected, overview.total) }),
  ].join('');
}

function renderEmployeeUsageChart(employeeUsage) {
  const theme = chartTheme();
  const ctx = document.getElementById('chart-employee-usage').getContext('2d');
  if (employeeUsageChart) employeeUsageChart.destroy();

  employeeUsageChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: employeeUsage.map((e) => e.employeeName),
      datasets: [
        {
          data: employeeUsage.map((e) => e.totalDays),
          backgroundColor: theme.accent,
          borderRadius: 4,
          maxBarThickness: 42,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          padding: 10,
          cornerRadius: 8,
          callbacks: { label: (item) => `${item.parsed.y} gün` },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: theme.text, font: { size: 11 } } },
        y: { beginAtZero: true, grid: { color: theme.grid }, ticks: { color: theme.text, precision: 0 } },
      },
    },
  });
}

function renderLeaveTypeChart(distribution) {
  const theme = chartTheme();
  const ctx = document.getElementById('chart-leave-type').getContext('2d');
  if (leaveTypeChart) leaveTypeChart.destroy();

  const total = distribution.reduce((sum, t) => sum + t.count, 0);
  donutTotalValueEl.textContent = total;

  leaveTypeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: distribution.map((t) => t.name),
      datasets: [
        {
          data: distribution.map((t) => t.count),
          backgroundColor: distribution.map((t) => getLeaveTypeColor(t.name)),
          borderColor: isDarkTheme() ? '#362A21' : '#FFFCF8',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          padding: 10,
          cornerRadius: 8,
          callbacks: { label: (item) => `${item.label}: ${item.parsed} (%${distribution[item.dataIndex].percentage})` },
        },
      },
    },
  });

  donutLegendEl.innerHTML = distribution
    .map(
      (t) => `
        <li class="stats-donut-legend-item">
          <span class="stats-donut-legend-dot" style="background:${getLeaveTypeColor(t.name)}"></span>
          <span class="stats-donut-legend-name">${t.name}</span>
          <span class="stats-donut-legend-value">${t.count} (%${t.percentage})</span>
        </li>
      `
    )
    .join('');
}

function renderDailyIntensityChart(dailyIntensity) {
  const theme = chartTheme();
  const ctx = document.getElementById('chart-daily-intensity').getContext('2d');
  if (dailyIntensityChart) dailyIntensityChart.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, isDarkTheme() ? 'rgba(211,163,118,0.35)' : 'rgba(140,110,99,0.3)');
  gradient.addColorStop(1, 'rgba(140,110,99,0)');

  dailyIntensityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dailyIntensity.map((d) => formatDateTR(d.date).slice(0, 5)),
      datasets: [
        {
          data: dailyIntensity.map((d) => d.count),
          borderColor: theme.accent,
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: theme.accent,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor: theme.tooltipText,
          padding: 10,
          cornerRadius: 8,
          callbacks: { label: (item) => `${item.parsed.y} kişi izinli` },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: theme.text, maxTicksLimit: 10, font: { size: 11 } } },
        y: { beginAtZero: true, grid: { color: theme.grid }, ticks: { color: theme.text, precision: 0 } },
      },
    },
  });
}

function renderTopLeaveTypes(topLeaveTypes) {
  if (!topLeaveTypes.length) {
    topLeaveTypesBody.innerHTML = '<tr><td colspan="4" class="form-message">Kayit bulunamadi.</td></tr>';
    return;
  }
  topLeaveTypesBody.innerHTML = topLeaveTypes
    .map(
      (t, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${t.name}</td>
          <td>${t.peopleCount}</td>
          <td>${t.totalDays}</td>
        </tr>
      `
    )
    .join('');
}

function renderTopEmployeesPage() {
  const start = (currentEmployeePage - 1) * EMPLOYEE_PAGE_SIZE;
  const pageItems = currentTopEmployees.slice(start, start + EMPLOYEE_PAGE_SIZE);

  if (!pageItems.length) {
    topEmployeesBody.innerHTML = '<tr><td colspan="5" class="form-message">Bu donemde izin kaydi bulunamadi.</td></tr>';
  } else {
    topEmployeesBody.innerHTML = pageItems
      .map(
        (e) => `
          <tr>
            <td>${e.employeeName}</td>
            <td>${e.departmentName}</td>
            <td>${e.totalDays}</td>
            <td>${e.leaveTypes}</td>
            <td>${e.requestCount}</td>
          </tr>
        `
      )
      .join('');
  }

  const totalPages = Math.max(1, Math.ceil(currentTopEmployees.length / EMPLOYEE_PAGE_SIZE));
  renderPagination(topEmployeesPagination, {
    page: currentEmployeePage,
    totalPages,
    onChange: (page) => {
      currentEmployeePage = page;
      renderTopEmployeesPage();
    },
  });
}

function renderTopEmployees(topEmployees) {
  currentTopEmployees = topEmployees;
  currentEmployeePage = 1;
  renderTopEmployeesPage();
}

async function loadStatistics() {
  const params = new URLSearchParams({ date_from: dateFromInput.value, date_to: dateToInput.value });
  const res = await fetch(`/api/manager/statistics?${params}`);
  if (!res.ok) return;
  const data = await res.json();

  renderStatCards(data.overview);
  renderEmployeeUsageChart(data.employeeUsage);
  renderLeaveTypeChart(data.leaveTypeDistribution);
  renderDailyIntensityChart(data.dailyIntensity);
  renderTopLeaveTypes(data.topLeaveTypes);
  renderTopEmployees(data.topEmployees);
}

dateFromInput.addEventListener('change', loadStatistics);
dateToInput.addEventListener('change', loadStatistics);

downloadBtn.addEventListener('click', () => {
  const headers = ['Personel', 'Departman', 'Toplam Izin Gunu', 'Kullanilan Izin Turu', 'Talep Sayisi'];
  const rows = currentTopEmployees.map((e) => [e.employeeName, e.departmentName, e.totalDays, e.leaveTypes, e.requestCount]);

  exportReportToPDF({
    filename: `ekip-istatistikleri-${dateFromInput.value}-${dateToInput.value}.pdf`,
    title: 'Ekip Istatistikleri Raporu',
    subtitle: `${formatDateTR(dateFromInput.value)} - ${formatDateTR(dateToInput.value)} - Olusturulma: ${new Date().toLocaleString('tr-TR')}`,
    headers,
    rows,
  });
});

const themeToggleBtn = document.getElementById('theme-toggle-btn');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    setTimeout(loadStatistics, 0);
  });
}

const { from, to } = defaultDateRange();
dateFromInput.value = from;
dateToInput.value = to;
loadStatistics();
