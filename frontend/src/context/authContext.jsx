import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Use a simpler approach - store token in sessionStorage with a consistent key
// but add a timestamp to detect if it's from a different session
const getStoredToken = () => {
    const tokenData = sessionStorage.getItem('auth_token');
    if (tokenData) {
        try {
            const { token, timestamp } = JSON.parse(tokenData);
            // Check if token is less than 24 hours old
            const now = Date.now();
            const tokenAge = now - timestamp;
            if (tokenAge < 24 * 60 * 60 * 1000) { // 24 hours
                return token;
            } else {
                // Token is too old, remove it
                sessionStorage.removeItem('auth_token');
            }
        } catch (error) {
            // Invalid token data, remove it
            sessionStorage.removeItem('auth_token');
        }
    }
    return null;
};

const initialState = {
    user: null,
    token: getStoredToken(),
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
        case 'NO_TOKEN':
            return {
                ...state,
                user: null,
                token: null,
                loading: false,
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

    // Cleanup on tab close
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Only cleanup when tab is actually closed, not on refresh
            // Use a flag to detect if it's a refresh
            sessionStorage.setItem('tab_closing', 'true');
            setTimeout(() => {
                if (sessionStorage.getItem('tab_closing') === 'true') {
                    sessionStorage.removeItem('auth_token');
                    sessionStorage.removeItem('tab_closing');
                }
            }, 100);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Clear the closing flag on page load (indicates it's a refresh, not a close)
    useEffect(() => {
        sessionStorage.removeItem('tab_closing');
    }, []);

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
                    sessionStorage.removeItem('auth_token');
                    dispatch({
                        type: 'AUTH_ERROR',
                        payload: 'Session expired. Please login again.'
                    });
                }
            } else {
                dispatch({ type: 'NO_TOKEN' });
            }
        };

        loadUser();
    }, [state.token]);

    const login = async (email, password) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const response = await axios.post('/api/users/login', { email, password });
            const { data } = response.data;

            sessionStorage.setItem('auth_token', JSON.stringify({
                token: data.token,
                timestamp: Date.now()
            }));
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

            sessionStorage.setItem('auth_token', JSON.stringify({
                token: data.token,
                timestamp: Date.now()
            }));
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
        sessionStorage.removeItem('auth_token');
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
