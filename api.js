const PERSONAL_KEY = 'nikandrov-danil';
const BASE_URL = `https://wedev-api.sky.pro/api/v2/${PERSONAL_KEY}`;
const AUTH_URL = `https://wedev-api.sky.pro/api/user`;

export let token = null;
export let user = null;

export const setToken = (newToken) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem('token', newToken);
  } else {
    localStorage.removeItem('token');
  }
};

export const setUser = (newUser) => {
  user = newUser;
  if (newUser) {
    localStorage.setItem('user', JSON.stringify(newUser));
  } else {
    localStorage.removeItem('user');
  }
};

export const getToken = () => {
  return token || localStorage.getItem('token');
};

export const getUser = () => {
  const userData = user || localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const removeAuthData = () => {
  setToken(null);
  setUser(null);
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
  
  if (!currentToken) {
    throw new Error('Ошибка авторизации');
  }
  
  try {
    const response = await fetch(`${BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
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
  try {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({
        login,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400) {
        throw new Error(errorData.error || 'Неверный логин или пароль');
      } else {
        throw new Error(errorData.error || 'Ошибка сервера');
      }
    }

    const data = await response.json();
    setToken(data.user.token);
    setUser(data.user);
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Кажется, у вас сломался интернет, попробуйте позже');
    }
    throw error;
  }
};

export const register = async ({ name, login, password }) => {
  try {
    const response = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        login,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400) {
        throw new Error(errorData.error || 'Пользователь с таким логином уже существует');
      } else {
        throw new Error(errorData.error || 'Ошибка сервера');
      }
    }

    const data = await response.json();
    setToken(data.user.token);
    setUser(data.user);
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Кажется, у вас сломался интернет, попробуйте позже');
    }
    throw error;
  }
};