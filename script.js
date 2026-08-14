const body = document.body;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Header and navigation */
const header = document.querySelector("[data-header]");
const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 40);
};
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const closeMenu = () => {
  menuButton?.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
  mobileMenu?.classList.remove("is-open");
  mobileMenu?.setAttribute("aria-hidden", "true");
  header?.classList.remove("menu-open");
};
menuButton?.addEventListener("click", () => {
  const isOpen = !menuButton.classList.contains("is-open");
  menuButton.classList.toggle("is-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  mobileMenu?.classList.toggle("is-open", isOpen);
  mobileMenu?.setAttribute("aria-hidden", String(!isOpen));
  header?.classList.toggle("menu-open", isOpen);
});
mobileMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const navObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => link.classList.toggle("is-active", link.getAttribute("href") === "#" + visible.target.id));
    }, { rootMargin: "-30% 0px -58%", threshold: [0, .2, .5] })
  : null;
navLinks.forEach(link => {
  const section = document.querySelector(link.getAttribute("href"));
  if (section) navObserver?.observe(section);
});

/* Hero word */
const rotatingWord = document.querySelector("[data-rotating-word]");
const rotatingWords = ["działają.", "uspokajają.", "zostają.", "pasują."];
let rotatingIndex = 0;
if (rotatingWord && !reduceMotion) {
  window.setInterval(() => {
    rotatingWord.classList.add("is-changing");
    window.setTimeout(() => {
      rotatingIndex = (rotatingIndex + 1) % rotatingWords.length;
      rotatingWord.textContent = rotatingWords[rotatingIndex];
    }, 290);
    window.setTimeout(() => rotatingWord.classList.remove("is-changing"), 610);
  }, 3100);
}

/* Reveal */
const revealItems = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach(item => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: "0px 0px -50px" });
  revealItems.forEach(item => revealObserver.observe(item));
}

/* Cursor light */
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".spotlight").forEach(panel => {
    panel.addEventListener("pointermove", event => {
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty("--mx", (event.clientX - rect.left) + "px");
      panel.style.setProperty("--my", (event.clientY - rect.top) + "px");
    });
  });
}

/* Project modal */
const modal = document.querySelector("[data-modal]");
const modalImage = modal?.querySelector("[data-modal-image]");
const modalTitle = modal?.querySelector("[data-modal-title]");
const modalCategory = modal?.querySelector("[data-modal-category]");
const modalThumbs = modal?.querySelector("[data-modal-thumbs]");
let lastFocus = null;

const selectModalImage = source => {
  if (!modalImage || !modalThumbs) return;
  modalImage.src = source;
  modalThumbs.querySelectorAll("button").forEach(button => {
    const active = button.dataset.source === source;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
};

const openModal = card => {
  if (!modal || !card || !modalImage || !modalTitle || !modalCategory || !modalThumbs) return;
  lastFocus = document.activeElement;
  const gallery = (card.dataset.gallery || card.dataset.image || "")
    .split(",")
    .map(source => source.trim())
    .filter(Boolean);
  const firstImage = card.dataset.image || gallery[0] || "";
  modalImage.alt = card.dataset.title || "";
  modalTitle.textContent = card.dataset.title || "";
  modalCategory.textContent = card.dataset.category || "";
  modalThumbs.replaceChildren();
  gallery.forEach((source, index) => {
    const button = document.createElement("button");
    const image = document.createElement("img");
    button.type = "button";
    button.className = "modal__thumb";
    button.dataset.source = source;
    button.setAttribute("aria-label", `Pokaż zdjęcie ${index + 1}`);
    button.addEventListener("click", () => selectModalImage(source));
    image.src = source;
    image.alt = "";
    button.append(image);
    modalThumbs.append(button);
  });
  selectModalImage(firstImage);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  body.style.overflow = "hidden";
  modal.querySelector(".modal__close")?.focus();
};
const closeModal = () => {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  body.style.overflow = "";
  if (modalImage) modalImage.src = "";
  modalThumbs?.replaceChildren();
  lastFocus?.focus?.();
};
document.addEventListener("click", event => {
  const trigger = event.target.closest("[data-project-card] > button");
  if (trigger) openModal(trigger.closest("[data-project-card]"));
});
modal?.querySelector(".modal__close")?.addEventListener("click", closeModal);
modal?.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
});

/* Infinite, slow project carousel */
const viewport = document.querySelector("[data-project-viewport]");
const track = document.querySelector("[data-project-track]");
const projectPrev = document.querySelector("[data-project-prev]");
const projectNext = document.querySelector("[data-project-next]");
let sliderOffset = 0;
let sliderSetWidth = 0;
let sliderPaused = false;
let sliderAnimating = false;
let sliderRaf = 0;
let sliderLast = 0;
let sliderDesktop = false;

const originals = () => [...(track?.querySelectorAll("[data-project-card]:not([data-clone])") || [])];
const clearClones = () => track?.querySelectorAll("[data-clone]").forEach(clone => clone.remove());

const setTrackPosition = (value, animate = false) => {
  if (!track) return;
  track.style.transition = animate ? "transform .72s cubic-bezier(.2,.72,.2,1)" : "none";
  track.style.transform = "translate3d(" + (-value) + "px,0,0)";
};

const measureSlider = () => {
  const cards = originals();
  if (!track || cards.length < 2) return;
  const styles = getComputedStyle(track);
  const gap = parseFloat(styles.columnGap || styles.gap) || 0;
  sliderSetWidth = cards[cards.length - 1].offsetLeft + cards[cards.length - 1].offsetWidth - cards[0].offsetLeft + gap;
};

const sliderFrame = time => {
  if (!sliderDesktop || !track) return;
  if (!sliderLast) sliderLast = time;
  const delta = Math.min(40, time - sliderLast);
  sliderLast = time;
  if (!sliderPaused && !sliderAnimating && sliderSetWidth) {
    sliderOffset += delta * .018;
    if (sliderOffset >= sliderSetWidth) sliderOffset -= sliderSetWidth;
    setTrackPosition(sliderOffset);
  }
  sliderRaf = requestAnimationFrame(sliderFrame);
};

const setupSlider = () => {
  if (!track || !viewport) return;
  const shouldDesktop = innerWidth > 820;
  cancelAnimationFrame(sliderRaf);
  clearClones();
  track.style.transition = "none";
  track.style.transform = "none";
  sliderOffset = 0;
  sliderLast = 0;
  sliderDesktop = shouldDesktop;

  if (!shouldDesktop || reduceMotion) return;

  originals().forEach(card => {
    const clone = card.cloneNode(true);
    clone.dataset.clone = "true";
    clone.setAttribute("aria-hidden", "true");
    track.append(clone);
  });
  requestAnimationFrame(() => {
    measureSlider();
    setTrackPosition(0);
    sliderRaf = requestAnimationFrame(sliderFrame);
  });
};

const nudgeSlider = direction => {
  if (!track || !viewport) return;
  const first = originals()[0];
  if (!first) return;

  if (!sliderDesktop || reduceMotion) {
    viewport.scrollBy({ left: direction * (first.offsetWidth + 14), behavior: "smooth" });
    return;
  }

  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  const distance = first.offsetWidth + gap;
  if (direction < 0 && sliderOffset < distance) {
    sliderOffset += sliderSetWidth;
    setTrackPosition(sliderOffset);
  }

  sliderAnimating = true;
  sliderOffset += direction * distance;
  setTrackPosition(sliderOffset, true);

  window.setTimeout(() => {
    if (sliderOffset >= sliderSetWidth) sliderOffset -= sliderSetWidth;
    if (sliderOffset < 0) sliderOffset += sliderSetWidth;
    setTrackPosition(sliderOffset);
    sliderAnimating = false;
    sliderLast = performance.now();
  }, 740);
};

viewport?.addEventListener("mouseenter", () => { sliderPaused = true; });
viewport?.addEventListener("mouseleave", () => { sliderPaused = false; sliderLast = performance.now(); });
viewport?.addEventListener("focusin", () => { sliderPaused = true; });
viewport?.addEventListener("focusout", () => { sliderPaused = false; sliderLast = performance.now(); });
projectPrev?.addEventListener("click", () => nudgeSlider(-1));
projectNext?.addEventListener("click", () => nudgeSlider(1));
window.addEventListener("load", setupSlider);
let resizeTimer = 0;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(setupSlider, 180);
});

/* Process accordion */
const processItems = [...document.querySelectorAll("[data-process-item]")];
const processGhost = document.querySelector("[data-process-ghost]");
processItems.forEach((item, index) => {
  const button = item.querySelector("[data-process-toggle]");
  button?.addEventListener("click", () => {
    const willOpen = !item.classList.contains("is-open");
    processItems.forEach(other => {
      const open = willOpen && other === item;
      other.classList.toggle("is-open", open);
      other.querySelector("[data-process-toggle]")?.setAttribute("aria-expanded", String(open));
    });
    if (processGhost && willOpen) {
      processGhost.style.opacity = "0";
      processGhost.style.transform = "translateY(14px)";
      window.setTimeout(() => {
        processGhost.textContent = String(index + 1).padStart(2, "0");
        processGhost.style.opacity = "";
        processGhost.style.transform = "";
      }, 180);
    }
  });
});

/* Success message */
const params = new URLSearchParams(location.search);
if (params.get("wyslano") === "1") document.querySelector("[data-success]")?.classList.add("is-visible");

window.addEventListener("beforeunload", () => cancelAnimationFrame(sliderRaf));
