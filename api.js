const API_URL = "http://localhost:3004/comments";

export const getComments = async () => {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return [
      { id: 1, name: "Admin", text: "Сервер недоступен. Используются демо-данные" }
    ];
  }
};

export const postComment = async (comment) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(comment)
    });

    if (!response.ok) {
      throw new Error(`Failed to post comment. Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to post comment:", error);
    throw error; 
  }
};