const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 36);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle?.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("menu-open", open);
});

mobileMenu?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  });
});

/* Hero rotating word */
const rotatingWord = document.querySelector("[data-rotating-word]");
const heroWords = ["działają.", "uspokajają.", "dojrzewają.", "zostają."];
let heroWordIndex = 0;

if (rotatingWord && !reduceMotion) {
  window.setInterval(() => {
    rotatingWord.classList.add("is-changing");
    window.setTimeout(() => {
      heroWordIndex = (heroWordIndex + 1) % heroWords.length;
      rotatingWord.textContent = heroWords[heroWordIndex];
      rotatingWord.classList.remove("is-changing");
    }, 280);
  }, 2400);
}

/* Reveal */
const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => element.classList.add("visible"));
}

/* Projects carousel */
const carousel = document.querySelector("[data-project-carousel]");
const previousProject = document.querySelector("[data-project-prev]");
const nextProject = document.querySelector("[data-project-next]");
let carouselPaused = false;

const projectStep = () => {
  const card = carousel?.querySelector("[data-project-card]");
  if (!card || !carousel) return 0;
  return card.getBoundingClientRect().width + 24;
};

const scrollProjects = direction => {
  if (!carousel) return;
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;
  const next = carousel.scrollLeft + direction * projectStep();
  if (direction > 0 && next >= maxScroll - 10) {
    carousel.scrollTo({ left: 0, behavior: "smooth" });
  } else if (direction < 0 && next <= 0) {
    carousel.scrollTo({ left: maxScroll, behavior: "smooth" });
  } else {
    carousel.scrollBy({ left: direction * projectStep(), behavior: "smooth" });
  }
};

previousProject?.addEventListener("click", () => scrollProjects(-1));
nextProject?.addEventListener("click", () => scrollProjects(1));
carousel?.addEventListener("mouseenter", () => carouselPaused = true);
carousel?.addEventListener("mouseleave", () => carouselPaused = false);
carousel?.addEventListener("focusin", () => carouselPaused = true);
carousel?.addEventListener("focusout", () => carouselPaused = false);

if (carousel && !reduceMotion) {
  window.setInterval(() => {
    if (!carouselPaused) scrollProjects(1);
  }, 4200);
}

/* Project modal — works on desktop and mobile */
const modal = document.querySelector("[data-project-modal]");
const modalImage = modal?.querySelector("[data-modal-image]");
const modalTitle = modal?.querySelector("[data-modal-title]");
const modalCategory = modal?.querySelector("[data-modal-category]");
const modalClose = modal?.querySelector(".project-modal__close");
let lastFocusedElement = null;

const openModal = card => {
  if (!modal || !modalImage || !modalTitle || !modalCategory) return;
  lastFocusedElement = document.activeElement;
  modalImage.src = card.dataset.image;
  modalImage.alt = card.dataset.title;
  modalTitle.textContent = card.dataset.title;
  modalCategory.textContent = card.dataset.category;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalClose?.focus();
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  lastFocusedElement?.focus();
};

document.querySelectorAll("[data-project-card]").forEach(card => {
  card.querySelector(".project-card__open")?.addEventListener("click", () => openModal(card));
});

modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
});

/* Process interaction */
const processData = [
  {
    step: "Etap 01",
    title: "Analiza lokalu",
    image: "package-consultation.jpg",
    description: "Rozpoczynamy od poznania miejsca, sposobu użytkowania wnętrza oraz oczekiwań inwestora. Ustalamy priorytety i ograniczenia, które będą wpływać na cały projekt.",
    items: ["rozmowa o potrzebach i stylu życia", "analiza możliwości lokalu", "ustalenie zakresu i dalszych etapów"]
  },
  {
    step: "Etap 02",
    title: "Inwentaryzacja",
    image: "package-functional.jpg",
    description: "Dokładnie mierzymy lokal i dokumentujemy jego stan. Ten etap tworzy wiarygodną bazę do dalszej pracy nad funkcją i detalem.",
    items: ["pomiary pomieszczeń", "dokumentacja fotograficzna", "rzuty stanu istniejącego"]
  },
  {
    step: "Etap 03",
    title: "Układ funkcjonalny",
    image: "garderoba.jpg",
    description: "Przygotowujemy warianty rozmieszczenia funkcji, wyposażenia i komunikacji. Wspólnie wybieramy rozwiązanie najlepiej dopasowane do codzienności.",
    items: ["warianty układu", "analiza ergonomii", "wybór kierunku do rozwinięcia"]
  },
  {
    step: "Etap 04",
    title: "Projekt koncepcyjny",
    image: "package-comprehensive.jpg",
    description: "Budujemy charakter wnętrza. Łączymy materiały, kolorystykę, oświetlenie i wyposażenie w jeden czytelny kierunek.",
    items: ["moodboard i paleta materiałów", "wizualizacje wnętrza", "dobór wyposażenia"]
  },
  {
    step: "Etap 05",
    title: "Projekt wykonawczy",
    image: "kuchnia2.jpg",
    description: "Przekładamy koncepcję na dokumentację potrzebną ekipom wykonawczym. Każda ważna decyzja zostaje opisana i uporządkowana.",
    items: ["rysunki techniczne", "zestawienia materiałów", "wytyczne dla wykonawców"]
  },
  {
    step: "Etap 06",
    title: "Nadzór autorski",
    image: "package-supervision.jpg",
    description: "Pomagamy zachować spójność projektu podczas realizacji. Odpowiadamy na pytania wykonawców i wspieramy inwestora przy zmianach.",
    items: ["wizyty na miejscu", "konsultacje wykonawcze", "kontrola zgodności z projektem"]
  }
];

const processTabs = [...document.querySelectorAll("[data-process-index]")];
const processImage = document.querySelector("[data-process-image]");
const processStep = document.querySelector("[data-process-step]");
const processTitle = document.querySelector("[data-process-title]");
const processDescription = document.querySelector("[data-process-description]");
const processList = document.querySelector("[data-process-list]");

const activateProcess = index => {
  const data = processData[index];
  if (!data) return;
  processTabs.forEach((tab, tabIndex) => {
    const active = tabIndex === index;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  if (processImage) {
    processImage.style.opacity = ".18";
    window.setTimeout(() => {
      processImage.src = data.image;
      processImage.alt = data.title;
      processImage.style.opacity = "1";
    }, 140);
  }
  if (processStep) processStep.textContent = data.step;
  if (processTitle) processTitle.textContent = data.title;
  if (processDescription) processDescription.textContent = data.description;
  if (processList) {
    processList.innerHTML = data.items.map(item => `<li>${item}</li>`).join("");
  }
};

processTabs.forEach(tab => {
  const index = Number(tab.dataset.processIndex);
  tab.addEventListener("click", () => activateProcess(index));
  tab.addEventListener("mouseenter", () => activateProcess(index));
  tab.addEventListener("focus", () => activateProcess(index));
});

/* Contact mail */
document.querySelector("[data-contact-form]")?.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Zapytanie o projekt wnętrza — ${data.get("name") || ""}`);
  const body = encodeURIComponent(
`Imię i nazwisko: ${data.get("name") || ""}
Telefon: ${data.get("phone") || ""}
E-mail: ${data.get("email") || ""}
Rodzaj inwestycji: ${data.get("type") || ""}

Informacje o inwestycji:
${data.get("message") || ""}`
  );
  window.location.href = `mailto:tooniprojektuja@gmail.com?subject=${subject}&body=${body}`;
});