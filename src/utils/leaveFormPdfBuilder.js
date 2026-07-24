const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { calculateDayCount } = require('./leaveDayCount');

const DEFAULT_FONT_REGULAR = path.join(__dirname, '../../node_modules/dejavu-fonts-ttf/ttf/DejaVuSans.ttf');
const DEFAULT_FONT_BOLD = path.join(__dirname, '../../node_modules/dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf');

const STATUS_LABELS = {
  pending: 'Bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  cancelled: 'İptal Edildi',
};

function formatDateTR(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = String(dateStr).split('-');
  return `${day}.${month}.${year}`;
}

function formatDateObjTR(date) {
  if (!date) return '';
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function addDaysToDateStr(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function registerFonts(doc) {
  const regularPath = process.env.PDF_FONT_REGULAR;
  const boldPath = process.env.PDF_FONT_BOLD;

  try {
    if (regularPath && fs.existsSync(regularPath)) {
      doc.registerFont('form-regular', regularPath);
    } else {
      doc.registerFont('form-regular', DEFAULT_FONT_REGULAR);
    }
    if (boldPath && fs.existsSync(boldPath)) {
      doc.registerFont('form-bold', boldPath);
    } else {
      doc.registerFont('form-bold', DEFAULT_FONT_BOLD);
    }
  } catch (err) {
    doc.registerFont('form-regular', DEFAULT_FONT_REGULAR);
    doc.registerFont('form-bold', DEFAULT_FONT_BOLD);
  }
}

function buildLeaveFormPdf(request) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  registerFonts(doc);

  const companyName = process.env.COMPANY_NAME || 'Sirket Adi';
  const companyAddress = process.env.COMPANY_ADDRESS || '';

  const margin = 50;
  const contentWidth = doc.page.width - margin * 2;
  let cursorY = margin;

  const headerHeight = 45;
  doc.rect(margin, cursorY, contentWidth, headerHeight).stroke();
  doc
    .font('form-bold')
    .fontSize(13)
    .fillColor('#000')
    .text(companyName, margin, cursorY + 10, { width: contentWidth, align: 'center' });
  if (companyAddress) {
    doc
      .font('form-regular')
      .fontSize(8)
      .fillColor('#555')
      .text(companyAddress, margin, cursorY + 28, { width: contentWidth, align: 'center' });
  }
  doc.fillColor('#000');
  cursorY += headerHeight + 25;

  doc
    .font('form-bold')
    .fontSize(16)
    .text('İZİN FORMU', margin, cursorY, { width: contentWidth, align: 'center' });
  cursorY += 35;

  const rows = [
    ['Adı Soyadı', request.employee_name],
    ['T.C. Kimlik No', ''],
    ['Çalışma Yeri ve Görevi', ''],
    ['Departman', request.department_name],
    ['Yönetici', request.manager_name || '-'],
    ['İzin Türü', request.leave_type_name],
  ];

  if (request.is_hourly) {
    rows.push(
      ['İzin Tarihi', formatDateTR(request.start_date)],
      ['Saat Aralığı', `${String(request.start_time).slice(0, 5)} - ${String(request.end_time).slice(0, 5)}`]
    );
  } else {
    const dayCount = calculateDayCount(request.start_date, request.end_date);
    rows.push(
      ['İzin Gün Sayısı', String(dayCount)],
      ['İzin Başlangıç Tarihi', formatDateTR(request.start_date)],
      ['İzin Bitiş Tarihi', formatDateTR(request.end_date)],
      ['Göreve Başlayacağı Tarih', addDaysToDateStr(request.end_date, 1)]
    );
  }

  rows.push(
    ['Açıklama / Talep Nedeni', request.reason || '-'],
    ['Talep Durumu', STATUS_LABELS[request.status] || request.status],
    ['Onaylayan Yönetici', request.approved_by_name || '-']
  );

  const labelWidth = 190;
  const valueWidth = contentWidth - labelWidth;

  rows.forEach(([label, value]) => {
    const rowHeight = label === 'Açıklama / Talep Nedeni' ? 40 : 24;

    doc.rect(margin, cursorY, labelWidth, rowHeight).stroke();
    doc.rect(margin + labelWidth, cursorY, valueWidth, rowHeight).stroke();

    doc
      .font('form-bold')
      .fontSize(9)
      .text(label, margin + 8, cursorY + 8, { width: labelWidth - 16 });
    doc
      .font('form-regular')
      .fontSize(9)
      .text(value, margin + labelWidth + 8, cursorY + 8, { width: valueWidth - 16 });

    cursorY += rowHeight;
  });

  cursorY += 25;

  const boxHeight = 110;
  doc.rect(margin, cursorY, contentWidth, boxHeight).stroke();
  doc
    .font('form-regular')
    .fontSize(9)
    .text('Yukarıda belirtilen bilgiler çerçevesinde izin talebimin işleme alınmasını rica ederim.', margin + 12, cursorY + 12, {
      width: contentWidth - 24,
    });
  doc.text(`Tarih: ${formatDateObjTR(request.created_at)}`, margin + 12, cursorY + 45);
  doc.text(`Ad Soyad: ${request.employee_name}`, margin + 12, cursorY + 68);
  doc.text('İmza:', margin + 12, cursorY + 91);

  return doc;
}

module.exports = { buildLeaveFormPdf };
