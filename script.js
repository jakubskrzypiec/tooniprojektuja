const projects = [
  {
    image: "kuchnia1.jpg",
    title: "Kuchnia / projekt indywidualny",
    meta: "Wnętrze mieszkalne",
    tag: "Projekt wnętrza",
    description: "Jasna, funkcjonalna strefa dzienna z zabudową dopasowaną do układu mieszkania i codziennych potrzeb domowników."
  },
  {
    image: "kuchnia2.jpg",
    title: "Strefa dzienna",
    meta: "Kuchnia i salon",
    tag: "Projekt kompleksowy",
    description: "Spójne połączenie kuchni i salonu, oparte na spokojnych materiałach, ergonomii i naturalnym świetle."
  },
  {
    image: "lazienka1.jpg",
    title: "Łazienka / detal",
    meta: "Projekt koncepcyjny",
    tag: "Projekt wnętrza",
    description: "Kompaktowa łazienka uporządkowana za pomocą prostych podziałów, konsekwentnych materiałów i dobrze zaplanowanego światła."
  },
  {
    image: "lazienka2.jpg",
    title: "Łazienka / realizacja",
    meta: "Wnętrze prywatne",
    tag: "Projekt wykonawczy",
    description: "Projekt łączący funkcjonalność z detalem — bez przypadkowych elementów i niepotrzebnych dekoracji."
  },
  {
    image: "garderoba.jpg",
    title: "Garderoba na wymiar",
    meta: "Zabudowa indywidualna",
    tag: "Projekt mebla",
    description: "Zabudowa zaplanowana pod konkretną przestrzeń, sposób przechowywania i rytm codziennego użytkowania."
  },
  {
    image: "sypialnia.jpg",
    title: "Sypialnia / spokojna baza",
    meta: "Wnętrze mieszkalne",
    tag: "Projekt wnętrza",
    description: "Wyciszona przestrzeń oparta na miękkich proporcjach, naturalnej palecie i uporządkowanym oświetleniu."
  },
  {
    image: "park1.jpg",
    title: "Skwer w Zabrzu",
    meta: "Przestrzeń wspólna",
    tag: "Koncepcja urbanistyczna",
    description: "Projekt przestrzeni publicznej uwzględniający istniejący krajobraz, retencję wody, zieleń i codzienne potrzeby mieszkańców."
  }
];

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 30);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle?.addEventListener("click", () => {
  const open = !mobileMenu.classList.contains("is-open");
  mobileMenu.classList.toggle("is-open", open);
  mobileMenu.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});

mobileMenu?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

const track = document.querySelector("[data-project-track]");
const marquee = document.querySelector("[data-project-marquee]");
const dialog = document.querySelector("[data-project-dialog]");

const createCard = (project, index) => {
  const card = document.createElement("article");
  card.className = "project-card";
  card.tabIndex = 0;
  card.innerHTML = `
    <div class="project-card-image"><img src="${project.image}" alt="${project.title}" loading="lazy"></div>
    <div class="project-card-copy">
      <div><h3>${project.title}</h3><p>${project.meta}</p></div>
      <span class="project-card-index">${String((index % projects.length) + 1).padStart(2, "0")}</span>
    </div>`;
  const open = () => openProject(project);
  card.addEventListener("click", open);
  card.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  });
  return card;
};

if (track) {
  [...projects, ...projects].forEach((project, index) => track.appendChild(createCard(project, index)));
}

let autoScroll = 0.42;
let paused = false;
let dragging = false;
let startX = 0;
let startScroll = 0;

const animateMarquee = () => {
  if (marquee && !paused && !dragging) {
    marquee.scrollLeft += autoScroll;
    if (marquee.scrollLeft >= track.scrollWidth / 2) marquee.scrollLeft = 0;
  }
  requestAnimationFrame(animateMarquee);
};
animateMarquee();

marquee?.addEventListener("mouseenter", () => paused = true);
marquee?.addEventListener("mouseleave", () => paused = false);
marquee?.addEventListener("pointerdown", event => {
  dragging = true;
  startX = event.clientX;
  startScroll = marquee.scrollLeft;
  marquee.setPointerCapture(event.pointerId);
  marquee.classList.add("is-dragging");
});
marquee?.addEventListener("pointermove", event => {
  if (!dragging) return;
  marquee.scrollLeft = startScroll - (event.clientX - startX);
});
marquee?.addEventListener("pointerup", () => {
  dragging = false;
  marquee.classList.remove("is-dragging");
});
marquee?.addEventListener("pointercancel", () => {
  dragging = false;
  marquee.classList.remove("is-dragging");
});

function openProject(project) {
  if (!dialog) return;
  dialog.querySelector("[data-dialog-image]").src = project.image;
  dialog.querySelector("[data-dialog-image]").alt = project.title;
  dialog.querySelector("[data-dialog-tag]").textContent = project.tag;
  dialog.querySelector("[data-dialog-title]").textContent = project.title;
  dialog.querySelector("[data-dialog-description]").textContent = project.description;
  dialog.showModal();
}

dialog?.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
dialog?.querySelector("[data-dialog-contact]")?.addEventListener("click", () => dialog.close());

document.querySelectorAll(".package-row button").forEach(button => {
  button.addEventListener("click", () => {
    const row = button.closest(".package-row");
    const open = !row.classList.contains("is-open");
    document.querySelectorAll(".package-row").forEach(item => {
      item.classList.remove("is-open");
      item.querySelector("button").setAttribute("aria-expanded", "false");
      item.querySelector(".package-plus").textContent = "+";
    });
    if (open) {
      row.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      row.querySelector(".package-plus").textContent = "−";
    }
  });
});

const parkMain = document.querySelector(".park-image img");
document.querySelectorAll("[data-park-image]").forEach(button => {
  button.addEventListener("click", () => {
    if (!parkMain) return;
    parkMain.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 350 });
    parkMain.src = button.dataset.parkImage;
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll(".section-head > *, .studio-copy > *, .packages-intro > *, .package-row, .process-grid article, .contact-copy > *, .contact-form, .client-panel-inner > *").forEach(el => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});

document.querySelector("[data-contact-form]")?.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Zapytanie o projekt wnętrza — ${data.get("name") || ""}`);
  const body = encodeURIComponent(
`Imię i nazwisko: ${data.get("name") || ""}
Telefon: ${data.get("phone") || ""}
E-mail: ${data.get("email") || ""}
Lokalizacja / metraż: ${data.get("project") || ""}

Opis inwestycji:
${data.get("message") || ""}`
  );
  window.location.href = `mailto:tooniprojektuja@gmail.com?subject=${subject}&body=${body}`;
});
