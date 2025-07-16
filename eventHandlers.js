import { comments } from './comments.js';
import { renderComments } from './renderComments.js';

let nameInput, commentInput, addButton;

function initHandlers() {
  nameInput = document.querySelector('.add-form-name');
  commentInput = document.querySelector('.add-form-text');
  addButton = document.querySelector('.add-form-button');
  const commentsList = document.querySelector('.comments');

  commentsList.addEventListener('click', (e) => {
    const target = e.target;
    const commentElement = target.closest('.comment');
    
    if (!commentElement) return;
    
    const commentId = parseInt(commentElement.dataset.id);
    const comment = comments.find(c => c.id === commentId);
    
    if (target.classList.contains('like-button')) {
      toggleLike(commentId);
      return;
    }
    
    replyToComment(comment);
  });

  nameInput.addEventListener('input', checkInputs);
  commentInput.addEventListener('input', checkInputs);
  
  addButton.addEventListener('click', addComment);
}

function toggleLike(commentId) {
  const comment = comments.find(c => c.id === commentId);
  if (!comment) return;
  
  comment.isLiked = !comment.isLiked;
  comment.likes += comment.isLiked ? 1 : -1;
  renderComments();
}

function replyToComment(comment) {
  nameInput.value = comment.name;
  commentInput.value = `> ${comment.text}\n`;
  commentInput.focus();
}

function checkInputs() {
  addButton.disabled = !(nameInput.value.trim() && commentInput.value.trim());
}

function addComment() {
  const author = nameInput.value.trim();
  const text = commentInput.value.trim();
  
  if (!author || !text) return;
  
  let replyTo = null;
  
  if (text.startsWith('> ')) {
    const lines = text.split('\n');
    const replyText = lines[0].substring(2);
    replyTo = {
      author,
      text: replyText
    };
  }
  
  const newComment = {
    id: Date.now(),
    name: author,
    text: text,
    date: new Date().toLocaleString(),
    likes: 0,
    isLiked: false,
    replyTo
  };
  
  comments.push(newComment);
  
  nameInput.value = '';
  commentInput.value = '';
  addButton.disabled = true;
  
  renderComments();
}

export { initHandlers };