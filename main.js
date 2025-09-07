import { renderComments } from './renderComments.js';
import { initHandlers } from './eventHandlers.js';
import { getComments, postComment, getToken, getUser, removeAuthData } from './api.js';
import { renderLoginComponent } from './login.js';

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
let formData = { text: '' };

const loadComments = async () => {
  isLoading = true;
  renderApp();
  
  try {
    comments = await getComments();
    error = null;
  } catch (err) {
    console.error('Failed to load comments:', err);
    error = err;
    
    if (err.message === 'Сервер сломался, попробуй позже') {
      alert('Сервер сломался, попробуй позже');
    } else if (err.message === 'Кажется, у вас сломался интернет, попробуйте позже') {
      alert('Кажется, у вас сломался интернет, попробуйте позже');
    }
  } finally {
    isLoading = false;
    renderApp();
  }
};

function setFormDisabled(disabled) {
  const addButton = document.querySelector('.add-form-button');
  const commentInput = document.querySelector('.add-form-text');
  const addForm = document.querySelector('.add-form');
  
  if (addButton) {
    addButton.disabled = disabled;
    addButton.textContent = disabled ? 'Отправка...' : 'Написать';
  }
  
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
  const commentInput = document.querySelector('.add-form-text');
  if (commentInput) formData.text = commentInput.value;
}

function restoreFormData() {
  const commentInput = document.querySelector('.add-form-text');
  if (commentInput) commentInput.value = formData.text;
}

function renderApp() {
  const appEl = document.getElementById('app');
  const token = getToken();
  const user = getUser();
  
  if (!token) {
    renderLoginComponent({
      appEl,
      onSuccess: () => {
        loadComments();
        renderApp();
      }
    });
    return;
  }

  const appHtml = `
    <div class="container">
      <ul class="comments"></ul>
      
      <div class="add-form">
        <div class="add-form-overlay">
          <div class="add-form-loading">Комментарий добавляется...</div>
        </div>
        <input
          type="text"
          class="add-form-name"
          value="${user.name}"
          readonly
        />
        <textarea
          type="textarea"
          class="add-form-text"
          placeholder="Введите ваш комментарий"
          rows="4"
        ></textarea>
        <div class="add-form-row">
          <button class="add-form-button">Написать</button>
          <button class="logout-button">Выйти</button>
        </div>
      </div>
    </div>
  `;

  appEl.innerHTML = appHtml;

  const commentsList = document.querySelector('.comments');
  renderComments(comments, isLoading, error, formData, commentsList);

  const logoutButton = document.querySelector('.logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      removeAuthData();
      renderApp();
    });
  }

  initHandlers({
    onAddComment: async (newComment) => {
      const startTime = Date.now();
      setFormDisabled(true);
      saveFormData();
      
      try {
        const user = getUser();
        const tempComment = {
          id: 'temp-' + Date.now(),
          name: user.name,
          text: newComment.text,
          date: Date.now(),
          likes: 0,
          isLiked: false,
          isSending: true
        };
        
        comments = [...comments, tempComment];
        renderApp();
        
        const updatedComments = await postComment(newComment.text);
        
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(2000 - elapsed, 0);
        await delay(remainingDelay);
        
        comments = updatedComments;
        error = null;
        formData = { text: '' };
        
      } catch (err) {
        console.error('Failed to post comment:', err);
        error = err;
        
        if (err.message.includes('не короче 3 символов')) {
          alert('Комментарий должен быть не короче 3 символов');
        } else if (err.message === 'Сервер сломался, попробуй позже') {
          alert('Сервер сломался, попробуй позже');
        } else if (err.message === 'Кажется, у вас сломался интернет, попробуйте позже') {
          alert('Кажется, у вас сломался интернет, попробуйте позже');
        } else if (err.message === 'Ошибка авторизации') {
          alert('Ошибка авторизации');
          removeAuthData();
          renderApp();
        }
        
        comments = comments.filter(c => !c.isSending);
      } finally {
        setFormDisabled(false);
        restoreFormData();
        renderApp();
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
      renderApp();
      
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
        renderApp();
      }
    },
    
    onRetry: loadComments,
    
    onReply: (author, text) => {
      const commentInput = document.querySelector('.add-form-text');
      formData.text = `> ${author}: ${text}\n\n${formData.text}`;
      restoreFormData();
      if (commentInput) commentInput.focus();
    },
    
    onInputChange: () => {
      saveFormData();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const appEl = document.createElement('div');
  appEl.id = 'app';
  document.body.appendChild(appEl);
  
  renderApp();
  loadComments();
});
