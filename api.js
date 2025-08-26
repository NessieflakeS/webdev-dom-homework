const PERSONAL_KEY = 'nikandrov-danil'; 

const BASE_URL = `https://wedev-api.sky.pro/api/v1/${PERSONAL_KEY}`;

export const getComments = async () => {
  try {
    const response = await fetch(`${BASE_URL}/comments`);
    
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
    console.error("API Error:", error);
    throw error;
  }
};

export const postComment = async (comment) => {
  try {
    const formData = new FormData();
    formData.append('text', comment.text);
    formData.append('name', comment.name);

    const response = await fetch(`${BASE_URL}/comments`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Ошибка сервера');
    }

    return await getComments();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const updateComment = async (commentId, updates) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: commentId, ...updates };
};