const API_URL = "http://localhost:3004/comments";

export const getComments = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Ошибка загрузки");
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export const postComment = async (comment) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...comment,
        date: new Date().toLocaleString(),
        likes: 0,
        isLiked: false,
        replyTo: null
      })
    });
    
    if (!response.ok) throw new Error("Ошибка отправки");
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const updateComment = async (id, updates) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) throw new Error("Ошибка обновления");
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};