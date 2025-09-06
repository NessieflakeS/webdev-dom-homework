import { login, register } from './api.js';

export function renderLoginComponent({ appEl, onSuccess }) {
  let isLoginMode = true;

  const renderForm = () => {
    const appHtml = `
      <div class="container">
        <div class="add-form">
          <h1>${isLoginMode ? 'Вход' : 'Регистрация'}</h1>
          ${isLoginMode ? '' : `
            <input
              type="text"
              class="add-form-name"
              placeholder="Введите имя"
              id="name-input"
            />
          `}
          <input
            type="text"
            class="add-form-login"
            placeholder="Введите логин"
            id="login-input"
          />
          <input
            type="password"
            class="add-form-password"
            placeholder="Введите пароль"
            id="password-input"
          />
          <div class="add-form-row">
            <button class="add-form-button" id="login-button">${isLoginMode ? 'Войти' : 'Зарегистрироваться'}</button>
          </div>
          <div class="add-form-row">
            <a href="#" id="toggle-link">${isLoginMode ? 'Зарегистрироваться' : 'Войти'}</a>
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;

    document.getElementById('login-button').addEventListener('click', () => {
      if (isLoginMode) {
        const login = document.getElementById('login-input').value;
        const password = document.getElementById('password-input').value;

        if (!login || !password) {
          alert('Введите логин и пароль');
          return;
        }

        login({ login, password })
          .then(() => {
            onSuccess();
          })
          .catch((error) => {
            alert(error.message);
          });
      } else {
        const name = document.getElementById('name-input').value;
        const login = document.getElementById('login-input').value;
        const password = document.getElementById('password-input').value;

        if (!name || !login || !password) {
          alert('Введите имя, логин и пароль');
          return;
        }

        register({ name, login, password })
          .then(() => {
            onSuccess();
          })
          .catch((error) => {
            alert(error.message);
          });
      }
    });

    document.getElementById('toggle-link').addEventListener('click', (event) => {
      event.preventDefault();
      isLoginMode = !isLoginMode;
      renderForm();
    });
  };

  renderForm();
}



