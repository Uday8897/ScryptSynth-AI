import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Auth API Calls ---
export const loginApi = (credentials) => {
  return api.post('/api/auth/login', credentials);
};

export const registerApi = (userData) => {
  return api.post('/api/auth/register', userData);
};

export const logoutApi = () => {
  return api.post('/api/auth/logout');
};

export const refreshTokenApi = () => {
  return api.post('/api/auth/refresh');
};

export const getCurrentUserApi = () => {
  return api.get('/api/auth/me');
};

// --- Movie/Content API Calls ---
export const searchMoviesApi = (query, limit = 10) => {
  return api.get('/api/content/search', {
    params: { query, limit }
  });
};

export const getMovieByIdApi = (movieId) => {
  return api.get(`/api/content/movies/${movieId}`);
};

export const getCompleteMovieApi = (movieId) => {
  return api.get(`/api/content/movies/${movieId}/complete`);
};

export const getLatestMoviesApi = (limit = 12) => {
  return api.get('/api/content/latest', {
    params: { limit }
  });
};

export const getNowPlayingMoviesApi = (region = 'IN', limit = 12) => {
  return api.get('/api/content/now-playing', {
    params: { region, limit }
  });
};

export const getMoviesPaginatedApi = (page = 1, limit = 20, sortBy = 'vote_average', sortOrder = 'desc') => {
  return api.get('/api/content/movies', {
    params: { page, limit, sort_by: sortBy, sort_order: sortOrder }
  });
};

// --- AI Recommendation API Calls ---
export const getPersonalRecommendationApi = (user_id, query) => {
  return api.post('/api/ai/recommend/personal', {
    user_id,
    query
  });
};

export const routeAgentApi = (user_id, query) => {
  return api.post('/api/ai/agent/route', {
    user_id,
    query
  });
};

export const generateIdeasApi = (user_id, query) => {
  return api.post('/api/ai/agent/idea-generation', {
    user_id,
    query
  });
};

export const generateShortsScriptApi = (user_id, query) => {
  return api.post('/api/ai/agent/shorts-script', {
    user_id,
    query
  });
};

export const optimizeCaptionsApi = (user_id, query) => {
  return api.post('/api/ai/agent/caption-optimizer', {
    user_id,
    query
  });
};

// --- History/Reviews API Calls ---
export const addReviewApi = (reviewData) => {
  return api.post('/api/history', reviewData);
};

export const getUserReviewsApi = (userId) => {
  return api.get(`/api/history/user/${userId}`);
};

export const getMovieReviewsApi = (movieId) => {
  return api.get(`/api/history/movie/${movieId}`);
};

export const updateReviewApi = (reviewId, reviewData) => {
  return api.put(`/api/history/${reviewId}`, reviewData);
};

export const deleteReviewApi = (reviewId) => {
  return api.delete(`/api/history/${reviewId}`);
};

// --- Watchlist API Calls ---
export const addToWatchlistApi = (contentId) => {
  return api.post(`/api/history/watchlist/${contentId}`);
};

export const removeFromWatchlistApi = (contentId) => {
  return api.delete(`/api/history/watchlist/${contentId}`);
};

export const getMyWatchlistApi = () => {
  return api.get('/api/history/watchlist/my');
};

export const getUserWatchlistApi = (userId) => {
  return api.get(`/api/history/watchlist/user/${userId}`);
};

export const checkWatchlistStatusApi = (contentId) => {
  return api.get(`/api/history/watchlist/check/${contentId}`);
};


// --- User Profile API Calls ---
export const getUserProfileApi = (userId) => {
  return api.get(`/api/users/${userId}`);
};

export const updateUserProfileApi = (userId, profileData) => {
  return api.put(`/api/users/${userId}`, profileData);
};

export const uploadProfilePictureApi = (userId, formData) => {
  return api.post(`/api/users/${userId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};


// --- Health Check API Calls ---
export const healthCheckApi = () => {
  return api.get('/api/health');
};

export const aiHealthCheckApi = () => {
  return api.get('/api/ai/health');
};

// --- Debug/Utility API Calls ---
export const getAvailableRoutesApi = () => {
  return api.get('/api/debug/routes');
};

// Axios interceptor to automatically add the JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (user && user.id) {
      config.headers['X-User-ID'] = user.id;
    }
    
    // Log request for debugging
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;