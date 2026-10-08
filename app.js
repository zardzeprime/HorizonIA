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
    const angle = direction * Math.PI / 8;
    const pitch = Math.cos(angle) * 9;
    const yaw = Math.sin(angle) * -7;
    const tilt = `perspective(700px) rotateX(${pitch.toFixed(1)}deg) rotateY(${yaw.toFixed(1)}deg)`;
    frame.style.backgroundPosition = `${-col * frameSize.width}px ${-row * frameSize.height}px`;
    stage.style.transform = tilt;
    document.querySelectorAll(".message-avatar").forEach((avatar) => {
      avatar.style.backgroundPosition = `${-col * 48}px ${-row * 52}px`;
      avatar.style.transform = tilt;
    });
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
    let pathData;
    if (level < 0.025) {
      pathData = "M 4 12 H 116";
    } else {
      const points = [];
      const count = 48;
      const amplitude = Math.min(6.4, 0.7 + level * 7);
      for (let i = 0; i <= count; i += 1) {
        const x = 4 + (112 * i / count);
        const envelope = Math.sin(Math.PI * i / count) ** 0.55;
        const texture = Math.sin(i * 0.88 + time * 0.0048) * 0.56
          + Math.sin(i * 0.39 - time * 0.0061) * 0.29
          + Math.sin(i * 1.27 + time * 0.0032) * 0.15;
        const y = Math.max(3, Math.min(21, 12 + texture * amplitude * envelope));
        points.push({ x, y });
      }
      pathData = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < points.length - 1; i += 1) {
        const midpointX = (points[i].x + points[i + 1].x) / 2;
        const midpointY = (points[i].y + points[i + 1].y) / 2;
        pathData += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${midpointX.toFixed(1)} ${midpointY.toFixed(1)}`;
      }
      const last = points[points.length - 1];
      pathData += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
    }
    [wavePath, ...document.querySelectorAll(".message-wave path")].forEach((path) => {
      path.setAttribute("d", pathData);
    });
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
        const targetLevel = 0.04 + pulse * syllable * 0.48;
        audioLevel += (targetLevel - audioLevel) * (targetLevel > audioLevel ? 0.22 : 0.1);
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
      avatar.setAttribute("role", "img");
      avatar.setAttribute("aria-label", "Mascote Horizon");
      avatar.style.backgroundPosition = `${-(direction % 4) * 48}px ${-Math.floor(direction / 4) * 52}px`;
      avatar.innerHTML = '<svg class="message-wave" viewBox="0 0 120 24" aria-hidden="true"><path d="M 4 12 H 116" /></svg>';
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
