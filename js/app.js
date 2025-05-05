/* Barra de navegación */

// Cambia estilo al hacer scroll
window.addEventListener('scroll', function () {
  const header = document.querySelector('.encabezado');
  const logo = document.getElementById('logo');

  if (header) {
    const scrolled = window.scrollY > 50;
    header.classList.toggle('scrolled', scrolled);

    if (logo) {
      logo.src = scrolled ? '../img/logo-negro.png' : '../img/logo-blanco.png';
    }
  }
});

// Manejo del botón de menú móvil (si existe)
const toggleButton = document.querySelector('.navbar-toggler');
const body = document.body;

if (toggleButton) {
  toggleButton.addEventListener('click', () => {
    body.classList.toggle('menu-open');
  });
}


