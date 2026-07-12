const body = document.body;
const intro = document.querySelector("[data-intro]");
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Safe intro */
let introClosed = false;
const closeIntro = () => {
  if (!intro || introClosed) return;
  introClosed = true;
  intro.classList.add("is-closing");
  body.classList.remove("intro-active");
  window.setTimeout(() => intro.remove(), 820);
};
if (intro && !reduceMotion) {
  window.setTimeout(closeIntro, 1050);
  window.setTimeout(closeIntro, 2300);
  intro.addEventListener("click", closeIntro, { once:true });
  window.addEventListener("load", () => window.setTimeout(closeIntro, 350), { once:true });
} else {
  intro?.remove();
  body.classList.remove("intro-active");
}

/* Header */
const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 35);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive:true });

/* Mobile menu */
menuButton?.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
  body.classList.toggle("menu-open", open);
});
mobileMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden","true");
  menuButton?.setAttribute("aria-expanded","false");
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

/* Reveal */
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold:.11, rootMargin:"0px 0px -30px 0px" });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible"));
}

/* Projects autoplay */
const projectTrack = document.querySelector("[data-project-track]");
const prevProject = document.querySelector("[data-project-prev]");
const nextProject = document.querySelector("[data-project-next]");
let projectPaused = false;

const projectStep = () => {
  const card = projectTrack?.querySelector("[data-project-card]");
  return card ? card.getBoundingClientRect().width + 22 : 0;
};

const moveProjects = direction => {
  if (!projectTrack) return;
  const max = projectTrack.scrollWidth - projectTrack.clientWidth;
  const target = projectTrack.scrollLeft + direction * projectStep();
  if (direction > 0 && target >= max - 12) projectTrack.scrollTo({ left:0, behavior:"smooth" });
  else if (direction < 0 && target <= 0) projectTrack.scrollTo({ left:max, behavior:"smooth" });
  else projectTrack.scrollBy({ left:direction * projectStep(), behavior:"smooth" });
};

prevProject?.addEventListener("click", () => moveProjects(-1));
nextProject?.addEventListener("click", () => moveProjects(1));
projectTrack?.addEventListener("mouseenter", () => projectPaused = true);
projectTrack?.addEventListener("mouseleave", () => projectPaused = false);
projectTrack?.addEventListener("focusin", () => projectPaused = true);
projectTrack?.addEventListener("focusout", () => projectPaused = false);

if (projectTrack && !reduceMotion) {
  window.setInterval(() => { if (!projectPaused) moveProjects(1); }, 4200);
}

/* Project modal */
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
  modal.setAttribute("aria-hidden","false");
  body.classList.add("modal-open");
  modalClose?.focus();
};

const closeModal = () => {
  modal?.classList.remove("is-open");
  modal?.setAttribute("aria-hidden","true");
  body.classList.remove("modal-open");
  lastFocus?.focus();
};

document.querySelectorAll("[data-project-card]").forEach(card => {
  card.querySelector("button")?.addEventListener("click", () => openModal(card));
});
modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

/* Packages */
const packageData = [
  {
    label:"Pakiet 01",
    title:"Konsultacja projektowa",
    image:"tooni-stilllife.jpg",
    description:"Spotkanie poświęcone przestrzeni, stylowi i najważniejszym decyzjom. Pozwala uporządkować temat przed rozpoczęciem większego projektu.",
    items:["analiza potrzeb","wstępny kierunek","rekomendacje dalszych etapów"]
  },
  {
    label:"Pakiet 02",
    title:"Projekt funkcjonalny",
    image:"garderoba.jpg",
    description:"Opracowanie układu pomieszczeń, komunikacji i wyposażenia. Celem jest rozwiązanie, które odpowiada sposobowi codziennego użytkowania.",
    items:["inwentaryzacja","warianty układu","wybór najlepszego rozwiązania"]
  },
  {
    label:"Pakiet 03",
    title:"Projekt kompleksowy",
    image:"tooni-materials.jpg",
    description:"Pełne opracowanie wnętrza: od układu, przez materiały i wizualizacje, aż po dokumentację dla wykonawców.",
    items:["koncepcja wnętrza","materiały i wyposażenie","dokumentacja techniczna"]
  },
  {
    label:"Pakiet 04",
    title:"Nadzór autorski",
    image:"tooni-blueprints.jpg",
    description:"Wsparcie w trakcie realizacji, konsultowanie zmian i pomoc w zachowaniu zgodności wykonywanych prac z projektem.",
    items:["wizyty na miejscu","kontakt z wykonawcami","kontrola zgodności"]
  }
];

const packageRows = [...document.querySelectorAll("[data-package-index]")];
const packageImage = document.querySelector("[data-package-image]");
const packageLabel = document.querySelector("[data-package-label]");
const packageTitle = document.querySelector("[data-package-title]");
const packageDescription = document.querySelector("[data-package-description]");
const packageList = document.querySelector("[data-package-list]");

const activatePackage = index => {
  const data = packageData[index];
  if (!data) return;
  packageRows.forEach((row, i) => row.classList.toggle("is-active", i === index));
  if (packageImage) {
    packageImage.style.opacity = ".18";
    window.setTimeout(() => {
      packageImage.src = data.image;
      packageImage.alt = data.title;
      packageImage.style.opacity = "1";
    }, 130);
  }
  if (packageLabel) packageLabel.textContent = data.label;
  if (packageTitle) packageTitle.textContent = data.title;
  if (packageDescription) packageDescription.textContent = data.description;
  if (packageList) packageList.innerHTML = data.items.map(item => `<li>${item}</li>`).join("");
};

packageRows.forEach(row => {
  const index = Number(row.dataset.packageIndex);
  row.addEventListener("click", () => activatePackage(index));
  row.addEventListener("mouseenter", () => activatePackage(index));
  row.addEventListener("focus", () => activatePackage(index));
});

/* Process */
const processData = [
  {
    stage:"Etap 01",
    title:"Analiza lokalu",
    image:"tooni-blueprints.jpg",
    photoLabel:"analiza / kierunek",
    description:"Poznajemy miejsce, potrzeby inwestora, sposób użytkowania oraz ograniczenia techniczne. To etap, który ustawia właściwy kierunek całego projektu.",
    items:["rozmowa o potrzebach","analiza możliwości lokalu","ustalenie zakresu"],
    result:"Jasny kierunek dalszej pracy."
  },
  {
    stage:"Etap 02",
    title:"Inwentaryzacja",
    image:"tooni-blueprints.jpg",
    photoLabel:"pomiary / stan istniejący",
    description:"Dokładnie mierzymy przestrzeń i dokumentujemy jej stan. Powstaje wiarygodna baza do dalszej pracy nad funkcją i rozwiązaniami technicznymi.",
    items:["pomiary pomieszczeń","dokumentacja fotograficzna","rzuty stanu istniejącego"],
    result:"Komplet materiałów wyjściowych."
  },
  {
    stage:"Etap 03",
    title:"Układ funkcjonalny",
    image:"garderoba.jpg",
    photoLabel:"funkcja / ergonomia",
    description:"Przygotowujemy warianty rozmieszczenia funkcji, wyposażenia i komunikacji. Wspólnie wybieramy układ najlepiej dopasowany do codzienności.",
    items:["warianty układu","analiza ergonomii","wybór rozwiązania"],
    result:"Układ, który porządkuje przestrzeń."
  },
  {
    stage:"Etap 04",
    title:"Projekt koncepcyjny",
    image:"tooni-materials.jpg",
    photoLabel:"materiał / atmosfera",
    description:"Budujemy charakter wnętrza. Łączymy kolorystykę, materiały, światło i wyposażenie w jeden spójny kierunek.",
    items:["paleta materiałów","wizualizacje","dobór wyposażenia"],
    result:"Spójna koncepcja wnętrza."
  },
  {
    stage:"Etap 05",
    title:"Projekt wykonawczy",
    image:"tooni-blueprints.jpg",
    photoLabel:"rysunki / dokumentacja",
    description:"Przekładamy koncepcję na rysunki i informacje potrzebne ekipom wykonawczym. Każda kluczowa decyzja zostaje opisana.",
    items:["rysunki techniczne","zestawienia materiałów","wytyczne dla wykonawców"],
    result:"Dokumentacja gotowa do realizacji."
  },
  {
    stage:"Etap 06",
    title:"Nadzór autorski",
    image:"tooni-stilllife.jpg",
    photoLabel:"realizacja / kontrola",
    description:"Wspieramy inwestora w trakcie prac, odpowiadamy na pytania wykonawców i pomagamy utrzymać spójność realizacji z projektem.",
    items:["wizyty na miejscu","konsultacje zmian","kontrola zgodności"],
    result:"Wsparcie podczas realizacji."
  }
];

const processSteps = [...document.querySelectorAll("[data-process-index]")];
const processImage = document.querySelector("[data-process-image]");
const processPhotoLabel = document.querySelector("[data-process-photo-label]");
const processStage = document.querySelector("[data-process-stage]");
const processTitle = document.querySelector("[data-process-title]");
const processDescription = document.querySelector("[data-process-description]");
const processList = document.querySelector("[data-process-list]");
const processResult = document.querySelector("[data-process-result]");

const activateProcess = index => {
  const data = processData[index];
  if (!data) return;
  processSteps.forEach((step, i) => step.classList.toggle("is-active", i === index));
  if (processImage) {
    processImage.style.opacity = ".18";
    window.setTimeout(() => {
      processImage.src = data.image;
      processImage.alt = data.title;
      processImage.style.opacity = "1";
    }, 130);
  }
  if (processPhotoLabel) processPhotoLabel.textContent = data.photoLabel;
  if (processStage) processStage.textContent = data.stage;
  if (processTitle) processTitle.textContent = data.title;
  if (processDescription) processDescription.textContent = data.description;
  if (processList) processList.innerHTML = data.items.map(item => `<li>${item}</li>`).join("");
  if (processResult) processResult.textContent = data.result;
};

processSteps.forEach(step => {
  const index = Number(step.dataset.processIndex);
  step.addEventListener("click", () => activateProcess(index));
  step.addEventListener("mouseenter", () => activateProcess(index));
  step.addEventListener("focus", () => activateProcess(index));
});

/* Success */
const params = new URLSearchParams(window.location.search);
if (params.get("wyslano") === "1") {
  document.querySelector("[data-success]")?.classList.add("is-visible");
}
