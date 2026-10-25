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
  // ===== SLIDER DE COUVERTURE =====
  const slider = document.querySelector("[data-slider]");
  if (slider) {
    const track = slider.querySelector(".slider__track");
    const imgMap = {
      "article.html": "durant-back.jpeg",
      "article-sza.html": "SZA.jpeg",
      "article-frank.html": "Frank.jpeg",
      "article-mertra.html": "mertra.jpeg",
      "article-doomsday.html": "doomsday.jpeg",
    };
    const imgFor = (a) =>
      "assets/images/" +
      (imgMap[a.href] ||
        a.href.replace("article-", "").replace(".html", "") + ".jpg");
    const label = (c) =>
      c === "music" ? "Musique" : c === "fashion" ? "Mode" : "Culture";
    const slide = (a) =>
      '<a class="slide slide--' +
      a.cat +
      '" href="' +
      a.href +
      '" style="background-image:url(\'' +
      imgFor(a) +
      "')\">" +
      '<div class="slide__inner">' +
      '<span class="slide__tag">' +
      label(a.cat) +
      "</span>" +
      '<span class="slide__title">' +
      a.title +
      "</span>" +
      '<span class="slide__cta">Lire l\'article →</span>' +
      "</div></a>";

    // toutes les slides + un clone de la 1re pour boucler sans saut
    track.innerHTML = ARTICLES.map(slide).join("") + slide(ARTICLES[0]);

    const n = ARTICLES.length;
    let i = 0;
    const move = () => {
      track.style.transition = "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
      track.style.transform = "translateX(-" + i * 100 + "%)";
    };
    setInterval(() => {
      i++;
      move();
      if (i === n) {
        // on est sur le clone → on repart à 0, invisible
        setTimeout(() => {
          track.style.transition = "none";
          i = 0;
          track.style.transform = "translateX(0)";
        }, 850);
      }
    }, 5000);
  }
  const header = document.querySelector(".header");
  if (header) {
    let scrolled = window.scrollY > 50;
    let nearTop = false;
    const update = () =>
      header.classList.toggle("is-visible", scrolled || nearTop);

    window.addEventListener(
      "scroll",
      () => {
        scrolled = window.scrollY > 50;
        update();
      },
      { passive: true },
    );

    window.addEventListener("mousemove", (e) => {
      nearTop = e.clientY < 200; // souris à moins de 60px du haut
      update();
    });

    update();
  }
  const burger = document.querySelector("[data-burger]");
  const hdr = document.querySelector(".header");
  if (burger && hdr) {
    burger.addEventListener("click", () => {
      const open = hdr.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open);
    });
    hdr
      .querySelectorAll(".header__home, .header__theme, .header__back")
      .forEach((a) =>
        a.addEventListener("click", () => {
          hdr.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
        }),
      );
  }
  const galleryEl = document.querySelector("[data-gallery]");
  if (galleryEl) {
    const LINKS = {
      sza: "article-sza.html",
      sz: "article-sza.html",
      frank: "article-frank.html",
      carti: "article-carti.html",
      pnd: "article-pnd.html",
      livealbum: "article-livealbum.html",
      lacy: "article-lacy.html",
      drake: "article-drake.html",
      travis: "article-travis.html",
      corteiz: "article-corteiz.html",
      mertra: "article-mertra.html",
      mer: "article-mertra.html",
      sneaker: "article-sneaker.html",
      schiaparelli: "article-schiaparelli.html",
      seoul: "article-seoul.html",
      victoria: "article-victoria.html",
      "stars-mode": "article-stars-mode.html",
      gucci: "article-gucci.html",
      durant: "article.html",
      "durant-back": "article.html",
      doomsday: "article-doomsday.html",
      f1: "article-f1.html",
      golf: "article-golf.html",
      a24: "article-a24.html",
      tennis: "article-tennis.html",
      letterboxd: "article-letterboxd.html",
      gaming: "article-gaming.html",
      nba: "article-nba.html",
      gorpcore: "article-gorpcore.html",
    };

    const IMAGES = [
      "SZA.jpeg",
      "SZ.jpg",
      "Frank.jpeg",
      "frank-2.jpg",
      "frank-3.jpg",
      "carti.jpg",
      "carti-2.jpg",
      "carti-3.jpg",
      "pnd.jpg",
      "pnd-2.jpg",
      "pnd-3.jpg",
      "livealbum.jpg",
      "livealbum-2.jpg",
      "livealbum-3.jpg",
      "lacy.jpg",
      "lacy-2.jpg",
      "lacy-3.jpg",
      "drake.jpg",
      "drake-2.jpg",
      "drake-3.jpg",
      "travis.jpg",
      "travis-2.jpg",
      "travis-3.jpg",
      "corteiz.jpg",
      "corteiz-2.jpg",
      "corteiz-3.jpg",
      "mertra.jpeg",
      "mer.jpg",
      "sneaker.jpg",
      "sneaker-2.jpg",
      "schiaparelli.jpg",
      "schiaparelli-2.jpg",
      "schiaparelli-3.jpg",
      "seoul.jpg",
      "seoul-2.jpg",
      "seoul-3.jpg",
      "victoria.jpg",
      "victoria-2.jpg",
      "victoria-3.jpg",
      "stars-mode.jpg",
      "stars-mode-2.jpg",
      "stars-mode-3.jpg",
      "gucci.jpg",
      "gucci-2.jpg",
      "gucci-3.jpg",
      "durant-back.jpeg",
      "durant.jpg",
      "durant-2.jpg",
      "doomsday.jpeg",
      "f1.jpg",
      "f1-2.jpg",
      "f1-3.jpg",
      "golf.jpg",
      "golf-2.jpg",
      "golf-3.jpg",
      "a24.jpg",
      "a24-2.jpg",
      "a24-3.jpg",
      "tennis.jpg",
      "tennis-2.jpg",
      "letterboxd.jpg",
      "letterboxd-2.jpg",
      "letterboxd-3.jpg",
      "gaming.jpg",
      "gaming-2.jpg",
      "gaming-3.jpg",
      "nba.jpg",
      "nba-2.jpg",
      "nba-3.jpg",
      "gorpcore.jpg",
      "gorpcore-2.jpg",
      "gorpcore-3.jpg",
      "k.jpg",
    ];

    const stemOf = (n) =>
      n
        .replace(/\.[^.]+$/, "")
        .replace(/-\d+$/, "")
        .toLowerCase();

    const itemHTML = (n) => {
      const href = LINKS[stemOf(n)];
      const img = `<img src="assets/images/${n}" loading="lazy" alt="">`;
      return href
        ? `<a class="gallery__item" href="${href}">${img}<span class="gallery__cta">Lire l'article →</span></a>`
        : `<div class="gallery__item">${img}</div>`;
    };

    // on ne garde que les images qui chargent vraiment
    const test = (n) =>
      new Promise((res) => {
        const im = new Image();
        im.onload = () => res(n);
        im.onerror = () => res(null);
        im.src = "assets/images/" + n;
      });

    Promise.all(IMAGES.map(test)).then((results) => {
      const ok = results.filter(Boolean);
      const ROWS = 3;
      const rows = Array.from({ length: ROWS }, () => []);
      ok.forEach((n, i) => rows[i % ROWS].push(n));

      galleryEl.innerHTML = rows
        .map((imgs, r) => {
          const content = imgs.map(itemHTML).join("");
          return `<div class="marquee ${r % 2 ? "marquee--reverse" : ""}" style="--dur:${250 + r * 60}s">
          <div class="marquee__track">${content}${content}</div>
        </div>`;
        })
        .join("");
    });
  }
  const IMG = {
    "article-sza.html": "SZA.jpeg",
    "article-frank.html": "Frank.jpeg",
    "article-carti.html": "carti.jpg",
    "article-pnd.html": "pnd.jpg",
    "article-livealbum.html": "livealbum.jpg",
    "article-lacy.html": "lacy.jpg",
    "article-drake.html": "drake.jpg",
    "article-travis.html": "travis.jpg",
    "article-corteiz.html": "corteiz.jpg",
    "article-mertra.html": "mertra.jpeg",
    "article-sneaker.html": "sneaker.jpg",
    "article-schiaparelli.html": "schiaparelli.jpg",
    "article-seoul.html": "seoul.jpg",
    "article-victoria.html": "victoria.jpg",
    "article-stars-mode.html": "stars-mode.jpg",
    "article-gucci.html": "gucci.jpg",
    "article.html": "durant-back.jpeg",
    "article-doomsday.html": "doomsday.jpeg",
    "article-f1.html": "f1.jpg",
    "article-golf.html": "golf.jpg",
    "article-a24.html": "a24.jpg",
    "article-tennis.html": "tennis.jpg",
    "article-letterboxd.html": "letterboxd.jpg",
    "article-gaming.html": "gaming.jpg",
    "article-nba.html": "nba.jpg",
    "article-gorpcore.html": "gorpcore.jpg",
  };
  const imgOf = (a) => "assets/images/" + (IMG[a.href] || "");

  // À LA UNE — reprend l'intro 2 colonnes de l'article
  document.querySelectorAll("[data-cat-hero]").forEach((el) => {
    const list = ARTICLES.filter((x) => x.cat === el.dataset.catHero);
    if (!list.length) return;
    const [big, ...rest] = list;
    const smalls = rest.slice(0, 2);

    const bigCard = `
    <a class="laune__card laune__card--big" href="${big.href}">
      <img class="laune__img" src="${imgOf(big)}" alt="">
      <div class="laune__body">
        <h2 class="laune__title">${big.title}, ${big.sub}</h2>
        <p class="laune__chapo">${big.text}</p>
        <span class="laune__cta">Lire l'article →</span>
      </div>
    </a>`;

    const smallCards = smalls
      .map(
        (a) => `
    <a class="laune__card laune__card--small" href="${a.href}">
      <img class="laune__img" src="${imgOf(a)}" alt="">
      <div class="laune__body">
        <h2 class="laune__title">${a.title}, ${a.sub}</h2>
        <span class="laune__cta">Lire →</span>
      </div>
    </a>`,
      )
      .join("");

    el.innerHTML = `
    <header class="laune__head"><h2 class="laune__heading">À la une</h2></header>
    <div class="laune__grid">${bigCard}${smallCards}</div>`;
  });

  // À LIRE AUSSI — tes cartes lcard existantes
  document.querySelectorAll("[data-cat-related]").forEach((el) => {
    const cat = el.dataset.catRelated;
    const rest = ARTICLES.filter((x) => x.cat === cat).slice(1);
    const cards = rest
      .map(
        (a) => `
      <div class="related__item related__item--${cat}">
        <a class="lcard" href="${a.href}">
          <div class="lcard__content">
            <h3 class="lcard__title">${a.title}</h3>
            <p class="lcard__sub">${a.sub}</p>
            <p class="lcard__text">${a.text}</p>
          </div>
          <span class="lcard__cta">Découvrir</span>
        </a>
      </div>`,
      )
      .join("");
    el.innerHTML = `
    <h2 class="related__title">À lire aussi</h2>
    <div class="related__list">${cards}</div>`;
  });
  document.querySelectorAll("[data-collapse]").forEach((card) => {
    const btn = card.querySelector(".brief-card__toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const open = card.classList.toggle("is-open");
      card.style.maxHeight = open ? card.scrollHeight + "px" : "";
      btn.setAttribute("aria-expanded", open);
    });
  });
});
