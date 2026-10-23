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

    // ===================== ARTICLES : enrichissement + lecture infinie =====================
    const firstArt = document.querySelector(".art");
    if (firstArt) {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // --- temps de lecture + reveal sur un .art donné ---
      function enhanceArticle(art) {
        const slot = art.querySelector(".art__readtime");
        if (slot) {
          const words = art.innerText.trim().split(/\s+/).length;
          slot.textContent =
            Math.max(1, Math.round(words / 200)) + " min de lecture";
        }
        if (!reduce && "IntersectionObserver" in window) {
          const targets = art.querySelectorAll(
            "p, blockquote, .art__block, h2",
          );
          targets.forEach((t) => t.classList.add("reveal"));
          const io = new IntersectionObserver(
            (entries, obs) => {
              entries.forEach((e) => {
                if (e.isIntersecting) {
                  e.target.classList.add("is-in");
                  obs.unobserve(e.target);
                }
              });
            },
            { rootMargin: "0px 0px -10% 0px" },
          );
          targets.forEach((t) => io.observe(t));
        }
      }

      // --- sommaire : uniquement sur le 1er article ---
      // --- sommaire dynamique : suit l'article courant ---
      const tocList = document.querySelector(".art-toc__list");
      const tocNav = document.querySelector(".art-toc");
      let sectionSpy = null;
      let idc = 0;

      function showTocFor(art) {
        if (!tocList) return;
        const heads = art.querySelectorAll("h2");
        tocList.innerHTML = "";
        if (sectionSpy) sectionSpy.disconnect();
        if (!heads.length) {
          if (tocNav) tocNav.style.display = "none";
          return;
        }
        if (tocNav) tocNav.style.display = "";
        heads.forEach((h) => {
          if (!h.id) h.id = "sec-" + idc++;
          const li = document.createElement("li");
          li.innerHTML =
            '<a class="art-toc__link" href="#' +
            h.id +
            '">' +
            h.textContent +
            "</a>";
          tocList.appendChild(li);
        });
        const links = tocList.querySelectorAll(".art-toc__link");
        sectionSpy = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                links.forEach((l) => l.classList.remove("is-active"));
                const a = tocList.querySelector(
                  'a[href="#' + e.target.id + '"]',
                );
                if (a) a.classList.add("is-active");
              }
            });
          },
          { rootMargin: "-10% 0px -50% 0px" },
        );
        heads.forEach((h) => sectionSpy.observe(h));
      }

      // détecte quel article occupe le centre de l'écran → bascule le sommaire
      let currentArt = null;
      const artObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && e.target !== currentArt) {
              currentArt = e.target;
              showTocFor(e.target);
            }
          });
        },
        { rootMargin: "-45% 0px 20% 0px" },
      );
      artObserver.observe(firstArt);
      showTocFor(firstArt); // affiche tout de suite celui du 1er
      // --- cartes "à lire aussi" d'un .art (3 au hasard) ---
      function fillRelated(art) {
        const relList = art.querySelector(".related__list");
        if (!relList) return;
        let pool = ARTICLES.filter((a) => !loaded.has(a.href));
        if (pool.length < 3) pool = ARTICLES.slice();
        for (let k = pool.length - 1; k > 0; k--) {
          const j = Math.floor(Math.random() * (k + 1));
          [pool[k], pool[j]] = [pool[j], pool[k]];
        }
        relList.innerHTML = pool
          .slice(0, 3)
          .map(
            (a) =>
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
              '" class="lcard__cta">Découvrir</a></article></div>',
          )
          .join("");
      }

      // --- suivi des articles déjà chargés ---
      const loaded = new Set();
      loaded.add(location.pathname.split("/").pop() || "index.html");
      function pickNext() {
        let pool = ARTICLES.filter((a) => !loaded.has(a.href));
        if (!pool.length) pool = ARTICLES.slice();
        return pool[Math.floor(Math.random() * pool.length)];
      }

      // --- prépare la pilule "article suivant" et la place en tout dernier ---
      function setPill(art, article) {
        const pill = art.querySelector(".next-article");
        if (!pill || !article) return null;
        pill.setAttribute("href", article.href);
        const t = pill.querySelector(".next-article__title");
        if (t) t.textContent = article.title + " — " + article.sub;
        art.appendChild(pill); // la pilule descend tout en bas
        pill.addEventListener("click", (e) => {
          e.preventDefault();
          loadNext();
        });
        return pill;
      }

      // init 1er article
      enhanceArticle(firstArt);
      fillRelated(firstArt);
      let pending = pickNext();
      loaded.add(pending.href);
      let currentPill = setPill(firstArt, pending);

      // --- moteur de la lecture infinie ---
      let pull = 0,
        busy = false;
      const threshold = 700;
      const atBottom = () =>
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      const feedback = () => {
        if (currentPill)
          currentPill.style.setProperty(
            "--pull",
            Math.min(pull / threshold, 1),
          );
      };

      async function loadNext() {
        if (busy || !pending) return;
        busy = true;
        if (currentPill) currentPill.classList.add("is-loading");
        try {
          const res = await fetch(pending.href);
          const doc = new DOMParser().parseFromString(
            await res.text(),
            "text/html",
          );
          const art = doc.querySelector(".art");
          if (!art) {
            busy = false;
            return;
          }
          const toc = art.querySelector(".art-toc"); // pas de 2e sommaire
          if (toc) toc.remove();
          fillRelated(art);
          const next = pickNext();
          loaded.add(next.href);
          const newPill = setPill(art, next);
          art.classList.add("art--incoming");
          firstArt.parentNode.appendChild(art);
          artObserver.observe(art); // le nouvel article entre dans le suivi du sommaire
          requestAnimationFrame(() => art.classList.add("art--in"));
          enhanceArticle(art);
          pending = next;
          currentPill = newPill;
          pull = 0;
        } catch (err) {
          if (pending) window.location.href = pending.href; // secours : navigation
        } finally {
          busy = false;
        }
      }

      window.addEventListener(
        "wheel",
        (e) => {
          if (busy) return;
          if (e.deltaY > 0 && atBottom()) {
            pull += e.deltaY;
            feedback();
            if (pull >= threshold) loadNext();
          } else if (e.deltaY < 0) {
            pull = 0;
            feedback();
          }
        },
        { passive: true },
      );
    }
  })();
});
