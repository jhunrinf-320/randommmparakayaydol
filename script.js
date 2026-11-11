document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const intro = $("intro");
  const reveal = $("reveal-content");
  const giftButton = $("open-gift");
  const particleLayer = $("particle-layer");
  const bouquet = $("bouquet");
  const letterButton = $("letter-button");
  const letter = $("letter");
  const envelopeHint = $("envelope-hint");
  const musicButton = $("music-button");
  const musicLabel = $("music-label");

  if (
    !intro || !reveal || !giftButton || !particleLayer ||
    !bouquet || !letterButton || !letter || !envelopeHint ||
    !musicButton || !musicLabel
  ) {
    console.error("The page is missing one or more required HTML elements.");
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function burstHearts(count = 22) {
    if (reduceMotion.matches) return;

    const symbols = ["♡", "♥", "❤"];

    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");
      heart.className = "float-heart";
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      heart.style.left = `${8 + Math.random() * 84}%`;
      heart.style.top = `${45 + Math.random() * 35}%`;
      heart.style.animationDelay = `${Math.random() * 0.45}s`;
      heart.style.fontSize = `${13 + Math.random() * 17}px`;

      particleLayer.appendChild(heart);
      heart.addEventListener("animationend", () => heart.remove(), { once: true });
    }
  }

  function makePetal() {
    if (document.hidden || reduceMotion.matches) return;

    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--drift", `${-90 + Math.random() * 180}px`);
    petal.style.animationDuration = `${7 + Math.random() * 7}s`;
    petal.style.animationDelay = `${Math.random() * 2}s`;

    particleLayer.appendChild(petal);
    petal.addEventListener("animationend", () => petal.remove(), { once: true });
  }

  const petalInterval = window.setInterval(makePetal, 650);

  // Gift opening.
  giftButton.addEventListener("click", () => {
    if (giftButton.disabled) return;

    giftButton.disabled = true;
    intro.classList.add("opening");
    burstHearts(28);

    window.setTimeout(() => {
      intro.hidden = true;
      reveal.hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });

      for (let i = 0; i < 16; i++) {
        window.setTimeout(makePetal, i * 90);
      }
    }, 850);
  });

  // Bloom the complete bouquet.
  $("bloom-button")?.addEventListener("click", () => {
    bouquet.classList.remove("blooming");
    void bouquet.offsetWidth;
    bouquet.classList.add("blooming");
    burstHearts(12);
  });

  $("heart-button")?.addEventListener("click", () => burstHearts(30));

  // Open and close the letter.
  function closeLetter() {
    letter.hidden = true;
    letterButton.classList.remove("open");
    letterButton.setAttribute("aria-expanded", "false");
    envelopeHint.textContent = "Tap the envelope to open your letter";
  }

  letterButton.addEventListener("click", () => {
    const opening = !letterButton.classList.contains("open");

    letterButton.classList.toggle("open", opening);
    letterButton.setAttribute("aria-expanded", String(opening));
    letter.hidden = !opening;

    envelopeHint.textContent = opening
      ? "A little something, from the heart ♡"
      : "Tap the envelope to open your letter";

    if (opening) {
      window.setTimeout(() => {
        letter.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);

      burstHearts(9);
    }
  });

  $("close-letter")?.addEventListener("click", closeLetter);

  // Original gentle melody generated with the Web Audio API.
  let audioContext = null;
  let melodyTimer = null;
  let noteIndex = 0;
  let masterGain = null;

  const melody = [
    [523.25, 0.34], [659.25, 0.34], [783.99, 0.50], [659.25, 0.34],
    [587.33, 0.34], [698.46, 0.34], [880.00, 0.55], [698.46, 0.40],
    [523.25, 0.34], [659.25, 0.34], [783.99, 0.50], [1046.50, 0.65],
    [880.00, 0.34], [783.99, 0.34], [659.25, 0.65], [587.33, 0.65]
  ];

  function playNote(frequency, duration) {
    if (!audioContext || !masterGain) return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const noteGain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.075, now + 0.035);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(noteGain);
    noteGain.connect(masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  async function startMusic() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      musicLabel.textContent = "Audio isn't supported here";
      return;
    }

    try {
      audioContext = audioContext || new AudioContextClass();

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (!masterGain) {
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
      }

      masterGain.gain.cancelScheduledValues(audioContext.currentTime);
      masterGain.gain.setValueAtTime(0.55, audioContext.currentTime);

      const playNextNote = () => {
        const [frequency, duration] = melody[noteIndex];
        playNote(frequency, duration);
        noteIndex = (noteIndex + 1) % melody.length;
      };

      playNextNote();
      melodyTimer = window.setInterval(playNextNote, 390);

      musicButton.classList.add("playing");
      musicButton.setAttribute("aria-pressed", "true");
      musicLabel.textContent = "Pause the little melody";
    } catch (error) {
      console.error("Unable to start audio:", error);
      musicLabel.textContent = "Tap to try the melody again";
    }
  }

  function stopMusic() {
    if (melodyTimer !== null) {
      window.clearInterval(melodyTimer);
      melodyTimer = null;
    }

    if (masterGain && audioContext) {
      masterGain.gain.cancelScheduledValues(audioContext.currentTime);
      masterGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.06);
    }

    musicButton.classList.remove("playing");
    musicButton.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Play a little melody";
  }

  musicButton.addEventListener("click", () => {
    if (melodyTimer !== null) stopMusic();
    else startMusic();
  });

  // Replay the surprise from the beginning.
  $("restart-button")?.addEventListener("click", () => {
    stopMusic();
    reveal.hidden = true;
    intro.hidden = false;
    intro.classList.remove("opening");
    giftButton.disabled = false;

    bouquet.classList.remove("blooming");
    closeLetter();

    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("pagehide", () => {
    window.clearInterval(petalInterval);

    if (melodyTimer !== null) {
      window.clearInterval(melodyTimer);
    }

    if (audioContext && audioContext.state !== "closed") {
      audioContext.close();
    }
  }, { once: true });
});
