'use strict';
var EMAIL = 'hello@mousebench.fyi';
module.exports = {
  title: 'Contacto con MousePress',
  desc: 'Contacto con MousePress: preguntas, informes de errores, sugerencias de funciones o comentarios sobre nuestros tests y gu\u00edas de rat\u00f3n. Respondemos a todos los mensajes.',
  h1: 'Contacto',
  kicker: 'Contacto',
  intro: '\u00bfAlgo no est\u00e1 claro, una prueba falla o te falta una gu\u00eda? Escr\u00edbenos. Respondemos a todos los mensajes serios.',
  faqTitle: 'Preguntas frecuentes',
  relatedTitle: 'M\u00e1s',
  content: [
    { h2: 'Escr\u00edbenos',
      p: 'La v\u00eda m\u00e1s r\u00e1pida para contactar con el equipo es el correo. Respondemos con brevedad y normalmente en pocos d\u00edas.' },
    { h2: 'A esta direcci\u00f3n',
      p: '<a class="mailto" href="mailto:' + EMAIL + '">' + EMAIL + '</a>' },
    { h2: 'Qu\u00e9 incluir',
      p: 'Cuanto m\u00e1s contexto, antes podemos ayudarte. Para informes de error incluye el modelo de tu rat\u00f3n, el sistema operativo, el navegador y su versi\u00f3n, y una o dos frases sobre lo que esperabas frente a lo que ocurri\u00f3.',
      ul: ['Modelo de rat\u00f3n y tipo de conexi\u00f3n (cable / dongle / Bluetooth).', 'Sistema operativo y versi\u00f3n del navegador.', 'Pasos para reproducir el problema, si se trata de un error.'] },
    { h2: 'Qu\u00e9 ocurre despu\u00e9s',
      p: 'Leemos cada mensaje y respondemos personalmente. Si informas de un fallo en una herramienta, la probamos, la corregimos si podemos reproducirla y te avisamos cuando la actualizaci\u00f3n est\u00e9 publicada.' },
  ],
  faqs: [
    { q: '\u00bfRespond\u00e9is a todos los mensajes?',
      a: 'S\u00ed. Todo mensaje serio recibe una respuesta personalizada, normalmente en dos o tres d\u00edas.' },
    { q: '\u00bfPuedo pedir una herramienta nueva?',
      a: 'Por supuesto. Dinos qu\u00e9 te gustar\u00eda probar y la crearemos si es t\u00e9cnicamente posible en un navegador.' },
    { q: '\u00bfEl soporte es gratis?',
      a: 'S\u00ed. Hacer preguntas, informar de errores y proponer funciones no cuesta nada.' },
  ],
  related: [
    { href: 'about', label: 'Sobre nosotros' },
    { href: 'privacy-policy', label: 'Pol\u00edtica de privacidad' },
    { href: 'terms-of-use', label: 'T\u00e9rminos de uso' },
  ],
};