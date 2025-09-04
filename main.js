import { renderComments } from './renderComments.js';
import { initHandlers } from './eventHandlers.js';
import { getComments, postComment, updateComment } from './api.js';

function delay(interval = 300) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), interval);
  });
}

function disablePageScroll() {
  document.body.classList.add('-noscroll');
  window.scrollTo(0, window.pageYOffset);
}

function enablePageScroll() {
  document.body.classList.remove('-noscroll');
}

let comments = [];
let isLoading = false;
let error = null;
let formData = { name: '', text: '' }; 

const loadComments = async () => {
  isLoading = true;
  renderComments(comments, isLoading, error, formData);
  
  try {
    comments = await getComments();
    error = null;
  } catch (err) {
    console.error('Failed to load comments:', err);
    error = err;
    
    if (err.code === 500) {
      alert('Сервер сломался, попробуй позже');
    } else if (err.code === 'NETWORK_ERROR') {
      alert('Кажется, у вас сломался интернет, попробуйте позже');
    }
  } finally {
    isLoading = false;
    renderComments(comments, isLoading, error, formData);
  }
};

function setFormDisabled(disabled) {
  const addButton = document.querySelector('.add-form-button');
  const nameInput = document.querySelector('.add-form-name');
  const commentInput = document.querySelector('.add-form-text');
  const addForm = document.querySelector('.add-form');
  
  if (addButton) {
    addButton.disabled = disabled;
    addButton.textContent = disabled ? 'Отправка...' : 'Написать';
  }
  
  if (nameInput) nameInput.disabled = disabled;
  if (commentInput) commentInput.disabled = disabled;
  
  if (addForm) {
    if (disabled) {
      addForm.classList.add('-loading');
      disablePageScroll();
    } else {
      addForm.classList.remove('-loading');
      enablePageScroll();
    }
  }
}

function saveFormData() {
  const nameInput = document.querySelector('.add-form-name');
  const commentInput = document.querySelector('.add-form-text');
  
  if (nameInput) formData.name = nameInput.value;
  if (commentInput) formData.text = commentInput.value;
}

function restoreFormData() {
  const nameInput = document.querySelector('.add-form-name');
  const commentInput = document.querySelector('.add-form-text');
  
  if (nameInput) nameInput.value = formData.name;
  if (commentInput) commentInput.value = formData.text;
}

document.addEventListener('DOMContentLoaded', async () => {
  restoreFormData();
  
  await loadComments();

  initHandlers({
    onAddComment: async (newComment) => {
      const startTime = Date.now();
      setFormDisabled(true);
      saveFormData(); // Сохраняем данные формы
      
      try {
        const tempComment = {
          id: 'temp-' + Date.now(),
          name: newComment.name,
          text: newComment.text,
          date: Date.now(),
          likes: 0,
          isLiked: false,
          isSending: true
        };
        
        comments = [...comments, tempComment];
        renderComments(comments, isLoading, error, formData);
        
        const updatedComments = await postComment(newComment);
        
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(2000 - elapsed, 0);
        await delay(remainingDelay);
        
        comments = updatedComments;
        error = null;
        formData = { name: '', text: '' }; // Очищаем данные формы
        
      } catch (err) {
      console.error('Failed to post comment:', err);
      error = err;
      
      if (err.code === 400) {
        alert('Имя и комментарий должны быть не короче 3 символов');
      } else if (err.code === 500) {
        alert('Сервер сломался, попробуй позже');
      } else if (err.code === 'NETWORK_ERROR') {
        alert('Кажется, у вас сломался интернет, попробуйте позже');
      }
      
      comments = comments.filter(c => !c.isSending);
    }
    },
    
    onToggleLike: async (commentId) => {
      const commentIndex = comments.findIndex(c => c.id == commentId);
      if (commentIndex === -1) return;
      
      const updatedComments = [...comments];
      const comment = updatedComments[commentIndex];
      
      updatedComments[commentIndex] = {
        ...comment,
        isLikeLoading: true
      };
      
      comments = updatedComments;
      renderComments(comments, isLoading, error, formData);
      
      try {
        await delay(1000);
        
        const finalComments = [...comments];
        finalComments[commentIndex] = {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLikeLoading: false
        };
        
        comments = finalComments;
        error = null;
      } catch (err) {
        console.error('Ошибка при обновлении лайка:', err);
        error = err;
        
        const restoredComments = [...comments];
        restoredComments[commentIndex] = {
          ...comment,
          isLikeLoading: false
        };
        comments = restoredComments;
      } finally {
        renderComments(comments, isLoading, error, formData);
      }
    },
    
    onRetry: loadComments,
    
    onReply: (author, text) => {
      const commentInput = document.querySelector('.add-form-text');
      formData.text = `> ${author}: ${text}\n\n${formData.text}`;
      restoreFormData();
      commentInput.focus();
    },
    
    onInputChange: () => {
      saveFormData();
    }
  });
});