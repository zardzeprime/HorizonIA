# HorizonI

Site institucional da HorizonI. Implementação original em HTML, CSS e JavaScript, inspirada na identidade preta e dourada da marca. A estrutura editorial considera o site de Jean Pierre como referência; código, textos e gráficos são próprios.

## Desenvolvimento

Sem instalação ou compilação. Sirva esta pasta com qualquer servidor estático. Edite `index.html`, `styles.css` e `app.js` diretamente.

## Recursos

- Layout responsivo, menu mobile, navegação por âncoras e foco visível.
- Horizonte procedural em Canvas 2D com partículas orbitais, trilhas luminosas, reflexos em movimento e paralaxe sutil. Animações CSS nos ícones, gráficos e órbitas. Animação contínua, suporte à preferência do sistema por movimento reduzido e renderização interrompida fora de tela ou em aba oculta.
- Laboratório interativo com três demonstrações conceituais, sem chamadas a modelos de IA.
- Perguntas frequentes e briefing local com opção de copiar.
- Publicação pelo GitHub no Vercel, sem créditos de geração de plataformas.

## Abertura da nova era

`onboarding.js` cria uma abertura original com planetas, luas e objetos vetoriais sendo atraídos por um buraco negro. Após cerca de 4,5 segundos, revela um convite. O botão inicia uma segunda apresentação de cerca de 15,6 segundos, com duas mensagens e a marca surgindo das sombras, antes de liberar o site. A abertura e a apresentação não oferecem atalhos de pular; o site é liberado automaticamente depois da sequência. Inclui foco controlado e respeito a movimento reduzido. O onboarding acontece em cada carregamento da página; nenhum cookie ou rastreamento é usado. No mobile, são renderizados 16 objetos (26 no desktop), filtros de desfoque são reduzidos e o Canvas do horizonte fica suspenso durante a abertura.

## Proposta

Criada por Esdras Oliveira e Oliveira Junior, a HorizonI transforma o acesso à IA em execução com estratégia, contexto, instruções claras, testes e revisão humana. Cria sites por código, corrige problemas em sites e WordPress, desenvolve criação digital e avalia plataformas web conforme escopo e viabilidade. Aplicativos mobile não integram a oferta definida.

A foto do criador usa PNG transparente com moldura e iluminação animadas em CSS.

## Planetas e contato animado

`space-contact.js` desenha SVGs próprios de planetas no Canvas com movimento contínuo e colisão nas bordas. São 5 planetas no mobile e 8 no desktop, com renderização limitada a cerca de 30 fps, suspensão na abertura, no contato e em abas ocultas. O foguete original HorizonI avança em direção à tela antes de abrir uma janela de contato acessível, com abas WhatsApp e E-mail.

`contact-config.js` contém os destinos públicos. O proprietário escolheu configurar o e-mail depois: a aba fica desabilitada e sinalizada como “em breve”. Ao definir `email`, a aba fornece um link `mailto:` com mensagem pronta para o cliente revisar no aplicativo de e-mail. Não há servidor de envio ou coleta de dados.

## Contato

Contato comercial: WhatsApp `(75) 98298-0702`, link internacional `https://wa.me/5575982980702`. O formulário prepara um briefing e abre o WhatsApp com o texto preenchido para o visitante revisar e enviar. O site não armazena os dados em servidor. O Instagram `@zard.prime` permanece no rodapé. Nenhum projeto demonstrativo é apresentado como case real, e não há preços ou resultados inventados.

## Publicação

Importe este repositório no Vercel com Framework Preset “Other”, sem build e servindo a raiz. `vercel.json` contém apenas configuração estática e cabeçalhos. O código não depende de um editor visual. As fontes do Google têm fallback local.

## Movimento e easter egg

Cards entram como cartas distribuídas, com carrossel manual em telas até 1000 px. Controles respondem ao scroll, teclado e redimensionamento. SVGs de setas são originais; o H orbital foi ampliado. Respeitamos prefers-reduced-motion.

Os atalhos F12 e Ctrl/Cmd+Shift+I/J/C podem abrir uma cena humorística com sirene, viatura e policial. É um easter egg dispensável, não uma defesa: não bloqueia os atalhos, não detecta DevTools por outros caminhos, não criptografa nem impede a cópia dos arquivos públicos. Sem telemetria ou inferências por tamanho de janela.
