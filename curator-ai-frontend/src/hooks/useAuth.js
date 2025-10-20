import useAuthStore from "../store/authStore";

// A simple custom hook to easily access auth state
export const useAuth = () => {
    const { token, user, isAuth, login, logout } = useAuthStore();
    return { token, user, isAuth, login, logout };
};