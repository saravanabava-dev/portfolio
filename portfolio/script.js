/* ==========================================================================
   SARAVANA BAVA — PORTFOLIO SCRIPT
   Vanilla JS only. Organized by feature, each self-contained so sections
   can be reused independently.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. THEME TOGGLE + PERSISTENCE ---------- */
  (function themeModule(){
    const root = document.body;
    const toggleBtn = document.getElementById('themeToggle');
    const stored = localStorage.getItem('portfolio-theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (stored) {
      root.setAttribute('data-theme', stored);
    } else if (prefersLight) {
      root.setAttribute('data-theme', 'light');
    }

    toggleBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);
    });
  })();

  /* ---------- 2. NAVBAR: SHRINK ON SCROLL + ACTIVE TAB HIGHLIGHT ---------- */
  (function navModule(){
    const navbar = document.getElementById('navbar');
    const tabs = Array.from(document.querySelectorAll('.nav-tab'));
    const sections = tabs
      .map(tab => document.querySelector(tab.getAttribute('href')))
      .filter(Boolean);

    function onScroll(){
      navbar.classList.toggle('shrink', window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          tabs.forEach(tab => tab.classList.toggle('active', tab.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    sections.forEach(sec => observer.observe(sec));
  })();

  /* ---------- 3. MOBILE MENU ---------- */
  (function mobileMenuModule(){
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      menu.classList.toggle('open');
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        menu.classList.remove('open');
      });
    });
  })();

  /* ---------- 4. SCROLL PROGRESS BAR ---------- */
  (function scrollProgressModule(){
    const bar = document.getElementById('scrollProgress');
    function update(){
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const pct = height > 0 ? (scrollTop / height) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ---------- 5. TYPEWRITER EFFECT ---------- */
  (function typewriterModule(){
    const el = document.getElementById('typewriter');
    const phrases = [
      'Full-Stack Developer',
      'Java Programmer',
      'MERN Stack Builder',
      'DSA & Problem Solving',
      'Open to Internships'
    ];
    let phraseIndex = 0, charIndex = 0, deleting = false;

    function tick(){
      const current = phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 45 : 85);
    }
    tick();
  })();

  /* ---------- 6. REVEAL ON SCROLL (sections, cards, timeline, etc.) ---------- */
  (function revealModule(){
    const items = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(item => observer.observe(item));
  })();

  /* ---------- 7. ANIMATED COUNTERS ---------- */
  (function counterModule(){
    const counters = document.querySelectorAll('.counter-num');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const decimal = el.dataset.decimal;
        const duration = 1400;
        const start = performance.now();

        function frame(now){
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;
          el.textContent = decimal
            ? (value).toFixed(0) + '.' + decimal
            : Math.floor(value).toString();
          if (progress < 1) {
            requestAnimationFrame(frame);
          } else {
            el.textContent = decimal ? target + '.' + decimal : target.toString();
          }
        }
        requestAnimationFrame(frame);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  })();

  /* ---------- 8. SKILL BARS + RINGS ANIMATION ---------- */
  (function skillsModule(){
    const bars = document.querySelectorAll('.skill-bar');
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const level = entry.target.dataset.level;
          entry.target.querySelector('.bar-fill').style.width = level + '%';
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(bar => barObserver.observe(bar));

    const CIRC = 2 * Math.PI * 42; // r=42
    const rings = document.querySelectorAll('.ring-item');
    const ringObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const level = parseInt(el.dataset.level, 10);
        const fg = el.querySelector('.ring-fg');
        const pctLabel = el.querySelector('.ring-pct');
        const offset = CIRC - (level / 100) * CIRC;

        fg.style.strokeDasharray = CIRC;
        fg.style.strokeDashoffset = CIRC;
        requestAnimationFrame(() => { fg.style.strokeDashoffset = offset; });

        let current = 0;
        const start = performance.now();
        function frame(now){
          const progress = Math.min((now - start) / 1300, 1);
          current = Math.floor(level * progress);
          pctLabel.textContent = current + '%';
          if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
        ringObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    rings.forEach(ring => ringObserver.observe(ring));
  })();

  /* ---------- 9. PROJECT FILTERING ---------- */
  (function projectFilterModule(){
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        cards.forEach(card => {
          const tags = card.dataset.tags.split(',');
          const show = filter === 'all' || tags.includes(filter);
          card.style.display = show ? '' : 'none';
        });
      });
    });
  })();

  /* ---------- 10. CONTACT FORM VALIDATION ---------- */
  (function contactFormModule(){
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');

    function setError(field, message){
      const row = field.closest('.form-row');
      const msg = row.querySelector('.error-msg');
      if (message) {
        row.classList.add('error');
        msg.textContent = message;
      } else {
        row.classList.remove('error');
        msg.textContent = '';
      }
    }

    function validate(){
      let valid = true;
      const name = form.name;
      const email = form.email;
      const message = form.message;

      if (!name.value.trim()) { setError(name, 'Please enter your name.'); valid = false; }
      else setError(name, '');

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) { setError(email, 'Please enter your email.'); valid = false; }
      else if (!emailPattern.test(email.value.trim())) { setError(email, 'Please enter a valid email address.'); valid = false; }
      else setError(email, '');

      if (!message.value.trim() || message.value.trim().length < 10) {
        setError(message, 'Message should be at least 10 characters.');
        valid = false;
      } else setError(message, '');

      return valid;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) {
        success.classList.remove('show');
        return;
      }
      // No backend is connected — simulate a successful send.
      success.classList.add('show');
      form.reset();
      setTimeout(() => success.classList.remove('show'), 5000);
    });

    ['input', 'blur'].forEach(evt => {
      form.name.addEventListener(evt, () => { if (form.name.value.trim()) setError(form.name, ''); });
      form.email.addEventListener(evt, () => { if (form.email.value.trim()) setError(form.email, ''); });
      form.message.addEventListener(evt, () => { if (form.message.value.trim().length >= 10) setError(form.message, ''); });
    });
  })();

  /* ---------- 11. COPY TO CLIPBOARD ---------- */
  (function copyModule(){
    document.querySelectorAll('.copyable').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.copy;
        try {
          await navigator.clipboard.writeText(text);
        } catch (err) {
          // Fallback for older browsers
          const temp = document.createElement('textarea');
          temp.value = text;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        }
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1800);
      });
    });
  })();

  /* ---------- 12. BACK TO TOP ---------- */
  (function backToTopModule(){
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  /* ---------- 13. MOUSE PARALLAX (hero glows) ---------- */
  (function parallaxModule(){
    const glows = document.querySelectorAll('.hero-glow');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 900px)').matches) return;

    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 30;
      const y = (e.clientY / innerHeight - 0.5) * 30;
      glows.forEach((glow, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        glow.style.transform = `translate(${x * dir}px, ${y * dir}px)`;
      });
    });
  })();

  /* ---------- 14. CARD TILT EFFECT (project cards + code window) ---------- */
  (function tiltModule(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const tiltTargets = document.querySelectorAll('.project-card, .achieve-card, .dsa-platform-card');
    tiltTargets.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${y * -6}deg) rotateY(${x * 6}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  })();

  /* ---------- 15. RIPPLE BUTTON EFFECT ---------- */
  (function rippleModule(){
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function(e){
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
      });
    });
  })();

  /* ---------- 16. FOOTER YEAR ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

});
