const API_URL = "https://6891c1a2447ff4f11fbd9fda.mockapi.io/comments";

const handleApiError = (response) => {
  if (response.status === 404) throw new Error("Ресурс не найден");
  if (response.status === 500) throw new Error("Ошибка сервера");
  if (response.status === 400) throw new Error("Некорректный запрос");
  throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
};

export const getComments = async () => {
  try {
    const response = await fetch(`${API_URL}?sortBy=createdAt&order=desc`);
    if (!response.ok) handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
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
    
    if (!response.ok) handleApiError(response);
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
    
    if (!response.ok) handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};