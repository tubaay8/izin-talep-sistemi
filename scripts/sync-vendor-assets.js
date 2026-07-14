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
];

for (const { from, to } of copies) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log(`Kopyalandi: ${path.basename(to)}`);
}
