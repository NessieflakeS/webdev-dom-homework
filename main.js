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

function setFormDisabled(disabled) {
  const addButton = document.querySelector('.add-form-button');
  const nameInput = document.querySelector('.add-form-name');
  const commentInput = document.querySelector('.add-form-text');
  
  if (addButton) addButton.disabled = disabled;
  if (nameInput) nameInput.disabled = disabled;
  if (commentInput) commentInput.disabled = disabled;
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
        await postComment({ /* данные */ });

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
        setFormDisabled(false); 
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

function delay(interval = 300) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), interval);
  });
}

onToggleLike: async (commentId) => {
  const comment = comments.find(c => c.id === commentId);
  if (!comment) return;
  
  comments = comments.map(c => c.id === commentId 
    ? { ...c, isLikeLoading: true } 
    : c
  );
  renderComments(comments, isLoading, error);
  
  try {
    await delay(2000);
    
    const updatedComment = {
      ...comment,
      isLiked: !comment.isLiked,
      likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
      isLikeLoading: false
    };
    
    comments = comments.map(c => c.id === commentId ? updatedComment : c);
  } catch (err) {
    console.error('Failed to update like:', err);
    comments = comments.map(c => c.id === commentId 
      ? { ...c, isLikeLoading: false } 
      : c
    );
  } finally {
    renderComments(comments, isLoading, error);
  }
}