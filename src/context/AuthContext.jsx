import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Configurar axios para incluir token en todas las peticiones
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            loadUser();
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/auth/user`);
            setUser(res.data);
        } catch (err) {
            console.error('Error loading user:', err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, {
                username,
                password
            });
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.msg || 'Error al iniciar sesión'
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
