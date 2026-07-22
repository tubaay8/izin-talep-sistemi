const fs = require('fs');
const path = require('path');

const copies = [
  {
    from: path.join(__dirname, '..', 'node_modules', 'sweetalert2', 'dist', 'sweetalert2.all.min.js'),
    to: path.join(__dirname, '..', 'public', 'vendor', 'sweetalert2.all.min.js'),
  },
  {
    from: path.join(__dirname, '..', 'node_modules', 'jspdf', 'dist', 'jspdf.umd.min.js'),
    to: path.join(__dirname, '..', 'public', 'vendor', 'jspdf.umd.min.js'),
  },
  {
    from: path.join(__dirname, '..', 'node_modules', 'jspdf-autotable', 'dist', 'jspdf.plugin.autotable.min.js'),
    to: path.join(__dirname, '..', 'public', 'vendor', 'jspdf.plugin.autotable.min.js'),
  },
  {
    from: path.join(__dirname, '..', 'node_modules', '@fullcalendar', 'core', 'index.global.min.js'),
    to: path.join(__dirname, '..', 'public', 'vendor', 'fullcalendar-core.min.js'),
  },
  {
    from: path.join(__dirname, '..', 'node_modules', '@fullcalendar', 'core', 'locales', 'tr.global.min.js'),
    to: path.join(__dirname, '..', 'public', 'vendor', 'fullcalendar-locale-tr.min.js'),
  },
  {
    from: path.join(__dirname, '..', 'node_modules', '@fullcalendar', 'daygrid', 'index.global.min.js'),
    to: path.join(__dirname, '..', 'public', 'vendor', 'fullcalendar-daygrid.min.js'),
  },
  {
    from: path.join(__dirname, '..', 'node_modules', '@fullcalendar', 'timegrid', 'index.global.min.js'),
    to: path.join(__dirname, '..', 'public', 'vendor', 'fullcalendar-timegrid.min.js'),
  },
  {
    from: path.join(__dirname, '..', 'node_modules', 'chart.js', 'dist', 'chart.umd.js'),
    to: path.join(__dirname, '..', 'public', 'vendor', 'chart.umd.js'),
  },
];

for (const { from, to } of copies) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log(`Kopyalandi: ${path.basename(to)}`);
}

// jsPDF varsayilan fontu (Helvetica) Turkce karakterleri (ş, ğ, ı, İ, ö, ü, ç)
// dogru basmiyor; Unicode destekli DejaVu Sans'i jsPDF'in VFS'ine gomup
// tarayicida kullanilabilir hale getiriyoruz.
function buildJsPdfFontModule(ttfPath, vfsName, fontName, style) {
  const base64 = fs.readFileSync(ttfPath).toString('base64');
  return `(function (jsPDFAPI) {
  var font = '${base64}';
  jsPDFAPI.addFileToVFS('${vfsName}', font);
  jsPDFAPI.addFont('${vfsName}', '${fontName}', '${style}');
})(jspdf.jsPDF.API);
`;
}

const fontModules = [
  {
    ttf: path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf', 'DejaVuSans.ttf'),
    vfsName: 'DejaVuSans-normal.ttf',
    fontName: 'DejaVuSans',
    style: 'normal',
    to: path.join(__dirname, '..', 'public', 'vendor', 'dejavu-sans-normal.js'),
  },
  {
    ttf: path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf', 'DejaVuSans-Bold.ttf'),
    vfsName: 'DejaVuSans-bold.ttf',
    fontName: 'DejaVuSans',
    style: 'bold',
    to: path.join(__dirname, '..', 'public', 'vendor', 'dejavu-sans-bold.js'),
  },
];

for (const { ttf, vfsName, fontName, style, to } of fontModules) {
  fs.writeFileSync(to, buildJsPdfFontModule(ttf, vfsName, fontName, style));
  console.log(`Olusturuldu: ${path.basename(to)}`);
}
