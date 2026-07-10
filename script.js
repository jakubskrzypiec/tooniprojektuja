
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

menuToggle?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
});

document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const track = document.querySelector('[data-marquee-track]');
if (track) {
  track.innerHTML += track.innerHTML;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.14});

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const parkMain = document.getElementById('parkMain');
document.querySelectorAll('[data-park]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-park]').forEach(item => item.classList.remove('is-active'));
    btn.classList.add('is-active');
    if (!parkMain) return;
    parkMain.animate([{opacity:.35, transform:'scale(.99)'},{opacity:1, transform:'scale(1)'}], {duration:260, easing:'ease-out'});
    parkMain.src = btn.dataset.park;
  });
});

document.querySelector('[data-contact-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Zapytanie o projekt — ${data.get('name') || ''}`);
  const body = encodeURIComponent(
`Imię i nazwisko: ${data.get('name') || ''}
Telefon: ${data.get('phone') || ''}
E-mail: ${data.get('email') || ''}
Zakres inwestycji: ${data.get('project') || ''}

Wiadomość:
${data.get('message') || ''}`
  );
  window.location.href = `mailto:tooniprojektuja@gmail.com?subject=${subject}&body=${body}`;
});
