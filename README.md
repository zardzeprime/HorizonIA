# Horizon AI — primeira interface

Uma prévia da plataforma Horizon em formato de conversa, com uma barra lateral própria e o mascote acompanhando o cursor. O projeto é estático e não depende de um serviço de hospedagem específico.

## Abrir no GitHub Codespaces

No terminal do Codespace, execute:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Abra a porta `4173` na lista de portas do Codespace.

## O que já funciona

- Layout responsivo com navegação à esquerda e conversa no painel principal.
- Horizon acompanha o cursor com inclinação contínua e suavizada, inclusive para cima e para baixo.
- A animação atual inclina a imagem frontal; um rig próprio do Rive depende de arte separada em partes e do arquivo `.riv` do projeto.
- A linha central fica reta em repouso e se anima durante uma resposta demonstrativa.
- `window.HorizonMascot.setSpeaking(true)` e `setAudioLevel(0..1)` permitem ligar o movimento ao áudio real quando o serviço de voz estiver configurado.
- Caixa de mensagem, sugestões e criação de conversa funcionam como prévia local.

## Conectar respostas reais

Por segurança, este repositório não contém chave de modelo nem serviço de conversa. Defina `window.HORIZON_CHAT_ENDPOINT` antes de `app.js` para apontar a interface a um endpoint próprio. A interface envia `{ "message": "..." }` por `POST` e espera JSON com `reply` ou `message`. Credenciais devem ficar no servidor, nunca neste HTML.

O endpoint de voz pode enviar níveis de áudio para `window.HorizonMascot.setAudioLevel(level)` enquanto `setSpeaking(true)` estiver ativo. Ao terminar a fala, chame `setSpeaking(false)`; a onda volta à linha reta.

## Estrutura

- `index.html` — interface sem framework.
- `styles.css` — aparência desktop e mobile.
- `app.js` — conversa demonstrativa, direção do mascote e onda reativa.
- `public/assets/horizon-owl.webp` — pose frontal limpa do Horizon, com fundo transparente.
