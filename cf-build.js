'use strict';
const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = path.join(root, 'public');
const skip = new Set(['node_modules', 'public', 'articles', 'cf-build.js', 'gen-lib.js', 'gen-articles.js', 'topics.js', 'update-footers.js', 'package.json', 'package-lock.json', 'wrangler.jsonc']);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

let copied = 0;
for (const name of fs.readdirSync(root)) {
  if (skip.has(name) || name.startsWith('.') || name.endsWith('.ps1')) continue;
  fs.cpSync(path.join(root, name), path.join(out, name), { recursive: true });
  copied++;
}
console.log('Built static site into public/ (' + copied + ' top-level entries copied).');