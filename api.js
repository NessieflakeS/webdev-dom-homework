const PERSONAL_KEY = 'nikandrov-danil'; 

const BASE_URL = `https://wedev-api.sky.pro/api/v1/${PERSONAL_KEY}/comments`;

export const getComments = async () => {
  try {
    const response = await fetch(BASE_URL);
    
    if (!response.ok) {
      throw new Error('Ошибка сервера');
    }

    const data = await response.json();
    
    return data.comments.map(comment => ({
      id: comment.id,
      name: comment.author.name,
      text: comment.text,
      likes: comment.likes,
      isLiked: comment.isLiked,
      date: new Date(comment.date).getTime()
    }));
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const postComment = async (comment) => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: comment.text,
        name: comment.name
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка сервера');
    }

    const updatedComments = await getComments();
    return updatedComments;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};