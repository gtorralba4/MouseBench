'use strict';
var EMAIL = 'hello@mousebench.fyi';
module.exports = {
  title: 'Kontakt zu MousePress',
  desc: 'Kontakt zu MousePress: Fragen, Fehlerberichte, Funktionsw\u00fcnsche oder Feedback zu unseren Maus-Tests und Guides. Wir antworten auf jede Nachricht.',
  h1: 'Kontakt',
  kicker: 'Kontakt',
  intro: 'Etwas unklar, ein Test verh\u00e4lt sich seltsam oder ein Guide fehlt? Schreiben Sie uns. Wir beantworten jede ernsthafte Nachricht.',
  faqTitle: 'H\u00e4ufige Fragen',
  relatedTitle: 'Mehr',
  content: [
    { h2: 'Schreiben Sie uns',
      p: 'Der schnellste Weg zum Team ist E-Mail. Wir halten Antworten kurz und melden uns meist innerhalb weniger Tage.' },
    { h2: 'An diese Adresse',
      p: '<a class="mailto" href="mailto:' + EMAIL + '">' + EMAIL + '</a>' },
    { h2: 'Was Sie beif\u00fcgen sollten',
      p: 'Je mehr Kontext, desto schneller k\u00f6nnen wir helfen. F\u00fcr Fehlerberichte nennen Sie bitte Ihr Mausmodell, das Betriebssystem, Browser und Version sowie einen oder zwei S\u00e4tze zu dem, was Sie erwartet haben statt dessen, was passierte.',
      ul: ['Mausmodell und Verbindung (kabelgebunden / Dongle / Bluetooth).', 'Betriebssystem und Browserversion.', 'Schritte zum Reproduzieren des Problems, falls es ein Fehler ist.'] },
    { h2: 'Und dann?',
      p: 'Wir lesen jede Nachricht und antworten pers\u00f6nlich. Melden Sie ein Problem mit einem Tool, testen wir es, beheben es, wenn wir es reproduzieren k\u00f6nnen, und informieren Sie, sobald das Update live ist.' },
  ],
  faqs: [
    { q: 'Antworten Sie auf alle Nachrichten?',
      a: 'Ja. Auf jede ernsthafte Nachricht folgt eine pers\u00f6nliche Antwort, in der Regel innerhalb von zwei bis drei Tagen.' },
    { q: 'Kann ich ein neues Tool vorschlagen?',
      a: 'Gerne. Sagen Sie uns, was Sie testen m\u00f6chten \u2013 wir bauen es, wenn es im Browser technisch m\u00f6glich ist.' },
    { q: 'Kostet der Support etwas?',
      a: 'Nein. Fragen stellen, Fehler melden und W\u00fcnsche \u00e4u\u00dfern ist kostenlos.' },
  ],
  related: [
    { href: 'about.html', label: '\u00dcber uns' },
    { href: 'privacy-policy.html', label: 'Datenschutzerkl\u00e4rung' },
    { href: 'terms-of-use.html', label: 'Nutzungsbedingungen' },
  ],
};