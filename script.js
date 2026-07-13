const body = document.body;
const intro = document.querySelector("[data-intro]");
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Split intro */
let introClosed = false;
const closeIntro = () => {
  if (!intro || introClosed) return;
  introClosed = true;
  intro.classList.add("is-closing");
  body.classList.remove("intro-active");
  window.setTimeout(() => intro.remove(), 780);
};
if (intro && !reduceMotion) {
  window.setTimeout(closeIntro, 1150);
  window.setTimeout(closeIntro, 2400);
  intro.addEventListener("click", closeIntro, { once:true });
  window.addEventListener("load", () => window.setTimeout(closeIntro, 450), { once:true });
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

/* Approach hover */
const approachSteps = [...document.querySelectorAll("[data-approach-step]")];
approachSteps.forEach(step => {
  const activate = () => {
    approachSteps.forEach(item => item.classList.remove("is-active"));
    step.classList.add("is-active");
  };
  step.addEventListener("mouseenter", activate);
  step.addEventListener("focus", activate);
});

/* Seamless projects */
const marquee = document.querySelector("[data-project-marquee]");
const track = document.querySelector("[data-project-track]");
const prevProject = document.querySelector("[data-project-prev]");
const nextProject = document.querySelector("[data-project-next]");

if (track && marquee) {
  const originals = [...track.children];
  originals.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
  if (!reduceMotion) marquee.classList.add("is-animated");

  marquee.addEventListener("mouseenter", () => marquee.classList.add("is-paused"));
  marquee.addEventListener("mouseleave", () => marquee.classList.remove("is-paused"));
  marquee.addEventListener("focusin", () => marquee.classList.add("is-paused"));
  marquee.addEventListener("focusout", () => marquee.classList.remove("is-paused"));
}

const nudgeProjects = direction => {
  if (!track || !marquee) return;
  marquee.classList.add("is-paused");
  const current = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41 || 0;
  track.style.transform = `translateX(${current + direction * 412}px)`;
  window.setTimeout(() => {
    track.style.transform = "";
    marquee.classList.remove("is-paused");
  }, 850);
};

prevProject?.addEventListener("click", () => nudgeProjects(1));
nextProject?.addEventListener("click", () => nudgeProjects(-1));

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

/* Packages accordion */
const packageItems = [...document.querySelectorAll(".package-item")];
packageItems.forEach(item => {
  item.querySelector("[data-package-toggle]")?.addEventListener("click", () => {
    packageItems.forEach(other => {
      if (other !== item) other.classList.remove("is-open");
    });
    item.classList.toggle("is-open");
  });
});

/* Process */
const processData = [
  {
    stage:"Etap 01",
    title:"Analiza lokalu",
    image:"tooni-blueprints.jpg",
    caption:"analiza / kierunek",
    description:"Poznajemy miejsce, potrzeby inwestora, sposób użytkowania oraz ograniczenia techniczne. To etap, który ustawia właściwy kierunek całego projektu.",
    items:["rozmowa o potrzebach","analiza możliwości lokalu","ustalenie zakresu"],
    result:"Jasny kierunek dalszej pracy."
  },
  {
    stage:"Etap 02",
    title:"Inwentaryzacja",
    image:"tooni-blueprints.jpg",
    caption:"pomiary / stan istniejący",
    description:"Dokładnie mierzymy przestrzeń i dokumentujemy jej stan. Powstaje wiarygodna baza do dalszej pracy nad funkcją i rozwiązaniami technicznymi.",
    items:["pomiary pomieszczeń","dokumentacja fotograficzna","rzuty stanu istniejącego"],
    result:"Komplet materiałów wyjściowych."
  },
  {
    stage:"Etap 03",
    title:"Układ funkcjonalny",
    image:"garderoba.jpg",
    caption:"funkcja / ergonomia",
    description:"Przygotowujemy warianty rozmieszczenia funkcji, wyposażenia i komunikacji. Wspólnie wybieramy układ najlepiej dopasowany do codzienności.",
    items:["warianty układu","analiza ergonomii","wybór rozwiązania"],
    result:"Układ, który porządkuje przestrzeń."
  },
  {
    stage:"Etap 04",
    title:"Projekt koncepcyjny",
    image:"tooni-materials.jpg",
    caption:"materiał / atmosfera",
    description:"Budujemy charakter wnętrza. Łączymy kolorystykę, materiały, światło i wyposażenie w jeden spójny kierunek.",
    items:["paleta materiałów","wizualizacje","dobór wyposażenia"],
    result:"Spójna koncepcja wnętrza."
  },
  {
    stage:"Etap 05",
    title:"Projekt wykonawczy",
    image:"tooni-blueprints.jpg",
    caption:"rysunki / dokumentacja",
    description:"Przekładamy koncepcję na rysunki i informacje potrzebne ekipom wykonawczym. Każda kluczowa decyzja zostaje opisana.",
    items:["rysunki techniczne","zestawienia materiałów","wytyczne dla wykonawców"],
    result:"Dokumentacja gotowa do realizacji."
  },
  {
    stage:"Etap 06",
    title:"Nadzór autorski",
    image:"tooni-stilllife.jpg",
    caption:"realizacja / kontrola",
    description:"Wspieramy inwestora w trakcie prac, odpowiadamy na pytania wykonawców i pomagamy utrzymać spójność realizacji z projektem.",
    items:["wizyty na miejscu","konsultacje zmian","kontrola zgodności"],
    result:"Wsparcie podczas realizacji."
  }
];

const processNodes = [...document.querySelectorAll("[data-process-index]")];
const processImage = document.querySelector("[data-process-image]");
const processCaption = document.querySelector("[data-process-caption]");
const processStage = document.querySelector("[data-process-stage]");
const processTitle = document.querySelector("[data-process-title]");
const processDescription = document.querySelector("[data-process-description]");
const processList = document.querySelector("[data-process-list]");
const processResult = document.querySelector("[data-process-result]");

const activateProcess = index => {
  const data = processData[index];
  if (!data) return;
  processNodes.forEach((node, i) => node.classList.toggle("is-active", i === index));

  if (processImage) {
    processImage.style.opacity = ".15";
    processImage.style.transform = "scale(1.02)";
    window.setTimeout(() => {
      processImage.src = data.image;
      processImage.alt = data.title;
      processImage.style.opacity = "1";
      processImage.style.transform = "scale(1)";
    }, 140);
  }

  if (processCaption) processCaption.textContent = data.caption;
  if (processStage) processStage.textContent = data.stage;
  if (processTitle) processTitle.textContent = data.title;
  if (processDescription) processDescription.textContent = data.description;
  if (processList) processList.innerHTML = data.items.map(item => `<li>${item}</li>`).join("");
  if (processResult) processResult.textContent = data.result;
};

processNodes.forEach(node => {
  const index = Number(node.dataset.processIndex);
  node.addEventListener("click", () => activateProcess(index));
  node.addEventListener("mouseenter", () => activateProcess(index));
  node.addEventListener("focus", () => activateProcess(index));
});

/* Form success */
const params = new URLSearchParams(window.location.search);
if (params.get("wyslano") === "1") {
  document.querySelector("[data-success]")?.classList.add("is-visible");
}
