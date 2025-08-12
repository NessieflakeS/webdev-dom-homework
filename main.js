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

document.addEventListener('DOMContentLoaded', async () => {
  await loadComments();

  initHandlers({
    onAddComment: async (newComment) => {
      isLoading = true;
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
        
        const savedComment = await postComment({
          ...newComment,
          text: commentText,
          likes: 0,
          isLiked: false,
          replyTo
        });
        
        comments = [savedComment, ...comments.filter(c => c.id !== savedComment.id)];
        error = null;
      } catch (err) {
        console.error('Failed to post comment:', err);
        error = err;
      } finally {
        isLoading = false;
        renderComments(comments, isLoading, error);
      }
    },
    
    onToggleLike: async (commentId) => {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;
      
      isLoading = true;
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
        
        comments = comments.map(c => c.id === commentId ? updatedComment : c);
        error = null;
      } catch (err) {
        console.error('Failed to update comment:', err);
        error = err;
      } finally {
        isLoading = false;
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