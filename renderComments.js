import { escapeHTML } from './escapeHTML.js';

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

function renderComments(comments, isLoading = false, error = null) {
  const commentsList = document.querySelector('.comments');
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

    let replySection = '';
    if (comment.replyTo) {
      const safeReplyAuthor = escapeHTML(comment.replyTo.author || '');
      const safeReplyText = escapeHTML(comment.replyTo.text || '');
      replySection = `
        <div class="reply-text">
          → Ответ на ${safeReplyAuthor}: ${safeReplyText}
        </div>
      `;
    }

    commentElement.innerHTML = `
      <div class="comment-header">
        <div class="comment-author">${safeName}</div>
        <div class="comment-date">${date}</div>
      </div>
      ${replySection}
      <div class="comment-body">${safeText}</div>
      <div class="comment-footer">
        <button class="comment-reply">Ответить</button>
        <div class="likes">
          <span class="likes-counter">${comment.likes || 0}</span>
          <button class="like-button 
            ${comment.isLiked ? '-active-like' : ''}
            ${comment.isLikeLoading ? '-loading-like' : ''}">
            ♥
          </button>
        </div>
      </div>
      ${comment.isSending ? '<div class="sending-indicator">Отправка...</div>' : ''}
    `;

    commentsList.appendChild(commentElement);
  });
}

export { renderComments };