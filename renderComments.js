import { escapeHTML } from './escapeHTML.js';
import { getToken } from './api.js';

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function renderComments(comments, isLoading = false, error = null, formData = { text: '' }, commentsList) {
  const token = getToken();
  
  if (!commentsList) {
    commentsList = document.querySelector('.comments');
    if (!commentsList) return;
  }
  
  commentsList.innerHTML = '';

  if (isLoading) {
    commentsList.innerHTML = '<div class="loading">Загрузка...</div>';
    return;
  }

  if (error) {
    commentsList.innerHTML = `
      <div class="error">
        Ошибка: ${error.message}
        <button class="retry-btn">Повторить</button>
      </div>
    `;
    return;
  }

  if (!comments || comments.length === 0) {
    commentsList.innerHTML = '<div class="empty">Комментариев пока нет</div>';
    return;
  }

  comments.forEach(comment => {
    const commentElement = document.createElement('li');
    commentElement.className = 'comment';
    commentElement.dataset.id = comment.id;

    const safeName = escapeHTML(comment.name);
    const safeText = escapeHTML(comment.text);
    const date = formatDate(comment.date);

    let likeButtonClass = 'like-button';
    if (comment.isLiked) likeButtonClass += ' -active-like';
    if (comment.isLikeLoading) likeButtonClass += ' -loading-like';

    commentElement.innerHTML = `
      <div class="comment-header">
        <div class="comment-author">${safeName}</div>
        <div class="comment-date">${date}</div>
      </div>
      <div class="comment-body">${safeText}</div>
      <div class="comment-footer">
        ${token ? `
          <button class="comment-reply">Ответить</button>
          <div class="likes">
            <span class="likes-counter">${comment.likes || 0}</span>
            <button class="${likeButtonClass}">
              ♥
            </button>
          </div>
        ` : `
          <div class="likes">
            <span class="likes-counter">${comment.likes || 0}</span>
            <span class="like-icon">♥</span>
          </div>
        `}
      </div>
      ${comment.isSending ? '<div class="sending-indicator">Отправка...</div>' : ''}
    `;

    commentsList.appendChild(commentElement);
  });
}