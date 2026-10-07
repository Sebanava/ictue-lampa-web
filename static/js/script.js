"use strict";

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector(".header");
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".nav-menu");
const form = document.getElementById("prayer-form");
const message = document.getElementById("oracion-mensaje");
const phone = document.getElementById("oracion-telefono");
const call = document.getElementById("oracion-llamada");
const petition = document.getElementById("oracion-peticion");
const counter = document.getElementById("peticion-count");

header.classList.add("js-nav");
menuToggle.hidden = false;

function closeMenu(restoreFocus = false) {
  menu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
menu.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("open"))
    closeMenu(true);
});
document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) closeMenu();
});
window
  .matchMedia("(min-width: 801px)")
  .addEventListener("change", () => closeMenu());

let framePending = false;
function updateScroll() {
  framePending = false;
  header.classList.toggle("scrolled", window.scrollY > 20);
}
function requestScrollUpdate() {
  if (!framePending) {
    framePending = true;
    window.requestAnimationFrame(updateScroll);
  }
}
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
updateScroll();

let revealObserver;
const revealElements = document.querySelectorAll("[data-reveal]");
function configureReveals() {
  if (revealObserver) revealObserver.disconnect();
  revealElements.forEach((element) =>
    element.classList.remove("reveal-pending"),
  );
  updateScroll();
  if (motionPreference.matches || !("IntersectionObserver" in window)) return;
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  revealElements.forEach((element) => {
    if (!element.classList.contains("is-visible")) {
      element.classList.add("reveal-pending");
      revealObserver.observe(element);
    }
  });
}
configureReveals();
motionPreference.addEventListener("change", configureReveals);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        menu.querySelectorAll("a").forEach((link) => {
          if (link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-20% 0px -55% 0px", threshold: 0 },
  );
  document
    .querySelectorAll("main section[id]")
    .forEach((section) => sectionObserver.observe(section));
}

function updateCounter() {
  counter.textContent = `${petition.value.length} / 500 caracteres`;
}
petition.addEventListener("input", updateCounter);

function updatePhoneRequirement() {
  phone.required = call.checked;
  phone.setCustomValidity("");
}
call.addEventListener("change", updatePhoneRequirement);
phone.addEventListener("input", () => phone.setCustomValidity(""));
updatePhoneRequirement();

function showMessage(text, success = false) {
  message.textContent = text;
  message.className = `form-message ${success ? "success" : "error"}`;
  message.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  if (button.disabled) return;
  const nombre = document.getElementById("oracion-nombre").value.trim();
  const peticion = petition.value.trim();
  const telefono = phone.value.trim();
  const llamada = call.checked;
  if (!nombre || !peticion) {
    showMessage("Escribe tu nombre y tu petición para poder enviarla.");
    (!nombre ? document.getElementById("oracion-nombre") : petition).focus();
    return;
  }
  if (llamada && !telefono) {
    phone.setCustomValidity("Escribe tu teléfono si deseas que te llamemos.");
    phone.reportValidity();
    return;
  }
  message.hidden = true;
  button.disabled = true;
  button.textContent = "Enviando petición…";
  form.setAttribute("aria-busy", "true");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(form.getAttribute("action"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, peticion, telefono, llamada }),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok || data.ok !== true) throw new Error("No se pudo enviar");
    form.reset();
    updateCounter();
    updatePhoneRequirement();
    showMessage(
      "¡Petición enviada! Nuestro equipo de intercesión orará por ti.",
      true,
    );
  } catch (error) {
    showMessage(
      error.name === "AbortError"
        ? "El envío tardó más de lo esperado y no pudimos confirmar la recepción. Puedes contactarnos por correo."
        : "No pudimos enviar tu petición. Tus datos siguen aquí; inténtalo de nuevo o escríbenos a ictueoracion@gmail.com.",
    );
  } finally {
    window.clearTimeout(timeout);
    button.disabled = false;
    button.textContent = "Enviar petición ↗︎";
    form.removeAttribute("aria-busy");
  }
});

document.getElementById("year").textContent = String(new Date().getFullYear());

const instagramTrack = document.getElementById("instagram-track");
if (instagramTrack) {
  const cards = [...instagramTrack.querySelectorAll(".instagram-card")];
  const carousel = instagramTrack.closest(".instagram-carousel");
  const previous = carousel.querySelector(".instagram-prev");
  const next = carousel.querySelector(".instagram-next");
  const toggle = carousel.querySelector(".instagram-toggle");
  const status = carousel.querySelector(".instagram-status");
  const hasVisibilityObserver = "IntersectionObserver" in window;
  let autoplayEnabled = !motionPreference.matches;
  let trackVisible = false;
  let hovered = false;
  let autoplayTimer = 0;
  let animationFrame = 0;
  let autoplayDirection = 1;
  carousel.querySelector(".instagram-controls").hidden = false;

  function cardStep() {
    return cards.length > 1
      ? cards[1].offsetLeft - cards[0].offsetLeft
      : instagramTrack.clientWidth;
  }
  function updateInstagramControls() {
    const step = cardStep();
    const first = Math.max(0, Math.round(instagramTrack.scrollLeft / step));
    const visible = Math.max(1, Math.round(instagramTrack.clientWidth / step));
    previous.disabled = instagramTrack.scrollLeft <= 2;
    next.disabled =
      instagramTrack.scrollLeft >=
      instagramTrack.scrollWidth - instagramTrack.clientWidth - 2;
    const label =
      visible === 1
        ? `Publicación ${first + 1} de ${cards.length}`
        : `Publicaciones ${first + 1}–${Math.min(cards.length, first + visible)} de ${cards.length}`;
    if (status.textContent !== label) status.textContent = label;
  }
  function updateAutoplayControl() {
    toggle.hidden = motionPreference.matches;
    toggle.textContent = autoplayEnabled ? "Pausar" : "Reproducir";
    toggle.setAttribute(
      "aria-label",
      autoplayEnabled
        ? "Pausar avance automático"
        : "Reproducir publicaciones automáticamente",
    );
    status.setAttribute("aria-live", autoplayEnabled ? "off" : "polite");
  }
  function cancelInstagramAnimation() {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = 0;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    instagramTrack.classList.remove("is-auto-scrolling");
  }
  function canAutoplay() {
    const focused = document.activeElement;
    return (
      autoplayEnabled &&
      !motionPreference.matches &&
      trackVisible &&
      !document.hidden &&
      !hovered &&
      !(focused !== toggle && carousel.contains(focused)) &&
      instagramTrack.scrollWidth - instagramTrack.clientWidth > 2
    );
  }
  function scheduleAutoplay() {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = 0;
    if (!canAutoplay() || animationFrame) return;
    autoplayTimer = window.setTimeout(advanceInstagram, 10000);
  }
  function stopAutoplay() {
    autoplayEnabled = false;
    cancelInstagramAnimation();
    updateAutoplayControl();
  }
  function advanceInstagram() {
    autoplayTimer = 0;
    if (!canAutoplay()) return;
    const maximum = instagramTrack.scrollWidth - instagramTrack.clientWidth;
    const start = Math.max(0, Math.min(maximum, instagramTrack.scrollLeft));
    if (start >= maximum - 2) autoplayDirection = -1;
    else if (start <= 2) autoplayDirection = 1;
    const destination = Math.max(
      0,
      Math.min(maximum, start + autoplayDirection * cardStep()),
    );
    let startedAt;
    instagramTrack.classList.add("is-auto-scrolling");
    function animate(timestamp) {
      if (!canAutoplay()) {
        cancelInstagramAnimation();
        return;
      }
      if (startedAt === undefined) startedAt = timestamp;
      const progress = Math.min(1, (timestamp - startedAt) / 1100);
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      instagramTrack.scrollTo({
        left: start + (destination - start) * eased,
        behavior: "instant",
      });
      if (progress < 1) animationFrame = window.requestAnimationFrame(animate);
      else {
        animationFrame = 0;
        instagramTrack.classList.remove("is-auto-scrolling");
        updateInstagramControls();
        scheduleAutoplay();
      }
    }
    animationFrame = window.requestAnimationFrame(animate);
  }
  function updateFallbackVisibility() {
    const bounds = instagramTrack.getBoundingClientRect();
    const visibleWidth = Math.max(
      0,
      Math.min(bounds.right, window.innerWidth) - Math.max(bounds.left, 0),
    );
    const visibleHeight = Math.max(
      0,
      Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0),
    );
    const visible =
      bounds.width > 0 &&
      bounds.height > 0 &&
      (visibleWidth * visibleHeight) / (bounds.width * bounds.height) >= 0.2;
    if (visible === trackVisible) return;
    trackVisible = visible;
    cancelInstagramAnimation();
    scheduleAutoplay();
  }
  function moveInstagram(direction) {
    stopAutoplay();
    instagramTrack.scrollBy({
      left: direction * cardStep(),
      behavior: motionPreference.matches ? "instant" : "smooth",
    });
  }
  toggle.addEventListener("click", () => {
    if (motionPreference.matches) return;
    autoplayEnabled = !autoplayEnabled;
    cancelInstagramAnimation();
    updateAutoplayControl();
    scheduleAutoplay();
  });
  previous.addEventListener("click", () => moveInstagram(-1));
  next.addEventListener("click", () => moveInstagram(1));
  instagramTrack.addEventListener("keydown", (event) => {
    if (event.target !== instagramTrack) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveInstagram(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  instagramTrack.addEventListener("scroll", updateInstagramControls, {
    passive: true,
  });
  ["pointerdown", "touchstart", "wheel"].forEach((eventName) => {
    instagramTrack.addEventListener(eventName, stopAutoplay, { passive: true });
  });
  carousel.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    cancelInstagramAnimation();
  });
  carousel.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = false;
    scheduleAutoplay();
  });
  carousel.addEventListener("focusin", (event) => {
    if (event.target !== toggle) stopAutoplay();
  });
  window.addEventListener("blur", () => {
    window.setTimeout(() => {
      if (instagramTrack.contains(document.activeElement)) stopAutoplay();
    }, 0);
  });
  window.addEventListener(
    "resize",
    () => {
      cancelInstagramAnimation();
      updateInstagramControls();
      if (!hasVisibilityObserver) updateFallbackVisibility();
      scheduleAutoplay();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    cancelInstagramAnimation();
    scheduleAutoplay();
  });
  motionPreference.addEventListener("change", () => {
    autoplayEnabled = false;
    cancelInstagramAnimation();
    updateAutoplayControl();
  });
  if (hasVisibilityObserver) {
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible =
            entry.isIntersecting && entry.intersectionRatio >= 0.2;
          if (visible === trackVisible) return;
          trackVisible = visible;
          cancelInstagramAnimation();
          scheduleAutoplay();
        });
      },
      { threshold: [0, 0.2] },
    );
    visibilityObserver.observe(instagramTrack);
  } else {
    window.addEventListener("scroll", updateFallbackVisibility, {
      passive: true,
    });
    updateFallbackVisibility();
  }
  updateAutoplayControl();
  updateInstagramControls();

  function loadInstagramCard(card) {
    const frame = card.querySelector(".instagram-frame");
    if (!frame.dataset.src) return;
    frame.src = frame.dataset.src;
    delete frame.dataset.src;
    frame.hidden = false;
    card.querySelector(".instagram-preview").hidden = true;
  }
  if ("IntersectionObserver" in window) {
    const embedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadInstagramCard(entry.target);
            embedObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    cards.forEach((card) => embedObserver.observe(card));
  } else {
    cards.forEach(loadInstagramCard);
  }
}
