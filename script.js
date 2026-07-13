const body = document.body;
const intro = document.querySelector("[data-intro]");
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Safe architectural intro */
let introClosed = false;
const closeIntro = () => {
  if (!intro || introClosed) return;
  introClosed = true;
  intro.classList.add("is-closing");
  body.classList.remove("intro-active");
  window.setTimeout(() => intro.remove(), 360);
};

if (intro && !reduceMotion) {
  window.setTimeout(closeIntro, 1350);
  window.setTimeout(closeIntro, 2600);
  intro.addEventListener("click", closeIntro, { once: true });
  window.addEventListener("load", () => window.setTimeout(closeIntro, 700), { once: true });
} else {
  intro?.remove();
  body.classList.remove("intro-active");
}

/* Header */
const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 35);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

/* Mobile menu */
menuButton?.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
  body.classList.toggle("menu-open", open);
});

mobileMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuButton?.setAttribute("aria-expanded", "false");
  body.classList.remove("menu-open");
}));

/* Rotating hero */
const rotating = document.querySelector("[data-rotating-word]");
const words = ["działają.", "uspokajają.", "dojrzewają.", "zostają."];
let wordIndex = 0;

if (rotating && !reduceMotion) {
  window.setInterval(() => {
    rotating.classList.add("is-changing");
    window.setTimeout(() => {
      wordIndex = (wordIndex + 1) % words.length;
      rotating.textContent = words[wordIndex];
      rotating.classList.remove("is-changing");
    }, 260);
  }, 2450);
}

/* Scroll reveal */
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.11, rootMargin: "0px 0px -30px 0px" });

  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible"));
}

/* Infinite project slider driven by scrollLeft — stable, equal cards */
const viewport = document.querySelector("[data-project-viewport]");
const track = document.querySelector("[data-project-track]");
const prevProject = document.querySelector("[data-project-prev]");
const nextProject = document.querySelector("[data-project-next]");

let sliderPaused = false;
let sliderRaf = 0;
let sliderLastTime = 0;
const sliderSpeed = 34;

if (viewport && track) {
  const originals = [...track.children];
  originals.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  const tick = time => {
    if (!sliderLastTime) sliderLastTime = time;
    const delta = Math.min((time - sliderLastTime) / 1000, 0.05);
    sliderLastTime = time;

    if (!sliderPaused && !reduceMotion) {
      viewport.scrollLeft += sliderSpeed * delta;
      const half = track.scrollWidth / 2;
      if (viewport.scrollLeft >= half) viewport.scrollLeft -= half;
    }
    sliderRaf = requestAnimationFrame(tick);
  };

  sliderRaf = requestAnimationFrame(tick);

  const pause = () => sliderPaused = true;
  const resume = () => sliderPaused = false;

  viewport.addEventListener("mouseenter", pause);
  viewport.addEventListener("mouseleave", resume);
  viewport.addEventListener("focusin", pause);
  viewport.addEventListener("focusout", resume);
  viewport.addEventListener("touchstart", pause, { passive: true });
  viewport.addEventListener("touchend", () => window.setTimeout(resume, 900), { passive: true });
}

const nudgeProjects = direction => {
  if (!viewport) return;
  const card = viewport.querySelector("[data-project-card]");
  const step = card ? card.getBoundingClientRect().width + 22 : 412;
  sliderPaused = true;
  viewport.scrollBy({ left: direction * step, behavior: "smooth" });
  window.setTimeout(() => sliderPaused = false, 900);
};

prevProject?.addEventListener("click", () => nudgeProjects(-1));
nextProject?.addEventListener("click", () => nudgeProjects(1));

/* Modal */
const modal = document.querySelector("[data-modal]");
const modalImage = modal?.querySelector("[data-modal-image]");
const modalTitle = modal?.querySelector("[data-modal-title]");
const modalCategory = modal?.querySelector("[data-modal-category]");
const modalClose = modal?.querySelector(".modal-close");
let lastFocus = null;

const openModal = card => {
  if (!modal || !modalImage || !modalTitle || !modalCategory) return;
  lastFocus = document.activeElement;
  modalImage.src = card.dataset.image;
  modalImage.alt = card.dataset.title;
  modalTitle.textContent = card.dataset.title;
  modalCategory.textContent = card.dataset.category;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
  modalClose?.focus();
};

const closeModal = () => {
  modal?.classList.remove("is-open");
  modal?.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");
  lastFocus?.focus();
};

document.querySelectorAll("[data-project-card]").forEach(card => {
  card.querySelector("button")?.addEventListener("click", () => openModal(card));
});

modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

/* Accordions */
const bindSingleAccordion = (itemSelector, buttonSelector) => {
  const items = [...document.querySelectorAll(itemSelector)];

  items.forEach(item => {
    const button = item.querySelector(buttonSelector);
    button?.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");

      items.forEach(other => {
        other.classList.remove("is-open");
        other.querySelector(buttonSelector)?.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });
};

bindSingleAccordion(".package-item", "[data-package-toggle]");
bindSingleAccordion(".process-item", "[data-process-toggle]");

/* Form success */
const params = new URLSearchParams(window.location.search);
if (params.get("wyslano") === "1") {
  document.querySelector("[data-success]")?.classList.add("is-visible");
}

/* Cleanup */
window.addEventListener("beforeunload", () => {
  if (sliderRaf) cancelAnimationFrame(sliderRaf);
});
