import { renderComments } from './renderComments.js';
import { initHandlers } from './eventHandlers.js';

document.addEventListener('DOMContentLoaded', () => {
  renderComments();

  initHandlers();
});

try {
  const comments = await getComments();
  renderComments(comments);
} catch (error) {
  showError("Не удалось загрузить комментарии");
}

function showError(message) {
  const errorEl = document.createElement('div');
  errorEl.className = 'error';
  errorEl.textContent = message;
  document.body.prepend(errorEl);
  
  setTimeout(() => errorEl.remove(), 3000);
}