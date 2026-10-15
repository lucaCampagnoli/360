document.addEventListener("DOMContentLoaded", () => {
  /* ============ CURSEUR CUSTOM ============ */
  const cursor = document.querySelector(".cursor");
  if (cursor) {
    let mouseX = 0,
      mouseY = 0,
      posX = 0,
      posY = 0,
      prevX = 0,
      prevY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      posX += (mouseX - posX) * 0.35;
      posY += (mouseY - posY) * 0.35;
      const dx = posX - prevX,
        dy = posY - prevY;
      const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 30);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      cursor.style.left = posX + "px";
      cursor.style.top = posY + "px";
      cursor.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scaleX(${1 + speed / 20})`;
      prevX = posX;
      prevY = posY;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll("a, button, .card, .lcard").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () =>
        cursor.classList.remove("is-hover"),
      );
    });
  }

  /* ============ BANDEAU MUSIC : drag smooth + centrage ============ */
  document.querySelectorAll(".music_list, .fashion_list").forEach((slider) => {
    let isDown = false,
      startX = 0,
      scrollStart = 0;
    let targetScroll = 0,
      currentScroll = 0,
      rafId = null;

    window.addEventListener("load", () => {
      slider.scrollLeft = (slider.scrollWidth - slider.clientWidth) / 2;
    });
    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX;
      scrollStart = slider.scrollLeft;
      targetScroll = currentScroll = slider.scrollLeft;
      if (cursor) cursor.classList.add("is-grabbing");
      smoothScroll();
    });
    document.addEventListener("mouseup", () => {
      if (!isDown) return;
      isDown = false;
      if (cursor) cursor.classList.remove("is-grabbing");
      cancelAnimationFrame(rafId);
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      targetScroll = scrollStart - (e.pageX - startX) * 1.5;
    });
    function smoothScroll() {
      currentScroll += (targetScroll - currentScroll) * 0.12;
      slider.scrollLeft = currentScroll;
      if (isDown) rafId = requestAnimationFrame(smoothScroll);
    }
  });
  /* ============ HORLOGE LIVE DU TICKET ============ */
  const clock = document.querySelector(".receipt__clock");
  if (clock) {
    function tick() {
      const now = new Date();
      const date = now.toLocaleDateString("fr-CH");
      const time = now.toLocaleTimeString("fr-CH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      clock.textContent = date + "  " + time;
    }
    tick(); // affiche tout de suite
    setInterval(tick, 1000); // met à jour chaque seconde
  }
  const receipt = document.querySelector(".receipt");
  if (receipt) {
    const colors = [
      "--color-mode",
      "--color-musique",
      "--color-culture",
      "--color-theme",
    ];
    const root = getComputedStyle(document.documentElement);

    receipt.addEventListener("mouseenter", () => {
      const pick = colors[Math.floor(Math.random() * colors.length)];
      const color = root.getPropertyValue(pick).trim();
      receipt.style.background = color;
    });
    receipt.addEventListener("mouseleave", () => {
      receipt.style.background = "#fff"; // retour au blanc
    });
  }
});
