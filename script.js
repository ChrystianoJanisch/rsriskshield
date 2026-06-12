/* ============================================================
   RS COMPANY — RISK SHIELD · script.js
   Canvas lattice · reveals · navbar · timeline · cursor ·
   botões magnéticos · parallax · FAQ · formulário
   ============================================================ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ==========================================================
     0. PRELOADER — abertura (1ª visita da sessão)
     ========================================================== */
  const preloader = document.getElementById("preloader");
  const isLoading = document.documentElement.classList.contains("is-loading");

  if (preloader && isLoading) {
    const TOTAL = 4900; /* escudo 1.5s → RS 1.4s → wordmark 2.2s → flare 3.1s → brilho 3.7s → saída */
    setTimeout(() => {
      preloader.classList.add("done");
      try { sessionStorage.setItem("rs_intro", "1"); } catch (e) {}
      /* libera as animações de entrada do conteúdo junto com a cortina subindo */
      setTimeout(() => {
        document.documentElement.classList.remove("is-loading");
        preloader.remove();
      }, 880);
    }, TOTAL);
    /* trava de segurança: nunca prende o usuário mais de 6s */
    setTimeout(() => {
      if (document.documentElement.classList.contains("is-loading")) {
        document.documentElement.classList.remove("is-loading");
        preloader.remove();
      }
    }, 6000);
  } else if (preloader) {
    preloader.remove();
  }


  /* ==========================================================
     1. HERO — MALHA DE PARTÍCULAS (canvas)
     ========================================================== */
  const canvas = document.getElementById("lattice");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, particles, raf;
    const mouse = { x: -9999, y: -9999 };
    const GOLD = "232, 198, 107";
    const LINK_DIST = 130;
    const MOUSE_DIST = 180;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.floor((w * h) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.6,
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dxm = p.x - mouse.x;
        const dym = p.y - mouse.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < MOUSE_DIST && dm > 0.01) {
          const f = (1 - dm / MOUSE_DIST) * 0.6;
          p.x += (dxm / dm) * f;
          p.y += (dym / dm) * f;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD}, 0.55)`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${GOLD}, ${0.14 * (1 - d / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }

    const hero = canvas.closest(".hero");
    hero.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener("mouseleave", () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    /* pausa quando o hero sai da tela — economiza bateria */
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf) raf = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(raf);
          raf = null;
        }
      },
      { threshold: 0 }
    ).observe(canvas);

    window.addEventListener("resize", resize, { passive: true });
    resize();
    raf = requestAnimationFrame(tick);
  }

  /* ==========================================================
     2. NAVBAR — estado de scroll + barra de progresso + scrollspy
     ========================================================== */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("navProgress");

  function onScrollNav() {
    nav.classList.toggle("scrolled", window.scrollY > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* marca a página atual no menu */
  const path = window.location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav__links a, .nav__drop-menu a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (href !== "/" && path.startsWith(href))) a.classList.add("active");
  });

  /* scrollspy — só para âncoras internas da página atual */
  const navLinks = Array.from(document.querySelectorAll(".nav__links a")).filter((a) =>
    a.getAttribute("href").startsWith("#")
  );
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`)
          );
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ==========================================================
     3. MENU MOBILE
     ========================================================== */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  function closeMenu() {
    burger.classList.remove("open");
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  burger.addEventListener("click", () => {
    const opening = !mobileMenu.classList.contains("open");
    burger.classList.toggle("open", opening);
    mobileMenu.classList.toggle("open", opening);
    mobileMenu.setAttribute("aria-hidden", String(!opening));
    burger.setAttribute("aria-expanded", String(opening));
    document.body.style.overflow = opening ? "hidden" : "";
  });
  mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ==========================================================
     4. REVEALS POR SCROLL
     ========================================================== */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ==========================================================
     5. TIMELINE — linha que se desenha + pontos que acendem
     ========================================================== */
  const timeline = document.getElementById("timeline");
  const timelineFill = document.getElementById("timelineFill");
  const steps = timeline ? Array.from(timeline.querySelectorAll(".step")) : [];

  function onScrollTimeline() {
    if (!timeline) return;
    const rect = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height;
    const passed = Math.min(Math.max(vh * 0.7 - rect.top, 0), total);
    const pct = total > 0 ? passed / total : 0;
    timelineFill.style.transform = `scaleY(${pct})`;

    steps.forEach((step) => {
      const sRect = step.getBoundingClientRect();
      step.classList.toggle("lit", sRect.top + 60 < vh * 0.7);
    });
  }
  window.addEventListener("scroll", onScrollTimeline, { passive: true });
  onScrollTimeline();

  /* ==========================================================
     6. PARALLAX — texto gigante do alerta + telefone do app
     ========================================================== */
  const alertaBg = document.querySelector(".alerta__bg");

  function onScrollParallax() {
    if (reduceMotion) return;
    if (alertaBg) {
      const rect = alertaBg.parentElement.getBoundingClientRect();
      const offset = (rect.top - window.innerHeight / 2) * 0.18;
      alertaBg.style.transform = `translateY(calc(-50% + ${offset}px)) translateX(${offset * 0.6}px)`;
    }
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const speed = parseFloat(el.dataset.parallax);
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.translate = `0 ${-offset}px`;
    });
  }
  window.addEventListener("scroll", onScrollParallax, { passive: true });
  onScrollParallax();

  /* ==========================================================
     7. BOTÕES MAGNÉTICOS
     ========================================================== */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      const inner = btn.querySelector(".magnetic__inner");
      const strength = 0.35;

      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        if (inner) inner.style.transform = `translate(${x * strength * 0.4}px, ${y * strength * 0.4}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
        if (inner) inner.style.transform = "";
        btn.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
        setTimeout(() => (btn.style.transition = ""), 500);
      });
    });
  }

  /* ==========================================================
     8. CURSOR CUSTOMIZADO
     ========================================================== */
  if (finePointer && !reduceMotion) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let rx = 0, ry = 0, tx = 0, ty = 0;

    window.addEventListener("mousemove", (e) => {
      document.body.classList.add("cursor-on");
      tx = e.clientX;
      ty = e.clientY;
      dot.style.left = `${tx}px`;
      dot.style.top = `${ty}px`;
    });

    (function followRing() {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      requestAnimationFrame(followRing);
    })();

    document.querySelectorAll("[data-cursor='hover'], a, button, summary").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });
  }

  /* ==========================================================
     9. FAQ — acordeão suave
     ========================================================== */
  document.querySelectorAll(".faq__item").forEach((item) => {
    /* mantém o details sempre aberto no DOM; o visual é controlado por classe */
    const wasOpen = item.hasAttribute("open");
    item.setAttribute("open", "");
    if (wasOpen) item.classList.add("active");

    item.querySelector("summary").addEventListener("click", (e) => {
      e.preventDefault();
      const isActive = item.classList.contains("active");
      document.querySelectorAll(".faq__item.active").forEach((o) => o.classList.remove("active"));
      if (!isActive) item.classList.add("active");
    });
  });

  /* ==========================================================
     10. FORMULÁRIO — validação + envio (Netlify Forms)
     ========================================================== */
  const form = document.getElementById("contactForm");
  if (form) {
    const successMsg = document.getElementById("formSuccess");
    const submitLabel = document.getElementById("submitLabel");

    function validateField(input) {
      const field = input.closest(".field");
      let valid = input.value.trim().length > 0;
      if (input.type === "email") {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      }
      field.classList.toggle("invalid", !valid);
      return valid;
    }

    form.querySelectorAll("input[required], textarea[required]").forEach((input) => {
      input.addEventListener("blur", () => validateField(input));
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("invalid")) validateField(input);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const inputs = Array.from(form.querySelectorAll("input[required], textarea[required]"));
      const allValid = inputs.map(validateField).every(Boolean);
      if (!allValid) {
        form.querySelector(".field.invalid input, .field.invalid textarea")?.focus();
        return;
      }

      submitLabel.textContent = "Enviando…";

      try {
        const data = new FormData(form);
        await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(data).toString(),
        });
        form.reset();
        successMsg.hidden = false;
        submitLabel.textContent = "Solicitar análise gratuita";
        setTimeout(() => (successMsg.hidden = true), 6000);
      } catch {
        submitLabel.textContent = "Tentar novamente";
      }
    });
  }
})();
