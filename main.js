import { renderComments } from './renderComments.js';
import { initHandlers } from './eventHandlers.js';
import { getComments, postComment, updateComment } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  let comments = [];
  const container = document.querySelector('.comments');
  
  renderComments([], true);
  
  try {
    comments = await getComments();
    renderComments(comments);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    renderComments([], false, `Ошибка загрузки комментариев: ${error.message}`);
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
        
        renderComments(comments, true);
        
        const savedComment = await postComment({
          ...newComment,
          text: commentText,
          likes: 0,
          isLiked: false,
          replyTo: replyTo
        });
        
        comments = [savedComment, ...comments];
        renderComments(comments);
      } catch (error) {
        console.error('Ошибка отправки:', error);
        renderComments(
          comments, 
          false, 
          `Ошибка отправки комментария: ${error.message}`
        );
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
        
        renderComments(comments, true);
        
        await updateComment(commentId, {
          isLiked: updatedComment.isLiked,
          likes: updatedComment.likes
        });
        
        comments = comments.map(c => c.id == commentId ? updatedComment : c);
        renderComments(comments);
      } catch (error) {
        console.error('Ошибка при лайке:', error);
        renderComments(
          comments, 
          false, 
          `Ошибка обновления комментария: ${error.message}`
        );
      }
    },
    
    onReply: (author, text) => {
      const commentInput = document.querySelector('.add-form-text');
      commentInput.value = `> ${author}: ${text}\n\n`;
      commentInput.focus();
    }
  });
});