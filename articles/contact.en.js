'use strict';
var EMAIL = 'hello@mousebench.fyi';
module.exports = {
  title: 'Contact MousePress',
  desc: 'Contact MousePress: questions, bug reports, feature requests, or feedback about our mouse tests and guides. We reply to every message.',
  h1: 'Contact',
  kicker: 'Contact',
  intro: 'Something unclear, a test misbehaving, or a guide you wish existed? Write to us. We answer every serious message.',
  faqTitle: 'Frequently asked questions',
  relatedTitle: 'More',
  content: [
    { h2: 'Email us',
      p: 'The fastest way to reach the team is email. We keep replies short and usually answer within a few days.' },
    { h2: 'Write to',
      p: '<a class="mailto" href="mailto:' + EMAIL + '">' + EMAIL + '</a>' },
    { h2: 'What to include',
      p: 'The more context, the faster we can help. For bug reports please include your mouse model, computer operating system, browser name and version, and one or two sentences about what you expected versus what happened.',
      ul: ['Mouse model and connection type (wired / dongle / Bluetooth).', 'Operating system and browser version.', 'Steps to reproduce the issue, if it is a bug.'] },
    { h2: 'What happens next',
      p: 'We read every message and answer personally. If you report an issue with a tool, we test it, fix it if we can reproduce it, and let you know when the update is live.' },
  ],
  faqs: [
    { q: 'Do you reply to all messages?',
      a: 'Yes. Personalised replies go out for every serious message, usually within two or three days.' },
    { q: 'Can I request a new tool?',
      a: 'Absolutely. Tell us what you would like to test, and we will build it if it is technically possible in a browser.' },
    { q: 'Is support free?',
      a: 'Yes. Asking questions, reporting bugs and requesting features costs nothing.' },
  ],
  related: [
    { href: 'about.html', label: 'About' },
    { href: 'privacy-policy.html', label: 'Privacy Policy' },
    { href: 'terms-of-use.html', label: 'Terms of Use' },
  ],
};