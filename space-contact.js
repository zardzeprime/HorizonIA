'use strict';
(() => {
  const config = window.HORIZONI_CONTACT || { whatsapp: '5575982980702', email: '' };
  let modalOpen = false;

  const overlay = document.querySelector('.contact-overlay');
  const modal = document.querySelector('.contact-modal');
  const tabs = Array.from(document.querySelectorAll('[data-channel]'));
  const closeButton = document.querySelector('.contact-close');
  let originalFocus, originalOverflow, inertStates = [];
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
    if (modalOpen) return;
    modalOpen = true;
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
    if (modalOpen) return;
    originalFocus = trigger;
    open(channel);
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
})();
