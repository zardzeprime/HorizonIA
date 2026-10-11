'use strict';
document.documentElement.classList.add('js');
const menu = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu'); navigation.classList.remove('open'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); navigation.classList.toggle('open', open); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });
if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }); }, { threshold: .08 }); document.querySelectorAll('.reveal').forEach(element => observer.observe(element)); } else { document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible')); }
const progress = document.querySelector('.scroll-progress');
let scrollScheduled = false;
window.addEventListener('scroll', () => { if (scrollScheduled) return; scrollScheduled = true; requestAnimationFrame(() => { const height = document.documentElement.scrollHeight - window.innerHeight; progress.style.width = `${height > 0 ? Math.min(100, window.scrollY / height * 100) : 0}%`; scrollScheduled = false; }); }, { passive: true });
const examples = {
  operation: { title: 'operation.flow', content: '<div class="flow-demo"><div class="flow-node"><b>01</b> Solicitação recebida<small>Formulário ou canal de entrada</small></div><div class="flow-node"><b>02</b> Dados organizados<small>Campos validados e classificados</small></div><div class="flow-node"><b>03</b> Ferramentas conectadas<small>Registro no sistema da operação</small></div><div class="flow-node"><b>04</b> Equipe informada<small>Próximo passo pronto para revisão</small></div></div><div class="flow-caption"><span>✧ CONEXÕES COM PROPÓSITO</span><small>FLUXO ILUSTRATIVO</small></div>' },
  ai: { title: 'knowledge.agent', content: '<div class="chat-bubble">Onde encontro o processo de onboarding?</div><div class="chat-answer"><strong>✧ ASSISTENTE / EXEMPLO</strong><p>Um agente pode consultar os materiais aprovados da empresa e ajudar a localizar o processo, indicando de onde veio a informação.</p><div class="knowledge-tags"><span>Documentação</span><span>→ Contexto</span><span>→ Resposta</span></div></div><div class="flow-caption"><span>CONHECIMENTO MAIS PRÓXIMO</span><small>INTERFACE CONCEITUAL</small></div>' },
  creation: { title: 'brand.experience', content: '<div class="creative-demo"><small>SUA MARCA / UM NOVO CAPÍTULO</small><h4>Uma ideia que<br>merece ser vista.</h4><p>Identidade, mensagem e experiência conectadas em uma presença digital feita para o seu público.</p><span class="creative-cta">Conheça a possibilidade <svg class="orbit-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 18 18 5M10 5h8v8"/><path class="arrow-orbit" d="M4 12a8 8 0 0 0 8 8"/></svg></span></div><div class="flow-caption"><span>ESTRATÉGIA + IDENTIDADE</span><small>COMPOSIÇÃO DEMONSTRATIVA</small></div>' }
};
let currentTab = 'operation';
const tabs = Array.from(document.querySelectorAll('.lab-tabs [role="tab"]'));
function renderExample(key) { currentTab = key; const example = examples[key]; document.querySelector('#demo-window-title').textContent = example.title; document.querySelector('.demo-content').innerHTML = example.content; document.querySelector('#lab-panel').setAttribute('aria-labelledby', `tab-${key}`); tabs.forEach(tab => { const active = tab.dataset.tab === key; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; }); }
tabs.forEach((tab, index) => { tab.addEventListener('click', () => renderExample(tab.dataset.tab)); tab.addEventListener('keydown', event => { let target; if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % tabs.length; if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index + tabs.length - 1) % tabs.length; if (event.key === 'Home') target = 0; if (event.key === 'End') target = tabs.length - 1; if (target !== undefined) { event.preventDefault(); renderExample(tabs[target].dataset.tab); tabs[target].focus(); } }); });
document.querySelector('.replay').addEventListener('click', () => renderExample(currentTab));
renderExample(currentTab);
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => { document.querySelector('#service').value = link.dataset.service; }));
const form = document.querySelector('.brief-form');
const status = document.querySelector('.form-status');
const output = document.querySelector('#brief-output');
form.addEventListener('submit', event => { event.preventDefault(); if (!form.reportValidity()) return; const name = document.querySelector('#name').value.trim(); const idea = document.querySelector('#idea').value.trim(); if (!name || !idea) { status.textContent = 'Preencha seu nome e conte um pouco da ideia.'; return; } output.value = `Olá, Esdras! Vim pelo site da HorizonI.\n\nNome: ${name}\nSolução: ${document.querySelector('#service').value}\n\nMinha ideia:\n${idea}\n\nVamos conversar sobre o projeto?`; document.querySelector('.brief-result').hidden = false; const whatsappUrl = `https://wa.me/5575982980702?text=${encodeURIComponent(output.value)}`; document.querySelector('#whatsapp-brief').href = whatsappUrl; window.open(whatsappUrl, '_blank', 'noopener,noreferrer'); status.textContent = 'Mensagem pronta. Revise no WhatsApp e toque em enviar. Se a conversa não abriu, use o link abaixo.'; });
document.querySelector('#copy-brief').addEventListener('click', async () => { try { if (!navigator.clipboard) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(output.value); status.textContent = 'Briefing copiado! Agora é só colar na conversa.'; } catch { output.focus(); output.select(); status.textContent = 'Selecionei o briefing. Use a opção Copiar do seu dispositivo.'; } });
document.querySelector('#year').textContent = String(new Date().getFullYear());

// Original procedural horizon: orbital dust, light trails and water reflections.
// No videos, external animation libraries or AI calls are used.
(() => {
  const hero = document.querySelector('.hero');
  const art = document.querySelector('.hero-art');
  const canvas = document.createElement('canvas');
  canvas.className = 'horizon-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  art.append(canvas);
  const context = canvas.getContext('2d');
  if (!context) return;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motionPreference.matches;
  let visible = true;
  let onboardingActive = false;
  let contactActive = false;
  let frame = 0;
  let lastTime = 0;
  let phase = 0;
  let width = 0;
  let height = 0;
  let particles = [];
  let pointer = { x: 0, y: 0 };
  let drift = { x: 0, y: 0 };
  function resize() {
    const bounds = hero.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: width <= 760 ? 140 : 260 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: .35 + Math.random() * .75,
      size: .4 + Math.random() * 1.1,
      speed: .12 + Math.random() * .22,
      brightness: .2 + Math.random() * .6,
      lane: Math.random() > .65 ? 'sky' : 'disk'
    }));
    draw();
  }
  function draw() {
    context.clearRect(0, 0, width, height);
    const mobile = width <= 760;
    const centerX = width * (mobile ? .70 : .77) + drift.x;
    const centerY = height * (mobile ? .76 : .65) + drift.y;
    const radius = mobile ? Math.min(width * .52, 220) : Math.min(width * .27, 380);
    const halo = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.25);
    halo.addColorStop(0, 'rgba(246, 212, 160, .13)');
    halo.addColorStop(.2, 'rgba(183, 123, 62, .04)');
    halo.addColorStop(1, 'rgba(183, 123, 62, 0)');
    context.fillStyle = halo;
    context.fillRect(centerX - radius * 1.3, centerY - radius * 1.3, radius * 2.6, radius * 2.6);
    // A tilted luminous disk: short curved trails follow their own orbital speeds.
    particles.forEach(particle => {
      const angle = particle.angle + phase * particle.speed;
      const r = radius * particle.radius;
      const sky = particle.lane === 'sky';
      const squash = sky ? .72 : .13;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r * squash;
      const alpha = particle.brightness * (sky ? .60 : .95);
      if (!sky) {
        context.beginPath();
        context.ellipse(centerX, centerY, r, r * squash, 0, angle - .06, angle);
        context.strokeStyle = `rgba(215, 174, 112, ${alpha * .35})`;
        context.lineWidth = particle.size * .65;
        context.stroke();
      }
      context.beginPath();
      context.arc(x, y, particle.size, 0, Math.PI * 2);
      context.fillStyle = `rgba(244, 213, 167, ${alpha})`;
      context.fill();
    });
    // Traveling highlights over the semicircles.
    [1, 1.46].forEach((scale, index) => {
      const angle = Math.PI + ((phase * .21 + index * 2) % Math.PI);
      context.beginPath();
      context.arc(centerX, centerY, radius * .8 * scale, angle, Math.min(angle + .28, Math.PI * 2));
      context.strokeStyle = `rgba(232, 195, 140, ${index ? .17 : .35})`;
      context.lineWidth = 1.2;
      context.stroke();
      const x = centerX + Math.cos(angle) * radius * .8 * scale;
      const y = centerY + Math.sin(angle) * radius * .8 * scale;
      context.fillStyle = 'rgba(250, 222, 179, .7)';
      context.fillRect(x, y, 2, 2);
    });
    // Ripples spread from the point of light and fade into the dark surface.
    for (let i = 0; i < 16; i++) {
      const travel = (i / 16 + phase * .024) % 1;
      const y = centerY + 9 + travel * height * .26;
      const halfWidth = 4 + travel * radius * .65;
      const flicker = .65 + Math.sin(phase * 1.2 + i * 2) * .25;
      const gradient = context.createLinearGradient(centerX - halfWidth, y, centerX + halfWidth, y);
      gradient.addColorStop(0, 'rgba(214, 172, 109, 0)');
      gradient.addColorStop(.5, `rgba(232, 197, 146, ${(1 - travel) * .20 * flicker})`);
      gradient.addColorStop(1, 'rgba(214, 172, 109, 0)');
      context.strokeStyle = gradient;
      context.beginPath();
      context.moveTo(centerX - halfWidth, y);
      context.lineTo(centerX + halfWidth, y);
      context.stroke();
    }
  }
  function animate(time) {
    frame = 0;
    if (paused || !visible || document.hidden || onboardingActive || contactActive) { lastTime = 0; return; }
    if (!lastTime || time - lastTime >= 32) {
      phase += lastTime ? Math.min((time - lastTime) / 1000, .08) : .032;
      lastTime = time;
      drift.x += (pointer.x - drift.x) * .035;
      drift.y += (pointer.y - drift.y) * .035;
      draw();
    }
    frame = requestAnimationFrame(animate);
  }
  function schedule() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (!paused && visible && !document.hidden && !onboardingActive && !contactActive) frame = requestAnimationFrame(animate);
  }
  document.addEventListener('horizoni:contact-start', () => { contactActive = true; schedule(); });
  document.addEventListener('horizoni:contact-end', () => { contactActive = false; schedule(); });
  document.addEventListener('horizoni:onboarding-start', () => { onboardingActive = true; schedule(); });
  document.addEventListener('horizoni:onboarding-end', () => { onboardingActive = false; schedule(); });
  motionPreference.addEventListener('change', event => { paused = event.matches; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }).observe(hero);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
  else window.addEventListener('resize', resize);
  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const bounds = hero.getBoundingClientRect();
    pointer = { x: ((event.clientX - bounds.left) / width - .5) * 12, y: ((event.clientY - bounds.top) / height - .5) * 8 };
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer = { x: 0, y: 0 }; });
  resize();
  schedule();
})();
