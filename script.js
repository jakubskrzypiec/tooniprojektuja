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
  window.setTimeout(() => intro.remove(), 820);
};

if (intro && !reduceMotion) {
  requestAnimationFrame(() => intro.classList.add("is-ready"));
  window.setTimeout(closeIntro, 2400);
  intro.addEventListener("click", closeIntro, { once: true });
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

/* Modal realizacji — V36: duży kadr, miniatury i opis */
const modal = document.querySelector('[data-modal]');
const modalImage = modal?.querySelector('[data-modal-image]');
const modalTitle = modal?.querySelector('[data-modal-title]');
const modalCategory = modal?.querySelector('[data-modal-category]');
const modalDescription = modal?.querySelector('[data-modal-description]');
const modalThumbnails = modal?.querySelector('[data-modal-thumbnails]');
const modalClose = modal?.querySelector('.modal-close');
const modalContact = modal?.querySelector('[data-modal-contact]');
let lastFocus = null;

const renderModalThumbnails = card => {
  if (!modalThumbnails || !modalImage) return;
  modalThumbnails.innerHTML = '';

  const fallback = card.dataset.image || '';
  const gallery = (card.dataset.gallery || '')
    .split('|')
    .map(item => item.trim())
    .filter(Boolean);
  const images = gallery.length ? gallery : [fallback, fallback, fallback];
  const positions = ['center 22%', 'center 50%', 'center 78%'];

  images.slice(0, 4).forEach((src, index) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = `modal-thumb${index === 0 ? ' is-active' : ''}`;
    thumb.setAttribute('aria-label', `Ujęcie ${index + 1}`);
    thumb.innerHTML = `<img src="${src}" alt="" loading="lazy">`;
    thumb.addEventListener('click', () => {
      modalImage.src = src;
      modalImage.style.objectPosition = positions[index] || 'center';
      modalThumbnails.querySelectorAll('.modal-thumb').forEach(item => item.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
    modalThumbnails.appendChild(thumb);
  });
};

const openModal = card => {
  if (!modal || !modalImage || !modalTitle || !modalCategory) return;
  lastFocus = document.activeElement;
  modalImage.src = card.dataset.image;
  modalImage.alt = card.dataset.title || '';
  modalImage.style.objectPosition = 'center 50%';
  const place = card.dataset.place ? ` / ${card.dataset.place}` : '';
  const area = card.dataset.area ? ` / ${card.dataset.area}` : '';
  modalTitle.textContent = card.dataset.title || '';
  modalCategory.textContent = `${card.dataset.category || ''}${place}${area}`;

  if (modalDescription) {
    modalDescription.innerHTML = '';
    const description = card.dataset.description || '';
    const parts = description.split(/(?<=\.)\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ])/).filter(Boolean);
    const chunks = parts.length > 1 ? parts : [description];
    chunks.slice(0, 3).forEach(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text.trim();
      modalDescription.appendChild(paragraph);
    });
  }

  renderModalThumbnails(card);
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
modalContact?.addEventListener('click', closeModal);
modal?.addEventListener('click', event => {
  if (event.target === modal) closeModal();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
});

/* Project slider — V36: ciągły ruch z przyspieszaniem i wyhamowaniem */
const viewport = document.querySelector('[data-project-viewport]');
const track = document.querySelector('[data-project-track]');
const prevProject = document.querySelector('[data-project-prev]');
const nextProject = document.querySelector('[data-project-next]');
const projectsMobile = window.matchMedia('(max-width: 780px)');
let sliderPaused = false;
let sliderRaf = 0;
let sliderOffset = 0;
let sliderLast = 0;
let setWidth = 0;
let sliderMode = '';
let sliderVelocity = 32;
let sliderTargetVelocity = 32;
let sliderSpeedFactor = 1;
const sliderCruiseSpeed = 32;
const sliderMinFactor = .2;
const sliderMaxFactor = 2;
const sliderStepFactor = .05;
const sliderHoverFactor = .32;

const bindProjectCards = root => {
  if (!root || root.dataset.projectClickBound === '1') return;
  root.dataset.projectClickBound = '1';
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-project-card] button');
    if (!button || !root.contains(button)) return;
    const card = button.closest('[data-project-card]');
    if (card) openModal(card);
  });
};

const stopProjectLoop = () => {
  if (sliderRaf) cancelAnimationFrame(sliderRaf);
  sliderRaf = 0;
  sliderLast = 0;
};

const removeProjectClones = () => {
  track?.querySelectorAll('[data-project-clone]').forEach(clone => clone.remove());
};

const measureSetWidth = originalsLength => {
  if (!track) return 0;
  const cards = [...track.children].slice(0, originalsLength);
  if (!cards.length) return 0;
  const gap = parseFloat(getComputedStyle(track).gap || 0);
  return cards.reduce((sum, card) => sum + card.getBoundingClientRect().width, 0) + gap * cards.length;
};

const normalizeSliderOffset = () => {
  if (setWidth <= 0) return;
  while (sliderOffset < 0) sliderOffset += setWidth;
  while (sliderOffset >= setWidth) sliderOffset -= setWidth;
};

const currentCruiseVelocity = () => sliderCruiseSpeed * sliderSpeedFactor;

if (viewport && track) {
  const originals = [...track.children];
  bindProjectCards(track);

  const runDesktopLoop = time => {
    if (sliderMode !== 'desktop') return;
    if (!sliderLast) sliderLast = time;
    const delta = Math.min((time - sliderLast) / 1000, 0.05);
    sliderLast = time;

    if (!reduceMotion && setWidth > 0) {
      const easing = 1 - Math.pow(0.002, delta);
      sliderVelocity += (sliderTargetVelocity - sliderVelocity) * easing;
      if (!sliderPaused) sliderOffset += sliderVelocity * delta;
      normalizeSliderOffset();
      track.style.transform = `translate3d(${-sliderOffset}px,0,0)`;
    }
    sliderRaf = requestAnimationFrame(runDesktopLoop);
  };

  const setupMobileProjects = () => {
    if (sliderMode === 'mobile') return;
    sliderMode = 'mobile';
    stopProjectLoop();
    removeProjectClones();
    sliderPaused = true;
    sliderOffset = 0;
    setWidth = 0;
    track.style.transform = 'none';
    viewport.scrollLeft = 0;
  };

  const setupDesktopProjects = () => {
    if (sliderMode === 'desktop') return;
    sliderMode = 'desktop';
    stopProjectLoop();
    removeProjectClones();
    viewport.scrollLeft = 0;
    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.dataset.projectClone = '1';
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    bindProjectCards(track);
    sliderPaused = false;
    sliderOffset = 0;
    sliderVelocity = sliderCruiseSpeed * sliderSpeedFactor;
    sliderTargetVelocity = sliderCruiseSpeed * sliderSpeedFactor;
    track.style.transform = 'translate3d(0,0,0)';
    setWidth = measureSetWidth(originals.length);
    sliderRaf = requestAnimationFrame(runDesktopLoop);
  };

  const syncProjectMode = () => projectsMobile.matches ? setupMobileProjects() : setupDesktopProjects();
  syncProjectMode();
  projectsMobile.addEventListener?.('change', syncProjectMode);

  window.addEventListener('resize', () => {
    if (sliderMode === 'desktop') {
      setWidth = measureSetWidth(originals.length);
      normalizeSliderOffset();
    }
  }, { passive: true });
}

const adjustProjectSpeed = delta => {
  if (!track || !viewport) return;

  if (sliderMode === 'mobile') {
    const firstCard = track.querySelector('[data-project-card]');
    const gap = parseFloat(getComputedStyle(track).gap || 0);
    const step = firstCard ? firstCard.getBoundingClientRect().width + gap : 412;
    viewport.scrollBy({ left: delta < 0 ? -step : step, behavior: reduceMotion ? 'auto' : 'smooth' });
    return;
  }

  sliderSpeedFactor = Math.min(sliderMaxFactor, Math.max(sliderMinFactor, +(sliderSpeedFactor + delta).toFixed(2)));
  sliderPaused = false;
  sliderTargetVelocity = currentCruiseVelocity();
  viewport.dataset.speed = `${Math.round(sliderSpeedFactor * 100)}%`;
};
prevProject?.addEventListener('click', () => adjustProjectSpeed(-sliderStepFactor));
nextProject?.addEventListener('click', () => adjustProjectSpeed(sliderStepFactor));


/* Process accordion — one icon language: + / × */
const syncProcessIcon = (item) => {
  const toggle = item?.querySelector('[data-process-toggle]');
  const icon = toggle?.querySelector('span');
  const open = !!item?.classList.contains('is-open');
  if (toggle) toggle.setAttribute('aria-expanded', String(open));
  if (icon) icon.textContent = open ? '×' : '+';
};

document.querySelectorAll('.process-item').forEach(syncProcessIcon);
document.querySelectorAll('[data-process-toggle]').forEach(button => {
  if (button.dataset.processBound === '1') return;
  button.dataset.processBound = '1';

  button.addEventListener('click', () => {
    const currentItem = button.closest('.process-item');
    if (!currentItem) return;
    const wasOpen = currentItem.classList.contains('is-open');

    document.querySelectorAll('.process-item').forEach(item => {
      item.classList.remove('is-open');
      syncProcessIcon(item);
    });

    if (!wasOpen) currentItem.classList.add('is-open');
    syncProcessIcon(currentItem);
  });
});

/* FAQ — + changes to ×, no rotation/morphing */
document.querySelectorAll('.faq-list details').forEach(details => {
  const icon = details.querySelector('summary > span');
  const sync = () => { if (icon) icon.textContent = details.open ? '×' : '+'; };
  details.addEventListener('toggle', sync);
  sync();
});

/* Form success */
const params = new URLSearchParams(window.location.search);
if (params.get('wyslano') === '1') {
  document.querySelector('[data-success]')?.classList.add('is-visible');
}

window.addEventListener('beforeunload', () => {
  if (sliderRaf) cancelAnimationFrame(sliderRaf);
});






/* Final page polish */
const philosophyV29 = document.querySelector('.philosophy-v29');
if (philosophyV29) {
  if (reduceMotion || !('IntersectionObserver' in window)) {
    philosophyV29.classList.add('is-visible');
  } else {
    const philosophyV29Observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.28 });
    philosophyV29Observer.observe(philosophyV29);
  }
}

const updatePageProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  document.documentElement.style.setProperty('--page-progress', `${Math.min(100, Math.max(0, progress))}%`);
};
updatePageProgress();
window.addEventListener('scroll', updatePageProgress, { passive: true });
window.addEventListener('resize', updatePageProgress);

const mainNavLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const navSections = mainNavLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && mainNavLinks.length) {
  const navObserver = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    mainNavLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, {
    rootMargin: '-25% 0px -55% 0px',
    threshold: [0.08, 0.25, 0.5]
  });

  navSections.forEach(section => navObserver.observe(section));
}


/* === V35: premium pointer interactions — desktop only === */
(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!finePointer.matches || reduceMotion) return;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /* Cursor-position light inside package and process rows. */
  document.querySelectorAll('.info-glow-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = clamp(event.clientX - rect.left, 0, rect.width);
      const y = clamp(event.clientY - rect.top, 0, rect.height);
      card.style.setProperty('--hover-x', `${x}px`);
      card.style.setProperty('--hover-y', `${y}px`);
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--hover-x');
      card.style.removeProperty('--hover-y');
    }, { passive: true });
  });

  /* Very subtle magnetic movement. It never changes layout. */
  document.querySelectorAll(
    '.header-button, .hero-action, .contact-form > .button, .social, .arrows button, .line-link'
  ).forEach(element => {
    element.classList.add('magnetic-v35');

    element.addEventListener('pointermove', event => {
      const rect = element.getBoundingClientRect();
      const strength = element.matches('.social, .arrows button') ? 5 : 7;
      const x = ((event.clientX - rect.left) / rect.width - .5) * strength;
      const y = ((event.clientY - rect.top) / rect.height - .5) * strength;
      element.style.setProperty('--mag-x', `${x.toFixed(2)}px`);
      element.style.setProperty('--mag-y', `${y.toFixed(2)}px`);
    }, { passive: true });

    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--mag-x', '0px');
      element.style.setProperty('--mag-y', '0px');
    }, { passive: true });
  });

  /* Process preview number and progress follow hover/focus, then return to opened step. */
  const processGridV35 = document.querySelector('.process-grid');
  const processIntroV35 = processGridV35?.querySelector('.process-intro');
  const processItemsV35 = [...(processGridV35?.querySelectorAll('.process-item') || [])];

  if (processGridV35 && processIntroV35 && processItemsV35.length) {
    let changeTimer = 0;

    const showProcessStep = index => {
      const safeIndex = clamp(index, 0, processItemsV35.length - 1);
      const label = String(safeIndex + 1).padStart(2, '0');
      const progress = processItemsV35.length > 1
        ? (safeIndex / (processItemsV35.length - 1)) * 100
        : 100;

      if (processIntroV35.dataset.activeStep !== label) {
        processIntroV35.classList.add('is-step-changing');
        window.clearTimeout(changeTimer);
        changeTimer = window.setTimeout(() => {
          processIntroV35.dataset.activeStep = label;
          processIntroV35.classList.remove('is-step-changing');
        }, 115);
      }

      processGridV35.style.setProperty('--process-progress', `${progress}%`);
    };

    const restoreOpenedStep = () => {
      const openIndex = processItemsV35.findIndex(item => item.classList.contains('is-open'));
      showProcessStep(openIndex >= 0 ? openIndex : 0);
    };

    processItemsV35.forEach((item, index) => {
      item.addEventListener('pointerenter', () => showProcessStep(index), { passive: true });
      item.addEventListener('pointerleave', restoreOpenedStep, { passive: true });
      item.addEventListener('focusin', () => showProcessStep(index));
      item.addEventListener('focusout', restoreOpenedStep);
      item.addEventListener('click', () => requestAnimationFrame(restoreOpenedStep));
    });

    restoreOpenedStep();
  }
})();
