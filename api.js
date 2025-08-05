const API_URL = "https://6891c1a2447ff4f11fbd9fda.mockapi.io/coments";

const handleApiError = (response) => {
  if (response.status === 404) throw new Error("Ресурс не найден");
  if (response.status === 500) throw new Error("Ошибка сервера");
  if (response.status === 400) throw new Error("Некорректный запрос");
  throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
};

export const getComments = async () => {
  try {
    const response = await fetch(`${API_URL}?sortBy=createdAt&order=desc`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Details:', errorData);
      
      if (response.status === 404) {
        throw new Error("Ресурс не найден. Проверьте URL и существование ресурса в MockAPI.");
      }
      
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Data Received:', data);
    return data;
  } catch (error) {
    console.error("API Request Failed:", error);
    throw new Error(`Не удалось загрузить комментарии: ${error.message}`);
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