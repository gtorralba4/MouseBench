'use strict';
const fs = require('fs');
const path = require('path');

const root = __dirname;

function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
function write(p, c) { fs.writeFileSync(path.join(root, p), c, 'utf8'); }

function extract(html, from, to) {
  const i = html.indexOf(from);
  const j = html.indexOf(to, i);
  return html.slice(i, j + to.length);
}

const LANG = {
  en: { src: 'click-speed-test.html', css: 'css/style.css', js: 'js/common.js' },
  de: { src: 'de/click-speed-test.html', css: '../css/style.css', js: '../js/common.js' },
  es: { src: 'es/click-speed-test.html', css: '../css/style.css', js: '../js/common.js' },
};

const HREFLANG_PREFIX = { en: '', de: 'de/', es: 'es/' };

function fixLangLinks(header, lang, slug) {
  if (slug === 'click-speed-test') return header;
  // Only rewrite lang-drop links (those carrying a hreflang attribute).
  // Nav/footer links to the CPS tool keep their original href.
  const re = /(href="(?:\.\.\/)?(?:es\/|de\/)?)click-speed-test(\.html")( hreflang)/g;
  return header.replace(re, '$1' + slug + '$2$3');
}

function head(lang, opts) {
  const absUrl = 'https://mousebench.fyi/' + (lang === 'en' ? '' : lang + '/') + opts.slug;
  const hreflang = [
    { l: 'de', u: 'https://mousebench.fyi/de/' + opts.slug },
    { l: 'en', u: 'https://mousebench.fyi/' + opts.slug },
    { l: 'es', u: 'https://mousebench.fyi/es/' + opts.slug },
  ];
  const hlTags = hreflang.map((h) => '<link rel="alternate" hreflang="' + h.l + '" href="' + h.u + '">').join('\n');
  const locale = lang === 'de' ? 'de_DE' : lang === 'es' ? 'es_ES' : 'en_US';
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': opts.schemaType || 'Article',
        name: opts.h1,
        headline: opts.h1,
        description: opts.desc,
        url: absUrl,
        inLanguage: lang,
        datePublished: opts.datePublished,
        dateModified: opts.dateModified,
        author: { '@type': 'Organization', name: 'MousePress', url: 'https://mousebench.fyi/' },
        publisher: { '@type': 'Organization', name: 'MousePress', url: 'https://mousebench.fyi/' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang === 'de' ? 'Startseite' : lang === 'es' ? 'Inicio' : 'Home', item: 'https://mousebench.fyi/' + (lang === 'en' ? '' : lang) },
          { '@type': 'ListItem', position: 2, name: opts.h1, item: absUrl },
        ],
      },
    ],
  };

  return '<!DOCTYPE html>\n<html lang="' + lang + '">\n<head>\n'
    + '<script async src="https://fundingchoicesmessages.google.com/i/pub-2675015568638839?ers=1"></script>\n'
    + '<script>(function(){function signalGooglefcPresent(){if(!window.frames[\'googlefcPresent\']){if(document.body){const iframe=document.createElement(\'iframe\');iframe.style=\'width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;display:none;background-color:white;\';iframe.name=\'googlefcPresent\';document.body.appendChild(iframe);}else{setTimeout(signalGooglefcPresent,0);}}}signalGooglefcPresent();})();</script>\n'
    + '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2675015568638839"\n     crossorigin="anonymous"></script>\n'
    + '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<title>' + opts.title + '</title>\n'
    + '<meta name="description" content="' + opts.desc + '">\n'
    + '<meta property="og:site_name" content="MousePress">\n'
    + '<meta property="og:type" content="article">\n'
    + '<meta property="og:url" content="' + absUrl + '">\n'
    + '<meta property="og:title" content="' + opts.title + '">\n'
    + '<meta property="og:description" content="' + opts.desc + '">\n'
    + '<meta property="og:locale" content="' + locale + '">\n'
    + '<meta property="og:image" content="https://mousebench.fyi/og-image.png">\n'
    + '<meta name="twitter:card" content="summary_large_image">\n'
    + '<meta name="twitter:title" content="' + opts.title + '">\n'
    + '<meta name="twitter:description" content="' + opts.desc + '">\n'
    + '<meta name="twitter:image" content="https://mousebench.fyi/og-image.png">\n'
    + '<link rel="canonical" href="' + absUrl + '">\n'
    + hlTags + '\n'
    + '<link rel="alternate" hreflang="x-default" href="https://mousebench.fyi/' + opts.slug + '">\n'
    + '<link rel="stylesheet" href="' + LANG[lang].css + '">\n'
    + '<script>try{var t=localStorage.getItem(\'mbt\')||(window.matchMedia(\'(prefers-color-scheme:dark)\').matches?\'dark\':\'light\');document.documentElement.setAttribute(\'data-theme\',t)}catch(e){document.documentElement.setAttribute(\'data-theme\',\'light\')}</script>\n'
    + '<script type="application/ld+json">' + JSON.stringify(jsonld) + '</script>\n'
    + '  <link rel="icon" type="image/svg+xml" href="/favicon.svg">\n  <link rel="icon" href="/favicon.ico" sizes="32x32">\n'
    + '</head>\n';
}

function page(lang, data) {
  const slug = data.slug;
  const header = extract(read(LANG[lang].src), '<header', '</header>');
  const footer = extract(read(LANG[lang].src), '<footer', '</footer>');
  const headerFixed = fixLangLinks(header, lang, slug);

  const sections = data[lang].content.map((s) => {
    let html = '<h2>' + s.h2 + '</h2>\n';
    if (s.p) html += '<p>' + s.p + '</p>\n';
    if (s.ul) html += '<ul>' + s.ul.map((li) => '<li>' + li + '</li>').join('\n') + '</ul>';
    if (s.ol) html += '<ol>' + s.ol.map((li) => '<li>' + li + '</li>').join('\n') + '</ol>';
    return html;
  }).join('\n');

  const faqs = data[lang].faqs.map((f) =>
    '<details class="faq-item">\n    <summary>' + f.q + '</summary>\n    <p>' + f.a + '</p>\n    </details>'
  ).join('\n');

  const related = data[lang].related.map((r) => '            <a href="' + (lang === 'en' ? '' : '../') + r.href + '">' + r.label + '</a>').join('\n');

  const ad = '<ins class="adsbygoogle"\n         style="display:inline-block;width:Wpx;height:Hpx"\n         data-ad-client="ca-pub-2675015568638839"\n         data-ad-slot="6168873351"></ins>\n     <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>';
  const leader = ad.replace('W', '728').replace('H', '90');
  const rect = ad.replace('W', '300').replace('H', '250');
  const sidebar = ad.replace('W', '300').replace('H', '250');

  const body = head(lang, { slug: slug, title: data[lang].title, desc: data[lang].desc, h1: data[lang].h1, schemaType: data.schemaType, datePublished: data.datePublished, dateModified: data.dateModified })
    + '<body>\n' + headerFixed + '\n\n  <main class="site-main">\n\n<div class="page-zone">\n  <div class="container">\n    <div class="hero">\n      <span class="kicker">' + data[lang].kicker + '</span>\n      <h1>' + data[lang].h1 + '</h1>\n      <p>' + data[lang].intro + '</p>\n    </div>\n'
    + '\n    <div class="ad-slot leaderboard">\n      ' + leader + '\n    </div>\n\n    <div class="grid-main has-sidebar">\n      <div>\n        <div class="card prose">\n' + sections + '\n        </div>\n'
    + '        <div class="card prose">\n          <h2>' + data[lang].faqTitle + '</h2>\n          <div class="faq" style="margin-top:8px;">\n' + faqs + '\n          </div>\n        </div>\n'
    + '        <div class="ad-slot rectangle">\n          ' + rect + '\n        </div>\n      </div>\n      <aside class="aside-sticky">\n        <div class="ad-slot sidebar">\n          ' + sidebar + '\n        </div>\n        <div class="card">\n          <h3>' + data[lang].relatedTitle + '</h3>\n          <div class="related" style="flex-direction:column;">\n' + related + '\n          </div>\n        </div>\n      </aside>\n    </div>\n  </div>\n</div>\n\n</main>\n\n  ' + footer + '\n\n<script src="' + LANG[lang].js + 'common.js" defer></script>\n</body>\n</html>\n';
  return body;
}

function generate(data) {
  for (const lang of ['en', 'de', 'es']) {
    const file = (lang === 'en' ? '' : lang + '/') + data.slug + '.html';
    write(file, page(lang, data));
    console.log('Wrote ' + file);
  }
}

module.exports = { generate: generate, read: read };