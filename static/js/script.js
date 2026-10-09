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
  .matchMedia("(min-width: 1001px)")
  .addEventListener("change", () => closeMenu());

let framePending = false;
let sceneObserver;
const activeScenes = new Set();
const scrollScenes = [...document.querySelectorAll("[data-scroll]")].map(
  (element) => ({
    element,
    type: element.dataset.scroll,
    anchor:
      element.dataset.scroll === "portrait"
        ? element.closest(".portrait")
        : element.dataset.scroll === "hero"
          ? element
          : element.dataset.scroll === "detail"
            ? element.closest(".ministry-card, .radio-row, .prayer-intro") ||
              element.parentElement
            : element.parentElement,
  }),
);

function updateSceneMotion() {
  if (motionPreference.matches || document.hidden) return;
  const viewport = window.innerHeight;
  const compact = window.innerWidth <= 800;
  const measurements = [...activeScenes].map((scene) => ({
    scene,
    bounds: scene.anchor.getBoundingClientRect(),
  }));
  measurements.forEach(({ scene, bounds }) => {
    const progress = Math.min(
      1,
      Math.max(0, (viewport - bounds.top) / (viewport + bounds.height)),
    );
    if (scene.type === "hero") {
      scene.element.style.setProperty(
        "--hero-shift",
        `${(progress * (compact ? 50 : 100)).toFixed(2)}px`,
      );
      return;
    }
    const distance =
      scene.type === "portrait"
        ? compact
          ? 12
          : 28
        : scene.type === "detail"
          ? compact
            ? 16
            : 28
          : compact
            ? 36
            : 64;
    scene.element.style.setProperty(
      "--scroll-shift",
      `${((0.5 - progress) * distance).toFixed(2)}px`,
    );
    if (scene.type === "portrait") {
      scene.element.style.setProperty(
        "--scroll-zoom",
        (1.115 - progress * 0.035).toFixed(4),
      );
    } else if (scene.type === "heading") {
      scene.element.style.setProperty(
        "--scroll-zoom",
        (0.96 + Math.min(1, progress * 1.8) * 0.04).toFixed(4),
      );
    }
  });
}

function configureSceneMotion() {
  sceneObserver?.disconnect();
  activeScenes.clear();
  document.documentElement.classList.toggle(
    "scroll-motion",
    !motionPreference.matches,
  );
  scrollScenes.forEach(({ element }) => {
    ["--scroll-shift", "--scroll-zoom", "--hero-shift"].forEach((property) =>
      element.style.removeProperty(property),
    );
  });
  if (motionPreference.matches) return;
  if ("IntersectionObserver" in window) {
    const scenesByElement = new Map(
      scrollScenes.map((scene) => [scene.element, scene]),
    );
    sceneObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const scene = scenesByElement.get(entry.target);
          if (entry.isIntersecting) activeScenes.add(scene);
          else activeScenes.delete(scene);
        });
        requestScrollUpdate();
      },
      { rootMargin: "160px 0px", threshold: 0 },
    );
    scrollScenes.forEach((scene) => sceneObserver.observe(scene.element));
  } else {
    scrollScenes.forEach((scene) => activeScenes.add(scene));
  }
  requestScrollUpdate();
}

function updateScroll() {
  framePending = false;
  header.classList.toggle("scrolled", window.scrollY > 20);
  if (motionPreference.matches) {
    header.style.removeProperty("--reading-progress");
    return;
  }
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress =
    scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  header.style.setProperty("--reading-progress", String(progress));
  updateSceneMotion();
}
function requestScrollUpdate() {
  if (!framePending) {
    framePending = true;
    window.requestAnimationFrame(updateScroll);
  }
}
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
document.addEventListener("visibilitychange", requestScrollUpdate);
document.addEventListener("transitionend", (event) => {
  if (
    event.propertyName === "transform" &&
    event.target.matches("[data-reveal]")
  )
    requestScrollUpdate();
});
configureSceneMotion();
motionPreference.addEventListener("change", configureSceneMotion);
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
    {
      rootMargin: `0px 0px -${Math.min(96, Math.round(window.innerHeight * 0.12))}px 0px`,
      threshold: 0.08,
    },
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
  const photoLoads = new WeakMap();
  const galleries = [...instagramTrack.querySelectorAll(".post-gallery")].map(
    (element) => ({
      element,
      photos: [...element.querySelectorAll(".post-photo")],
      count: element.querySelector(".photo-count"),
      index: 0,
      visible: false,
      hovered: false,
      pending: false,
      revision: 0,
      timer: 0,
      failed: new Set(),
    }),
  );
  let autoplayEnabled = !motionPreference.matches;
  carousel.querySelector(".instagram-controls").hidden = false;
  status.setAttribute("aria-live", "polite");

  function cardStep() {
    return cards.length > 1
      ? cards[1].offsetLeft - cards[0].offsetLeft
      : instagramTrack.clientWidth;
  }
  function updateInstagramControls() {
    const step = Math.max(1, cardStep());
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
    toggle.hidden =
      motionPreference.matches ||
      !galleries.some((state) => state.photos.length > 1);
    toggle.textContent = autoplayEnabled ? "Pausar fotos" : "Reproducir fotos";
    toggle.setAttribute("aria-label", toggle.textContent);
    toggle.removeAttribute("aria-pressed");
  }
  function canAutoplay(state) {
    return (
      autoplayEnabled &&
      !motionPreference.matches &&
      !document.hidden &&
      state.visible &&
      !state.hovered &&
      state.photos.length > 1
    );
  }
  function clearPhotoTimer(state) {
    window.clearTimeout(state.timer);
    state.timer = 0;
  }
  function nextPhotoIndex(state, direction) {
    for (let step = 1; step < state.photos.length; step += 1) {
      const index =
        (state.index + direction * step + state.photos.length) %
        state.photos.length;
      if (!state.failed.has(index)) return index;
    }
    return state.index;
  }
  function loadPhoto(photo) {
    if (photo.complete && photo.naturalWidth > 0) return Promise.resolve();
    if (photoLoads.has(photo)) return photoLoads.get(photo);
    const loaded = new Promise((resolve, reject) => {
      function removeListeners() {
        photo.removeEventListener("load", onLoad);
        photo.removeEventListener("error", onError);
      }
      async function onLoad() {
        removeListeners();
        if (typeof photo.decode === "function") {
          try {
            await photo.decode();
          } catch {
            if (!photo.naturalWidth) {
              reject(new Error("La foto no está disponible"));
              return;
            }
          }
        }
        resolve();
      }
      function onError() {
        removeListeners();
        reject(new Error("La foto no está disponible"));
      }
      photo.addEventListener("load", onLoad);
      photo.addEventListener("error", onError);
      photo.loading = "eager";
      if (photo.dataset.src) {
        photo.src = photo.dataset.src;
        delete photo.dataset.src;
      }
      if (photo.complete) {
        if (photo.naturalWidth > 0) onLoad();
        else if (photo.getAttribute("src")) onError();
      }
    });
    photoLoads.set(photo, loaded);
    return loaded;
  }
  function preloadNextPhoto(state) {
    if (!state.visible || state.photos.length < 2 || document.hidden) return;
    const index = nextPhotoIndex(state, 1);
    if (index === state.index) return;
    loadPhoto(state.photos[index]).catch(() => state.failed.add(index));
  }
  function schedulePhotos(state) {
    clearPhotoTimer(state);
    if (!canAutoplay(state) || state.pending) return;
    state.timer = window.setTimeout(() => {
      state.timer = 0;
      if (!canAutoplay(state)) return;
      changePhoto(state, 1, false);
    }, 2000);
  }
  function scheduleAllPhotos() {
    galleries.forEach(schedulePhotos);
  }
  function pausePhotos() {
    autoplayEnabled = false;
    galleries.forEach(clearPhotoTimer);
    updateAutoplayControl();
  }
  function updatePhotoPresentation(state, manual = false) {
    state.photos.forEach((photo, index) => {
      const active = index === state.index;
      photo.classList.toggle("is-active", active);
      photo.setAttribute("aria-hidden", String(!active));
    });
    if (state.count) {
      state.count.setAttribute("aria-live", manual ? "polite" : "off");
      state.count.textContent = `${state.index + 1} / ${state.photos.length}`;
    }
  }
  async function changePhoto(state, direction, manual = true) {
    if (manual) pausePhotos();
    const index = nextPhotoIndex(state, direction);
    if (index === state.index) return;
    clearPhotoTimer(state);
    const revision = ++state.revision;
    state.pending = true;
    try {
      await loadPhoto(state.photos[index]);
      if (revision !== state.revision || (!manual && !canAutoplay(state)))
        return;
      state.index = index;
      updatePhotoPresentation(state, manual);
      preloadNextPhoto(state);
    } catch {
      state.failed.add(index);
    } finally {
      if (revision === state.revision) {
        state.pending = false;
        schedulePhotos(state);
      }
    }
  }
  function setGalleryVisibility(state, visible) {
    if (visible === state.visible) return;
    state.visible = visible;
    if (visible) preloadNextPhoto(state);
    schedulePhotos(state);
  }
  function updateFallbackVisibility() {
    const trackBounds = instagramTrack.getBoundingClientRect();
    galleries.forEach((state) => {
      const bounds = state.element.getBoundingClientRect();
      const width = Math.max(
        0,
        Math.min(bounds.right, trackBounds.right, window.innerWidth) -
          Math.max(bounds.left, trackBounds.left, 0),
      );
      const height = Math.max(
        0,
        Math.min(bounds.bottom, trackBounds.bottom, window.innerHeight) -
          Math.max(bounds.top, trackBounds.top, 0),
      );
      const visible =
        bounds.width > 0 &&
        bounds.height > 0 &&
        (width * height) / (bounds.width * bounds.height) >= 0.2;
      if (visible) loadPhoto(state.photos[state.index]).catch(() => {});
      setGalleryVisibility(state, visible);
    });
  }
  function moveInstagram(direction) {
    pausePhotos();
    instagramTrack.scrollBy({
      left: direction * cardStep(),
      behavior: motionPreference.matches ? "instant" : "smooth",
    });
  }
  toggle.addEventListener("click", () => {
    if (motionPreference.matches) return;
    autoplayEnabled = !autoplayEnabled;
    updateAutoplayControl();
    if (autoplayEnabled) galleries.forEach(preloadNextPhoto);
    scheduleAllPhotos();
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
  instagramTrack.addEventListener(
    "scroll",
    () => {
      updateInstagramControls();
      if (!hasVisibilityObserver) updateFallbackVisibility();
    },
    { passive: true },
  );
  ["pointerdown", "wheel"].forEach((eventName) => {
    instagramTrack.addEventListener(eventName, pausePhotos, { passive: true });
  });
  carousel.addEventListener("focusin", (event) => {
    if (event.target !== toggle) pausePhotos();
  });
  galleries.forEach((state) => {
    let gesture;
    const gallery = state.element;
    const previousPhoto = gallery.querySelector(".photo-prev");
    const nextPhoto = gallery.querySelector(".photo-next");
    state.index = Math.max(
      0,
      state.photos.findIndex((photo) => photo.classList.contains("is-active")),
    );
    updatePhotoPresentation(state);
    previousPhoto?.addEventListener("click", () => changePhoto(state, -1));
    nextPhoto?.addEventListener("click", () => changePhoto(state, 1));
    gallery.addEventListener("keydown", (event) => {
      if (event.target !== gallery) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        changePhoto(state, event.key === "ArrowRight" ? 1 : -1);
      }
    });
    gallery.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      state.hovered = true;
      clearPhotoTimer(state);
    });
    gallery.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "mouse") return;
      state.hovered = false;
      schedulePhotos(state);
    });
    gallery.addEventListener("pointerdown", (event) => {
      if (
        event.pointerType === "mouse" ||
        !event.isPrimary ||
        event.target.closest("button, a")
      )
        return;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
      gallery.setPointerCapture(event.pointerId);
    });
    gallery.addEventListener("pointermove", (event) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const horizontal = Math.abs(event.clientX - gesture.x);
      const vertical = Math.abs(event.clientY - gesture.y);
      if (horizontal > 12 && horizontal > vertical * 1.4)
        event.preventDefault();
    });
    gallery.addEventListener("pointerup", (event) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const horizontal = event.clientX - gesture.x;
      const vertical = event.clientY - gesture.y;
      gesture = undefined;
      if (
        Math.abs(horizontal) >= 40 &&
        Math.abs(horizontal) > Math.abs(vertical) * 1.4
      )
        changePhoto(state, horizontal < 0 ? 1 : -1);
    });
    gallery.addEventListener("pointercancel", () => {
      gesture = undefined;
    });
  });
  window.addEventListener(
    "resize",
    () => {
      updateInstagramControls();
      if (!hasVisibilityObserver) updateFallbackVisibility();
      scheduleAllPhotos();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) galleries.forEach(preloadNextPhoto);
    scheduleAllPhotos();
  });
  motionPreference.addEventListener("change", () => {
    autoplayEnabled = false;
    galleries.forEach(clearPhotoTimer);
    updateAutoplayControl();
  });
  if (hasVisibilityObserver) {
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const state = galleries.find((item) => item.element === entry.target);
          setGalleryVisibility(
            state,
            entry.isIntersecting && entry.intersectionRatio >= 0.2,
          );
        });
      },
      { threshold: [0, 0.2] },
    );
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const state = galleries.find((item) => item.element === entry.target);
          loadPhoto(state.photos[state.index]).catch(() => {});
          imageObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    galleries.forEach((state) => {
      visibilityObserver.observe(state.element);
      imageObserver.observe(state.element);
    });
  } else {
    window.addEventListener("scroll", updateFallbackVisibility, {
      passive: true,
    });
    updateFallbackVisibility();
  }
  if (
    carousel.contains(document.activeElement) &&
    document.activeElement !== toggle
  )
    pausePhotos();
  updateAutoplayControl();
  updateInstagramControls();
}

const eventCards = [...document.querySelectorAll("[data-event-date]")];
const eventEmpty = document.getElementById("event-empty");
function updateUpcomingEvents() {
  if (!eventEmpty) return;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const today = `${date.year}-${date.month}-${date.day}`;
  eventCards.forEach((card) => {
    card.hidden = card.dataset.eventDate < today;
  });
  eventEmpty.hidden = eventCards.some((card) => !card.hidden);
  requestScrollUpdate();
}
updateUpcomingEvents();
window.addEventListener("pageshow", updateUpcomingEvents);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateUpcomingEvents();
});

const eventDialog = document.getElementById("event-poster-dialog");
if (eventDialog && typeof eventDialog.showModal === "function") {
  const title = document.getElementById("event-dialog-title");
  const image = eventDialog.querySelector(".event-dialog-image");
  const original = eventDialog.querySelector(".event-dialog-original");
  let opener;
  document.querySelectorAll("[data-event-poster]").forEach((link) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.setAttribute("aria-controls", eventDialog.id);
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      opener = link;
      title.textContent = link.dataset.eventTitle;
      image.alt = link.querySelector("img").alt;
      image.src = link.href;
      original.href = link.href;
      eventDialog.showModal();
      document.documentElement.classList.add("event-poster-open");
    });
  });
  eventDialog.querySelector(".event-dialog-close").addEventListener("click", () => eventDialog.close());
  eventDialog.addEventListener("click", (event) => {
    if (event.target !== eventDialog) return;
    const bounds = eventDialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom
    )
      eventDialog.close();
  });
  eventDialog.addEventListener("close", () => {
    document.documentElement.classList.remove("event-poster-open");
    opener?.focus({ preventScroll: true });
  });
}
