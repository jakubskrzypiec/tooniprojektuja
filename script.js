const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

menuToggle?.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
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

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

const marquee = document.querySelector("[data-marquee]");
const track = document.querySelector("[data-project-track]");

if (track && marquee) {
  track.innerHTML += track.innerHTML;

  let paused = false;
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  const loop = () => {
    if (!paused && !dragging) {
      marquee.scrollLeft += 0.45;
      if (marquee.scrollLeft >= track.scrollWidth / 2) marquee.scrollLeft = 0;
    }
    requestAnimationFrame(loop);
  };
  loop();

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
  const stop = () => {
    dragging = false;
    marquee.classList.remove("dragging");
  };
  marquee.addEventListener("pointerup", stop);
  marquee.addEventListener("pointercancel", stop);
}

const dialog = document.querySelector("[data-project-dialog]");
document.querySelectorAll(".project-slide").forEach(slide => {
  slide.addEventListener("click", () => {
    if (!dialog) return;
    dialog.querySelector("[data-dialog-image]").src = slide.dataset.image;
    dialog.querySelector("[data-dialog-image]").alt = slide.dataset.title;
    dialog.querySelector("[data-dialog-title]").textContent = slide.dataset.title;
    dialog.querySelector("[data-dialog-subtitle]").textContent = slide.dataset.subtitle;
    dialog.showModal();
  });
});

dialog?.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

const parkMain = document.querySelector("[data-park-main]");
document.querySelectorAll("[data-park-image]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-park-image]").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    if (!parkMain) return;
    parkMain.style.opacity = ".25";
    window.setTimeout(() => {
      parkMain.src = button.dataset.parkImage;
      parkMain.style.opacity = "1";
    }, 130);
  });
});

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