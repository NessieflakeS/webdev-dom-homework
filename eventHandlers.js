import { escapeHTML } from './escapeHTML.js';

export function initHandlers({ onAddComment, onToggleLike, onReply, onRetry, onInputChange }) {
  const nameInput = document.querySelector('.add-form-name');
  const commentInput = document.querySelector('.add-form-text');
  const addButton = document.querySelector('.add-form-button');
  const commentsList = document.querySelector('.comments');

  const checkInputs = () => {
    addButton.disabled = !(nameInput.value.trim() && commentInput.value.trim());
    if (onInputChange) onInputChange();
  };

  commentsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('retry-btn')) {
      onRetry();
      return;
    }

    if (event.target.classList.contains('like-button')) {
      event.preventDefault();
      const commentElement = event.target.closest('.comment');
      if (!commentElement) return;
      
      const commentId = commentElement.dataset.id;
      onToggleLike(commentId);
      return;
    }

    if (event.target.classList.contains('comment-reply')) {
      event.preventDefault();
      const commentElement = event.target.closest('.comment');
      if (!commentElement) return;
      
      const author = commentElement.querySelector('.comment-author').textContent;
      const text = commentElement.querySelector('.comment-body').textContent;
      onReply(author, text);
      return;
    }
  });

  addButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    const name = nameInput.value.trim();
    const text = commentInput.value.trim();
    
      if (name.length < 3 || text.length < 3) {
      alert('Имя и комментарий должны быть не короче 3 символов');
      return;
    }
    
    onAddComment({
      name: escapeHTML(name),
      text: escapeHTML(text)
    });
  });

  nameInput.addEventListener('input', checkInputs);
  commentInput.addEventListener('input', checkInputs);
  
  checkInputs();
}