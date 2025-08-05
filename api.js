const API_BASE_URL = "https://6891fd81447ff4f11fbeaced.mockapi.io/comments/comments";
const API_URL = `${API_BASE_URL}/comments`;

const makeRequest = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

export const getComments = async () => {
  return makeRequest('?sortBy=createdAt&order=desc');
};

export const postComment = async (comment) => {
  return makeRequest('', 'POST', {
    ...comment,
    createdAt: new Date().toISOString(),
    likes: comment.likes || 0,
    isLiked: comment.isLiked || false,
    replyTo: comment.replyTo || null
  });
};

export const updateComment = async (id, updates) => {
  return makeRequest(`/${id}`, 'PUT', updates);
};

export const deleteComment = async (id) => {
  return makeRequest(`/${id}`, 'DELETE');
};