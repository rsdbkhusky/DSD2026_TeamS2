/* ═══════════════════════════════════════════════════
   DSD2026 · Team S2 · Global Script
   ═══════════════════════════════════════════════════ */

const THEME_KEY = 'dsd2026-theme';
const themeToggle = document.getElementById('themeToggle');
function syncThemeToggle() {
  if (!themeToggle) return;
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  themeToggle.setAttribute('aria-label', isLight ? '切换到深色' : '切换到浅色');
  themeToggle.title = isLight ? '切换到深色' : '切换到浅色';
  themeToggle.textContent = isLight ? '☾' : '☼';
}
syncThemeToggle();
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    if (root.getAttribute('data-theme') === 'light') {
      root.removeAttribute('data-theme');
      try { localStorage.setItem(THEME_KEY, 'dark'); } catch (e) { /* ignore */ }
    } else {
      root.setAttribute('data-theme', 'light');
      try { localStorage.setItem(THEME_KEY, 'light'); } catch (e) { /* ignore */ }
    }
    syncThemeToggle();
  });
}

// ── Navbar scroll state ──
const topbar = document.querySelector('.topbar');
if (topbar) {
  window.addEventListener('scroll', () => {
    topbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── Active nav link ──
const navLinks = document.querySelectorAll('.nav-link');
const currentFile = location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(link => {
  const href = link.getAttribute('href');
  const hrefFile = href ? href.split('/').pop() : '';
  if (hrefFile === currentFile || (currentFile === '' && hrefFile === 'index.html')) {
    link.classList.add('active');
  }
});

// ── Mobile menu toggle ──
const menuToggle = document.getElementById('menuToggle');
const mainNav    = document.getElementById('mainNav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
      mainNav.classList.remove('open');
    }
  });
}

// ── Reveal on scroll ──
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
  revealEls.forEach(el => io.observe(el));
}

// ── Scroll progress button ──
const scrollBtn = document.getElementById('scroll-btn');
const sring     = document.getElementById('sring');
if (scrollBtn) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.body.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? scrolled / total : 0;
    scrollBtn.classList.toggle('visible', scrolled > 200);
    if (sring) sring.style.strokeDashoffset = 120 - pct * 120;
  }, { passive: true });
  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── VISUAL FX: Scroll progress bar (decoupled)
      Drives .nav-progress-bar width.
      Remove the element from HTML to fully disable. ── */
const progressBar = document.querySelector('.nav-progress-bar');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
    progressBar.style.width = pct + '%';
  }, { passive: true });
}

/* ── VISUAL FX: Cursor glow (decoupled)
      Follows mouse pointer.
      Remove <div id="cursor-glow"> from HTML to fully disable. ── */
const cursorGlow = document.getElementById('cursor-glow');
if (cursorGlow) {
  let glowVisible = false;
  document.addEventListener('mousemove', e => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top  = e.clientY + 'px';
    if (!glowVisible) {
      cursorGlow.style.opacity = '1';
      glowVisible = true;
    }
  });
  document.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
    glowVisible = false;
  });
}

/* ── VISUAL FX: Count-up animation (decoupled)
      Targets elements with data-target="NUMBER".
      Remove data-target attribute to disable per element. ── */
function animateCountUp(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1200;
  const start    = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}
const countEls = document.querySelectorAll('[data-target]');
if (countEls.length) {
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCountUp(e.target);
        countObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  countEls.forEach(el => countObs.observe(el));
}
