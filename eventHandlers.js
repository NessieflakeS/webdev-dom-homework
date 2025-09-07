import { escapeHTML } from './escapeHTML.js';
import { getToken } from './api.js';
import { renderLoginComponent } from './login.js';

export function initHandlers({ onAddComment, onToggleLike, onReply, onRetry, onInputChange }) {
  const commentInput = document.querySelector('.add-form-text');
  const addButton = document.querySelector('.add-form-button');
  const commentsList = document.querySelector('.comments');
  const appEl = document.getElementById('app');

  const checkInputs = () => {
    if (addButton) {
      addButton.disabled = !commentInput.value.trim();
    }
    if (onInputChange) onInputChange();
  };

  if (commentsList) {
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
  }

  if (addButton && commentInput) {
    addButton.addEventListener('click', (event) => {
      event.preventDefault();
      
      const text = commentInput.value.trim();
      
      if (text.length < 3) {
        alert('Комментарий должен быть не короче 3 символов');
        return;
      }
      
      onAddComment({
        text: escapeHTML(text)
      });
    });

    commentInput.addEventListener('input', checkInputs);
  }
  
  checkInputs();
}