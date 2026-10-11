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
  creation: { title: 'brand.experience', content: '<div class="creative-demo"><small>SUA MARCA / UM NOVO CAPÍTULO</small><h4>Uma ideia que<br>merece ser vista.</h4><p>Identidade, mensagem e experiência conectadas em uma presença digital feita para o seu público.</p><span class="creative-cta">Conheça a possibilidade ↗</span></div><div class="flow-caption"><span>ESTRATÉGIA + IDENTIDADE</span><small>COMPOSIÇÃO DEMONSTRATIVA</small></div>' }
};
let currentTab = 'operation';
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
function renderExample(key) { currentTab = key; const example = examples[key]; document.querySelector('#demo-window-title').textContent = example.title; document.querySelector('.demo-content').innerHTML = example.content; document.querySelector('#lab-panel').setAttribute('aria-labelledby', `tab-${key}`); tabs.forEach(tab => { const active = tab.dataset.tab === key; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; }); }
tabs.forEach((tab, index) => { tab.addEventListener('click', () => renderExample(tab.dataset.tab)); tab.addEventListener('keydown', event => { let target; if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % tabs.length; if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index + tabs.length - 1) % tabs.length; if (event.key === 'Home') target = 0; if (event.key === 'End') target = tabs.length - 1; if (target !== undefined) { event.preventDefault(); renderExample(tabs[target].dataset.tab); tabs[target].focus(); } }); });
document.querySelector('.replay').addEventListener('click', () => renderExample(currentTab));
renderExample(currentTab);
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => { document.querySelector('#service').value = link.dataset.service; }));
const form = document.querySelector('.brief-form');
const status = document.querySelector('.form-status');
const output = document.querySelector('#brief-output');
form.addEventListener('submit', event => { event.preventDefault(); if (!form.reportValidity()) return; const name = document.querySelector('#name').value.trim(); const idea = document.querySelector('#idea').value.trim(); if (!name || !idea) { status.textContent = 'Preencha seu nome e conte um pouco da ideia.'; return; } output.value = `Olá, Esdras! Vim pelo site da HorizonI.\n\nNome: ${name}\nSolução: ${document.querySelector('#service').value}\n\nMinha ideia:\n${idea}\n\nVamos conversar sobre o projeto?`; document.querySelector('.brief-result').hidden = false; status.textContent = 'Briefing pronto. Copie e cole na conversa do Instagram.'; output.focus(); });
document.querySelector('#copy-brief').addEventListener('click', async () => { try { if (!navigator.clipboard) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(output.value); status.textContent = 'Briefing copiado! Agora é só colar na conversa.'; } catch { output.focus(); output.select(); status.textContent = 'Selecionei o briefing. Use a opção Copiar do seu dispositivo.'; } });
document.querySelector('#year').textContent = String(new Date().getFullYear());
