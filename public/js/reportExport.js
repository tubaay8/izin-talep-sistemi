function csvEscapeValue(value) {
  const str = String(value ?? '');
  // Excel, gg.aa.yyyy bicimindeki metinleri tarih sanip sayiya cevirir; dar
  // sutunlarda bu da "####" olarak gozukur. Formul gibi yazip metin kalmasini saglıyoruz.
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(str)) {
    return `="${str}"`;
  }
  if (/["\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadBlob(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportReportToCSV({ filename, headers, rows }) {
  const lines = [headers.map(csvEscapeValue).join(';')];
  rows.forEach((row) => {
    lines.push(row.map(csvEscapeValue).join(';'));
  });
  const csvContent = '﻿' + lines.join('\r\n');
  downloadBlob(filename, csvContent, 'text/csv;charset=utf-8;');
}

function exportReportToPDF({ filename, title, subtitle, headers, rows }) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  // Varsayilan Helvetica Turkce karakterleri (ş, ğ, ı, İ, ö, ü, ç) dogru
  // basamiyor; Unicode destekli DejaVu Sans'i kullaniyoruz.
  doc.setFont('DejaVuSans', 'normal');

  doc.setFontSize(14);
  doc.text(title, 14, 15);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(subtitle, 14, 21);
  }

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: subtitle ? 26 : 20,
    styles: { fontSize: 8, cellPadding: 2, font: 'DejaVuSans', fontStyle: 'normal' },
    headStyles: { fillColor: [44, 62, 80], font: 'DejaVuSans', fontStyle: 'bold' },
  });

  doc.save(filename);
}

function printReport() {
  window.print();
}
