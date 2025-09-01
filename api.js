const PERSONAL_KEY = 'nikandrov-danil';

const BASE_URL = `https://wedev-api.sky.pro/api/v2/${PERSONAL_KEY}/comments`;

export const getComments = async () => {
  try {
    const response = await fetch(BASE_URL);
    
    if (response.status === 500) {
      throw new Error('Сервер сломался, попробуй позже');
    }
    
    if (!response.ok) {
      throw new Error('Ошибка сервера');
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

export const postComment = async ({ name, text, forceError = false }, retries = 3) => {
  try {
    const body = JSON.stringify({
      text,
      name,
      forceError
    });

    const response = await fetch(BASE_URL, {
      method: 'POST',
      body: body
    });

    if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }

    if (response.status === 500) {
      if (retries > 0) {
        return postComment({ name, text, forceError }, retries - 1);
      }
      throw new Error('Сервер сломался, попробуй позже');
    }

    if (!response.ok) {
      throw new Error('Ошибка сервера');
    }

    return await getComments();
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Кажется, у вас сломался интернет, попробуйте позже');
    }
    throw error;
  }
};

export const updateComment = async (commentId, updates) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: commentId, ...updates };
};