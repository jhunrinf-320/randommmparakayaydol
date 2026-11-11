
document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // ELEMENTS — MATCHED TO ORIGINAL index.html
  // ==========================================

  const $ = (id) => document.getElementById(id);

  const intro = $("intro");
  const reveal = $("reveal-content");
  const giftButton = $("open-gift");
  const particleLayer = $("particle-layer");
  const bouquet = $("bouquet");

  const bloomButton = $("bloom-button");
  const heartButton = $("heart-button");

  const letterButton = $("letter-button");
  const letter = $("letter");
  const envelopeHint = $("envelope-hint");
  const closeLetterButton = $("close-letter");

  const musicButton = $("music-button");
  const musicLabel = $("music-label");
  const restartButton = $("restart-button");

  // Check required HTML elements
  const requiredElements = {
    intro,
    reveal,
    giftButton,
    particleLayer,
    bouquet,
    bloomButton,
    heartButton,
    letterButton,
    letter,
    envelopeHint,
    closeLetterButton,
    musicButton,
    musicLabel,
    restartButton
  };

  const missingElements = Object.entries(requiredElements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error(
      "Website HTML is missing these elements:",
      missingElements
    );
  }

  // ==========================================
  // FLOATING HEARTS
  // ==========================================

  function burstHearts(count = 22) {
    if (!particleLayer) return;

    const symbols = ["♡", "♥", "❤"];

    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");

      heart.className = "float-heart";
      heart.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

      heart.style.left = `${8 + Math.random() * 84}%`;
      heart.style.top = `${45 + Math.random() * 35}%`;
      heart.style.animationDelay = `${Math.random() * 0.45}s`;
      heart.style.fontSize = `${13 + Math.random() * 17}px`;

      particleLayer.appendChild(heart);

      heart.addEventListener(
        "animationend",
        () => heart.remove(),
        { once: true }
      );
    }
  }

  // ==========================================
  // FALLING FLOWER PETALS
  // ==========================================

  function makePetal() {
    if (!particleLayer) return;

    if (
      document.hidden ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const petal = document.createElement("span");

    petal.className = "petal";

    petal.style.left = `${Math.random() * 100}%`;

    petal.style.setProperty(
      "--drift",
      `${-90 + Math.random() * 180}px`
    );

    petal.style.animationDuration =
      `${7 + Math.random() * 7}s`;

    petal.style.animationDelay =
      `${Math.random() * 2}s`;

    particleLayer.appendChild(petal);

    petal.addEventListener(
      "animationend",
      () => petal.remove(),
      { once: true }
    );
  }

  const petalInterval = window.setInterval(makePetal, 650);

  // ==========================================
  // OPEN GIFT
  // ==========================================

  if (giftButton && intro && reveal) {
    giftButton.addEventListener("click", () => {
      if (giftButton.disabled) return;

      giftButton.disabled = true;

      intro.classList.add("opening");

      burstHearts(28);

      window.setTimeout(() => {
        intro.hidden = true;
        reveal.hidden = false;

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

        for (let i = 0; i < 16; i++) {
          window.setTimeout(makePetal, i * 90);
        }
      }, 950);
    });
  }

  // ==========================================
  // MAKE THE BOUQUET BLOOM
  // ==========================================

  if (bloomButton && bouquet) {
    bloomButton.addEventListener("click", () => {
      bouquet.classList.remove("blooming");

      // Restart the CSS animation
      void bouquet.offsetWidth;

      bouquet.classList.add("blooming");

      burstHearts(12);
    });
  }

  // ==========================================
  // SEND A HEART
  // ==========================================

  if (heartButton) {
    heartButton.addEventListener("click", () => {
      burstHearts(30);
    });
  }

  // ==========================================
  // OPEN AND CLOSE LOVE LETTER
  // ==========================================

  function closeLetter() {
    if (!letter || !letterButton) return;

    letter.hidden = true;

    letterButton.classList.remove("open");

    letterButton.setAttribute(
      "aria-expanded",
      "false"
    );

    if (envelopeHint) {
      envelopeHint.textContent =
        "Tap the envelope to open your letter";
    }
  }

  if (letterButton && letter) {
    letterButton.addEventListener("click", () => {
      const opening =
        !letterButton.classList.contains("open");

      letterButton.classList.toggle("open", opening);

      letterButton.setAttribute(
        "aria-expanded",
        String(opening)
      );

      letter.hidden = !opening;

      if (envelopeHint) {
        envelopeHint.textContent = opening
          ? "A little something, from the heart ♡"
          : "Tap the envelope to open your letter";
      }

      if (opening) {
        window.setTimeout(() => {
          letter.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }, 350);

        burstHearts(9);
      }
    });
  }

  if (closeLetterButton) {
    closeLetterButton.addEventListener("click", closeLetter);
  }

  // ==========================================
  // ORIGINAL BACKGROUND MELODY
  // ==========================================

  let audioContext = null;
  let masterGain = null;
  let melodyTimer = null;
  let noteIndex = 0;

  const melody = [
    [523.25, 0.34],
    [659.25, 0.34],
    [783.99, 0.50],
    [659.25, 0.34],

    [587.33, 0.34],
    [698.46, 0.34],
    [880.00, 0.55],
    [698.46, 0.40],

    [523.25, 0.34],
    [659.25, 0.34],
    [783.99, 0.50],
    [1046.5, 0.65],

    [880.00, 0.34],
    [783.99, 0.34],
    [659.25, 0.65],
    [587.33, 0.65]
  ];

  function playNote(frequency, duration) {
    if (!audioContext || !masterGain) return;

    const now = audioContext.currentTime;

    const oscillator = audioContext.createOscillator();
    const noteGain = audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      frequency,
      now
    );

    noteGain.gain.setValueAtTime(0.0001, now);

    noteGain.gain.exponentialRampToValueAtTime(
      0.075,
      now + 0.035
    );

    noteGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    oscillator.connect(noteGain);
    noteGain.connect(masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  async function startMusic() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      if (musicLabel) {
        musicLabel.textContent =
          "Audio is not supported in this browser";
      }
      return;
    }

    try {
      if (!audioContext) {
        audioContext = new AudioContextClass();
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (!masterGain) {
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
      }

      masterGain.gain.cancelScheduledValues(
        audioContext.currentTime
      );

      masterGain.gain.setValueAtTime(
        0.55,
        audioContext.currentTime
      );

      playNote(
        melody[noteIndex][0],
        melody[noteIndex][1]
      );

      noteIndex = (noteIndex + 1) % melody.length;

      melodyTimer = window.setInterval(() => {
        const [frequency, duration] = melody[noteIndex];

        playNote(frequency, duration);

        noteIndex = (noteIndex + 1) % melody.length;
      }, 390);

      musicButton.classList.add("playing");

      musicButton.setAttribute(
        "aria-pressed",
        "true"
      );

      musicLabel.textContent =
        "Pause the little melody";

    } catch (error) {
      console.error("Music error:", error);

      musicLabel.textContent =
        "Unable to play music";
    }
  }

  function stopMusic() {
    if (melodyTimer !== null) {
      window.clearInterval(melodyTimer);
      melodyTimer = null;
    }

    if (masterGain && audioContext) {
      masterGain.gain.cancelScheduledValues(
        audioContext.currentTime
      );

      masterGain.gain.setTargetAtTime(
        0.0001,
        audioContext.currentTime,
        0.06
      );
    }

    if (musicButton) {
      musicButton.classList.remove("playing");

      musicButton.setAttribute(
        "aria-pressed",
        "false"
      );
    }

    if (musicLabel) {
      musicLabel.textContent =
        "Play a little melody";
    }
  }

  if (musicButton) {
    musicButton.addEventListener("click", () => {
      if (melodyTimer !== null) {
        stopMusic();
      } else {
        startMusic();
      }
    });
  }

  // ==========================================
  // REPLAY THE SURPRISE
  // ==========================================

  if (restartButton) {
    restartButton.addEventListener("click", () => {
      stopMusic();

      if (reveal) reveal.hidden = true;

      if (intro) {
        intro.hidden = false;
        intro.classList.remove("opening");
      }

      if (giftButton) {
        giftButton.disabled = false;
      }

      closeLetter();

      if (bouquet) {
        bouquet.classList.remove("blooming");
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  console.log("🌷 Rose & Tulip Bouquet initialized successfully!");
});
