import { renderComments } from './renderComments.js';
import { initHandlers } from './eventHandlers.js';
import { getComments, postComment } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const comments = await getComments();
    renderComments(comments);
  } catch (error) {
    console.error('Initialization error:', error);
    const container = document.getElementById('comments');
    container.innerHTML = `<div class="error">Ошибка загрузки: ${error.message}</div>`;
  }

  initHandlers({
    async onAddComment(newComment) {
      try {
        const savedComment = await postComment(newComment);
        renderComments([savedComment, ...comments], true);
      } catch (error) {
        alert(`Ошибка отправки: ${error.message}`);
      }
    }
  });
});

console.log("Using API module:", { getComments, postComment });