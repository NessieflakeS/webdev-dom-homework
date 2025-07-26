const API_URL = "http://localhost:5500/comments";

export const getComments = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const postComment = async (comment) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(comment)
  });
  return response.json();
};