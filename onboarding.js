'use strict';
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const overlay = document.createElement('div');
  overlay.className = 'era-onboarding';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'era-title');
  overlay.innerHTML = `<div class="era-space" aria-hidden="true"><div class="era-stars"></div><div class="era-hole"><div class="era-ring"></div><div class="era-core"></div></div><div class="era-objects"></div><div class="era-darkness"></div><div class="era-explosion"></div></div><button class="era-skip" type="button">Pular abertura ↗</button><div class="era-caption" role="status">IDEIAS. FERRAMENTAS. POSSIBILIDADES.<span>Tudo está entrando em uma nova era.</span></div><div class="era-dialog" hidden><p class="eyebrow">UM NOVO HORIZONTE COMEÇA AGORA</p><h2 id="era-title">Pronto para descobrir<br><span>a nova era?</span></h2><p>A inteligência artificial mudou a forma de criar.<br>O próximo passo é descobrir o que você pode construir com ela.</p><button class="button primary era-enter" type="button">Explorar meu próximo horizonte <span>↗</span></button><span class="era-dialog-note">CRIATIVIDADE HUMANA × INTELIGÊNCIA ARTIFICIAL</span></div>`;
  overlay.innerHTML += `<div class="era-presentation" hidden><div class="presentation-aura" aria-hidden="true"></div><div class="presentation-orbit" aria-hidden="true"></div><div class="presentation-copy" aria-live="polite"><p class="presentation-line line-one">Uma ideia pode mudar<br><span>o seu próximo passo.</span></p><p class="presentation-line line-two" hidden>Quer aprender a criar com IA?<br><span>Ou quer que façam por você?</span></p></div><div class="presentation-brand" hidden><p class="eyebrow">APRESENTAMOS</p><div class="brand-reveal" aria-label="HorizonI"><span class="horizon-mark" aria-hidden="true"></span><span>horizon<span class="brand-i">I</span></span></div><p>Inteligência que transforma ideias.</p><span class="presentation-description">Direção humana. Criação com IA.<br>Um novo horizonte para o seu projeto.</span><button class="button primary era-finish" type="button">Conhecer a HorizonI <span>↗</span></button></div><span class="presentation-progress" aria-hidden="true"></span></div>`;
  document.body.append(overlay);
  document.dispatchEvent(new Event('horizoni:onboarding-start'));
  const previousFocus = document.activeElement;
  const skip = overlay.querySelector('.era-skip');
  const dialog = overlay.querySelector('.era-dialog');
  const enter = overlay.querySelector('.era-enter');
  const presentation = overlay.querySelector('.era-presentation');
  const brand = overlay.querySelector('.presentation-brand');
  const finish = overlay.querySelector('.era-finish');
  const content = Array.from(document.body.children).filter(node => node !== overlay && node.tagName !== 'SCRIPT');
  const originalInert = content.map(node => node.inert);
  content.forEach(node => { node.inert = true; });
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  let finished = false;
  let revealTimer;
  let presenting = false;
  const presentationTimers = [];
  const svg = (body) => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const objects = [
    svg('<circle cx="32" cy="32" r="16" fill="currentColor" fill-opacity=".08"/><ellipse cx="32" cy="32" rx="29" ry="9" transform="rotate(-28 32 32)"/><path d="M22 22c9 2 14 9 17 19"/>'),
    svg('<circle cx="29" cy="35" r="17" fill="currentColor" fill-opacity=".09"/><circle cx="52" cy="12" r="5"/><path d="M18 29c7 2 12 1 21-2M17 38c10 5 15 3 25 3"/>'),
    svg('<rect x="7" y="18" width="50" height="29" rx="4" fill="currentColor" fill-opacity=".06"/><path d="M14 25h4m5 0h4m5 0h4m5 0h4m5 0h1M14 32h4m5 0h4m5 0h4m5 0h4m5 0h1M20 40h24"/>'),
    svg('<path d="M9 31 32 12l23 19M15 27v27h34V27M27 54V38h11v16"/><path d="M23 25h4m10 0h4"/>'),
    svg('<rect x="8" y="12" width="48" height="33" rx="3"/><path d="M25 54h14m-7-9v9M19 25l-5 5 5 5m26-10 5 5-5 5M35 23l-6 14"/>'),
    svg('<rect x="19" y="7" width="26" height="50" rx="5"/><path d="M27 13h10m-6 37h2"/><circle cx="32" cy="51" r="1"/>'),
    svg('<path d="m10 14 18 3v36l-18-3zm18 3 26-3v36l-26 3M16 24l6 1m-6 8 6 1m12-10 13-2m-13 12 13-2"/>'),
    svg('<circle cx="32" cy="32" r="13"/><ellipse cx="32" cy="32" rx="26" ry="13" transform="rotate(55 32 32)"/><circle cx="11" cy="11" r="3"/>'),
    svg('<path d="M16 22h32v26H16zM24 22v-8h16v8M22 48v5m20-5v5M25 32h1m12 0h1m-14 9h14M9 29v12m46-12v12"/><path d="M32 7v7"/>'),
    svg('<path d="m32 8 6 17 18 7-18 6-6 18-7-18-17-6 17-7z"/>'),
    svg('<path d="M12 22h10l5-7h10l5 7h10v29H12z"/><circle cx="32" cy="35" r="9"/><path d="M45 27h2"/>'),
    svg('<path d="M10 25h44v29H10zM10 19h44v6M18 19l8-9m7 9 8-9m6 9 7-9"/><path d="m27 32 12 7-12 7z"/>')
  ];
  const objectContainer = overlay.querySelector('.era-objects');
  const total = window.innerWidth < 760 ? 16 : 26;
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2 + .15;
    const item = document.createElement('span');
    item.className = 'era-object';
    item.innerHTML = objects[i % objects.length];
    item.style.setProperty('--x', `${Math.cos(angle) * (42 + i % 3 * 7)}vw`);
    item.style.setProperty('--y', `${Math.sin(angle) * (40 + i % 4 * 5)}vh`);
    item.style.setProperty('--turn', `${i % 2 ? 210 : -230}deg`);
    item.style.setProperty('--delay', `${.15 + (i % 8) * .13}s`);
    item.style.setProperty('--size', `${40 + i % 4 * 13}px`);
    objectContainer.append(item);
  }
  function reveal() {
    if (finished || overlay.classList.contains('era-ready')) return;
    clearTimeout(revealTimer);
    overlay.classList.add('era-ready');
    dialog.hidden = false;
    overlay.querySelector('.era-caption').hidden = true;
    skip.hidden = true;
    enter.focus();
  }
  function close() {
    if (finished) return;
    finished = true;
    clearTimeout(revealTimer);
    presentationTimers.forEach(clearTimeout);
    document.removeEventListener('keydown', onKey);
    reduced.removeEventListener('change', onPreference);
    content.forEach((node, index) => { node.inert = originalInert[index]; });
    document.body.style.overflow = previousOverflow;
    overlay.remove();
    document.dispatchEvent(new Event('horizoni:onboarding-end'));
    if (previousFocus && previousFocus !== document.body && previousFocus.isConnected) previousFocus.focus();
    else { const heading = document.querySelector('h1'); heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  function showBrand() {
    overlay.querySelector('.presentation-copy').hidden = true;
    brand.hidden = false;
    presentation.classList.add('brand-visible');
  }
  function beginPresentation() {
    if (presenting || finished) return;
    presenting = true;
    dialog.hidden = true;
    presentation.hidden = false;
    skip.hidden = false;
    skip.textContent = 'Pular apresentação ↗';
    overlay.setAttribute('aria-labelledby', 'presentation-title');
    brand.querySelector('.brand-reveal').id = 'presentation-title';
    overlay.classList.add('era-presenting');
    skip.focus();
    if (reduced.matches) { showBrand(); return; }
    presentationTimers.push(setTimeout(() => {
      overlay.querySelector('.line-one').hidden = true;
      overlay.querySelector('.line-two').hidden = false;
    }, 1900));
    presentationTimers.push(setTimeout(showBrand, 4100));
    presentationTimers.push(setTimeout(() => { overlay.classList.add('era-leaving'); }, 7900));
    presentationTimers.push(setTimeout(close, 8500));
  }
  function onKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      event.preventDefault();
      if (presenting && !brand.hidden) (document.activeElement === skip ? finish : skip).focus();
      else (presenting || dialog.hidden ? skip : enter).focus();
    }
  }
  function onPreference(event) { if (!event.matches) return; if (presenting) { presentationTimers.forEach(clearTimeout); overlay.classList.remove('era-leaving'); showBrand(); } else reveal(); }
  skip.addEventListener('click', () => { if (presenting) close(); else reveal(); });
  enter.addEventListener('click', beginPresentation);
  finish.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  reduced.addEventListener('change', onPreference);
  if (reduced.matches) reveal();
  else { skip.focus(); revealTimer = setTimeout(reveal, 4500); }
})();
