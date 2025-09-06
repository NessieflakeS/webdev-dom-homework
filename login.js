import { login, register } from './api.js';

export function renderLoginComponent({ appEl, onSuccess }) {
  let isLoginMode = true;
  let errorMessage = '';

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
            />
          `}
          
          <input
            type="text"
            class="add-form-name"
            placeholder="Введите логин"
            id="login-input"
            value=""
          />
          
          <input
            type="password"
            class="add-form-name"
            placeholder="Введите пароль"
            id="password-input"
            value=""
          />
          
          <div class="add-form-row">
            <button class="add-form-button" id="login-button">
              ${isLoginMode ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </div>
          
          <div class="add-form-row" style="justify-content: center; margin-top: 20px;">
            <a href="#" id="toggle-link" style="color: #bcec30;">
              ${isLoginMode ? 'Зарегистрироваться' : 'Войти'}
            </a>
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;

    document.getElementById('login-button').addEventListener('click', () => {
      if (isLoginMode) {
        const loginValue = document.getElementById('login-input').value;
        const password = document.getElementById('password-input').value;

        if (!loginValue || !password) {
          errorMessage = 'Введите логин и пароль';
          renderForm();
          return;
        }

        login({ login: loginValue, password })
          .then(() => {
            onSuccess();
          })
          .catch((error) => {
            errorMessage = error.message;
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

        register({ name, login: loginValue, password })
          .then(() => {
            onSuccess();
          })
          .catch((error) => {
            errorMessage = error.message;
            renderForm();
          });
      }
    });

    document.getElementById('toggle-link').addEventListener('click', (event) => {
      event.preventDefault();
      isLoginMode = !isLoginMode;
      errorMessage = '';
      renderForm();
    });
  };

  renderForm();
}