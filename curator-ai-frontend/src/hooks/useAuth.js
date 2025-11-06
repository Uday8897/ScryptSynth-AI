import useAuthStore from "../store/authStore";
export const useAuth = () => {
    const { token, user, isAuth, login, logout } = useAuthStore();
    return { token, user, isAuth, login, logout };
};