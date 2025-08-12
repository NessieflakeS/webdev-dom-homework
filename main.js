import { renderComments } from './renderComments.js';
import { initHandlers } from './eventHandlers.js';
import { getComments, postComment, updateComment } from './api.js';

let comments = [];
let isLoading = false;
let error = null;

const loadComments = async () => {
  isLoading = true;
  renderComments(comments, isLoading, error);
  
  try {
    comments = await getComments();
    comments = comments.map(comment => {
      if (typeof comment.date === 'string') {
        return {
          ...comment,
          date: new Date(comment.date).getTime()
        };
      }
      return comment;
    });
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
  
  if (addButton) {
    addButton.disabled = disabled;
    addButton.textContent = disabled ? 'Отправка...' : 'Написать';
  }
  
  if (nameInput) nameInput.disabled = disabled;
  if (commentInput) commentInput.disabled = disabled;
}

function delay(interval = 300) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), interval);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadComments();

  initHandlers({
    onAddComment: async (newComment) => {
      isLoading = true;
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
          ...newComment,
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
          ...newComment,
          text: commentText,
          date: tempComment.date,
          likes: 0,
          isLiked: false,
          replyTo
        });
        
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
        console.error('Failed to update like:', err);
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