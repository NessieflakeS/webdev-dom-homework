const PERSONAL_KEY = 'nikandrov-danil';

const BASE_URL = `https://wedev-api.sky.pro/api/v1/${PERSONAL_KEY}`;

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

export const postComment = async (comment, retryCount = 0) => {
  try {
    const body = JSON.stringify({
      text: comment.text,
      name: comment.name,
      forceError: true 
    });

    const response = await fetch(`${BASE_URL}/comments`, {
      method: 'POST',
      body: body
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Имя и комментарий должны быть не короче 3 символов');
      } else if (response.status === 500) {
        throw new Error('Сервер сломался, попробуй позже');
      } else {
        throw new Error('Ошибка сервера');
      }
    }

    return await getComments();
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Кажется, у вас сломался интернет, попробуйте позже');
    }
    
    if (error.message === 'Сервер сломался, попробуй позже' && retryCount < 2) {
      console.log(`Повторная попытка ${retryCount + 1}/2`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return postComment(comment, retryCount + 1);
    }
    
    throw error;
  }
};

export const updateComment = async (commentId, updates) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: commentId, ...updates };
};