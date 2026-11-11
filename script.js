document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const openGiftButton = document.getElementById("open-gift");
  const revealContent = document.getElementById("reveal-content");
  const particleLayer = document.getElementById("particle-layer");

  const bouquet = document.getElementById("bouquet");
  const bloomButton = document.getElementById("bloom-button");
  const heartButton = document.getElementById("heart-button");

  const letterButton = document.getElementById("letter-button");
  const letter = document.getElementById("letter");
  const closeLetterButton = document.getElementById("close-letter");
  const envelopeHint = document.getElementById("envelope-hint");

  const musicButton = document.getElementById("music-button");
  const musicLabel = document.getElementById("music-label");
  const restartButton = document.getElementById("restart-button");

  const requiredElements = [
    intro,
    openGiftButton,
    revealContent,
    particleLayer,
    bouquet,
    bloomButton,
    heartButton,
    letterButton,
    letter,
    closeLetterButton,
    musicButton,
    musicLabel,
    restartButton
  ];

  if (requiredElements.some(element => !element)) {
    console.error("Website setup error: One or more HTML elements are missing.");
    return;
  }

  let giftOpened = false;
  let petalInterval = null;

  let audioContext = null;
  let musicPlaying = false;
  let musicTimer = null;
  let melodyIndex = 0;

  /* OPEN GIFT */

  openGiftButton.addEventListener("click", () => {
    if (giftOpened) return;

    giftOpened = true;
    intro.classList.add("opening");

    createPetals(18);

    setTimeout(() => {
      intro.hidden = true;
      revealContent.hidden = false;

      createPetals(25);
      startPetalRain();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 1000);
  });

  /* FLOATING PETALS */

  function createPetal() {
    const petal = document.createElement("span");

    petal.className = "petal";

    petal.style.left = Math.random() * 100 + "vw";
    petal.style.animationDuration = (5 + Math.random() * 5) + "s";
    petal.style.setProperty(
      "--drift",
      (Math.random() * 180 - 90) + "px"
    );

    petal.style.opacity = 0.4 + Math.random() * 0.5;
    petal.style.transform = `rotate(${Math.random() * 360}deg)`;

    particleLayer.appendChild(petal);

    setTimeout(() => {
      petal.remove();
    }, 11000);
  }

  function createPetals(amount) {
    for (let i = 0; i < amount; i++) {
      setTimeout(createPetal, i * 100);
    }
  }

  function startPetalRain() {
    if (petalInterval) {
      clearInterval(petalInterval);
    }

    petalInterval = setInterval(() => {
      createPetal();
    }, 650);
  }

  /* FLOATING HEARTS */

  function createHeart() {
    const heart = document.createElement("span");

    heart.className = "float-heart";
    heart.textContent = ["♡", "♥", "💕", "💗"][
      Math.floor(Math.random() * 4)
    ];

    heart.style.left = (10 + Math.random() * 80) + "vw";
    heart.style.top = (45 + Math.random() * 35) + "vh";

    particleLayer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 2500);
  }

  heartButton.addEventListener("click", () => {
    for (let i = 0; i < 12; i++) {
      setTimeout(createHeart, i * 100);
    }
  });

  /* BOUQUET BLOOM */

  bloomButton.addEventListener("click", () => {
    bouquet.classList.remove("blooming");

    void bouquet.offsetWidth;

    bouquet.classList.add("blooming");

    createPetals(15);

    setTimeout(() => {
      bouquet.classList.remove("blooming");
    }, 1000);
  });

  /* OPEN LOVE LETTER */

  letterButton.addEventListener("click", () => {
    const isOpen = letterButton.classList.toggle("open");

    letter.hidden = !isOpen;
    letterButton.setAttribute("aria-expanded", String(isOpen));

    envelopeHint.textContent = isOpen
      ? "Your little letter is open ♡"
      : "Tap the envelope to open your letter";

    if (isOpen) {
      setTimeout(() => {
        letter.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 200);
    }
  });

  /* CLOSE LOVE LETTER */

  closeLetterButton.addEventListener("click", () => {
    letter.hidden = true;
    letterButton.classList.remove("open");

    letterButton.setAttribute("aria-expanded", "false");

    envelopeHint.textContent = "Tap the envelope to open your letter";

    letterButton.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });

  /* BACKGROUND MELODY */

  const melody = [
    261.63, 329.63, 392.00, 329.63,
    293.66, 349.23, 440.00, 349.23,
    261.63, 329.63, 392.00, 523.25,
    440.00, 392.00, 329.63, 293.66
  ];

  function playNote(frequency, duration = 0.35) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.08,
      audioContext.currentTime + 0.04
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  function playMelodyStep() {
    if (!musicPlaying) return;

    const frequency = melody[melodyIndex];

    playNote(frequency, 0.32);

    melodyIndex = (melodyIndex + 1) % melody.length;

    musicTimer = setTimeout(playMelodyStep, 400);
  }

  async function startMusic() {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        musicLabel.textContent = "Music is not supported";
        return;
      }

      if (!audioContext) {
        audioContext = new AudioContextClass();
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      musicPlaying = true;
      melodyIndex = 0;

      musicButton.classList.add("playing");
      musicButton.setAttribute("aria-pressed", "true");
      musicLabel.textContent = "Pause the melody";

      playMelodyStep();

    } catch (error) {
      console.error("Unable to start music:", error);
      musicLabel.textContent = "Unable to play melody";
    }
  }

  function stopMusic() {
    musicPlaying = false;

    clearTimeout(musicTimer);

    musicButton.classList.remove("playing");
    musicButton.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Play a little melody";
  }

  musicButton.addEventListener("click", () => {
    if (musicPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  });

  /* REPLAY SURPRISE */

  restartButton.addEventListener("click", () => {
    stopMusic();

    clearInterval(petalInterval);
    petalInterval = null;

    particleLayer.innerHTML = "";

    letter.hidden = true;
    letterButton.classList.remove("open");
    letterButton.setAttribute("aria-expanded", "false");

    envelopeHint.textContent = "Tap the envelope to open your letter";

    bouquet.classList.remove("blooming");

    revealContent.hidden = true;

    intro.hidden = false;
    intro.classList.remove("opening");

    giftOpened = false;

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

});
