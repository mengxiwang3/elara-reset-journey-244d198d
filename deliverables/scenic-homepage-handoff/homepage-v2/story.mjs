// Guided practice and the six-area chooser. Local only: nothing is sent or saved.
const replies = [...document.querySelectorAll('[data-reply]')], hint = document.querySelector('#example-hint');
replies.forEach(b => b.addEventListener('click', () => {
  replies.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  hint.textContent = 'Prueba también la otra respuesta. Aquí no hay una correcta.';
}));
const paths = [...document.querySelectorAll('[data-path]')], panels = [...document.querySelectorAll('[data-panel]')];
paths.forEach((b, i) => b.addEventListener('click', () => {
  paths.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  panels.forEach(p => { p.hidden = p.dataset.panel !== b.dataset.path; });
  document.querySelector('#path-number').textContent = `0${i + 1} / 06`;
  document.querySelector('#path-link').href = `https://elara-seven-day-journey.karawang3.chatgpt.site/?journey=${b.dataset.path}&day=1&lang=es`;
}));
