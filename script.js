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

  emailjs.init("0o8Gh_Y0Q_RG6v4Kt");

const form = document.getElementById("contactForm");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    emailjs.sendForm(
        "service_sz7ay2g",
        "template_ct553b2",
        this
    )
    .then(() => {
        alert("Message sent successfully!");
        form.reset();
    })
    .catch((error) => {
        alert("Failed to send message.");
        console.log(error);
    });
});
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
      'Java & Spring Boot Backend',
      'MERN Stack Developer',
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

        // Elements still waiting on a live fetch (coding-profile counts) have
        // no numeric data-target yet — e.g. "Loading…" or "Unavailable".
        // Animating that would show "NaN". Leave the text alone; once the
        // live value arrives it's written directly (see codingStatsModule),
        // and if this element is still on-screen it'll simply show the
        // correct number without the count-up flourish.
        if (Number.isNaN(target)) return;

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

  /* ---------- 8b. CODING PROFILE LIVE STATS ----------
     Displays coding-profile counts for LeetCode, GeeksforGeeks, and
     Code360, backed by a verified hardcoded baseline with an optional
     background refresh via our own backend (/api/coding-stats, a Vercel
     serverless function). Any scraping/CORS workarounds happen
     server-side — see api/coding-stats.js.

     UI FLOW (read before changing):
       1. index.html already contains the verified baseline numbers
          (LeetCode 118, GeeksforGeeks 155, Code360 166, Total 439) as the
          normal data-target values — exactly like any other static number
          on this page. There is no "Loading…"/"Unavailable" state for
          these anymore: a valid number is on screen from the first paint,
          and the existing scroll-triggered count-up animation (see
          counterModule above) plays against it normally.
       2. Immediately on load, BASELINE.js below is reconciled against
          localStorage: if a previous visit successfully fetched a newer
          number for a platform, that cached number is shown instead of
          the hardcoded baseline (still instantly, no network wait).
       3. A background refresh against /api/coding-stats is only attempted
          if a platform's cached value is missing or is 10+ days old —
          this is not a "refresh on every load" fetch, per the ~10-day
          cadence requested. If nothing is stale, no network request is
          made at all.
       4. If a background refresh succeeds for a platform, its number (and
          the "last fetched" timestamp) is saved to localStorage and the
          card updates in place. If it fails, or a platform has no public
          API at all (Code360 — see note below), the card simply keeps
          showing whatever it already had (cached value, or the verified
          baseline) — it is never blanked, and never shows "Unavailable".

     Open DevTools → Console for [coding-stats] log lines confirming
     whether a refresh ran this load and what it returned; open the
     Network tab to see the actual /api/coding-stats request when one
     happens.

     CODE360 NOTE: Naukri's Code360 has no public/official API, and its
     profile page is a fully client-rendered app with nothing in the
     initial HTML to scrape either (confirmed by inspecting the page
     directly). api/coding-stats.js is honest about this and always
     reports Code360 as unavailable, so its card always shows the verified
     baseline (166 = 142 Coding Problems + 24 MCQs) rather than a number
     that was never actually fetched.
  ---------------------------------------------------------------------- */
  (function codingStatsModule(){

    const CACHE_PREFIX = 'codingStats:v3:';
    const REFRESH_INTERVAL_MS = 10 * 24 * 60 * 60 * 1000; // ~10 days

    // Verified-as-of baseline values. This is the floor the dashboard will
    // never fall below — a background fetch can only improve on these
    // numbers, never blank them out or replace them with "Unavailable".
    // Update these by hand next time you re-verify your counts.
    const BASELINE = {
      leetcode: 118,
      gfg: 155,       // Basic 32 + Easy 76 + Medium 43 + Hard 4
      code360: 166,   // 142 Coding Problems + 24 MCQs
    };

    function readCache(platform){
      try {
        const raw = localStorage.getItem(CACHE_PREFIX + platform);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        return null; // localStorage unavailable (private browsing, etc.) — fine, just skip caching.
      }
    }

    function writeCache(platform, value){
      try {
        localStorage.setItem(CACHE_PREFIX + platform, JSON.stringify({ value, fetchedAt: Date.now() }));
      } catch (err) {
        // Ignore — caching is a nice-to-have, not required for correctness.
      }
    }

    function isStale(platform){
      const cached = readCache(platform);
      if (!cached) return true;
      return (Date.now() - cached.fetchedAt) >= REFRESH_INTERVAL_MS;
    }

    async function fetchStats(timeoutMs = 9000){
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      console.info('[coding-stats] ~10 days since the last successful refresh (or none yet) — requesting GET /api/coding-stats …');
      try {
        const res = await fetch('/api/coding-stats', { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        console.info('[coding-stats] Response received:', json);
        return json;
      } finally {
        clearTimeout(timer);
      }
    }

    // Sets a counter's visible value and its data-target, so the
    // scroll-triggered count-up animation (see counterModule above) plays
    // correctly whether or not this element has scrolled into view yet.
    function setLiveCount(el, value){
      if (el == null || value == null || Number.isNaN(value)) return;
      el.dataset.target = value;
      el.textContent = String(value);
    }

    function setText(el, value){
      if (el == null || value === undefined || value === null || value === '') return;
      el.textContent = value;
    }

    // Resolves one platform's "solved" count using, in priority order:
    // this session's live fetch > a previously cached value (any age,
    // used while waiting on the next ~10-day refresh, or if a refresh
    // just failed) > the verified hardcoded baseline. Always returns a
    // number — there is no "unresolvable" case anymore.
    function resolveSolved(platform, data){
      if (data && data.available && typeof data.solved === 'number') {
        writeCache(platform, data.solved);
        return data.solved;
      }
      const cached = readCache(platform);
      if (cached && typeof cached.value === 'number') return cached.value;
      return BASELINE[platform];
    }

    function applyPlatform(platform, data){
      const solvedEls = document.querySelectorAll(
        `[data-platform="${platform}"] [data-stat="solved"], [data-platform="${platform}"] [data-stat="mini-solved"]`
      );
      const value = resolveSolved(platform, data);
      solvedEls.forEach(el => setLiveCount(el, value));

      if (data && data.available === false) {
        const source = value === BASELINE[platform] ? 'verified baseline' : 'last cached value';
        console.warn(`[coding-stats] ${platform} refresh unavailable this load — showing ${source} (${value}):`, data.error);
      }
      return value;
    }

    function applyLeetCodeExtras(data){
      if (data && data.available && typeof data.ranking === 'number') {
        setText(document.querySelector('[data-platform="leetcode"] [data-stat="rank"]'), '~' + data.ranking.toLocaleString());
      }
      if (data && data.available) {
        if (typeof data.easy === 'number') setText(document.querySelector('[data-platform="leetcode"] [data-stat="easy"]'), 'Easy ' + data.easy);
        if (typeof data.medium === 'number') setText(document.querySelector('[data-platform="leetcode"] [data-stat="med"]'), 'Med ' + data.medium);
        if (typeof data.hard === 'number') setText(document.querySelector('[data-platform="leetcode"] [data-stat="hard"]'), 'Hard ' + data.hard);
      }
      // No fresh data? Leave whatever's already shown (verified baseline
      // "~1,736,269" from the HTML, or a previous successful fetch) as-is.
    }

    function applyGeeksforGeeksExtras(data){
      if (data && data.available && typeof data.score === 'number') {
        setText(document.querySelector('[data-platform="gfg"] [data-stat="score"]'), String(data.score));
      }
      if (data && data.available && data.instituteRank) {
        setText(document.querySelector('[data-platform="gfg"] [data-stat="rank"]'), String(data.instituteRank));
      }
      // No fresh data? Leave the verified baseline (Score 390 / Rank 6)
      // or a previous successful fetch's values as-is.
    }

    function updateTotal(leetcodeSolved, gfgSolved, code360Solved){
      setLiveCount(document.getElementById('dsaTotalNum'), leetcodeSolved + gfgSolved + code360Solved);
    }

    // 1) Show cached-or-baseline values immediately — no network wait, and
    //    always a valid number (never "Loading…" or "Unavailable").
    const initialLeetcode = applyPlatform('leetcode', null);
    const initialGfg = applyPlatform('gfg', null);
    const initialCode360 = applyPlatform('code360', null);
    updateTotal(initialLeetcode, initialGfg, initialCode360);

    // 2) Only hit the network if it's actually time for the ~10-day
    //    refresh. Code360 has no live source at all (see module comment),
    //    so it never gates the refresh — only LeetCode/GFG do.
    if (!isStale('leetcode') && !isStale('gfg')) {
      console.info('[coding-stats] Cached data is still within the ~10-day refresh window — skipping network fetch.');
      return;
    }

    fetchStats()
      .then(stats => {
        const leetcodeSolved = applyPlatform('leetcode', stats.leetcode);
        const gfgSolved = applyPlatform('gfg', stats.geeksforgeeks);
        const code360Solved = applyPlatform('code360', stats.code360);
        applyLeetCodeExtras(stats.leetcode);
        applyGeeksforGeeksExtras(stats.geeksforgeeks);
        updateTotal(leetcodeSolved, gfgSolved, code360Solved);
      })
      .catch(err => {
        console.warn('[coding-stats] Refresh attempt failed — keeping the previously displayed values (cached or verified baseline):', err.message);
        // Nothing else to do: step 1 already put valid numbers on screen.
      });
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
