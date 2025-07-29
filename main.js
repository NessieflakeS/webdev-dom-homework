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
    
    onReply: (author, text) => {
    const commentInput = document.querySelector('.add-form-text');
    commentInput.value = `> ${author}: ${text}\n\n`;
    commentInput.focus();
  },
  
  onAddComment: async (newComment) => {
    try {
      // Проверяем, является ли комментарий ответом
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
  }
  });
});