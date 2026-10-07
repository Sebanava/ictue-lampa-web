"use strict";

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector(".header");
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".nav-menu");
const hero = document.querySelector(".hero");
const heroPhoto = document.querySelector(".hero-photo");
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
  if (motionPreference.matches || window.innerWidth <= 800) {
    heroPhoto.style.removeProperty("--parallax");
    return;
  }
  const rect = hero.getBoundingClientRect();
  if (rect.bottom > 0 && rect.top < window.innerHeight) {
    heroPhoto.style.setProperty(
      "--parallax",
      `${Math.min(55, Math.max(0, -rect.top * 0.09))}px`,
    );
  }
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
