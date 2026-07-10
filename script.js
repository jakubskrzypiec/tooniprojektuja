const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 38);
};
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle?.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  mobileMenu.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});

mobileMenu?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

/* Hero rotating word */
const rotatingWord = document.querySelector("[data-rotating-word]");
const words = ["działają.", "uspokajają.", "dojrzewają.", "zostają."];
let wordIndex = 0;

if (rotatingWord) {
  window.setInterval(() => {
    rotatingWord.classList.add("is-changing");
    window.setTimeout(() => {
      wordIndex = (wordIndex + 1) % words.length;
      rotatingWord.textContent = words[wordIndex];
      rotatingWord.classList.remove("is-changing");
    }, 280);
  }, 2300);
}

/* Reveal animation */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

/* Project marquee */
const marquee = document.querySelector("[data-marquee]");
const track = document.querySelector("[data-project-track]");

if (marquee && track) {
  track.innerHTML += track.innerHTML;

  let paused = false;
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const move = () => {
    if (!paused && !dragging && !reduceMotion) {
      marquee.scrollLeft += 0.62;
      if (marquee.scrollLeft >= track.scrollWidth / 2) marquee.scrollLeft = 0;
    }
    requestAnimationFrame(move);
  };
  move();

  marquee.addEventListener("mouseenter", () => paused = true);
  marquee.addEventListener("mouseleave", () => paused = false);
  marquee.addEventListener("pointerdown", event => {
    dragging = true;
    startX = event.clientX;
    startScroll = marquee.scrollLeft;
    marquee.setPointerCapture(event.pointerId);
    marquee.classList.add("dragging");
  });
  marquee.addEventListener("pointermove", event => {
    if (!dragging) return;
    marquee.scrollLeft = startScroll - (event.clientX - startX);
  });
  const stopDragging = () => {
    dragging = false;
    marquee.classList.remove("dragging");
  };
  marquee.addEventListener("pointerup", stopDragging);
  marquee.addEventListener("pointercancel", stopDragging);
}

/* Project popup */
const projectDialog = document.querySelector("[data-project-dialog]");
document.querySelectorAll(".project-slide").forEach(slide => {
  slide.addEventListener("click", () => {
    if (!projectDialog) return;
    const image = projectDialog.querySelector("[data-dialog-image]");
    image.src = slide.dataset.image;
    image.alt = slide.dataset.title;
    projectDialog.querySelector("[data-dialog-title]").textContent = slide.dataset.title;
    projectDialog.querySelector("[data-dialog-category]").textContent = slide.dataset.category;
    projectDialog.showModal();
  });
});

projectDialog?.querySelector(".dialog-close")?.addEventListener("click", () => projectDialog.close());
projectDialog?.addEventListener("click", event => {
  if (event.target === projectDialog) projectDialog.close();
});

/* Park gallery */
const parkMain = document.querySelector("[data-park-main]");
document.querySelectorAll("[data-park-image]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-park-image]").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    if (!parkMain) return;
    parkMain.style.opacity = ".2";
    window.setTimeout(() => {
      parkMain.src = button.dataset.parkImage;
      parkMain.style.opacity = "1";
    }, 140);
  });
});

/* Process image */
const processImage = document.querySelector("[data-process-image]");
document.querySelectorAll(".process-row").forEach(row => {
  const activate = () => {
    document.querySelectorAll(".process-row").forEach(item => item.classList.remove("active"));
    row.classList.add("active");
    if (!processImage) return;
    processImage.style.opacity = ".2";
    window.setTimeout(() => {
      processImage.src = row.dataset.processSrc;
      processImage.style.opacity = "1";
    }, 130);
  };
  row.addEventListener("mouseenter", activate);
  row.addEventListener("click", activate);
});

/* Mail form */
document.querySelector("[data-contact-form]")?.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Zapytanie o projekt wnętrza — ${data.get("name") || ""}`);
  const body = encodeURIComponent(
`Imię i nazwisko: ${data.get("name") || ""}
Telefon: ${data.get("phone") || ""}
E-mail: ${data.get("email") || ""}

Informacje o inwestycji:
${data.get("message") || ""}`
  );
  window.location.href = `mailto:tooniprojektuja@gmail.com?subject=${subject}&body=${body}`;
});

/* V5 — subtle contact popup */
const projectPop = document.querySelector("[data-project-pop]");
const projectPopClose = projectPop?.querySelector(".project-pop-close");
let projectPopShown = false;

const showProjectPop = () => {
  if (!projectPop || projectPopShown) return;
  projectPopShown = true;
  projectPop.classList.add("visible");
  projectPop.setAttribute("aria-hidden", "false");
};

const hideProjectPop = () => {
  projectPop?.classList.remove("visible");
  projectPop?.setAttribute("aria-hidden", "true");
};

window.setTimeout(showProjectPop, 7000);

window.addEventListener("scroll", () => {
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (pageHeight > 0 && window.scrollY / pageHeight > 0.34) showProjectPop();
}, { passive: true });

projectPopClose?.addEventListener("click", hideProjectPop);
projectPop?.querySelector('a[href="#kontakt"]')?.addEventListener("click", hideProjectPop);
