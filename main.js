/* ═══════════════════════════════════════
   main.js — studentsite.dev / studentsite.online
═══════════════════════════════════════ */

(function () {
  'use strict';

  /* ════════════════════════════════════
     DOMAIN CONFIG — edit this list manually
     Add or remove objects to show more/fewer domains.
     Fields:
       label  — domain name shown in the pill
       status — 'online' or 'offline' (you control this)
  ════════════════════════════════════ */
  var DOMAINS = [
    { label: 'studentsite.dev',    status: 'online'  },
    { label: 'studentsite.online', status: 'online'  },
    // { label: 'example.com',       status: 'offline' },
  ];
  /* ════════════════════════════════════ */

  /* ────────────────────────────────────
     DOMAIN STATUS — render pills from config
  ──────────────────────────────────── */
  var domainList = document.getElementById('domainStatusList');

  function buildDomainPills() {
    if (!domainList || !DOMAINS.length) return;
    DOMAINS.forEach(function (domain) {
      var status = domain.status === 'offline' ? 'offline' : 'online';
      var statusText = status === 'online' ? 'online' : 'offline';
      var pill = document.createElement('span');
      pill.classList.add('domain-pill', 'domain-pill--' + status);
      pill.setAttribute('role', 'listitem');
      pill.setAttribute('aria-label', domain.label + ' \u2014 ' + statusText);
      pill.innerHTML =
        '<span class="domain-pill__dot" aria-hidden="true"></span>' +
        '<span class="domain-pill__name">' + escapeHTML(domain.label) + '</span>' +
        '<span class="domain-pill__status">' + statusText + '</span>';
      domainList.appendChild(pill);
    });
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  buildDomainPills();

  /* ────────────────────────────────────
     NAV — scroll effect
  ──────────────────────────────────── */
  var nav = document.getElementById('nav');
  var heroSection = document.getElementById('hero');

  function updateNav() {
    if (!nav || !heroSection) return;
    var heroBottom = heroSection.getBoundingClientRect().bottom;
    if (heroBottom <= 0) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ────────────────────────────────────
     SMOOTH SCROLL for nav/hero CTAs
  ──────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navHeight = nav ? nav.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ────────────────────────────────────
     FADE-UP — IntersectionObserver
  ──────────────────────────────────── */
  var fadeElements = document.querySelectorAll('.fade-up');

  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = el.dataset.delay || 0;
            setTimeout(function () {
              el.classList.add('is-visible');
            }, Number(delay));
            fadeObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    // Stagger siblings within each section by 80ms
    var sections = document.querySelectorAll('section, header, footer');
    sections.forEach(function (section) {
      var children = section.querySelectorAll('.fade-up');
      children.forEach(function (child, i) {
        child.dataset.delay = i * 80;
        fadeObserver.observe(child);
      });
    });
  } else {
    // Fallback: show everything
    fadeElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ────────────────────────────────────
     SPOT DOTS — animate taken/available
  ──────────────────────────────────── */
  var spotDotsContainer = document.getElementById('spotDots');
  var TOTAL_SPOTS = 50;
  var TAKEN_SPOTS = 12;

  function buildSpotDots() {
    if (!spotDotsContainer) return;

    // Create all dots as "base" first (invisible)
    var dots = [];
    for (var i = 0; i < TOTAL_SPOTS; i++) {
      var dot = document.createElement('span');
      dot.classList.add('spot-dot');
      dot.setAttribute('aria-hidden', 'true');
      spotDotsContainer.appendChild(dot);
      dots.push(dot);
    }

    // Animate "taken" dots filling in with 50ms stagger
    var takenIndices = pickRandom(TOTAL_SPOTS, TAKEN_SPOTS);
    takenIndices.forEach(function (idx, order) {
      setTimeout(function () {
        dots[idx].classList.add('spot-dot--taken', 'spot-dot--animate');
      }, order * 50);
    });

    // After taken animation, fill available
    var totalTakenDelay = TAKEN_SPOTS * 50 + 100;
    for (var j = 0; j < TOTAL_SPOTS; j++) {
      if (!takenIndices.includes(j)) {
        (function (dotEl, delay) {
          setTimeout(function () {
            dotEl.classList.add('spot-dot--available', 'spot-dot--animate');
          }, delay);
        })(dots[j], totalTakenDelay + j * 12);
      }
    }
  }

  function pickRandom(max, count) {
    var pool = [];
    for (var i = 0; i < max; i++) pool.push(i);
    var result = [];
    for (var k = 0; k < count; k++) {
      var randIdx = Math.floor(Math.random() * pool.length);
      result.push(pool[randIdx]);
      pool.splice(randIdx, 1);
    }
    return result;
  }

  // Only animate when scarcity section is visible
  var scarcitySection = document.getElementById('scarcity');
  var dotsAnimated = false;

  if (scarcitySection && 'IntersectionObserver' in window) {
    var dotsObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting && !dotsAnimated) {
          dotsAnimated = true;
          buildSpotDots();
          dotsObserver.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    dotsObserver.observe(scarcitySection);
  } else {
    buildSpotDots();
  }

  /* ────────────────────────────────────
     FORM — validation + success state
  ──────────────────────────────────── */
  var form = document.getElementById('applyForm');
  var submitBtn = document.getElementById('submitBtn');
  var formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', function (e) {
      if (!validateForm()) {
        e.preventDefault();
        return;
      }
      // If form passes validation, let formsubmit.co handle submission
      // but show success state in JS to improve UX
      e.preventDefault();
      handleSuccess();
    });

    // Live validation: clear error on input
    form.querySelectorAll('.form-input, .form-textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        clearError(input);
      });
    });

    form.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        var errorEl = document.getElementById('siteTypeError');
        if (errorEl) errorEl.classList.remove('is-visible');
      });
    });

    var agreeCheckbox = document.getElementById('agree');
    if (agreeCheckbox) {
      agreeCheckbox.addEventListener('change', function () {
        clearError(agreeCheckbox);
        var errorEl = document.getElementById('agreeError');
        if (errorEl) errorEl.classList.remove('is-visible');
      });
    }
  }

  function validateForm() {
    var valid = true;

    // Name
    var nameInput = document.getElementById('name');
    if (nameInput && nameInput.value.trim() === '') {
      showError(nameInput, 'nameError');
      valid = false;
    }

    // Email
    var emailInput = document.getElementById('email');
    if (emailInput) {
      var emailVal = emailInput.value.trim();
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        showError(emailInput, 'emailError');
        valid = false;
      }
    }

    // Subdomain
    var subdomainInput = document.getElementById('subdomain');
    if (subdomainInput) {
      var subdVal = subdomainInput.value.trim();
      var subdRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
      if (!subdVal || !subdRegex.test(subdVal)) {
        showError(subdomainInput, 'subdomainError');
        valid = false;
      }
    }

    // Site type
    var siteTypeSelected = form.querySelector('input[name="site_type"]:checked');
    if (!siteTypeSelected) {
      var siteTypeError = document.getElementById('siteTypeError');
      if (siteTypeError) siteTypeError.classList.add('is-visible');
      valid = false;
    }

    // Description
    var descInput = document.getElementById('description');
    if (descInput && descInput.value.trim().length < 5) {
      showError(descInput, 'descriptionError');
      valid = false;
    }

    // Agree checkbox
    var agreeEl = document.getElementById('agree');
    if (agreeEl && !agreeEl.checked) {
      var agreeError = document.getElementById('agreeError');
      if (agreeError) agreeError.classList.add('is-visible');
      valid = false;
    }

    // Scroll to first error
    if (!valid) {
      var firstError = form.querySelector('.form-input.has-error, .form-textarea.has-error');
      if (firstError) {
        var navH = nav ? nav.offsetHeight + 16 : 16;
        var top = firstError.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }

    return valid;
  }

  function showError(inputEl, errorId) {
    inputEl.classList.add('has-error');
    var errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.classList.add('is-visible');
  }

  function clearError(inputEl) {
    inputEl.classList.remove('has-error');
    // Find closest form-field and hide its error span
    var field = inputEl.closest('.form-field');
    if (field) {
      var errorEl = field.querySelector('.form-error');
      if (errorEl) errorEl.classList.remove('is-visible');
    }
  }

  function handleSuccess() {
    // Submit via fetch so we stay on the page
    var formData = new FormData(form);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
      .then(function () {
        showSuccess();
      })
      .catch(function () {
        // Even on network error, show success (formsubmit may have received it)
        showSuccess();
      });
  }

  function showSuccess() {
    // Hide form fields
    form.querySelectorAll('.form-row--two, .form-field, .btn--submit').forEach(function (el) {
      el.style.display = 'none';
    });

    // Show success message
    if (formSuccess) {
      formSuccess.removeAttribute('hidden');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ────────────────────────────────────
     FAQ — keyboard accessibility (details/summary)
     Native <details> handles click; add keyboard support
  ──────────────────────────────────── */
  document.querySelectorAll('.faq__question').forEach(function (summary) {
    summary.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var details = summary.closest('details');
        if (details) {
          details.open = !details.open;
        }
      }
    });
  });

})();
