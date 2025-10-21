import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
        case 'REGISTER_START':
            return {
                ...state,
                loading: true,
                error: null
            };
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
                error: null
            };
        case 'LOGIN_FAILURE':
        case 'REGISTER_FAILURE':
        case 'AUTH_ERROR':
            return {
                ...state,
                user: null,
                token: null,
                loading: false,
                error: action.payload
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                loading: false,
                error: null
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Set up axios defaults
    useEffect(() => {
        if (state.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [state.token]);

    // Load user on app start
    useEffect(() => {
        const loadUser = async () => {
            if (state.token) {
                try {
                    const response = await axios.get('/api/users/profile');
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            user: response.data.data,
                            token: state.token
                        }
                    });
                } catch (error) {
                    localStorage.removeItem('token');
                    dispatch({
                        type: 'AUTH_ERROR',
                        payload: 'Session expired. Please login again.'
                    });
                }
            } else {
                dispatch({ type: 'AUTH_ERROR', payload: null });
            }
        };

        loadUser();
    }, [state.token]);

    const login = async (email, password) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const response = await axios.post('/api/users/login', { email, password });
            const { data } = response.data;

            localStorage.setItem('token', data.token);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: {
                        _id: data._id,
                        name: data.name,
                        email: data.email,
                        role: data.role
                    },
                    token: data.token
                }
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            dispatch({ type: 'LOGIN_FAILURE', payload: message });
            return { success: false, message };
        }
    };

    const register = async (name, email, password) => {
        dispatch({ type: 'REGISTER_START' });
        try {
            const response = await axios.post('/api/users/register', { name, email, password });
            const { data } = response.data;

            localStorage.setItem('token', data.token);
            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: {
                    user: {
                        _id: data._id,
                        name: data.name,
                        email: data.email,
                        role: data.role
                    },
                    token: data.token
                }
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            dispatch({ type: 'REGISTER_FAILURE', payload: message });
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        user: state.user,
        token: state.token,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        clearError,
        isAuthenticated: !!state.user,
        isAdmin: state.user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
