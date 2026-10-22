import { ARTICLES } from "./articles.js";

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
  document
    .querySelectorAll(".music_list, .fashion_list, .culture_list")
    .forEach((slider) => {
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
  const palette = ["#FF3300", "#0A4CE0", "#FFCA00", "#FFCDFF"];
  const glitch = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@!*<>";

  document.querySelectorAll(".bigfoot__line").forEach((line) => {
    // on enveloppe chaque lettre dans un span
    const text = line.textContent;
    line.innerHTML = "";
    [...text].forEach((c) => {
      const span = document.createElement("span");
      span.className = "ch";
      span.textContent = c;
      span.dataset.orig = c;
      line.appendChild(span);
    });

    const chars = line.querySelectorAll(".ch");
    line.addEventListener("mouseenter", () => {
      const mid = (chars.length - 1) / 2;
      chars.forEach((ch, i) => {
        const delay = Math.abs(i - mid) * 30; // vague depuis le centre
        setTimeout(() => {
          ch.style.color = palette[Math.floor(Math.random() * palette.length)];
          if (ch.dataset.orig.trim() && Math.random() > 0.5) {
            ch.textContent = glitch[Math.floor(Math.random() * glitch.length)];
            setTimeout(() => {
              ch.textContent = ch.dataset.orig;
            }, 180);
          }
          setTimeout(() => {
            ch.style.color = "";
          }, 300);
        }, delay);
      });
    });
  });
  /* ============ HEADER : Home intelligent + Back ============ */
  const home = document.querySelector(".header__home");
  const back = document.querySelector(".header__back");

  // est-on sur la page d'accueil ?
  const onHome =
    location.pathname.endsWith("index.html") ||
    location.pathname === "/" ||
    location.pathname.endsWith("/");

  if (home) {
    home.addEventListener("click", (e) => {
      if (onHome) {
        e.preventDefault(); // on reste sur la page
        window.scrollTo({ top: 0, behavior: "smooth" }); // remonte en haut
      }
      // sinon : le href="index.html" fait son travail → retour à l'accueil
    });
  }

  if (back) {
    back.addEventListener("click", (e) => {
      e.preventDefault();
      history.back(); // retour à la page précédente
    });
  }
  (function () {
    var art = document.querySelector(".art");
    if (!art) return;

    // A. Temps de lecture (≈200 mots/min)
    var slot = document.querySelector(".art__readtime");
    if (slot) {
      var words = art.innerText.trim().split(/\s+/).length;
      slot.textContent =
        Math.max(1, Math.round(words / 200)) + " min de lecture";
    }

    // C. Sommaire auto + surlignage de la section active
    var toc = document.querySelector(".art-toc__list");
    var heads = art.querySelectorAll("h2"); // ← seulement les h2 (dont "À lire aussi")
    if (toc && heads.length && "IntersectionObserver" in window) {
      heads.forEach(function (h, i) {
        if (!h.id) h.id = "sec-" + i;
        var li = document.createElement("li");
        li.innerHTML =
          '<a class="art-toc__link" href="#' +
          h.id +
          '">' +
          h.textContent +
          "</a>";
        toc.appendChild(li);
      });
      var links = toc.querySelectorAll(".art-toc__link");
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              links.forEach(function (l) {
                l.classList.remove("is-active");
              });
              var a = toc.querySelector('a[href="#' + e.target.id + '"]');
              if (a) a.classList.add("is-active");
            }
          });
        },
        { rootMargin: "-10% 0px -50% 0px" },
      );
      heads.forEach(function (h) {
        spy.observe(h);
      });
    }

    // B. Révélation au scroll (coupée si l'utilisateur réduit le mouvement)
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && "IntersectionObserver" in window) {
      var targets = art.querySelectorAll("p, blockquote, .art__block, h2");
      targets.forEach(function (t) {
        t.classList.add("reveal");
      });
      var io = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              obs.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0% 0px 0% 0px" },
      );
      targets.forEach(function (t) {
        io.observe(t);
      });
    }
  })();
  // E. Article suivant aléatoire
  // Base commune des articles
  var articles = ARTICLES;
  var current = location.pathname.split("/").pop();
  var pool = articles.filter(function (a) {
    return a.href !== current;
  });
  for (var k = pool.length - 1; k > 0; k--) {
    // mélange
    var j = Math.floor(Math.random() * (k + 1));
    var tmp = pool[k];
    pool[k] = pool[j];
    pool[j] = tmp;
  }

  // D. "À lire aussi" — 3 cartes au hasard, couleur selon la catégorie
  var relList = document.querySelector(".related__list");
  if (relList) {
    relList.innerHTML = pool
      .slice(0, 3)
      .map(function (a) {
        return (
          '<div class="related__item related__item--' +
          a.cat +
          '">' +
          '<article class="lcard"><div class="lcard__content">' +
          '<h3 class="lcard__title">' +
          a.title +
          "</h3>" +
          '<p class="lcard__sub">' +
          a.sub +
          "</p>" +
          '<p class="lcard__text">' +
          a.text +
          "</p>" +
          '</div><a href="' +
          a.href +
          '" class="lcard__cta">Découvrir</a></article></div>'
        );
      })
      .join("");
  }

  // E. Article suivant — 1 au hasard, différent des 3 ci-dessus
  var next = document.querySelector(".next-article");
  var np = pool[3] || pool[0];
  if (next && np) {
    next.href = np.href;
    var t = next.querySelector(".next-article__title");
    if (t) t.textContent = np.title + " — " + np.sub;
  }
});
