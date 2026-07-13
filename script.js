const body = document.body;
const intro = document.querySelector("[data-intro]");
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Intro */
let introClosed = false;
const closeIntro = () => {
  if (!intro || introClosed) return;
  introClosed = true;
  intro.classList.add("is-closing");
  body.classList.remove("intro-active");
  window.setTimeout(() => intro.remove(), 420);
};

if (intro && !reduceMotion) {
  window.setTimeout(closeIntro, 1900);
  intro.addEventListener("click", closeIntro, { once: true });
  window.addEventListener("load", () => window.setTimeout(closeIntro, 900), { once: true });
  window.addEventListener("keydown", event => {
    if (event.key === "Escape") closeIntro();
  });
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
const words = ["działają.", "uspokajają.", "zostają.", "pasują."];
let wordIndex = 0;
if (rotating && !reduceMotion) {
  window.setInterval(() => {
    rotating.classList.add("is-changing");
    window.setTimeout(() => {
      wordIndex = (wordIndex + 1) % words.length;
      rotating.textContent = words[wordIndex];
      rotating.classList.remove("is-changing");
    }, 260);
  }, 2500);
}

/* Scroll reveal */
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}

/* Modal */
const modal = document.querySelector('[data-modal]');
const modalImage = modal?.querySelector('[data-modal-image]');
const modalTitle = modal?.querySelector('[data-modal-title]');
const modalCategory = modal?.querySelector('[data-modal-category]');
const modalClose = modal?.querySelector('.modal-close');
let lastFocus = null;

const openModal = card => {
  if (!modal || !modalImage || !modalTitle || !modalCategory) return;
  lastFocus = document.activeElement;
  modalImage.src = card.dataset.image;
  modalImage.alt = card.dataset.title || '';
  const place = card.dataset.place ? ` / ${card.dataset.place}` : '';
  const area = card.dataset.area ? ` / ${card.dataset.area}` : '';
  modalTitle.textContent = card.dataset.title || '';
  modalCategory.textContent = `${card.dataset.category || ''}${place}${area}`;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  body.classList.add('modal-open');
  modalClose?.focus();
};

const closeModal = () => {
  modal?.classList.remove('is-open');
  modal?.setAttribute('aria-hidden', 'true');
  body.classList.remove('modal-open');
  lastFocus?.focus();
};
modalClose?.addEventListener('click', closeModal);
modal?.addEventListener('click', event => {
  if (event.target === modal) closeModal();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
});

/* Project slider — transform based and reliable */
const viewport = document.querySelector('[data-project-viewport]');
const track = document.querySelector('[data-project-track]');
const prevProject = document.querySelector('[data-project-prev]');
const nextProject = document.querySelector('[data-project-next]');
let sliderPaused = false;
let sliderRaf = 0;
let sliderOffset = 0;
let sliderLast = 0;
let setWidth = 0;
const sliderSpeed = 38;

const bindProjectCards = root => {
  root.querySelectorAll('[data-project-card] button').forEach(button => {
    if (button.dataset.bound === '1') return;
    button.dataset.bound = '1';
    button.addEventListener('click', () => openModal(button.closest('[data-project-card]')));
  });
};

const measureSetWidth = originalsLength => {
  const cards = [...track.children].slice(0, originalsLength);
  if (!cards.length) return 0;
  const gap = parseFloat(getComputedStyle(track).gap || 0);
  return cards.reduce((sum, card) => sum + card.getBoundingClientRect().width, 0) + gap * (cards.length - 1);
};

if (viewport && track) {
  const originals = [...track.children];
  originals.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
  bindProjectCards(track);
  setWidth = measureSetWidth(originals.length);

  const tick = time => {
    if (!sliderLast) sliderLast = time;
    const delta = Math.min((time - sliderLast) / 1000, 0.05);
    sliderLast = time;

    if (!sliderPaused && !reduceMotion && setWidth > 0) {
      sliderOffset += sliderSpeed * delta;
      if (sliderOffset >= setWidth) sliderOffset -= setWidth;
      track.style.transform = `translate3d(${-sliderOffset}px,0,0)`;
    }
    sliderRaf = requestAnimationFrame(tick);
  };

  sliderRaf = requestAnimationFrame(tick);

  const pause = () => sliderPaused = true;
  const resume = () => sliderPaused = false;
  viewport.addEventListener('mouseenter', pause);
  viewport.addEventListener('mouseleave', resume);
  viewport.addEventListener('focusin', pause);
  viewport.addEventListener('focusout', resume);
  viewport.addEventListener('touchstart', pause, { passive: true });
  viewport.addEventListener('touchend', () => window.setTimeout(resume, 900), { passive: true });

  window.addEventListener('resize', () => {
    setWidth = measureSetWidth(originals.length);
    if (setWidth > 0) sliderOffset = sliderOffset % setWidth;
  });
}

const nudgeProjects = direction => {
  if (!track) return;
  const firstCard = track.querySelector('[data-project-card]');
  const gap = parseFloat(getComputedStyle(track).gap || 0);
  const step = firstCard ? firstCard.getBoundingClientRect().width + gap : 412;
  sliderPaused = true;
  sliderOffset += direction * step;
  if (setWidth > 0) {
    while (sliderOffset < 0) sliderOffset += setWidth;
    while (sliderOffset >= setWidth) sliderOffset -= setWidth;
  }
  track.style.transform = `translate3d(${-sliderOffset}px,0,0)`;
  window.setTimeout(() => sliderPaused = false, 900);
};
prevProject?.addEventListener('click', () => nudgeProjects(-1));
nextProject?.addEventListener('click', () => nudgeProjects(1));

/* Form success */
const params = new URLSearchParams(window.location.search);
if (params.get('wyslano') === '1') {
  document.querySelector('[data-success]')?.classList.add('is-visible');
}

window.addEventListener('beforeunload', () => {
  if (sliderRaf) cancelAnimationFrame(sliderRaf);
});
