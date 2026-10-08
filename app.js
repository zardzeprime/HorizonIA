(() => {
  const frame = document.getElementById("avatarSprite");
  const stage = document.getElementById("avatarStage");
  const wavePath = document.getElementById("wavePath");
  const status = document.getElementById("companionStatus");
  const conversation = document.getElementById("conversation");
  const welcome = document.getElementById("welcomeBlock");
  const messageList = document.getElementById("messageList");
  const input = document.getElementById("messageInput");
  const form = document.getElementById("composer");
  const sendButton = document.getElementById("sendButton");
  const typing = document.getElementById("typingIndicator");
  const sidebar = document.querySelector(".sidebar");
  const toast = document.getElementById("toast");

  const frameSize = { width: 174, height: 188 };
  let direction = 0;
  let audioLevel = 0;
  let externalAudioLevel = null;
  let speaking = false;
  let waveFrame = 0;
  let toastTimer;
  let demoTimer;

  function showDirection(index) {
    direction = ((index % 16) + 16) % 16;
    const col = direction % 4;
    const row = Math.floor(direction / 4);
    frame.style.backgroundPosition = `${-col * frameSize.width}px ${-row * frameSize.height}px`;
    frame.setAttribute("aria-label", `Coruja Horizon olhando na direção ${direction + 1} de 16`);
  }

  function pointerDirection(event) {
    const rect = stage.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) < 28) return showDirection(0);
    const degrees = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    showDirection(Math.round(degrees / 22.5) % 16);
  }

  document.addEventListener("pointermove", pointerDirection, { passive: true });
  document.addEventListener("pointerleave", () => showDirection(0));

  function drawWave(level, time) {
    if (level < 0.025) {
      wavePath.setAttribute("d", "M 4 12 H 116");
      return;
    }
    const points = [];
    const count = 28;
    const amplitude = Math.min(8, 1.2 + level * 12);
    for (let i = 0; i <= count; i += 1) {
      const x = 4 + (112 * i / count);
      const envelope = Math.sin(Math.PI * i / count) ** 0.45;
      const texture = Math.sin(i * 1.63 + time * 0.008) * 0.58
        + Math.sin(i * 0.71 - time * 0.012) * 0.34
        + Math.sin(i * 2.4 + time * 0.004) * 0.18;
      const y = Math.max(2, Math.min(22, 12 + texture * amplitude * envelope));
      points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    wavePath.setAttribute("d", points.join(" "));
  }

  function tickWave(now) {
    if (speaking) {
      // The local preview uses a gentle fallback envelope. A real audio
      // analyser can supply its level through HorizonMascot.setAudioLevel.
      if (externalAudioLevel !== null) {
        audioLevel = externalAudioLevel;
      } else {
        const pulse = 0.5 + 0.5 * Math.sin(now / 190);
        const syllable = 0.5 + 0.5 * Math.sin(now / 71 + 0.8);
        audioLevel = Math.max(audioLevel * 0.88, 0.08 + pulse * syllable * 0.7);
      }
    } else {
      audioLevel *= 0.82;
    }
    drawWave(audioLevel, now);
    if (speaking || audioLevel > 0.025) waveFrame = requestAnimationFrame(tickWave);
    else {
      waveFrame = 0;
      drawWave(0, now);
    }
  }

  function setSpeaking(value) {
    speaking = Boolean(value);
    if (!speaking) externalAudioLevel = null;
    stage.classList.toggle("is-speaking", speaking);
    status.textContent = speaking ? "Horizon falando" : "por aqui com você";
    if (speaking && !waveFrame) waveFrame = requestAnimationFrame(tickWave);
    if (!speaking && !waveFrame) drawWave(0, performance.now());
  }

  // Hook for the real voice pipeline: pass an audio level from 0 to 1, then
  // toggle speaking while assistant audio is playing.
  window.HorizonMascot = {
    setAudioLevel(level) {
      externalAudioLevel = Math.max(0, Math.min(1, Number(level) || 0));
      audioLevel = externalAudioLevel;
      if (!waveFrame) waveFrame = requestAnimationFrame(tickWave);
    },
    setSpeaking,
    lookAtDirection: showDirection,
  };

  function scrollConversationToBottom() {
    conversation.scrollTo({ top: conversation.scrollHeight, behavior: "smooth" });
  }

  function addMessage(role, text) {
    const article = document.createElement("article");
    article.className = `message ${role}`;
    if (role === "assistant") {
      const avatar = document.createElement("span");
      avatar.className = "message-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = "h";
      article.append(avatar);
    }
    const body = document.createElement("div");
    body.className = "message-body";
    if (role === "assistant") {
      const label = document.createElement("span");
      label.className = "message-role";
      label.textContent = "Horizon";
      body.append(label);
    }
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    body.append(paragraph);
    article.append(body);
    messageList.append(article);
    scrollConversationToBottom();
  }

  function demoReply() {
    return "Recebi sua mensagem. Esta prévia já mostra o Horizon acompanhando o cursor e modulando a faixa central durante a resposta. Para conversar de verdade, ainda falta conectar o modelo de IA da plataforma.";
  }

  function setConversationTitle(text) {
    const title = text.trim().replace(/\s+/g, " ").slice(0, 26) || "Uma ideia nova";
    document.getElementById("topTitle").textContent = title;
    document.querySelectorAll(".recent-item").forEach((item) => item.classList.remove("selected"));
    const firstRecent = document.querySelector(".recent-item");
    firstRecent.querySelector("span:last-child").textContent = title;
    firstRecent.classList.add("selected");
  }

  async function sendMessage(text) {
    const message = text.trim();
    if (!message || sendButton.disabled) return;
    welcome.hidden = true;
    addMessage("user", message);
    if (messageList.children.length === 1) setConversationTitle(message);
    input.value = "";
    input.style.height = "auto";
    sendButton.disabled = true;
    typing.classList.add("visible");
    setSpeaking(false);

    let reply;
    if (window.HORIZON_CHAT_ENDPOINT) {
      try {
        const response = await fetch(window.HORIZON_CHAT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        if (!response.ok) throw new Error("A resposta não chegou.");
        const payload = await response.json();
        reply = payload.reply || payload.message || "Recebi sua mensagem.";
      } catch {
        reply = "Não consegui alcançar o serviço de conversa agora. Tente novamente daqui a pouco.";
      }
    } else {
      // Local UI preview only. The production chat endpoint can be configured
      // without changing the mascot interaction component.
      await new Promise((resolve) => { demoTimer = window.setTimeout(resolve, 950); });
      reply = demoReply();
    }
    typing.classList.remove("visible");
    addMessage("assistant", reply);
    setSpeaking(true);
    window.setTimeout(() => setSpeaking(false), 4200);
    sendButton.disabled = false;
    input.focus();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 145)}px`;
  });
  input.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => sendMessage(button.dataset.prompt));
  });
  document.getElementById("newChat").addEventListener("click", () => {
    clearTimeout(demoTimer);
    messageList.replaceChildren();
    welcome.hidden = false;
    typing.classList.remove("visible");
    input.value = "";
    input.style.height = "auto";
    sendButton.disabled = false;
    setSpeaking(false);
    document.getElementById("topTitle").textContent = "Uma ideia nova";
    sidebar.classList.remove("open");
    input.focus();
  });

  document.querySelectorAll(".recent-item").forEach((item) => {
    item.addEventListener("click", () => {
      showToast("O histórico de conversas entra na próxima etapa.");
      sidebar.classList.remove("open");
    });
  });
  document.querySelectorAll("[data-inert-link], [data-toast]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(button.dataset.toast || "Esse espaço pode ganhar mais recursos depois.");
    });
  });
  document.getElementById("mobileMenu").addEventListener("click", () => sidebar.classList.toggle("open"));
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      input.focus();
    }
    if (event.key === "Escape") sidebar.classList.remove("open");
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2300);
  }

  showDirection(0);
})();
