
const firebaseConfig = {
  apiKey: "AIzaSyBVkXaQ3Gd2e9xWzIeHlWoqPDsw39v_Y08",
  authDomain: "commentsapp-d753f.firebaseapp.com",
  databaseURL: "https://commentsapp-d753f-default-rtdb.firebaseio.com",
  projectId: "commentsapp-d753f",
  storageBucket: "commentsapp-d753f.firebasestorage.app",
  messagingSenderId: "399259652856",
  appId: "1:399259652856:web:c17203606e1312b097610d"
};


firebase.initializeApp(firebaseConfig);
const database = firebase.database();

export const getComments = async () => {
  try {
    const snapshot = await database.ref('comments').once('value');
    const comments = snapshot.val() || {};
    
    // Конвертируем объект в массив
    return Object.keys(comments).map(key => ({
      id: key,
      ...comments[key]
    }));
  } catch (error) {
    console.error("Firebase Error:", error);
    return [];
  }
};

export const postComment = async (comment) => {
  try {
    const newCommentRef = database.ref('comments').push();
    await newCommentRef.set({
      ...comment,
      date: new Date().toLocaleString('ru-RU'),
      likes: 0,
      isLiked: false,
      replyTo: comment.replyTo || null
    });
    
    return {
      id: newCommentRef.key,
      ...comment
    };
  } catch (error) {
    console.error("Firebase Error:", error);
    throw error;
  }
};

export const updateComment = async (id, updates) => {
  try {
    await database.ref(`comments/${id}`).update(updates);
    return { id, ...updates };
  } catch (error) {
    console.error("Firebase Error:", error);
    throw error;
  }
};