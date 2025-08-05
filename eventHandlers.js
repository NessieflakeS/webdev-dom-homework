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
    const commentElement = event.target.closest('.comment');
    if (!commentElement) return;

    const commentId = commentElement.dataset.id;

    if (event.target.classList.contains('like-button')) {
      event.preventDefault();
      onToggleLike(commentId);
      return;
    }

    if (event.target.classList.contains('comment-reply')) {
      event.preventDefault();
      const author = commentElement.querySelector('.comment-author').textContent;
      const text = commentElement.querySelector('.comment-body').textContent;
      onReply(author, text);
      return;
    }

    if (event.target.classList.contains('retry-btn')) {
      window.location.reload();
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