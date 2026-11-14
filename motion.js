/* =============================================================================
   motion.js — site-wide scroll-blur reveal + hero scroll blur
   Loaded on every page:  <script src="motion.js" defer></script>
   ============================================================================= */

(function () {
  'use strict';

  var CONFIG = {
    blurMax:            14,
    blurMaxMobile:       8,
    risePx:             28,
    risePxMobile:       18,
    duration:          850,
    stagger:            90,
    rootMargin: '0px 0px -8% 0px',
    threshold:        0.12,
    heroSelector: '.hero, #hero, header.hero, .hero-section',
    heroBlurMax:        10,
    heroBlurMaxMobile:   4,
    preloaderTimeout: 6000,
    failsafeTimeout:  3500,
    pollInterval:       80
  };

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqMobile = window.matchMedia('(max-width: 640px)');
  var reduce   = mqReduce.matches;
  var isMobile = mqMobile.matches;
  var hasIO    = 'IntersectionObserver' in window;
  var heroEl   = null;

  if (reduce) {
    document.documentElement.classList.add('motion-reduced');
    document.querySelectorAll('.reveal-blur, [data-reveal]').forEach(function (el) {
      el.classList.add('is-visible', 'is-done');
    });
    return;
  }

  function syncCSSVars() {
    var r = document.documentElement.style;
    r.setProperty('--reveal-blur',     (isMobile ? CONFIG.blurMaxMobile : CONFIG.blurMax) + 'px');
    r.setProperty('--reveal-rise',     (isMobile ? CONFIG.risePxMobile : CONFIG.risePx) + 'px');
    r.setProperty('--reveal-duration', CONFIG.duration + 'ms');
    r.setProperty('--reveal-stagger',  CONFIG.stagger + 'ms');
    r.setProperty('--hero-blur-max',   (isMobile ? CONFIG.heroBlurMaxMobile : CONFIG.heroBlurMax) + 'px');
  }

  var AUTO_SELECTORS = [
    'main > section',
    'main > section > h1',
    'main > section > h2',
    'main > section > h3',
    'main > section > h4',
    'main > section > p',
    'main > section > ul',
    'main > section > ol',
    'main > section > blockquote',
    'main > section > figure',
    'main > section > img',
    'main > section > .project-card',
    'main > section > .card',
    'main > section > article',
    'main > section > .grid > *',
    'main > section > .row > *',
    '.project-card',
    '.card',
    '.project',
    'article.project',
    'section.project',
    'figure:not([data-no-reveal])',
    'img:not([data-no-reveal])',
    'footer > *'
  ];

  var SKIP = '.no-reveal, [data-no-reveal], .preloader, #preloader, .loader, nav, .nav, .navbar, .site-header';

  function tagElements() {
    /* 1. AUTO_SELECTORS pass */
    document.querySelectorAll(AUTO_SELECTORS.join(',')).forEach(function (el) {
      if (el.closest(SKIP)) return;
      if (el === heroEl) return;
      if (el.classList.contains('reveal-blur')) return;
      el.classList.add('reveal-blur');
    });

    /* 2. EVERY .reveal element (catches hero-copy children etc.) */
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.closest(SKIP)) return;
      if (el === heroEl) return;
      if (el.classList.contains('reveal-blur')) return;
      el.classList.add('reveal-blur');
    });

    /* 3. Manual opt-in */
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el.closest(SKIP)) return;
      el.classList.add('reveal-blur');
    });
  }

  function applyStagger() {
    document.querySelectorAll('main > section').forEach(function (section) {
      if (section.closest(SKIP)) return;
      var i = 0;
      Array.prototype.forEach.call(section.children, function (child) {
        if (!child.classList.contains('reveal-blur')) return;
        child.style.setProperty('--i', i);
        child.classList.add('reveal-stagger-child');
        i++;
      });
    });
  }

  function observeAll() {
    var els = document.querySelectorAll('.reveal-blur');

    if (!hasIO) {
      Array.prototype.forEach.call(els, function (el) {
        el.classList.add('is-visible', 'is-done');
      });
      return;
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');

        var done = function () {
          if (el.classList.contains('is-done')) return;
          el.classList.add('is-done');
          el.removeEventListener('transitionend', done);
        };
        el.addEventListener('transitionend', done);
        setTimeout(done, CONFIG.duration + 500);

        obs.unobserve(el);
      });
    }, {
      root: null,
      rootMargin: CONFIG.rootMargin,
      threshold: CONFIG.threshold
    });

    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  function heroScrollBlur() {
    if (!heroEl) return;
    if (isMobile && CONFIG.heroBlurMaxMobile === 0) return;

    var maxBlur = isMobile ? CONFIG.heroBlurMaxMobile : CONFIG.heroBlurMax;
    var ticking = false;

    function update() {
      var h = heroEl.offsetHeight || 600;
      var p = Math.min(1, Math.max(0, window.scrollY / h));
      heroEl.style.filter    = 'blur(' + (p * maxBlur).toFixed(2) + 'px)';
      heroEl.style.opacity   = String(1 - p * 0.85);
      heroEl.style.transform = 'translate3d(0,' + (p * -18).toFixed(1) + 'px,0)';
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    heroEl.classList.add('hero-scroll-blur');
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  function waitForPreloader(cb) {
    var pre = document.querySelector('.preloader, #preloader, .loader, .page-loader');
    if (!pre) return cb();

    function gone() {
      var cs = getComputedStyle(pre);
      return cs.display === 'none'
          || cs.visibility === 'hidden'
          || parseFloat(cs.opacity) < 0.05
          || pre.hidden
          || pre.hasAttribute('hidden');
    }

    if (gone()) return cb();

    var fired = false;
    function finish() {
      if (fired) return;
      fired = true;
      clearInterval(poll);
      clearTimeout(cap);
      if (mo) mo.disconnect();
      cb();
    }

    var poll = setInterval(function () { if (gone()) finish(); }, CONFIG.pollInterval);

    var mo = null;
    if (typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(function () { if (gone()) finish(); });
      mo.observe(pre, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    }

    var cap = setTimeout(finish, CONFIG.preloaderTimeout);
  }

  function failsafe() {
    setTimeout(function () {
      document.querySelectorAll('.reveal-blur:not(.is-visible)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add('is-visible', 'is-done');
        }
      });
    }, CONFIG.failsafeTimeout);
  }

  function watchMedia() {
    var onChange = function () {
      reduce   = mqReduce.matches;
      isMobile = mqMobile.matches;
      syncCSSVars();
      if (reduce) {
        document.querySelectorAll('.reveal-blur').forEach(function (el) {
          el.classList.add('is-visible', 'is-done');
        });
        if (heroEl) {
          heroEl.style.filter = 'none';
          heroEl.style.opacity = '1';
          heroEl.style.transform = 'none';
        }
      }
    };
    if (mqReduce.addEventListener) {
      mqReduce.addEventListener('change', onChange);
      mqMobile.addEventListener('change', onChange);
    } else if (mqReduce.addListener) {
      mqReduce.addListener(onChange);
      mqMobile.addListener(onChange);
    }
  }

  function boot() {
    heroEl = document.querySelector(CONFIG.heroSelector);

    syncCSSVars();
    tagElements();
    applyStagger();
    heroScrollBlur();

    waitForPreloader(function () {
      observeAll();
      failsafe();
    });

    watchMedia();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
