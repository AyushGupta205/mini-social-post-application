import api from './api';

export const postService = {
  getPosts: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  createPost: async (formData) => {
    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  toggleLike: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  addComment: async (postId, text) => {
    const response = await api.post(`/posts/${postId}/comments`, { text });
    return response.data;
  }
};
