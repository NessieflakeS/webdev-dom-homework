import { escapeHTML } from './escapeHTML.js';

export function initHandlers({ onAddComment, onToggleLike, onReply }) {
  const nameInput = document.querySelector('.add-form-name');
  const commentInput = document.querySelector('.add-form-text');
  const addButton = document.querySelector('.add-form-button');
  const commentsList = document.querySelector('.comments');

  const checkInputs = () => {
    addButton.disabled = !(nameInput.value.trim() && commentInput.value.trim());
  };

  commentsList.addEventListener('click', (event) => {
    const target = event.target;
    const commentElement = target.closest('.comment');
    
    if (!commentElement) return;

    const commentId = commentElement.dataset.id;

    if (target.classList.contains('like-button')) {
      onToggleLike(commentId);
      return;
    }
  });

  commentsList.addEventListener('click', (event) => {
    const target = event.target.closest('.comment-reply');
    if (target) {
      const commentId = target.dataset.id;
      onReply(commentId);
    }
  });

  addButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    const name = nameInput.value.trim();
    const text = commentInput.value.trim();
    
    if (!name || !text) return;
    
    onAddComment({
      name: escapeHTML(name),
      text: escapeHTML(text)
    });
    
    nameInput.value = '';
    commentInput.value = '';
    addButton.disabled = true;
  });

  nameInput.addEventListener('input', checkInputs);
  commentInput.addEventListener('input', checkInputs);
  checkInputs();
}
