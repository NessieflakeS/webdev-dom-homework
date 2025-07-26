// import { comments } from './comments.js';
import { escapeHTML } from './escapeHTML.js';

function renderComments() {
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
      <div class="comment-body">${safeText}</div>
      <div class="comment-footer">
        <div class="likes">
          <span class="likes-counter">${comment.likes}</span>
          <button class="like-button ${comment.isLiked ? '-active-like' : ''}"></button>
        </div>
      </div>
    `;

    if (comment.replyTo) {
      const safeReplyText = escapeHTML(comment.replyTo.text);
      const safeReplyName = escapeHTML(comment.replyTo.author);
      html = `
        <div class="comment-header">
          <div>${safeName}</div>
          <div>${comment.date}</div>
        </div>
        <div class="reply-text">→ Ответ на ${safeReplyName}: ${safeReplyText}</div>
        <div class="comment-body">${safeText}</div>
        ${html.split('<div class="comment-footer">')[1]}
      `;
    }

    commentElement.innerHTML = html;
    commentsList.appendChild(commentElement);
  });
}

export { renderComments };
