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

/* Project slider — desktop loop / native mobile swipe */
const viewport = document.querySelector('[data-project-viewport]');
const track = document.querySelector('[data-project-track]');
const prevProject = document.querySelector('[data-project-prev]');
const nextProject = document.querySelector('[data-project-next]');
const projectHint = document.querySelector('.project-heading-side p');
const projectsMobile = window.matchMedia('(max-width: 780px)');
let sliderPaused = false;
let sliderRaf = 0;
let sliderOffset = 0;
let sliderLast = 0;
let setWidth = 0;
let sliderMode = '';
const sliderSpeed = 34;
const desktopHint = 'Galeria przesuwa się automatycznie. Najedź, aby zatrzymać. Kliknij zdjęcie, aby otworzyć podgląd.';
const mobileHint = 'Przesuń realizacje palcem lub użyj strzałek. Dotknij zdjęcia, aby otworzyć podgląd.';

const bindProjectCards = root => {
  root.querySelectorAll('[data-project-card] button').forEach(button => {
    if (button.dataset.bound === '1') return;
    button.dataset.bound = '1';
    button.addEventListener('click', () => openModal(button.closest('[data-project-card]')));
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
  return cards.reduce((sum, card) => sum + card.getBoundingClientRect().width, 0) + gap * (cards.length - 1);
};

if (viewport && track) {
  const originals = [...track.children];
  bindProjectCards(track);

  const runDesktopLoop = time => {
    if (sliderMode !== 'desktop') return;
    if (!sliderLast) sliderLast = time;
    const delta = Math.min((time - sliderLast) / 1000, 0.05);
    sliderLast = time;

    if (!sliderPaused && !reduceMotion && setWidth > 0) {
      sliderOffset += sliderSpeed * delta;
      if (sliderOffset >= setWidth) sliderOffset -= setWidth;
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
    if (projectHint) projectHint.textContent = mobileHint;
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
    track.style.transform = 'translate3d(0,0,0)';
    setWidth = measureSetWidth(originals.length);
    if (projectHint) projectHint.textContent = desktopHint;
    sliderRaf = requestAnimationFrame(runDesktopLoop);
  };

  const syncProjectMode = () => projectsMobile.matches ? setupMobileProjects() : setupDesktopProjects();
  syncProjectMode();
  projectsMobile.addEventListener?.('change', syncProjectMode);

  const pause = () => {
    if (sliderMode === 'desktop') sliderPaused = true;
  };
  const resume = () => {
    if (sliderMode === 'desktop') sliderPaused = false;
  };

  viewport.addEventListener('mouseenter', pause);
  viewport.addEventListener('mouseleave', resume);
  viewport.addEventListener('focusin', pause);
  viewport.addEventListener('focusout', resume);

  window.addEventListener('resize', () => {
    if (sliderMode === 'desktop') {
      setWidth = measureSetWidth(originals.length);
      if (setWidth > 0) sliderOffset %= setWidth;
    }
  }, { passive: true });
}

const nudgeProjects = direction => {
  if (!track || !viewport) return;
  const firstCard = track.querySelector('[data-project-card]');
  const gap = parseFloat(getComputedStyle(track).gap || 0);
  const step = firstCard ? firstCard.getBoundingClientRect().width + gap : 412;

  if (sliderMode === 'mobile') {
    viewport.scrollBy({ left: direction * step, behavior: reduceMotion ? 'auto' : 'smooth' });
    return;
  }

  sliderPaused = true;
  sliderOffset += direction * step;
  if (setWidth > 0) {
    while (sliderOffset < 0) sliderOffset += setWidth;
    while (sliderOffset >= setWidth) sliderOffset -= setWidth;
  }
  track.style.transform = `translate3d(${-sliderOffset}px,0,0)`;
  window.setTimeout(() => {
    if (sliderMode === 'desktop') sliderPaused = false;
  }, 650);
};
prevProject?.addEventListener('click', () => nudgeProjects(-1));
nextProject?.addEventListener('click', () => nudgeProjects(1));


/* Process accordion */
document.querySelectorAll('[data-process-toggle]').forEach(button => {
  if (button.dataset.processBound === '1') return;
  button.dataset.processBound = '1';

  button.addEventListener('click', () => {
    const currentItem = button.closest('.process-item');
    if (!currentItem) return;

    const wasOpen = currentItem.classList.contains('is-open');

    document.querySelectorAll('.process-item').forEach(item => {
      item.classList.remove('is-open');
      item.querySelector('[data-process-toggle]')?.setAttribute('aria-expanded', 'false');
    });

    if (!wasOpen) {
      currentItem.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
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
