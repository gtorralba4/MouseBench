'use strict';
const lib = require('./gen-lib');
const topics = require('./topics');

console.log('Generating article pages...');
for (const t of topics) lib.generate(t);
console.log('Done.');