import { create } from 'zustand';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  // Ensure user is parsed correctly, check if 'user' key exists before parsing
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  isAuth: !!localStorage.getItem('token'),

  login: (token, user) => { // 'user' is now expected to be an object like { id: 1, displayName: "Uday" }
    localStorage.setItem('token', token);
    // Stringify the entire user object before saving
    localStorage.setItem('user', JSON.stringify(user)); 
    set({ token, user, isAuth: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuth: false });
  },
}));

export default useAuthStore;