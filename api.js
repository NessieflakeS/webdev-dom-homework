const PERSONAL_KEY = 'nikandrov-danil';
const BASE_URL = `https://wedev-api.sky.pro/api/v1/${PERSONAL_KEY}`;

export let token = null;
export let user = null;

export const setToken = (newToken) => {
  token = newToken;
  localStorage.setItem('token', newToken);
};

export const setUser = (newUser) => {
  user = newUser;
  localStorage.setItem('user', JSON.stringify(newUser));
};

export const getToken = () => {
  return token || localStorage.getItem('token');
};

export const getUser = () => {
  const userData = user || localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const removeAuthData = () => {
  token = null;
  user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getComments = async () => {
  try {
    const response = await fetch(`${BASE_URL}/comments`);
    
    if (!response.ok) {
      if (response.status === 500) {
        throw new Error('Сервер сломался, попробуй позже');
      } else {
        throw new Error('Ошибка сервера');
      }
    }

    const data = await response.json();
    
    return data.comments.map(comment => ({
      id: comment.id,
      name: comment.author.name,
      text: comment.text,
      likes: comment.likes || 0,
      isLiked: comment.isLiked || false,
      date: new Date(comment.date).getTime()
    }));
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Кажется, у вас сломался интернет, попробуйте позже');
    }
    throw error;
  }
};

export const postComment = async (text) => {
  const currentToken = getToken();
  
  try {
    const response = await fetch(`${BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({
        text,
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Комментарий должен быть не короче 3 символов');
      } else if (response.status === 500) {
        throw new Error('Сервер сломался, попробуй позже');
      } else if (response.status === 401) {
        throw new Error('Ошибка авторизации');
      } else {
        throw new Error('Ошибка сервера');
      }
    }

    return await getComments();
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Кажется, у вас сломался интернет, попробуйте позже');
    }
    throw error;
  }
};

export const login = async ({ login, password }) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    body: JSON.stringify({
      login,
      password,
    }),
  });

  if (response.status === 400) {
    throw new Error('Неверный логин или пароль');
  }

  const data = await response.json();
  setToken(data.user.token);
  setUser(data.user);
  return data;
};

export const register = async ({ login, password, name }) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    body: JSON.stringify({
      login,
      password,
      name,
    }),
  });

  if (response.status === 400) {
    throw new Error('Пользователь с таким логином уже существует');
  }

  const data = await response.json();
  setToken(data.user.token);
  setUser(data.user);
  return data;
};