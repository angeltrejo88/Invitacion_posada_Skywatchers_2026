/* ===== Posada Skywatchers 2026 · Fase 1 ===== */

// ===== CONFIG (EDITAR) =====
const CONFIG = {
  evento: {
    fecha: '2026-12-12T18:00:00',                 // EDITAR: fecha y hora de inicio
    fechaTexto: 'Sábado 12 de diciembre de 2026',
    horaTexto: 'A partir de las 6:00 PM',
    lugar: 'C. Sta. María del Oro 114, Hipódromo, 34270 Durango, Dgo.'  ,
    fechaCorta: '12 de diciembre de 2026 · 6:00 PM',
mapsUrl: 'https://maps.app.goo.gl/i6TdAYd61cC1XegdA'                                     // EDITAR: link de Maps (vacío = no se muestra el botón)                      // EDITAR (se usa en la fase 2)
  },
  audio: 'audio/musica.mp3',                          // EDITAR: audio ambiental (déjalo '' para no usar sonido)
  volumen: 0.35,
  invitadoPorDefecto: 'Invitado',
  

// al mismo nivel que evento:
supabase: { url: 'https://hlbmvwqomiqstvvwvyut.supabase.co', key: 'sb_publishable_z-Hjek32XKpXOK72jf6xcQ__ylQpZH4', tabla: 'posada2026_frases' },   // EDITAR: URL y anon key
frasesIniciales: [],                             // EDITAR: [{ t: 'frase', n: 'Nombre' }]

form: { url: '', nombre: 'entry.0', tipo: 'entry.0', pases: 'entry.0', asiste: 'entry.0', cantidad: 'entry.0',
        si: 'Sí, asistiré', no: 'No podré asistir' },   // EDITAR: URL …/formResponse y entry IDs

};

const $ = id => document.getElementById(id);

// ===== Invitado: ?d=base64("nombre|pases|invitadoPor") =====
function leerInvitado() {
  const inv = { nombre: CONFIG.invitadoPorDefecto, pases: 1, por: '', especial: false };
  const d = new URLSearchParams(location.search).get('d');
  if (!d) return inv;
  try {
    const b64 = d.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const [n, p, por] = new TextDecoder().decode(bytes).split('|');
    if (n && n.trim()) inv.nombre = n.trim();
    const np = parseInt(p, 10);
    if (np > 0) inv.pases = np;
    inv.por = (por || '').trim();
    inv.especial = inv.por !== '';
  } catch (e) { /* link inválido: se usan los valores por defecto */ }
  return inv;
}

const INVITADO = leerInvitado();
window.INVITADO = INVITADO; // lo usarán las siguientes fases


$('guestName').textContent = INVITADO.nombre;
$('guestMeta').textContent = INVITADO.especial ? 'Invitado especial de ' + INVITADO.por : '';


// ===== Cielo: estrellas que titilan y nieve ligera =====
(function cielo() {
  const cv = $('sky'), cx = cv.getContext('2d'), phone = $('phone');
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const estrellas = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), r: rnd(.3, 1.3), f: rnd(.5, 1.5), t: rnd(0, 6.28) }));
  const copos = Array.from({ length: 45 }, () => ({ x: Math.random(), y: Math.random(), r: rnd(.8, 2.2), vy: rnd(.25, .8), vx: rnd(-.15, .15) }));

  function ajustar() {
    const r = phone.getBoundingClientRect();
    W = cv.width = r.width; H = cv.height = r.height;
  }
  function dibujar(ms) {
    cx.clearRect(0, 0, W, H);
    for (const s of estrellas) {
      const a = .35 + .65 * Math.abs(Math.sin(ms / 1000 * s.f + s.t));
      cx.fillStyle = 'rgba(236,240,241,' + a + ')';
      cx.beginPath(); cx.arc(s.x * W, s.y * H, s.r, 0, 6.28); cx.fill();
    }
    cx.fillStyle = 'rgba(255,255,255,.8)';
    for (const c of copos) {
      if (!reducir) {
        c.y += c.vy / H * 1.2; c.x += c.vx / W;
        if (c.y > 1) { c.y = 0; c.x = Math.random(); }
        if (c.x < 0 || c.x > 1) c.x = (c.x + 1) % 1;
      }
      cx.beginPath(); cx.arc(c.x * W, c.y * H, c.r, 0, 6.28); cx.fill();
    }
    if (!reducir) requestAnimationFrame(dibujar);
  }
  addEventListener('resize', ajustar);
  ajustar();
  requestAnimationFrame(dibujar);
})();

// ===== Sonido ambiental =====
const audio = $('ambient'), btnSonido = $('soundBtn');

function iniciarAudio() {
  if (!CONFIG.audio) return;
  audio.src = CONFIG.audio;
  audio.volume = CONFIG.volumen;
 audio.play().then(() => {
  setTimeout(() => {
    btnSonido.hidden = false;
    btnSonido.classList.remove('muted');
    mostrarSonido();
  }, 1200);
}).catch(() => {});
}
audio.addEventListener('error', () => { btnSonido.hidden = true; });
btnSonido.addEventListener('click', () => {
  if (audio.paused) { audio.play(); btnSonido.classList.remove('muted'); }
  else { audio.pause(); btnSonido.classList.add('muted'); }

});

// El botón se oculta solo y reaparece al tocar o deslizar
let tOculto;
const mostrarSonido = () => {
  btnSonido.classList.remove('oculto');
  clearTimeout(tOculto);
  tOculto = setTimeout(() => btnSonido.classList.add('oculto'), 3000);
};
['pointerdown', 'touchstart', 'scroll'].forEach(ev =>
  $('phone').addEventListener(ev, mostrarSonido, { capture: true, passive: true }));

let reanudar = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (!audio.paused) { audio.pause(); reanudar = true; } }
  else if (reanudar) { audio.play().catch(() => {}); reanudar = false; }
});

// ===== Entrada: al tocar "Ingresar" la nave se retira y aparece la invitación =====
$('enterBtn').addEventListener('click', () => {
  iniciarAudio();
  const entrada = $('entry'), app = $('app');
  entrada.classList.add('leaving');
  setTimeout(() => {
    app.hidden = false;
    requestAnimationFrame(() => app.classList.add('show'));
  }, 900);
  setTimeout(() => entrada.remove(), 2300);
});

/* ===== FASE 2 ===== */
// Bienvenida y detalles
$('welTitle').textContent = INVITADO.especial ? 'Bienvenido, ' + INVITADO.nombre : INVITADO.nombre + ', te esperamos';
$('welP1').textContent = INVITADO.especial
  ? 'Nos dio gusto que ' + INVITADO.por + ' te recomendara. Serás muy bienvenido a nuestra posada.'
  : 'El año está por terminar y queremos cerrarlo juntos, bajo el mismo cielo que nos ha reunido.';
const fe = new Date(CONFIG.evento.fecha);
$('dMes').textContent = fe.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
$('dDia').textContent = fe.getDate();
$('dSem').textContent = fe.toLocaleDateString('es-MX', { weekday: 'long' });
$('dHora').textContent = CONFIG.evento.horaTexto;
$('dLugar').textContent = CONFIG.evento.lugar;
$('cFecha').textContent = CONFIG.evento.fechaCorta;
if (CONFIG.evento.mapsUrl) { const m = $('dMaps'); m.href = CONFIG.evento.mapsUrl; m.hidden = false; }

// Supabase (REST)
const SB = CONFIG.supabase, sbOk = !!(SB && SB.url && SB.key);
const REST = sbOk ? SB.url + '/rest/v1/' + SB.tabla : '';
const LINK_ID = new URLSearchParams(location.search).get('d') || '';
const cab = () => ({ apikey: SB.key, 'Content-Type': 'application/json' });
const yaRespondio = () => { try { return localStorage.getItem('posada26_frase') === '1'; } catch (e) { return false; } };

// Pregunta del grupo: solo invitados del grupo que aún no respondieron
const ask = $('ask'), entryEl = $('entry');
const preguntar = sbOk && !INVITADO.especial && !yaRespondio();
if (preguntar) {
  entryEl.classList.add('hold');
  const cerrar = () => { ask.classList.add('out'); entryEl.classList.remove('hold'); setTimeout(() => ask.remove(), 700); };
  let anonimo = false;
  const quien = a => { anonimo = a; $('whoName').setAttribute('aria-pressed', String(!a)); $('whoAnon').setAttribute('aria-pressed', String(a)); };
  $('whoName').onclick = () => quien(false);
  $('whoAnon').onclick = () => quien(true);
  $('askText').oninput = e => { $('askN').textContent = e.target.value.length; };
  $('askSkip').onclick = cerrar;
  $('askSend').onclick = async () => {
    const frase = $('askText').value.trim();
    if (!frase) return;
    const b = $('askSend'); b.disabled = true;
    try {
      const r = await fetch(REST, { method: 'POST', headers: { ...cab(), Prefer: 'return=minimal' },
        body: JSON.stringify({ nombre: INVITADO.nombre, anonimo, frase: frase.slice(0, 100), link_id: LINK_ID || 'sin-link-' + Date.now() }) });
      if (!r.ok && r.status !== 409) throw new Error(r.status + ' ' + (await r.text()));
      try { localStorage.setItem('posada26_frase', '1'); } catch (e) {}
      $('askMsg').textContent = 'Gracias por compartirlo. Tu frase ya viaja entre las estrellas del grupo.';
      setTimeout(cerrar, 1800);
    } catch (e) {
   console.error(e); $('askMsg').textContent = 'No se pudo enviar (' + e.message.slice(0, 140) + ')';
    }
  };
} else { ask.remove(); }



// Frases del grupo: tarjetas en carrusel
(async function frases() {
  const lista = [];
  if (sbOk) {
    try {
      const r = await fetch(REST + '?select=nombre,frase,anonimo&oculta=eq.false&order=created_at.desc&limit=60', { headers: cab() });
      if (r.ok) (await r.json()).forEach(x => lista.push({ t: x.frase, n: x.anonimo ? '' : x.nombre }));
      else console.error('Frases:', r.status, await r.text());
    } catch (e) {}
  }
  CONFIG.frasesIniciales.forEach(x => lista.push(x));

  if (!lista.length) return;
  const box = $('tarjetas');
  box.innerHTML = '';

  lista.forEach((x, k) => {
    const c = document.createElement('blockquote');
    c.className = 'tarjeta';
    c.dataset.c = k % 3;
    const p = document.createElement('p');
    p.textContent = x.t;
    const a = document.createElement('cite');
    a.textContent = x.n ? '— ' + x.n : '';
    c.append(p, a);
    box.appendChild(c);
  });

  $('voces').hidden = false;
  $('vocesN').textContent = lista.length === 1 ? '1 voz del grupo' : lista.length + ' voces del grupo';

  const n = lista.length;
  if (n < 2) return;

  // Clones para loop infinito: [última] + [1..n] + [primera]
  box.prepend(box.children[n - 1].cloneNode(true));
  box.append(box.children[1].cloneNode(true));

  const pos = i => {
    const el = box.children[i];
    return el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2;
  };

  const paso = () => {
    const d1 = pos(1) - pos(0);
    const d2 = pos(2) - pos(1);
    return d1 > 0 ? d1 : d2;
  };

  const actual = () => {
    const p = paso();
    if (!p) return 1;
    return Math.round((box.scrollLeft - pos(0)) / p);
  };

  const ir = (i, suave = false) => {
    if (!box.clientWidth) return;
    box.scrollTo({ left: pos(i), behavior: suave ? 'smooth' : 'auto' });
  };

  let iniciado = false;
  const posicionarInicial = () => {
    if (!box.clientWidth || box.offsetParent === null) return false;
    ir(1, false);
    iniciado = true;
    return true;
  };

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      posicionarInicial();
    });
  });

  const ro = new ResizeObserver(() => {
    if (!iniciado) {
      if (posicionarInicial()) ro.disconnect();
    } else {
      const idx = Math.min(Math.max(actual(), 1), n);
      ir(idx, false);
    }
  });
  ro.observe(box);

  let auto = true, timerScroll, timerAuto;
  const pararAuto = () => {
    auto = false;
    clearInterval(timerAuto);
  };

  box.addEventListener('pointerdown', pararAuto, { passive: true });
  box.addEventListener('touchstart', pararAuto, { passive: true });
  box.addEventListener('wheel', pararAuto, { passive: true });

  box.addEventListener('scroll', () => {
    if (!iniciado) return;
    clearTimeout(timerScroll);
    timerScroll = setTimeout(() => {
      const k = actual();
      if (k <= 0) ir(n, false);
      else if (k >= n + 1) ir(1, false);
    }, 110);
  }, { passive: true });

  timerAuto = setInterval(() => {
    if (!auto) return;
    if (!iniciado && !posicionarInicial()) return;
    const sig = actual() + 1;
    ir(sig > n + 1 ? 1 : sig, true);
  }, 4500);
})();

// Contador
(function contador() {
  const meta = new Date(CONFIG.evento.fecha).getTime();
  const els = ['d', 'h', 'm', 's'].map(k => $('c-' + k));
  let t;
  function tick() {
    const diff = meta - Date.now();
    if (diff <= 0) { clearInterval(t); const c = $('countBox'); c.textContent = 'Hoy es la noche'; c.classList.add('hoy'); return; }
    const v = [Math.floor(diff / 864e5), Math.floor(diff % 864e5 / 36e5), Math.floor(diff % 36e5 / 6e4), Math.floor(diff % 6e4 / 1e3)];
    els.forEach((el, i) => { el.textContent = String(v[i]).padStart(2, '0'); });
  }
  tick(); t = setInterval(tick, 1000);
})();

/* ===== FASES 3 Y 4 ===== */
// Apariciones al hacer scroll (el scroll ocurre dentro de #app)
function revelar(sel, cls) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add(cls); io.unobserve(e.target); }
  }), { root: $('app'), threshold: .25 });
  document.querySelectorAll(sel).forEach(el => io.observe(el));
}
revelar('.ph', 'v'); revelar('.agenda', 'on'); revelar('.agenda li', 'on'); revelar('.mapa', 'on');




// Galería ampliada, con deslizamiento
const fotos = [...document.querySelectorAll('.ph img')], lb = $('lb'), lbImg = $('lbImg');
let fi = 0, x0 = 0;
const abrir = i => { fi = (i + fotos.length) % fotos.length; lbImg.src = fotos[fi].src; lb.hidden = false; };
fotos.forEach((im, i) => { im.parentNode.onclick = () => abrir(i); });
lb.onclick = e => { if (e.target !== lbImg) lb.hidden = true; };
lb.ontouchstart = e => { x0 = e.touches[0].clientX; };
lb.ontouchend = e => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) abrir(fi + (dx < 0 ? 1 : -1)); };

// Confirmación
$('fNombre').textContent = INVITADO.nombre;
$('fTipo').textContent = INVITADO.especial ? 'Invitado especial' : 'Invitado del grupo';
$('fPases').textContent = INVITADO.pases;
(function rsvp() {
  const KEY = 'posada26_rsvp', sel = $('cant'), enviar = $('rsvpSend');
  for (let i = 1; i <= INVITADO.pases; i++) sel.add(new Option(i === 1 ? '1 pase' : i + ' pases', i));
  sel.value = INVITADO.pases;
  let resp = '';
  const elegir = r => {
    resp = r;
    $('siBtn').setAttribute('aria-pressed', String(r === 'si'));
    $('noBtn').setAttribute('aria-pressed', String(r === 'no'));
    $('cantBox').hidden = r !== 'si'; enviar.disabled = false;
  };
  $('siBtn').onclick = () => elegir('si');
  $('noBtn').onclick = () => elegir('no');

  // Archivo de calendario (.ics)
  const f = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', 'UID:posada2026@atdesignstudio',
    'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(new Date(CONFIG.evento.fecha)), 'SUMMARY:Posada Skywatchers 2026',
    ...(CONFIG.evento.lugar !== 'Por confirmar' ? ['LOCATION:' + CONFIG.evento.lugar] : []), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  $('calBtn').href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));

  function gracias(r) {
    $('rsvp').hidden = true;
    const g = $('gracias'); g.hidden = false; g.classList.remove('pop'); void g.offsetWidth; g.classList.add('pop');
    $('grTxt').textContent = r.a === 'si' ? '¡Te esperamos!' : 'Gracias por avisarnos';
    $('calBtn').hidden = r.a !== 'si';
  }
  enviar.onclick = () => {
    const r = { a: resp, n: resp === 'si' ? +sel.value : 0 }, F = CONFIG.form;
    if (F && F.url) {
      const fm = document.createElement('form');
      fm.method = 'POST'; fm.action = F.url; fm.target = 'gform'; fm.hidden = true;
      Object.entries({
        [F.nombre]: INVITADO.nombre,
        [F.tipo]: INVITADO.especial ? 'Invitado especial de ' + INVITADO.por : 'Invitado del grupo',
        [F.pases]: INVITADO.pases, [F.asiste]: resp === 'si' ? F.si : F.no, [F.cantidad]: r.n
      }).forEach(([k, v]) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v; fm.appendChild(i); });
      document.body.appendChild(fm); fm.submit(); fm.remove();
    }
    try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) {}
    gracias(r);
  };
  $('cambiar').onclick = () => { $('gracias').hidden = true; $('rsvp').hidden = false; };
  try { const prev = JSON.parse(localStorage.getItem(KEY)); if (prev) gracias(prev); } catch (e) {}
})();

// Cierre
$('cDesp').textContent = CONFIG.evento.fechaTexto + ' · ' + CONFIG.evento.horaTexto;
$('irConf').onclick = () => $('confirmacion').scrollIntoView({ behavior: 'smooth' });
$('arriba').onclick = () => $('app').scrollTo({ top: 0, behavior: 'smooth' });

/* ===== FASE 5 ===== */
(async function cena() {
  if (INVITADO.especial) {
    $('cenaTxt').textContent = 'La cena es compartida. Platica con quien te invitó para ver qué puedes llevar.';
    $('guia').remove();
  }
  if (!sbOk) return;
  try {
    const r = await fetch(SB.url + '/rest/v1/posada2026_cena?select=cosa,nombres,actualizado&order=orden.asc,id.asc', { headers: cab() });
    if (!r.ok) return;
    const filas = await r.json();
    if (!filas.length) return;
    const lista = filas.map(x => ({ cosa: x.cosa, n: (x.nombres || '').split(',').map(s => s.trim()).filter(Boolean)}  ));
    
    const max = Math.max(1, ...lista.map(x => x.n.length)), box = $('poll');
   
lista.forEach(x => {
  const row = document.createElement('div');
  row.className = 'opt' + (x.n.length ? '' : ' falta');
  // Separación visual entre cada tarjeta
  row.style.marginBottom = '14px'; 

  const h = document.createElement('div');
  h.className = 'opt-h';
  h.style.display = 'flex';
  h.style.justifyContent = 'space-between';
  h.style.alignItems = 'baseline';
  h.style.gap = '12px';

  // Izquierda: Qué cosa es
  const a = document.createElement('span');
  a.textContent = x.cosa;
  a.style.fontWeight = '600';

  // Derecha: Quiénes lo llevan (en lugar de solo el número)
  const b = document.createElement('small');
  b.textContent = x.n.length ? x.n.join(', ') : 'Aún falta';
  b.style.textAlign = 'right';
  b.style.opacity = x.n.length ? '0.9' : '0.6';

  h.append(a, b);

  // Barra de progreso
  const bar = document.createElement('i');
  bar.style.setProperty('--w', (x.n.length / max) * 100 + '%');

  row.append(h, bar);
  box.appendChild(row);
});


    box.hidden = false;
    if (!INVITADO.especial) $('pollNota').hidden = false;
    const ult = new Date(Math.max(...filas.map(x => new Date(x.actualizado))));
    const hora = ult.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
    $('pollUpd').textContent = 'Actualizado ' + (ult.toDateString() === new Date().toDateString()
      ? 'hoy a las ' + hora
      : 'el ' + ult.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + ', ' + hora);
  } catch (e) {}
})();