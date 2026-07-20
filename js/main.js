/* ============================================================
   NEXUS MATRIX — Global JavaScript v1.0
   Handles: scroll progress, header, reveal animations,
   counters, hero words + typing, particles, mega-menu,
   mobile nav, FAQ, carousel, drag-scroll, GA4 events
   ============================================================ */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  /* ----------------------------------------------------------
     SCROLL PROGRESS BAR
  ---------------------------------------------------------- */
  const progressBar = qs('#scroll-progress');

  function updateProgress() {
    if (!progressBar) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  }

  /* ----------------------------------------------------------
     STICKY HEADER
  ---------------------------------------------------------- */
  const header = qs('.site-header');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', scrollY > 50);
  }

  /* ----------------------------------------------------------
     BACK TO TOP
  ---------------------------------------------------------- */
  const btt = qs('.back-to-top');
  if (btt) {
    btt.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }
  function updateBTT() {
    if (btt) btt.classList.toggle('visible', scrollY > 500);
  }

  /* ----------------------------------------------------------
     RAF-THROTTLED SCROLL HANDLER
  ---------------------------------------------------------- */
  let rafPending = false;
  window.addEventListener('scroll', () => {
    if (!rafPending) {
      requestAnimationFrame(() => {
        updateProgress();
        updateHeader();
        updateBTT();
        checkScrollDepth();
        rafPending = false;
      });
      rafPending = true;
    }
  }, { passive: true });

  /* initial call */
  updateProgress();
  updateHeader();

  /* ----------------------------------------------------------
     INTERSECTION OBSERVER — SCROLL REVEAL
  ---------------------------------------------------------- */
  function initReveal() {
    if (reducedMotion) {
      qsa('[data-reveal],[data-stagger]').forEach(el => el.classList.add('revealed'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.09, rootMargin: '0px 0px -36px 0px' });

    qsa('[data-reveal],[data-stagger]').forEach(el => obs.observe(el));
  }

  /* ----------------------------------------------------------
     STATS COUNTER
  ---------------------------------------------------------- */
  function animateCounter(el) {
    const raw    = el.dataset.target;
    const target = parseFloat(raw);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = (raw.includes('.') ? raw.split('.')[1].length : 0);
    const dur = 2000;
    const t0  = performance.now();

    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);   /* ease-out-cubic */
      const val = eased * target;
      el.textContent = prefix + (decimals ? val.toFixed(decimals) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    if (reducedMotion) {
      qsa('[data-counter]').forEach(el => {
        el.textContent = (el.dataset.prefix || '') + el.dataset.target + (el.dataset.suffix || '');
      });
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    qsa('[data-counter]').forEach(el => obs.observe(el));
  }

  /* ----------------------------------------------------------
     HERO — WORD REVEAL
  ---------------------------------------------------------- */
  function initHeroWords() {
    const words = qsa('.hero h1 .word');
    if (!words.length) return;

    if (reducedMotion) {
      words.forEach(w => w.classList.add('visible'));
      return;
    }

    words.forEach((w, i) => {
      setTimeout(() => w.classList.add('visible'), 300 + i * 80);
    });
  }

  /* ----------------------------------------------------------
     HERO — TYPING EFFECT
  ---------------------------------------------------------- */
  function initTyping() {
    const el = qs('.typing-cursor');
    if (!el) return;

    const phrases = [
      'AI Agents',
      'LLM Solutions',
      'Computer Vision',
      'Generative AI',
      'ML Engineering',
      'Chatbot Development',
      'RAG Systems',
      'Predictive Analytics',
      'Voice AI'
    ];

    if (reducedMotion) {
      el.textContent = phrases[0];
      el.style.borderRight = 'none';
      return;
    }

    let pIdx = 0, cIdx = 0, deleting = false, paused = false;

    function tick() {
      const phrase = phrases[pIdx];

      if (paused) { paused = false; setTimeout(tick, 1600); return; }

      if (!deleting) {
        cIdx++;
        el.textContent = phrase.slice(0, cIdx);
        if (cIdx === phrase.length) { deleting = true; paused = true; setTimeout(tick, 100); return; }
      } else {
        cIdx--;
        el.textContent = phrase.slice(0, cIdx);
        if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
      }

      setTimeout(tick, deleting ? 42 : 88);
    }

    setTimeout(tick, 1900);
  }

  /* ----------------------------------------------------------
     PARTICLE CANVAS
  ---------------------------------------------------------- */
  function initParticles() {
    const canvas = qs('#particle-canvas');
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    let pts = [], raf, mouse = { x: -9999, y: -9999 };

    function resize() {
      canvas.width  = innerWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      build();
    }

    function build() {
      const n = Math.min(Math.floor(canvas.width * canvas.height / 11000), 130);
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - .5) * .28,
        vy: (Math.random() - .5) * .28,
        r:  Math.random() * 1.4 + .5,
        a:  Math.random() * .45 + .12
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];

        /* move */
        p.x += p.vx; p.y += p.vy;

        /* wrap */
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        /* soft mouse repulsion */
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 6400) { const d = Math.sqrt(d2); p.x += (dx / d) * 1.8; p.y += (dy / d) * 1.8; }

        /* dot */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.a})`;
        ctx.fill();

        /* connections */
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const ddx = p.x - q.x, ddy = p.y - q.y;
          const dd  = ddx * ddx + ddy * ddy;
          if (dd < 10000) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(139,92,246,${0.07 * (1 - Math.sqrt(dd) / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }

    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { cancelAnimationFrame(raf); resize(); draw(); }, 150);
    }, { passive: true });

    resize();
    draw();
  }

  /* ----------------------------------------------------------
     MOBILE HAMBURGER MENU
  ---------------------------------------------------------- */
  function initMobileMenu() {
    const btn = qs('.hamburger');
    const nav = qs('.mobile-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      const open = btn.classList.toggle('open');
      nav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      btn.setAttribute('aria-expanded', open);
    });

    /* close on link tap */
    qsa('a', nav).forEach(a => a.addEventListener('click', () => {
      btn.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }));

    /* close on Esc */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        btn.classList.remove('open');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ----------------------------------------------------------
     FAQ ACCORDION
  ---------------------------------------------------------- */
  function initFAQ() {
    qsa('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item   = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        /* close all */
        qsa('.faq-item.open').forEach(o => o.classList.remove('open'));

        if (!isOpen) {
          item.classList.add('open');
          trackEvent('faq_expand', { question: btn.textContent.trim().slice(0, 80) });
        }
      });
    });
  }

  /* ----------------------------------------------------------
     TESTIMONIALS CAROUSEL
  ---------------------------------------------------------- */
  function initCarousel() {
    const track  = qs('.testimonials-track');
    const slides = qsa('.testimonial-slide');
    const dots   = qsa('.carousel-dot');
    const prev   = qs('.carousel-arrow.prev');
    const next   = qs('.carousel-arrow.next');

    if (!track || !slides.length) return;

    let cur = 0, timer;

    function goTo(n) {
      cur = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${cur * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    }

    function startAuto() {
      if (!reducedMotion) timer = setInterval(() => goTo(cur + 1), 5500);
    }
    function stopAuto() { clearInterval(timer); }

    prev?.addEventListener('click', () => { stopAuto(); goTo(cur - 1); startAuto(); });
    next?.addEventListener('click', () => { stopAuto(); goTo(cur + 1); startAuto(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

    /* touch/swipe */
    let tx = 0;
    track.parentElement.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    track.parentElement.addEventListener('touchend',   e => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) { stopAuto(); goTo(cur + (diff > 0 ? 1 : -1)); startAuto(); }
    }, { passive: true });

    goTo(0);
    startAuto();
  }

  /* ----------------------------------------------------------
     INDUSTRIES DRAG-SCROLL
  ---------------------------------------------------------- */
  function initDragScroll() {
    const el = qs('.industries-scroll');
    if (!el) return;

    let dragging = false, startX, scrollLeft;

    el.addEventListener('mousedown', e => {
      dragging = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft;
      el.classList.add('grabbing');
    });
    ['mouseleave','mouseup'].forEach(ev => el.addEventListener(ev, () => { dragging = false; el.classList.remove('grabbing'); }));
    el.addEventListener('mousemove', e => {
      if (!dragging) return;
      e.preventDefault();
      el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.4;
    });
  }

  /* ----------------------------------------------------------
     CHATBOT WIDGET
  ---------------------------------------------------------- */
  function initChatbot() {
    const widget   = qs('.chatbot-widget');
    const trigger  = qs('.chatbot-trigger');
    const messages = qs('.chat-messages');
    const input    = qs('.chat-input');
    const sendBtn  = qs('.chat-send');
    const badge    = qs('.chatbot-badge');

    if (!widget || !trigger) return;

    let open = false, waiting = false;

    const welcome = "Hi! I'm the Nexus Matrix AI Assistant 👋 I can help you understand our AI services, pick the right solution for your project, or connect you with our team. What can I help you with today?";

    function openPanel() {
      open = true;
      widget.classList.add('open');
      if (badge) badge.classList.add('hidden');
      if (!messages.children.length) addMsg(welcome, 'bot');
      input?.focus();
      trackEvent('chat_open', { page: location.pathname });
    }

    function closePanel() { open = false; widget.classList.remove('open'); }

    trigger.addEventListener('click', () => open ? closePanel() : openPanel());

    function addMsg(text, role) {
      const div = document.createElement('div');
      div.className = `chat-msg ${role}`;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    function showTyping() {
      const el = document.createElement('div');
      el.className = 'chat-typing';
      el.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      return el;
    }

    async function send(text) {
      if (!text.trim() || waiting) return;
      waiting = true;
      if (sendBtn) sendBtn.disabled = true;

      addMsg(text, 'user');
      if (input) input.value = '';
      const typing = showTyping();
      trackEvent('chat_message_sent', { page: location.pathname });

      try {
        const res  = await fetch('/chat.php', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ message: text })
        });
        const data = await res.json();
        typing.remove();
        addMsg(data.reply || "Sorry, I couldn't process that. Please try the contact form.", 'bot');
        if (data.leadCaptured) trackEvent('chat_lead_captured', { page: location.pathname });
      } catch {
        typing.remove();
        addMsg("I'm unavailable right now. Please use the contact form and we'll get back to you shortly!", 'bot');
      }

      waiting = false;
      if (sendBtn) sendBtn.disabled = false;
    }

    sendBtn?.addEventListener('click', () => send(input?.value || ''));
    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); }
    });
  }

  /* ----------------------------------------------------------
     GA4 EVENT TRACKING
  ---------------------------------------------------------- */
  function trackEvent(name, params) {
    if (typeof gtag === 'function') {
      gtag('event', name, { page_path: location.pathname, ...params });
    }
  }

  /* scroll depth */
  const depthMarks = [25, 50, 75, 90];
  const depthFired = new Set();

  function checkScrollDepth() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max <= 0) return;
    const pct = (scrollY / max) * 100;
    depthMarks.forEach(d => {
      if (!depthFired.has(d) && pct >= d) {
        depthFired.add(d);
        trackEvent('scroll_depth', { depth_percent: d });
      }
    });
  }

  /* delegate CTA / phone / email clicks */
  document.addEventListener('click', e => {
    const cta = e.target.closest('[data-cta]');
    if (cta) trackEvent('cta_click', { label: cta.dataset.cta, page: location.pathname });

    if (e.target.closest('a[href^="tel:"]'))    trackEvent('phone_click');
    if (e.target.closest('a[href^="mailto:"]')) trackEvent('email_click');
  });

  /* ----------------------------------------------------------
     MAGNETIC BUTTONS (subtle, GPU-only)
  ---------------------------------------------------------- */
  function initMagnetic() {
    if (reducedMotion) return;
    qsa('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r  = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * 0.22;
        const dy = (e.clientY - r.top  - r.height / 2) * 0.22;
        btn.style.transform = `translate(${dx}px,${dy}px) translateY(-2px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ----------------------------------------------------------
     PARALLAX ORBS (scroll-linked, transform only)
  ---------------------------------------------------------- */
  function initParallax() {
    if (reducedMotion) return;
    const orbs = qsa('.orb');
    if (!orbs.length) return;

    window.addEventListener('scroll', () => {
      const y = scrollY;
      orbs.forEach((orb, i) => {
        const speed = (i % 2 === 0) ? 0.08 : -0.06;
        orb.style.transform = `translateY(${y * speed}px)`;
      });
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     SMOOTH ANCHOR SCROLL (offset for fixed header)
  ---------------------------------------------------------- */
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id  = anchor.getAttribute('href').slice(1);
    const tgt = id ? document.getElementById(id) : null;
    if (!tgt) return;
    e.preventDefault();
    const offset = (header?.offsetHeight || 72) + 20;
    scrollTo({ top: tgt.getBoundingClientRect().top + scrollY - offset, behavior: 'smooth' });
  });

  /* ----------------------------------------------------------
     INIT ALL
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initCounters();
    initHeroWords();
    initTyping();
    initParticles();
    initMobileMenu();
    initFAQ();
    initCarousel();
    initDragScroll();
    initChatbot();
    initMagnetic();
    initParallax();
  });

})();
