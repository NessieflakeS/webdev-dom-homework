import { login, register } from './api.js';

export function renderLoginComponent({ appEl, onSuccess }) {
  let isLoginMode = true;
  let errorMessage = '';
  let isLoading = false;

  const renderForm = () => {
    const appHtml = `
      <div class="container">
        <div class="add-form">
          <h1>${isLoginMode ? 'Вход' : 'Регистрация'}</h1>
          
          ${errorMessage ? `<div class="error">${errorMessage}</div>` : ''}
          
          ${isLoginMode ? '' : `
            <input
              type="text"
              class="add-form-name"
              placeholder="Введите имя"
              id="name-input"
              value=""
              ${isLoading ? 'disabled' : ''}
            />
          `}
          
          <input
            type="text"
            class="add-form-name"
            placeholder="Введите логин"
            id="login-input"
            value=""
            ${isLoading ? 'disabled' : ''}
          />
          
          <input
            type="password"
            class="add-form-name"
            placeholder="Введите пароль"
            id="password-input"
            value=""
            ${isLoading ? 'disabled' : ''}
          />
          
          <div class="add-form-row">
            <button class="add-form-button" id="login-button" ${isLoading ? 'disabled' : ''}>
              ${isLoading ? 'Загрузка...' : (isLoginMode ? 'Войти' : 'Зарегистрироваться')}
            </button>
          </div>
          
          <div class="add-form-row" style="justify-content: center; margin-top: 20px;">
            <a href="#" id="toggle-link" style="color: #bcec30;" ${isLoading ? 'style="pointer-events: none;"' : ''}>
              ${isLoginMode ? 'Зарегистрироваться' : 'Войти'}
            </a>
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;

    document.getElementById('login-button').addEventListener('click', () => {
      if (isLoading) return;
      
      if (isLoginMode) {
        const loginValue = document.getElementById('login-input').value;
        const password = document.getElementById('password-input').value;

        if (!loginValue || !password) {
          errorMessage = 'Введите логин и пароль';
          renderForm();
          return;
        }

        isLoading = true;
        renderForm();

        login({ login: loginValue, password })
          .then(() => {
            onSuccess();
          })
          .catch((error) => {
            errorMessage = error.message;
            isLoading = false;
            renderForm();
          });
      } else {
        const name = document.getElementById('name-input').value;
        const loginValue = document.getElementById('login-input').value;
        const password = document.getElementById('password-input').value;

        if (!name || !loginValue || !password) {
          errorMessage = 'Введите имя, логин и пароль';
          renderForm();
          return;
        }

        isLoading = true;
        renderForm();

        register({ name, login: loginValue, password })
          .then(() => {
            onSuccess();
          })
          .catch((error) => {
            errorMessage = error.message;
            isLoading = false;
            renderForm();
          });
      }
    });

    document.getElementById('toggle-link').addEventListener('click', (event) => {
      event.preventDefault();
      if (isLoading) return;
      
      isLoginMode = !isLoginMode;
      errorMessage = '';
      renderForm();
    });
  };

  renderForm();
}