'use strict';
const fs = require('fs');

const dirs = [
  { dir: '.', contact: 'Contact' },
  { dir: 'de', contact: 'Kontakt' },
  { dir: 'es', contact: 'Contacto' },
];

const re = /(href="index\.html#about">)([^<]+)(<\/a><\/li>)/g;

let changed = 0;
for (const g of dirs) {
  for (const f of fs.readdirSync(g.dir)) {
    if (!f.endsWith('.html')) continue;
    const file = g.dir === '.' ? f : g.dir + '/' + f;
    let h = fs.readFileSync(file, 'utf8');
    const before = h;
    h = h.replace(re, 'href="about.html">$2</a></li>\n          <li><a href="contact.html">' + g.contact + '</a></li>');
    if (h !== before) {
      fs.writeFileSync(file, h, 'utf8');
      changed++;
      console.log('Updated ' + file);
    }
  }
}
console.log('Total files updated: ' + changed);