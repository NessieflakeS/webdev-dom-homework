import { renderComments } from './renderComments.js';
import { initHandlers } from './eventHandlers.js';
import { getComments, postComment, updateComment } from './api.js';

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

const loadComments = async () => {
  isLoading = true;
  renderComments(comments, isLoading, error);
  
  try {
    comments = await getComments();
    error = null;
  } catch (err) {
    console.error('Failed to load comments:', err);
    error = err;
    comments = [];
  } finally {
    isLoading = false;
    renderComments(comments, isLoading, error);
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

document.addEventListener('DOMContentLoaded', async () => {
  await loadComments();

  initHandlers({
    onAddComment: async (newComment) => {
      setFormDisabled(true);
      
      try {
        comments = await postComment(newComment);
        error = null;
        
        const nameInput = document.querySelector('.add-form-name');
        const commentInput = document.querySelector('.add-form-text');
        nameInput.value = '';
        commentInput.value = '';
        
      } catch (err) {
        console.error('Failed to post comment:', err);
        error = err;
      } finally {
        setFormDisabled(false);
        renderComments(comments, isLoading, error);
      }
    },
    
    onToggleLike: async (commentId) => {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;
      
      const tempComment = {
        ...comment,
        isLikeLoading: true
      };
      
      comments = comments.map(c => c.id === commentId ? tempComment : c);
      renderComments(comments, isLoading, error);
      
      try {
        const updatedComment = {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
        
        await updateComment(commentId, {
          isLiked: updatedComment.isLiked,
          likes: updatedComment.likes
        });
        
        comments = comments.map(c => c.id === commentId 
          ? { ...updatedComment, isLikeLoading: false } 
          : c
        );
        error = null;
      } catch (err) {
        console.error('Ошибка при обновлении лайка:', err);
        error = err;
        comments = comments.map(c => c.id === commentId 
          ? { ...comment, isLikeLoading: false } 
          : c
        );
      } finally {
        renderComments(comments, isLoading, error);
      }
    },
    
    onRetry: loadComments,
    
    onReply: (author, text) => {
      const commentInput = document.querySelector('.add-form-text');
      commentInput.value = `> ${author}: ${text}\n\n`;
      commentInput.focus();
    }
  });
});