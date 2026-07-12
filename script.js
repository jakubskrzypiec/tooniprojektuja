const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Safe intro — transform and opacity only, with fallback */
const intro = document.querySelector("[data-page-intro]");
let introClosed = false;
const closeIntro = () => {
  if (!intro || introClosed) return;
  introClosed = true;
  intro.classList.add("is-leaving");
  body.classList.remove("intro-active");
  window.setTimeout(() => intro.remove(), 850);
};

if (intro && !reduceMotion) {
  window.setTimeout(closeIntro, 1250);
  window.setTimeout(closeIntro, 2600);
  intro.addEventListener("click", closeIntro, { once:true });
  window.addEventListener("load", () => window.setTimeout(closeIntro, 450), { once:true });
} else {
  intro?.remove();
  body.classList.remove("intro-active");
}

/* Header */
const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 36);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive:true });

/* Mobile navigation */
menuToggle?.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
  body.classList.toggle("menu-open", open);
});

mobileMenu?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    body.classList.remove("menu-open");
  });
});

/* Old hero rotating text */
const rotatingWord = document.querySelector("[data-rotating-word]");
const heroWords = ["działają.", "uspokajają.", "dojrzewają.", "zostają."];
let heroIndex = 0;
if (rotatingWord && !reduceMotion) {
  window.setInterval(() => {
    rotatingWord.classList.add("is-changing");
    window.setTimeout(() => {
      heroIndex = (heroIndex + 1) % heroWords.length;
      rotatingWord.textContent = heroWords[heroIndex];
      rotatingWord.classList.remove("is-changing");
    }, 270);
  }, 2500);
}

/* Reveal */
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold:.11, rootMargin:"0px 0px -35px 0px" });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible"));
}

/* Projects carousel */
const carousel = document.querySelector("[data-project-carousel]");
const prev = document.querySelector("[data-project-prev]");
const next = document.querySelector("[data-project-next]");
let carouselPaused = false;

const carouselStep = () => {
  const card = carousel?.querySelector("[data-project-card]");
  return card ? card.getBoundingClientRect().width + 22 : 0;
};

const moveCarousel = direction => {
  if (!carousel) return;
  const max = carousel.scrollWidth - carousel.clientWidth;
  const target = carousel.scrollLeft + direction * carouselStep();
  if (direction > 0 && target >= max - 12) carousel.scrollTo({ left:0, behavior:"smooth" });
  else if (direction < 0 && target <= 0) carousel.scrollTo({ left:max, behavior:"smooth" });
  else carousel.scrollBy({ left:direction * carouselStep(), behavior:"smooth" });
};

prev?.addEventListener("click", () => moveCarousel(-1));
next?.addEventListener("click", () => moveCarousel(1));
carousel?.addEventListener("mouseenter", () => carouselPaused = true);
carousel?.addEventListener("mouseleave", () => carouselPaused = false);
carousel?.addEventListener("focusin", () => carouselPaused = true);
carousel?.addEventListener("focusout", () => carouselPaused = false);

if (carousel && !reduceMotion) {
  window.setInterval(() => { if (!carouselPaused) moveCarousel(1); }, 4400);
}

/* Project modal */
const modal = document.querySelector("[data-project-modal]");
const modalImage = modal?.querySelector("[data-modal-image]");
const modalTitle = modal?.querySelector("[data-modal-title]");
const modalCategory = modal?.querySelector("[data-modal-category]");
const modalClose = modal?.querySelector(".project-modal__close");
let previousFocus = null;

const openModal = card => {
  if (!modal || !modalImage || !modalTitle || !modalCategory) return;
  previousFocus = document.activeElement;
  modalImage.src = card.dataset.image;
  modalImage.alt = card.dataset.title;
  modalTitle.textContent = card.dataset.title;
  modalCategory.textContent = card.dataset.category;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden","false");
  body.classList.add("modal-open");
  modalClose?.focus();
};

const closeModal = () => {
  modal?.classList.remove("is-open");
  modal?.setAttribute("aria-hidden","true");
  body.classList.remove("modal-open");
  previousFocus?.focus();
};

document.querySelectorAll("[data-project-card]").forEach(card => {
  card.querySelector(".project-open")?.addEventListener("click", () => openModal(card));
});
modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

/* Process */
const processData = [
  {
    stage:"Etap / Analiza",
    title:"Analiza lokalu",
    image:"tooni-blueprints.jpg",
    description:"Poznajemy miejsce, sposób jego użytkowania oraz oczekiwania inwestora. Ustalamy priorytety i ograniczenia, które będą wpływać na cały projekt.",
    items:["rozmowa o potrzebach","analiza możliwości lokalu","ustalenie zakresu"],
    result:"Jasny kierunek dalszej pracy i zakres projektu."
  },
  {
    stage:"Etap / Pomiary",
    title:"Inwentaryzacja",
    image:"tooni-blueprints.jpg",
    description:"Dokładnie mierzymy lokal i dokumentujemy jego stan. Ten etap tworzy wiarygodną bazę do pracy nad funkcją, instalacjami i detalem.",
    items:["pomiary pomieszczeń","dokumentacja fotograficzna","rzuty stanu istniejącego"],
    result:"Komplet dokładnych materiałów wyjściowych do projektowania."
  },
  {
    stage:"Etap / Funkcja",
    title:"Układ funkcjonalny",
    image:"garderoba.jpg",
    description:"Przygotowujemy warianty rozmieszczenia funkcji, wyposażenia i komunikacji. Wspólnie wybieramy rozwiązanie najlepiej dopasowane do codzienności.",
    items:["warianty układu","analiza ergonomii","wybór kierunku"],
    result:"Wybrany układ, który porządkuje sposób korzystania z wnętrza."
  },
  {
    stage:"Etap / Koncepcja",
    title:"Projekt koncepcyjny",
    image:"tooni-materials.jpg",
    description:"Budujemy charakter wnętrza. Łączymy materiały, kolorystykę, oświetlenie i wyposażenie w jeden czytelny kierunek.",
    items:["moodboard i materiały","wizualizacje","dobór wyposażenia"],
    result:"Spójny kierunek wizualny i zestaw najważniejszych decyzji."
  },
  {
    stage:"Etap / Dokumentacja",
    title:"Projekt wykonawczy",
    image:"tooni-blueprints.jpg",
    description:"Przekładamy koncepcję na dokumentację potrzebną ekipom wykonawczym. Każda ważna decyzja zostaje opisana i uporządkowana.",
    items:["rysunki techniczne","zestawienia materiałów","wytyczne dla wykonawców"],
    result:"Komplet informacji potrzebnych do sprawnej realizacji."
  },
  {
    stage:"Etap / Realizacja",
    title:"Nadzór autorski",
    image:"tooni-stilllife.jpg",
    description:"Pomagamy zachować spójność projektu podczas realizacji. Odpowiadamy na pytania wykonawców i wspieramy inwestora przy zmianach.",
    items:["wizyty na miejscu","konsultacje wykonawcze","kontrola zgodności"],
    result:"Wsparcie w utrzymaniu zgodności realizacji z projektem."
  }
];

const tabs = [...document.querySelectorAll("[data-process-index]")];
const processImage = document.querySelector("[data-process-image]");
const processStage = document.querySelector("[data-process-stage]");
const processTitle = document.querySelector("[data-process-title]");
const processDescription = document.querySelector("[data-process-description]");
const processList = document.querySelector("[data-process-list]");
const processResult = document.querySelector("[data-process-result]");

const activateProcess = index => {
  const data = processData[index];
  if (!data) return;
  tabs.forEach((tab, i) => {
    const active = i === index;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  if (processImage) {
    processImage.style.opacity = ".18";
    window.setTimeout(() => {
      processImage.src = data.image;
      processImage.alt = data.title;
      processImage.style.opacity = "1";
    }, 135);
  }
  if (processStage) processStage.textContent = data.stage;
  if (processTitle) processTitle.textContent = data.title;
  if (processDescription) processDescription.textContent = data.description;
  if (processList) processList.innerHTML = data.items.map(item => `<li>${item}</li>`).join("");
  if (processResult) processResult.textContent = data.result;
};

tabs.forEach(tab => {
  const index = Number(tab.dataset.processIndex);
  tab.addEventListener("click", () => activateProcess(index));
  tab.addEventListener("mouseenter", () => activateProcess(index));
  tab.addEventListener("focus", () => activateProcess(index));
});

/* Form success state */
const params = new URLSearchParams(window.location.search);
if (params.get("wyslano") === "1") {
  document.querySelector("[data-form-success]")?.classList.add("is-visible");
}
