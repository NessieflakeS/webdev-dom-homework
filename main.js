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
      
      setTimeout(() => {
        addForm.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }, 100);
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
      isLoading = true;
      const startTime = Date.now(); 
      setFormDisabled(true);
      renderComments(comments, isLoading, error);
      
      try {
        let replyTo = null;
        let commentText = newComment.text;
        
        if (commentText.startsWith('> ')) {
          const lines = commentText.split('\n');
          const replyMatch = lines[0].match(/^> (.+?): (.+)$/);
          
          if (replyMatch) {
            replyTo = {
              author: replyMatch[1],
              text: replyMatch[2]
            };
            commentText = lines.slice(1).join('\n').trim();
          }
        }
        
        const tempComment = {
          id: null, 
          name: newComment.name,
          text: commentText,
          date: Date.now(),
          likes: 0,
          isLiked: false,
          replyTo,
          isSending: true
        };
        
        comments = [tempComment, ...comments];
        renderComments(comments, isLoading, error);
        
        const savedComment = await postComment({
          name: newComment.name,
          text: commentText,
          date: tempComment.date,
          likes: 0,
          isLiked: false,
          replyTo
        });
        
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(2000 - elapsed, 0);
        await delay(remainingDelay);
        
        comments = [savedComment, ...comments.filter(c => c.id !== null)];
        error = null;
      } catch (err) {
        console.error('Failed to post comment:', err);
        error = err;
        comments = comments.filter(c => c.id !== null);
      } finally {
        isLoading = false;
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
        await delay(1000);
        
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
    
    onReply: (author, text) => {
      const commentInput = document.querySelector('.add-form-text');
      commentInput.value = `> ${author}: ${text}\n\n`;
      commentInput.focus();
    }
  });
});