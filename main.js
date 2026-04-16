(function () {
  "use strict";

  const DOMAINS = [
    { label: "studentsite.dev", status: "online" },
    { label: "studentsite.online", status: "online" }
  ];

  const nav = document.getElementById("nav");
  const heroSection = document.getElementById("hero");
  const domainList = document.getElementById("domainStatusList");
  const form = document.getElementById("applyForm");
  const submitBtn = document.getElementById("submitBtn");
  const formSuccess = document.getElementById("formSuccess");
  const formError = document.getElementById("formError");

  function buildDomainPills() {
    if (!domainList) return;

    DOMAINS.forEach(function (domain) {
      const status = domain.status === "offline" ? "offline" : "online";
      const pill = document.createElement("span");
      const dot = document.createElement("span");
      const name = document.createElement("span");
      const statusLabel = document.createElement("span");

      pill.className = "domain-pill domain-pill--" + status;
      pill.setAttribute("role", "listitem");
      pill.setAttribute("aria-label", domain.label + " is " + status);

      dot.className = "domain-pill__dot";
      dot.setAttribute("aria-hidden", "true");

      name.className = "domain-pill__name";
      name.textContent = domain.label;

      statusLabel.className = "domain-pill__status";
      statusLabel.textContent = status;

      pill.append(dot, name, statusLabel);
      domainList.appendChild(pill);
    });
  }

  function updateNav() {
    if (!nav || !heroSection) return;
    nav.classList.toggle("scrolled", heroSection.getBoundingClientRect().bottom <= 0);
  }

  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
      });
    });
  }

  function setupFadeUp() {
    const fadeElements = document.querySelectorAll(".fade-up");

    if (!("IntersectionObserver" in window)) {
      fadeElements.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const delay = Number(element.dataset.delay || 0);

        window.setTimeout(function () {
          element.classList.add("is-visible");
        }, delay);

        observer.unobserve(element);
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px"
    });

    document.querySelectorAll("section, header, footer").forEach(function (section) {
      section.querySelectorAll(".fade-up").forEach(function (element, index) {
        element.dataset.delay = index * 70;
        observer.observe(element);
      });
    });
  }

  function setFieldError(field, input, errorId) {
    const error = document.getElementById(errorId);

    if (field) field.classList.add("has-error");
    if (input) {
      input.classList.add("has-error");
      input.setAttribute("aria-invalid", "true");
    }
    if (error) error.classList.add("is-visible");
  }

  function clearFieldError(field, input, errorId) {
    const error = errorId
      ? document.getElementById(errorId)
      : field && field.querySelector(".form-error");

    if (field) field.classList.remove("has-error");
    if (input) {
      input.classList.remove("has-error");
      input.removeAttribute("aria-invalid");
    }
    if (error) error.classList.remove("is-visible");
  }

  function clearFormStatus() {
    if (formSuccess) formSuccess.hidden = true;
    if (formError) formError.hidden = true;
  }

  function validateForm() {
    if (!form) return false;

    let valid = true;
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const subdomainInput = document.getElementById("subdomain");
    const descriptionInput = document.getElementById("description");
    const siteTypeField = document.getElementById("siteTypeField");
    const agreeField = document.getElementById("agreeField");
    const agreeInput = document.getElementById("agree");

    clearFormStatus();

    if (nameInput && nameInput.value.trim() === "") {
      setFieldError(nameInput.closest(".form-field"), nameInput, "nameError");
      valid = false;
    }

    if (emailInput) {
      const emailValue = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(emailValue)) {
        setFieldError(emailInput.closest(".form-field"), emailInput, "emailError");
        valid = false;
      }
    }

    if (subdomainInput) {
      const subdomainValue = subdomainInput.value.trim();
      const subdomainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

      if (!subdomainRegex.test(subdomainValue)) {
        setFieldError(subdomainInput.closest(".form-field"), subdomainInput, "subdomainError");
        valid = false;
      }
    }

    if (!form.querySelector('input[name="site_type"]:checked')) {
      setFieldError(siteTypeField, null, "siteTypeError");
      valid = false;
    }

    if (descriptionInput && descriptionInput.value.trim().length < 5) {
      setFieldError(descriptionInput.closest(".form-field"), descriptionInput, "descriptionError");
      valid = false;
    }

    if (agreeInput && !agreeInput.checked) {
      setFieldError(agreeField, null, "agreeError");
      valid = false;
    }

    if (!valid) {
      const firstError = form.querySelector(".has-error");
      if (firstError) {
        const navHeight = nav ? nav.offsetHeight + 16 : 16;
        const targetTop = firstError.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    }

    return valid;
  }

  function showSuccess() {
    if (!form) return;

    form.classList.add("is-success");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Request sent";
    }
    if (formSuccess) {
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function showSubmitError(message) {
    if (!submitBtn) return;

    submitBtn.disabled = false;
    submitBtn.textContent = "Request a free hosting slot";

    if (formError) {
      formError.hidden = false;
      formError.textContent = message;
    }
  }

  async function submitForm() {
    if (!form || !submitBtn) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    clearFormStatus();

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }

      showSuccess();
    } catch (error) {
      showSubmitError("The request could not be sent. Try again in a minute.");
    }
  }

  function setupForm() {
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validateForm()) return;
      submitForm();
    });

    form.querySelectorAll(".form-input").forEach(function (input) {
      input.addEventListener("input", function () {
        clearFieldError(input.closest(".form-field"), input);
        clearFormStatus();
      });
    });

    form.querySelectorAll('input[name="site_type"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        clearFieldError(document.getElementById("siteTypeField"), null, "siteTypeError");
        clearFormStatus();
      });
    });

    const agreeCheckbox = document.getElementById("agree");
    if (agreeCheckbox) {
      agreeCheckbox.addEventListener("change", function () {
        clearFieldError(document.getElementById("agreeField"), null, "agreeError");
        clearFormStatus();
      });
    }
  }

  buildDomainPills();
  updateNav();
  setupSmoothScroll();
  setupFadeUp();
  setupForm();

  window.addEventListener("scroll", updateNav, { passive: true });
})();
