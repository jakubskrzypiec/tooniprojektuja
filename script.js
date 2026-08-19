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
  modalImage.style.objectPosition = card.dataset.focus || "50% 50%";
  modalTitle.textContent = card.dataset.title || "";
  modalCategory.textContent = card.dataset.category || "";
  modalThumbs.replaceChildren();
  const gallerySlots = Math.max(4, gallery.length);
  for (let index = 0; index < gallerySlots; index += 1) {
    const source = gallery[index];
    const tile = document.createElement(source ? "button" : "div");
    const label = document.createElement("span");
    tile.className = source ? "modal__thumb" : "modal__thumb modal__thumb--empty";
    label.textContent = "Czekamy na pełną galerię";

    if (source) {
      const image = document.createElement("img");
      tile.type = "button";
      tile.dataset.source = source;
      tile.setAttribute("aria-label", `Pokaż zdjęcie ${index + 1}`);
      tile.addEventListener("click", () => selectModalImage(source));
      image.src = source;
      image.alt = "";
      tile.append(image);
    } else {
      tile.setAttribute("aria-hidden", "true");
    }

    tile.append(label);
    modalThumbs.append(tile);
  }
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

/* Infinite, slow project carousel — V25 */
const viewport = document.querySelector("[data-project-viewport]");
const track = document.querySelector("[data-project-track]");
const projectPrev = document.querySelector("[data-project-prev]");
const projectNext = document.querySelector("[data-project-next]");
let sliderOffset = 0;
let sliderSetWidth = 0;
let sliderAnimating = false;
let sliderRaf = 0;
let sliderLast = 0;
let sliderDesktop = false;
const sliderSpeed = 14; // px / second — deliberately calm, but clearly moving

const originals = () => [...(track?.querySelectorAll("[data-project-card]:not([data-clone])") || [])];
const clearClones = () => track?.querySelectorAll("[data-clone]").forEach(clone => clone.remove());

const setTrackPosition = (value, animate = false) => {
  if (!track) return;
  track.style.transition = animate ? "transform .72s cubic-bezier(.2,.72,.2,1)" : "none";
  track.style.transform = `translate3d(${-value}px,0,0)`;
};

const measureSlider = () => {
  const cards = originals();
  if (!track || cards.length < 2) {
    sliderSetWidth = 0;
    return;
  }
  const styles = getComputedStyle(track);
  const gap = parseFloat(styles.columnGap || styles.gap) || 0;
  const first = cards[0];
  const last = cards[cards.length - 1];
  sliderSetWidth = last.offsetLeft + last.offsetWidth - first.offsetLeft + gap;
};

const normalizeSlider = () => {
  if (!sliderSetWidth) return;
  while (sliderOffset >= sliderSetWidth) sliderOffset -= sliderSetWidth;
  while (sliderOffset < 0) sliderOffset += sliderSetWidth;
};

const sliderFrame = time => {
  if (!sliderDesktop || !track) return;
  if (!sliderLast) sliderLast = time;
  const delta = Math.min(50, Math.max(0, time - sliderLast));
  sliderLast = time;

  if (!sliderAnimating && sliderSetWidth && !document.hidden) {
    sliderOffset += (delta / 1000) * sliderSpeed;
    normalizeSlider();
    setTrackPosition(sliderOffset);
  }
  sliderRaf = requestAnimationFrame(sliderFrame);
};

const setupSlider = () => {
  if (!track || !viewport) return;
  const shouldDesktop = window.innerWidth > 820;

  cancelAnimationFrame(sliderRaf);
  clearClones();
  track.style.transition = "none";
  track.style.transform = "none";
  sliderOffset = 0;
  sliderLast = 0;
  sliderDesktop = shouldDesktop;

  if (!shouldDesktop) return;

  /* Duplicate the complete set once, giving the transform a seamless loop. */
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

  if (!sliderDesktop) {
    viewport.scrollBy({ left: direction * (first.offsetWidth + 20) * 2, behavior: "smooth" });
    return;
  }

  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  const distance = (first.offsetWidth + gap) * 2; // faster jump: exactly 2 cards

  if (direction < 0 && sliderOffset < distance) {
    sliderOffset += sliderSetWidth;
    setTrackPosition(sliderOffset);
  }

  sliderAnimating = true;
  sliderOffset += direction * distance;
  setTrackPosition(sliderOffset, true);

  window.setTimeout(() => {
    normalizeSlider();
    setTrackPosition(sliderOffset);
    sliderAnimating = false;
    sliderLast = performance.now();
  }, 740);
};

/* The carousel keeps moving even while the cursor is above it.
   Hover is reserved for the card overlay, as requested. */
projectPrev?.addEventListener("click", () => nudgeSlider(-1));
projectNext?.addEventListener("click", () => nudgeSlider(1));
document.addEventListener("visibilitychange", () => { sliderLast = performance.now(); });

if (document.readyState === "complete") setupSlider();
else window.addEventListener("load", setupSlider, { once: true });

let resizeTimer = 0;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(setupSlider, 180);
});

if ("ResizeObserver" in window && track) {
  const carouselResizeObserver = new ResizeObserver(() => {
    if (!sliderDesktop || sliderAnimating) return;
    measureSlider();
    normalizeSlider();
    setTrackPosition(sliderOffset);
  });
  carouselResizeObserver.observe(track);
}

/* FAQ accordion - smooth opening/closing, one item at a time */
const faqItems = [...document.querySelectorAll(".faq__list details")];

const animateFaq = (item, willOpen) => {
  const summary = item.querySelector("summary");
  if (!summary) return;
  if (reduceMotion) {
    item.open = willOpen;
    return;
  }
  if (item.dataset.animating === "true") return;

  const startHeight = item.offsetHeight;
  if (willOpen) item.open = true;
  const endHeight = willOpen ? item.offsetHeight : summary.offsetHeight + 2;

  item.dataset.animating = "true";
  item.style.overflow = "hidden";
  const animation = item.animate(
    [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
    { duration: 430, easing: "cubic-bezier(.2,.75,.25,1)" }
  );

  animation.onfinish = () => {
    if (!willOpen) item.open = false;
    item.style.height = "";
    item.style.overflow = "";
    delete item.dataset.animating;
  };
  animation.oncancel = animation.onfinish;
};

faqItems.forEach(item => {
  const summary = item.querySelector("summary");
  if (!summary) return;

  summary.addEventListener("click", event => {
    event.preventDefault();
    const willOpen = !item.open;

    if (willOpen) {
      faqItems.forEach(other => {
        if (other !== item && other.open) animateFaq(other, false);
      });
    }
    animateFaq(item, willOpen);
  });
});

/* Polish typography: keep short one-letter words with the next word */
const typographySelectors = [
  ".rich-copy p",
  ".package-card__body p",
  ".process-answer p",
  ".process-answer b",
  ".faq__list details > div p",
  ".contact__lead",
  ".footer p"
];
document.querySelectorAll(typographySelectors.join(",")).forEach(node => {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(textNode => {
    textNode.nodeValue = textNode.nodeValue.replace(/\b([aiouwz])\s+/gi, "$1\u00A0");
  });
});

/* Process accordion + progress */
const processItems = [...document.querySelectorAll("[data-process-item]")];
const processGhost = document.querySelector("[data-process-ghost]");
const processRange = document.querySelector(".process__range");

const setProcessProgress = step => {
  if (!processRange || !processItems.length) return;
  const safeStep = Math.max(0, Math.min(processItems.length, step));
  processRange.style.setProperty("--process-progress", `${(safeStep / processItems.length) * 100}%`);
};

setProcessProgress(0);

processItems.forEach((item, index) => {
  const button = item.querySelector("[data-process-toggle]");
  button?.addEventListener("click", () => {
    const willOpen = !item.classList.contains("is-open");
    processItems.forEach(other => {
      const open = willOpen && other === item;
      other.classList.toggle("is-open", open);
      other.querySelector("[data-process-toggle]")?.setAttribute("aria-expanded", String(open));
    });

    setProcessProgress(index + 1);

    if (processGhost) {
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
