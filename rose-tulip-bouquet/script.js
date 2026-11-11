
"use strict";

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

  // Check required HTML elements
  const requiredElements = [
    intro,
    reveal,
    giftButton,
    particleLayer,
    bouquet,
    letterButton,
    letter,
    envelopeHint
  ];

  if (requiredElements.some(element => !element)) {
    console.error(
      "Website setup error: One or more required HTML elements are missing."
    );
    return;
  }

  // FLOATING HEARTS

  function burstHearts(count = 22) {

    const symbols = ["♡", "♥", "❤"];

    for (let i = 0; i < count; i++) {

      const heart = document.createElement("span");

      heart.className = "float-heart";

      heart.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

      heart.style.left = `${8 + Math.random() * 84}%`;
      heart.style.top = `${45 + Math.random() * 35}%`;
      heart.style.animationDelay = `${Math.random() * .45}s`;
      heart.style.fontSize = `${13 + Math.random() * 17}px`;

      particleLayer.appendChild(heart);

      heart.addEventListener(
        "animationend",
        () => heart.remove(),
        { once: true }
      );

    }

  }


  // FALLING PETALS

  function makePetal() {

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


  // OPENING GIFT

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

    }, 850);

  });


  // MAKE BOUQUET BLOOM

  const bloomButton = $("bloom-button");

  if (bloomButton) {

    bloomButton.addEventListener("click", () => {

      bouquet.classList.remove("blooming");

      void bouquet.offsetWidth;

      bouquet.classList.add("blooming");

      burstHearts(12);

    });

  }


  // SEND HEART

  const heartButton = $("heart-button");

  if (heartButton) {

    heartButton.addEventListener("click", () => {
      burstHearts(30);
    });

  }


  // OPEN LOVE LETTER

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


  // CLOSE LOVE LETTER

  const closeLetter = $("close-letter");

  if (closeLetter) {

    closeLetter.addEventListener("click", () => {

      letter.hidden = true;

      letterButton.classList.remove("open");

      letterButton.setAttribute(
        "aria-expanded",
        "false"
      );

      envelopeHint.textContent =
        "Tap the envelope to open your letter";

    });

  }


  // ORIGINAL BACKGROUND MELODY

  let audioContext = null;
  let melodyTimer = null;
  let noteIndex = 0;
  let masterGain = null;

  const melody = [

    [523.25, .34],
    [659.25, .34],
    [783.99, .5],
    [659.25, .34],

    [587.33, .34],
    [698.46, .34],
    [880.00, .55],
    [698.46, .4],

    [523.25, .34],
    [659.25, .34],
    [783.99, .5],
    [1046.5, .65],

    [880.00, .34],
    [783.99, .34],
    [659.25, .65],
    [587.33, .65]

  ];


  // PLAY INDIVIDUAL NOTES

  function playNote(frequency, duration) {

    if (!audioContext || !masterGain) return;

    const now = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";

    osc.frequency.setValueAtTime(
      frequency,
      now
    );

    gain.gain.setValueAtTime(.0001, now);

    gain.gain.exponentialRampToValueAtTime(
      .075,
      now + .035
    );

    gain.gain.exponentialRampToValueAtTime(
      .0001,
      now + duration
    );

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + .03);

  }


  // START MUSIC

  async function startMusic() {

    const AudioCtx =
      window.AudioContext ||
      window.webkitAudioContext;

    const musicLabel = $("music-label");
    const musicButton = $("music-button");

    if (!AudioCtx) {

      musicLabel.textContent =
        "Audio isn't supported here";

      return;

    }

    try {

      audioContext = audioContext || new AudioCtx();

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (!masterGain) {

        masterGain = audioContext.createGain();

        masterGain.gain.value = .55;

        masterGain.connect(audioContext.destination);

      } else {

        masterGain.gain.cancelScheduledValues(
          audioContext.currentTime
        );

        masterGain.gain.setTargetAtTime(
          .55,
          audioContext.currentTime,
          .05
        );

      }

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


  // STOP MUSIC

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
        .0001,
        audioContext.currentTime,
        .06
      );

    }

    const musicButton = $("music-button");
    const musicLabel = $("music-label");

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


  // MUSIC BUTTON

  const musicButton = $("music-button");

  if (musicButton) {

    musicButton.addEventListener("click", () => {

      if (melodyTimer !== null) {
        stopMusic();
      } else {
        startMusic();
      }

    });

  }


  // REPLAY SURPRISE

  const restartButton = $("restart-button");

  if (restartButton) {

    restartButton.addEventListener("click", () => {

      stopMusic();

      reveal.hidden = true;

      intro.hidden = false;

      intro.classList.remove("opening");

      giftButton.disabled = false;

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

  }


  console.log("🌷 Rose & Tulip Bouquet website loaded successfully!");

});
