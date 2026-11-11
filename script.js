
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

  // Check required HTML elements
  const requiredElements = [
    intro,
    reveal,
    giftButton,
    particleLayer,
    bouquet,
    letterButton,
    letter,
    envelopeHint,
    musicButton,
    musicLabel,
    $("bloom-button"),
    $("heart-button"),
    $("close-letter"),
    $("restart-button")
  ];

  if (requiredElements.some(element => !element)) {
    console.error("Some required website HTML elements are missing.");
    return;
  }

  // =====================================
  // FLOATING HEARTS
  // =====================================

  function burstHearts(count = 22) {
    const symbols = ["♡", "♥", "❤"];

    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");

      heart.className = "float-heart";
      heart.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

      heart.style.left = `${8 + Math.random() * 84}%`;
      heart.style.top = `${45 + Math.random() * 35}%`;

      heart.style.animationDelay =
        `${Math.random() * .45}s`;

      heart.style.fontSize =
        `${13 + Math.random() * 17}px`;

      particleLayer.appendChild(heart);

      heart.addEventListener(
        "animationend",
        () => heart.remove(),
        { once: true }
      );
    }
  }

  // =====================================
  // FALLING FLOWER PETALS
  // =====================================

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function makePetal() {
    if (
      document.hidden ||
      reducedMotion.matches ||
      !particleLayer
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
      `${Math.random() * 1.5}s`;

    particleLayer.appendChild(petal);

    petal.addEventListener(
      "animationend",
      () => petal.remove(),
      { once: true }
    );
  }

  // Keep the background petals running without creating
  // too many elements.
  const petalInterval = window.setInterval(makePetal, 850);

  // =====================================
  // GIFT OPENING
  // =====================================

  giftButton.addEventListener("click", () => {
    if (giftButton.disabled) return;

    giftButton.disabled = true;

    intro.classList.add("opening");

    burstHearts(28);

    window.setTimeout(() => {
      intro.hidden = true;
      reveal.hidden = false;

      // Start the bouquet's flower-opening animation.
      bouquet.classList.remove("blooming");
      void bouquet.offsetWidth;
      bouquet.classList.add("blooming");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      // Extra falling petals after the reveal.
      for (let i = 0; i < 18; i++) {
        window.setTimeout(makePetal, i * 100);
      }
    }, 850);
  });

  // =====================================
  // FLOWER BLOOM BUTTON
  // =====================================

  $("bloom-button").addEventListener("click", () => {
    bouquet.classList.remove("blooming");

    // Restart the bloom animation.
    void bouquet.offsetWidth;

    bouquet.classList.add("blooming");

    burstHearts(16);
  });

  // =====================================
  // SEND A HEART BUTTON
  // =====================================

  $("heart-button").addEventListener("click", () => {
    burstHearts(30);
  });

  // =====================================
  // LOVE LETTER / ENVELOPE
  // =====================================

  letterButton.addEventListener("click", () => {
    const opening =
      !letterButton.classList.contains("open");

    letterButton.classList.toggle("open", opening);

    letterButton.setAttribute(
      "aria-expanded",
      String(opening)
    );

    letter.hidden = !opening;

    envelopeHint.textContent = opening
      ? "A little something, from the heart ♡"
      : "Tap the envelope to open your letter";

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

  $("close-letter").addEventListener("click", () => {
    letter.hidden = true;

    letterButton.classList.remove("open");

    letterButton.setAttribute(
      "aria-expanded",
      "false"
    );

    envelopeHint.textContent =
      "Tap the envelope to open your letter";
  });

  // =====================================
  // ORIGINAL ROMANTIC BACKGROUND MELODY
  // =====================================

  let audioContext = null;
  let masterGain = null;
  let melodyTimer = null;
  let noteIndex = 0;

  // Original gentle melody.
  // Each number is a musical frequency in Hz.
  const melody = [
    [523.25, 0.42],
    [659.25, 0.42],
    [783.99, 0.60],
    [659.25, 0.42],

    [587.33, 0.42],
    [698.46, 0.42],
    [880.00, 0.65],
    [698.46, 0.50],

    [523.25, 0.42],
    [659.25, 0.42],
    [783.99, 0.60],
    [1046.50, 0.75],

    [880.00, 0.42],
    [783.99, 0.42],
    [659.25, 0.65],
    [587.33, 0.75]
  ];

  function playNote(frequency, duration) {
    if (!audioContext || !masterGain) return;

    const now = audioContext.currentTime;

    const oscillator =
      audioContext.createOscillator();

    const noteGain =
      audioContext.createGain();

    // Soft bell-like tone.
    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      frequency,
      now
    );

    // Smooth volume envelope.
    noteGain.gain.setValueAtTime(
      0.0001,
      now
    );

    noteGain.gain.exponentialRampToValueAtTime(
      0.055,
      now + 0.06
    );

    noteGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    oscillator.connect(noteGain);
    noteGain.connect(masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  async function startMusic() {
    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      musicLabel.textContent =
        "Audio is not supported in this browser";

      return;
    }

    try {
      // Create the audio system once.
      if (!audioContext) {
        audioContext = new AudioContextClass();

        masterGain = audioContext.createGain();

        masterGain.gain.value = 0.0001;

        masterGain.connect(
          audioContext.destination
        );
      }

      // Important for Safari and mobile browsers.
      if (audioContext.state !== "running") {
        await audioContext.resume();
      }

      if (audioContext.state !== "running") {
        throw new Error("Audio context did not start.");
      }

      masterGain.gain.cancelScheduledValues(
        audioContext.currentTime
      );

      masterGain.gain.setTargetAtTime(
        0.35,
        audioContext.currentTime,
        0.15
      );

      // Play the first note immediately.
      const [frequency, duration] =
        melody[noteIndex];

      playNote(frequency, duration);

      noteIndex =
        (noteIndex + 1) % melody.length;

      // Continue the melody.
      melodyTimer = window.setInterval(() => {
        const [nextFrequency, nextDuration] =
          melody[noteIndex];

        playNote(
          nextFrequency,
          nextDuration
        );

        noteIndex =
          (noteIndex + 1) % melody.length;

      }, 470);

      musicButton.classList.add("playing");

      musicButton.setAttribute(
        "aria-pressed",
        "true"
      );

      musicLabel.textContent =
        "Pause the little melody ♡";

    } catch (error) {
      console.error("Music playback error:", error);

      musicLabel.textContent =
        "Tap to try playing again";
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
        0.12
      );
    }

    musicButton.classList.remove("playing");

    musicButton.setAttribute(
      "aria-pressed",
      "false"
    );

    musicLabel.textContent =
      "Play a little melody ♡";
  }

  musicButton.addEventListener("click", () => {
    if (melodyTimer !== null) {
      stopMusic();
    } else {
      startMusic();
    }
  });

  // =====================================
  // REPLAY THE SURPRISE
  // =====================================

  $("restart-button").addEventListener("click", () => {
    stopMusic();

    reveal.hidden = true;
    intro.hidden = false;

    intro.classList.remove("opening");

    giftButton.disabled = false;

    // Reset bouquet animation.
    bouquet.classList.remove("blooming");

    // Reset letter.
    letter.hidden = true;

    letterButton.classList.remove("open");

    letterButton.setAttribute(
      "aria-expanded",
      "false"
    );

    envelopeHint.textContent =
      "Tap the envelope to open your letter";

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  console.log(
    "🌷 Rose & Tulip Bouquet initialized successfully!"
  );
});
