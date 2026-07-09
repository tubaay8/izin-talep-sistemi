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
];

for (const { from, to } of copies) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log(`Kopyalandi: ${path.basename(to)}`);
}
