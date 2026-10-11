'use strict';
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const config = window.HORIZONI_CONTACT || { whatsapp: '5575982980702', email: '' };
  const background = document.createElement('canvas');
  background.className = 'space-background';
  background.setAttribute('aria-hidden', 'true');
  document.body.prepend(background);
  const context = background.getContext('2d');
  let width = 0, height = 0, frame = 0, lastTime = 0;
  let suspended = false, modalOpen = false, flightActive = false;
  let planets = [];
  const textures = ['saturn', 'uranus', 'jupiter'].map(name => {
    const texture = new Image();
    texture.onload = () => { paint(); schedule(); };
    texture.src = `assets/planet-${name}.svg`;
    return texture;
  });
  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, width < 760 ? 1.25 : 1.5);
    background.width = Math.round(width * ratio); background.height = Math.round(height * ratio);
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = width < 760 ? 5 : 8;
    planets = Array.from({ length: count }, (_, index) => {
      const size = (width < 760 ? 42 : 60) + index % 3 * 15;
      return { x: size / 2 + (width - size) * ((index * .37 + .12) % 1), y: size / 2 + (height - size) * ((index * .29 + .18) % 1), vx: (index % 2 ? -1 : 1) * (7 + index * 1.4), vy: (index % 3 ? 1 : -1) * (5 + index), size, angle: index * .8, texture: textures[index % textures.length] };
    });
    paint(); schedule();
  }
  function paint() {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    context.globalAlpha = width < 760 ? .16 : .20;
    planets.forEach(planet => {
      if (!planet.texture.complete || !planet.texture.naturalWidth) return;
      context.save(); context.translate(planet.x, planet.y); context.rotate(planet.angle);
      context.drawImage(planet.texture, -planet.size / 2, -planet.size / 2, planet.size, planet.size);
      context.restore();
    });
  }
  function animate(time) {
    frame = 0;
    if (suspended || modalOpen || document.hidden || preference.matches || !context) { lastTime = 0; return; }
    if (!lastTime || time - lastTime >= 33) {
      const delta = lastTime ? Math.min((time - lastTime) / 1000, .08) : .033;
      lastTime = time;
      planets.forEach(planet => {
        const edge = planet.size / 2 + 5;
        planet.x += planet.vx * delta; planet.y += planet.vy * delta; planet.angle += delta * .018;
        if (planet.x < edge) { planet.x = edge; planet.vx = Math.abs(planet.vx); }
        if (planet.x > width - edge) { planet.x = width - edge; planet.vx = -Math.abs(planet.vx); }
        if (planet.y < edge) { planet.y = edge; planet.vy = Math.abs(planet.vy); }
        if (planet.y > height - edge) { planet.y = height - edge; planet.vy = -Math.abs(planet.vy); }
      });
      paint();
    }
    frame = requestAnimationFrame(animate);
  }
  function schedule() {
    if (frame) cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    if (context && !suspended && !modalOpen && !document.hidden && !preference.matches) frame = requestAnimationFrame(animate);
  }
  document.addEventListener('horizoni:onboarding-start', () => { suspended = true; schedule(); });
  document.addEventListener('horizoni:onboarding-end', () => { suspended = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('resize', resize, { passive: true });
  preference.addEventListener('change', () => { paint(); schedule(); });
  resize();

  const overlay = document.querySelector('.contact-overlay');
  const modal = document.querySelector('.contact-modal');
  const tabs = Array.from(document.querySelectorAll('[data-channel]'));
  const closeButton = document.querySelector('.contact-close');
  let originalFocus, originalOverflow, inertStates = [], flightTimer, flight, pendingChannel;
  const emailAvailable = Boolean(config.email);
  const emailTab = tabs.find(tab => tab.dataset.channel === 'email');
  emailTab.disabled = !emailAvailable;
  emailTab.setAttribute('aria-disabled', String(!emailAvailable));
  const emailLauncher = document.querySelector('.email-launch');
  emailLauncher.disabled = !emailAvailable;
  if (emailAvailable) { emailTab.firstChild.textContent = 'E-mail '; emailLauncher.firstChild.textContent = 'Explorar contato por e-mail '; }
  function selectChannel(channel, focus = false) {
    if (channel === 'email' && !emailAvailable) channel = 'whatsapp';
    tabs.forEach(tab => { const active = tab.dataset.channel === channel; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; document.querySelector(`#contact-panel-${tab.dataset.channel}`).hidden = !active; if (active && focus) tab.focus(); });
  }
  function open(channel) {
    flightActive = false;
    if (flight) { flight.remove(); flight = null; }
    if (modalOpen) return;
    modalOpen = true; schedule();
    document.dispatchEvent(new Event('horizoni:contact-start'));
    originalOverflow = document.body.style.overflow;
    inertStates = Array.from(document.body.children).filter(node => node !== overlay && node.tagName !== 'SCRIPT').map(node => [node, node.inert]);
    inertStates.forEach(([node]) => { node.inert = true; });
    document.body.style.overflow = 'hidden';
    selectChannel(channel);
    overlay.hidden = false;
    overlay.scrollTop = 0;
    modal.focus();
    document.addEventListener('keydown', onKey);
  }
  function close() {
    if (!modalOpen) return;
    modalOpen = false; overlay.hidden = true;
    document.dispatchEvent(new Event('horizoni:contact-end'));
    document.body.style.overflow = originalOverflow;
    inertStates.forEach(([node, state]) => { node.inert = state; });
    inertStates = [];
    document.removeEventListener('keydown', onKey);
    if (originalFocus && originalFocus.isConnected) originalFocus.focus({ preventScroll: true });
    schedule();
  }
  function onKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')).filter(element => !element.disabled && element.getClientRects().length);
    if (!focusable.length) { event.preventDefault(); modal.focus(); return; }
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === modal)) { event.preventDefault(); first.focus(); }
  }
  function launch(channel, trigger) {
    if (modalOpen || flightActive) return;
    originalFocus = trigger;
    pendingChannel = channel;
    if (preference.matches) { open(channel); return; }
    flightActive = true;
    const bounds = trigger.getBoundingClientRect();
    const nearest = planets.reduce((best, planet) => !best || Math.hypot(planet.x - bounds.left, planet.y - bounds.top) < Math.hypot(best.x - bounds.left, best.y - bounds.top) ? planet : best, null);
    const origin = nearest || { x: width * .2, y: height * .8 };
    flight = document.createElement('div'); flight.className = 'contact-flight'; flight.setAttribute('aria-hidden', 'true');
    flight.style.setProperty('--flight-x', `${origin.x - width / 2}px`); flight.style.setProperty('--flight-y', `${origin.y - height / 2}px`);
    flight.innerHTML = '<div class="flight-trail"></div><img src="assets/horizon-rocket.svg" width="160" height="240" alt=""><div class="flight-flash"></div>';
    document.body.append(flight);
    flightTimer = setTimeout(() => open(channel), 1450);
  }
  document.querySelectorAll('a[href="#contato"], [data-contact-tab]').forEach(trigger => {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', event => { event.preventDefault(); if (!trigger.disabled) launch(trigger.dataset.contactTab || 'whatsapp', trigger); });
  });
  tabs.forEach((tab, index) => { tab.addEventListener('click', () => selectChannel(tab.dataset.channel)); tab.addEventListener('keydown', event => { let target; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') target = 1 - index; if (event.key === 'Home') target = 0; if (event.key === 'End') target = tabs.length - 1; if (target !== undefined) { event.preventDefault(); if (!tabs[target].disabled) selectChannel(tabs[target].dataset.channel, true); } }); });
  closeButton.addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.querySelector('.email-to-whatsapp').addEventListener('click', () => {
    selectChannel('whatsapp', true);
    document.querySelector('#name').value = document.querySelector('#email-name').value;
    document.querySelector('#idea').value = [document.querySelector('#email-subject').value, document.querySelector('#email-message').value].filter(Boolean).join('\n\n');
  });
  const emailForm = document.querySelector('.email-form');
  const emailStatus = document.querySelector('.email-status');
  const emailOutput = document.querySelector('#email-output');
  if (config.email) { document.querySelector('.email-availability').hidden = true; document.querySelector('.email-note').textContent = 'Seu aplicativo de e-mail abrirá com a mensagem pronta. Revise e envie por lá.'; }
  emailForm.addEventListener('submit', event => {
    event.preventDefault(); if (!emailForm.reportValidity()) return;
    const name = document.querySelector('#email-name').value.trim(), address = document.querySelector('#email-address').value.trim(), subject = document.querySelector('#email-subject').value.trim(), message = document.querySelector('#email-message').value.trim();
    if (!name || !subject || !message) { emailStatus.textContent = 'Preencha seu nome, assunto e mensagem.'; return; }
    emailOutput.value = `Olá, Esdras! Vim pelo site da HorizonI.\n\nNome: ${name}\nE-mail: ${address}\nAssunto: ${subject}\n\n${message}`;
    document.querySelector('.email-result').hidden = false;
    const emailLink = document.querySelector('#open-email');
    emailLink.hidden = !config.email;
    if (config.email) emailLink.href = `mailto:${config.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailOutput.value)}`;
    emailStatus.textContent = config.email ? 'Mensagem preparada. Abra seu aplicativo de e-mail para revisar e enviar.' : 'Mensagem pronta para copiar. O WhatsApp está disponível para conversar agora.';
    emailOutput.focus();
  });
  document.querySelector('#copy-email').addEventListener('click', async () => { try { await navigator.clipboard.writeText(emailOutput.value); emailStatus.textContent = 'Mensagem copiada.'; } catch { emailOutput.focus(); emailOutput.select(); emailStatus.textContent = 'Mensagem selecionada. Use a opção Copiar do seu dispositivo.'; } });
  preference.addEventListener('change', event => { if (event.matches && flightActive) { clearTimeout(flightTimer); open(pendingChannel); } });
})();
