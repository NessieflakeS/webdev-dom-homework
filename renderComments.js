import { escapeHTML } from './escapeHTML.js';

function renderComments(comments) {
  const commentsList = document.querySelector('.comments');
  commentsList.innerHTML = '';

  comments.forEach((comment) => {
    const safeName = escapeHTML(comment.name);
    const safeText = escapeHTML(comment.text);

    const commentElement = document.createElement('li');
    commentElement.className = 'comment';
    commentElement.dataset.id = comment.id;

    let html = `
      <div class="comment-header">
        <div>${safeName}</div>
        <div>${comment.date}</div>
      </div>
    `;

    if (comment.replyTo) {
      const safeReplyAuthor = escapeHTML(comment.replyTo.author);
      const safeReplyText = escapeHTML(comment.replyTo.text);
      html += `
        <div class="reply-text">→ Ответ на ${safeReplyAuthor}: ${safeReplyText}</div>
      `;
    }

    html += `
      <div class="comment-body">${safeText}</div>
      <div class="comment-footer">
        <button class="comment-reply">Ответить</button>
        <div class="likes">
          <span class="likes-counter">${comment.likes || 0}</span>
          <button class="like-button ${comment.isLiked ? '-active-like' : ''}"></button>
        </div>
      </div>
    `;

    commentElement.innerHTML = html;
    commentsList.appendChild(commentElement);
  });
}

export { renderComments };
