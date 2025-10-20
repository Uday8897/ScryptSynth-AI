import axios from 'axios';
import useAuthStore from '../store/authStore';
const API_URL=import.meta.env.VITE_API_URL || "__VITE_API_URL__"
const api = axios.create({
  baseURL: API_URL, 
});
// ... (existing api setup)

// --- Social API Calls ---

// Follow a user
export const followUserApi = (userIdToFollow) => {
  return api.post(`/api/social/follow/${userIdToFollow}`);
};

// Unfollow a user
export const unfollowUserApi = (userIdToUnfollow) => {
  // Assuming backend uses POST for unfollow based on previous code
  // If backend uses DELETE, change to api.delete(...)
  return api.post(`/api/social/unfollow/${userIdToUnfollow}`);
};

// Get followers of a user
export const getFollowersApi = (userId) => {
  return api.get(`/api/social/${userId}/followers`);
};

// Get users someone is following
export const getFollowingApi = (userId) => {
  return api.get(`/api/social/${userId}/following`);
};

// Get the current user's feed
export const getFeedApi = () => {
  return api.get('/api/feed');
};


// Axios interceptor to automatically add the JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['X-User-ID']=JSON.parse(localStorage.getItem('user')).id;


    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;