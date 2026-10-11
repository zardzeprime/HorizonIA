'use strict';
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const deck = document.querySelector('#service-deck');
  const cards = Array.from(deck.querySelectorAll('.service'));
  const controls = document.querySelector('.deck-controls');
  const previous = controls.querySelector('[data-deck-step="-1"]');
  const next = controls.querySelector('[data-deck-step="1"]');
  let scheduled = false;
  function updateDeck() {
    scheduled = false;
    const overflow = deck.scrollWidth > deck.clientWidth + 2;
    controls.hidden = !overflow;
    previous.disabled = deck.scrollLeft <= 2;
    next.disabled = deck.scrollLeft >= deck.scrollWidth - deck.clientWidth - 2;
    const index = cards.reduce((best, card, i) => Math.abs(card.offsetLeft - cards[0].offsetLeft - deck.scrollLeft) < Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - deck.scrollLeft) ? i : best, 0);
    controls.querySelector('.deck-position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  }
  function queueUpdate() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateDeck); } }
  function advance(step) { deck.scrollBy({ left: step * (cards[0].getBoundingClientRect().width + 18), behavior: motion.matches ? 'instant' : 'smooth' }); }
  controls.querySelectorAll('button').forEach(button => button.addEventListener('click', () => advance(Number(button.dataset.deckStep))));
  deck.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate, { passive: true });
  deck.addEventListener('keydown', event => { if (event.target !== deck || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); if (event.key === 'Home' || event.key === 'End') deck.scrollTo({ left: event.key === 'Home' ? 0 : deck.scrollWidth, behavior: motion.matches ? 'instant' : 'smooth' }); else advance(event.key === 'ArrowRight' ? 1 : -1); });
  updateDeck();

  // A keyboard easter egg. Public browser assets remain inspectable.
  const overlay = document.createElement('div');
  overlay.className = 'cosmic-patrol'; overlay.hidden = true;
  overlay.innerHTML = `<section class="patrol-dialog" role="dialog" aria-modal="true" aria-labelledby="patrol-title" tabindex="-1">
    <div class="patrol-beacon" aria-hidden="true"><svg viewBox="0 0 100 65"><path d="M25 52V30a25 25 0 0 1 50 0v22Z" fill="#de635c"/><path d="M39 28a11 11 0 0 1 11-11" fill="none" stroke="#ffe6d7" stroke-width="5" stroke-linecap="round"/><path d="M18 54h64v8H18Z" fill="#c8a374"/></svg></div>
    <svg class="patrol-car" viewBox="0 0 280 130" aria-hidden="true"><path d="m28 83 17-30h48l26-29h68l27 30 38 10 12 31H18V84Z" fill="#dedbd3" stroke="#c8a374" stroke-width="2"/><path d="m105 51 21-21h24v21Zm52-21h25l22 21h-47Z" fill="#101820"/><path d="M28 70h230v20H28Z" fill="#171c25"/><path d="M137 18h17v8h-17Z" fill="#e06460"/><path d="M154 18h17v8h-17Z" fill="#6b9fef"/><circle cx="65" cy="97" r="22" fill="#08090b" stroke="#c8a374" stroke-width="3"/><circle cx="222" cy="97" r="22" fill="#08090b" stroke="#c8a374" stroke-width="3"/><circle cx="65" cy="97" r="9" fill="#6c6c70"/><circle cx="222" cy="97" r="9" fill="#6c6c70"/><path d="m145 66 10 6 10-6v15l-10 6-10-6Z" fill="#c8a374"/><path d="M247 62h10v8h-10Z" fill="#f3d19d"/></svg>
    <svg class="patrol-officer" viewBox="0 0 160 190" aria-hidden="true"><path d="M37 182v-45q0-35 43-36t43 36v45Z" fill="#202b3c" stroke="#c8a374" stroke-width="2"/><path d="m64 103 16 18 16-18" fill="#ebc29d"/><path d="m78 122-7 25 9 8 9-8-7-25" fill="#10141b"/><rect x="55" y="44" width="50" height="57" rx="24" fill="#ddb28d"/><path d="M45 47 52 20q28-18 56 0l7 27Z" fill="#202b3c" stroke="#c8a374" stroke-width="2"/><path d="M43 47h74l-9 9H52Z" fill="#10141b"/><path d="m80 22 9 5v10l-9 6-9-6V27Z" fill="#c8a374"/><path d="M62 68h12m12 0h12" stroke="#151923" stroke-width="4" stroke-linecap="round"/><path d="M73 86h14" stroke="#8d5d48" stroke-width="3" stroke-linecap="round"/><path d="m44 129 60 26m12-26-60 26" stroke="#354359" stroke-width="20" stroke-linecap="round"/><path d="m90 149 16 7m-36-7-16 7" stroke="#ddb28d" stroke-width="12" stroke-linecap="round"/><path d="m109 112 6 4 6-4v9l-6 5-6-5Z" fill="#c8a374"/></svg>
    <div class="patrol-message"><p class="eyebrow">PATRULHA DO HORIZONTE</p><h2 id="patrol-title">Perdeu alguma coisa<br>aqui, cidadão?</h2><p>Só uma parada cósmica. A curiosidade está liberada.</p><button class="button primary patrol-close" type="button">Voltar à exploração <span aria-hidden="true">✧</span></button></div>
  </section>`;
  document.body.append(overlay);
  const dialog = overlay.querySelector('.patrol-dialog'), closeButton = overlay.querySelector('.patrol-close');
  let busy = false, active = false, focusBefore, overflowBefore, inertBefore = [], used = false;
  document.addEventListener('horizoni:onboarding-start', () => { busy = true; });
  document.addEventListener('horizoni:onboarding-end', () => { busy = false; });
  document.addEventListener('horizoni:contact-start', () => { busy = true; });
  document.addEventListener('horizoni:contact-end', () => { busy = false; });
  function close() {
    if (!active) return;
    active = false; overlay.hidden = true; document.body.style.overflow = overflowBefore;
    inertBefore.forEach(([node, state]) => { node.inert = state; }); inertBefore = [];
    document.dispatchEvent(new Event('horizoni:contact-end'));
    if (focusBefore?.isConnected) focusBefore.focus({ preventScroll: true });
  }
  closeButton.addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => {
    if (active) { if (event.key === 'Escape') { event.preventDefault(); close(); } else if (event.key === 'Tab') { event.preventDefault(); closeButton.focus(); } return; }
    const shortcut = event.key === 'F12' || ((event.ctrlKey || event.metaKey) && event.shiftKey && ['i', 'j', 'c'].includes(event.key.toLowerCase()));
    if (!shortcut || busy || used) return;
    used = true; active = true; focusBefore = document.activeElement; overflowBefore = document.body.style.overflow;
    inertBefore = Array.from(document.body.children).filter(node => node !== overlay && node.tagName !== 'SCRIPT').map(node => [node, node.inert]);
    inertBefore.forEach(([node]) => { node.inert = true; });
    document.body.style.overflow = 'hidden'; overlay.hidden = false; dialog.focus();
    document.dispatchEvent(new Event('horizoni:contact-start'));
    // Intentionally do not preventDefault: developer tools are not blocked.
  });
})();
