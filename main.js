import { renderComments } from './renderComments.js';
import { initHandlers } from './eventHandlers.js';
import { getComments, postComment } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  let comments = [];
  
  try {
    comments = await getComments();
    renderComments(comments);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    const container = document.querySelector('.comments');
    container.innerHTML = `<div class="error">Ошибка загрузки комментариев: ${error.message}</div>`;
  }

  initHandlers({
    onAddComment: async (newComment) => {
      try {
        const savedComment = await postComment({
          ...newComment,
          date: new Date().toISOString(),
          likes: 0,
          isLiked: false,
          replyTo: null
        });
        comments = [savedComment, ...comments];
        renderComments(comments);
      } catch (error) {
        alert(`Ошибка отправки: ${error.message}`);
      }
    },
    
    onToggleLike: async (commentId) => {
      try {
        const comment = comments.find(c => c.id == commentId);
        if (!comment) return;
        
        const updatedComment = {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
        
        comments = comments.map(c => c.id == commentId ? updatedComment : c);
        renderComments(comments);
      } catch (error) {
        console.error('Ошибка при лайке:', error);
      }
    },
    
     onReply: (commentId) => {
      const comment = comments.find(c => c.id == commentId);
      if (!comment) return;
      
      const commentInput = document.querySelector('.add-form-text');
      
      commentInput.value = `> ${comment.text}\n\n`;
      commentInput.focus();
    }
  });
});