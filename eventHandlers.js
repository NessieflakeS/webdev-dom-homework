import { escapeHTML } from './escapeHTML.js';

export function initHandlers({ onAddComment, onRetry }) {
  const nameInput = document.querySelector('.add-form-name');
  const commentInput = document.querySelector('.add-form-text');
  const addButton = document.querySelector('.add-form-button');
  const commentsList = document.querySelector('.comments');

  const checkInputs = () => {
    addButton.disabled = !(nameInput.value.trim() && commentInput.value.trim());
  };

  commentsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('retry-btn')) {
      onRetry();
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
    
    addButton.disabled = true;
  });

  nameInput.addEventListener('input', checkInputs);
  commentInput.addEventListener('input', checkInputs);
  
  checkInputs();
}