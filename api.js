const API_URL = "https:// 6891c1a2447ff4f11fbd9fda.mockapi.io/comments/:endpoint";

export const getComments = async () => {
  try {
    const response = await fetch(`${API_URL}?sortBy=createdAt&order=desc`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Комментарии не найдены");
      }
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }
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
        createdAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("Некорректные данные комментария");
      }
      throw new Error(`Ошибка отправки: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const updateComment = async (id, updates) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Комментарий не найден");
      }
      throw new Error(`Ошибка обновления: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};