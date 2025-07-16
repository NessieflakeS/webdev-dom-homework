import { renderComments } from './renderComments.js';
import { initHandlers } from './eventHandlers.js';

document.addEventListener('DOMContentLoaded', () => {
  renderComments();
  
  initHandlers();
});