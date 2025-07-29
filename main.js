import { renderComments } from './renderComments.js';
import { initHandlers } from './eventHandlers.js';
import { getComments, postComment, updateComment } from './api.js';

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
        
        const savedComment = await postComment({
          ...newComment,
          text: commentText,
          date: new Date().toISOString(),
          likes: 0,
          isLiked: false,
          replyTo: replyTo
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
        
        await updateComment(commentId, {
          isLiked: updatedComment.isLiked,
          likes: updatedComment.likes
        });
        
        comments = comments.map(c => c.id == commentId ? updatedComment : c);
        renderComments(comments);
      } catch (error) {
        console.error('Ошибка при лайке:', error);
      }
    },
    
    onReply: (author, text) => {
      const commentInput = document.querySelector('.add-form-text');
      commentInput.value = `> ${author}: ${text}\n\n`;
      commentInput.focus();
    }
  });
});