import React from 'react';
import { useAuth } from '../context/authContext';

const LoadingOverlay = () => {
    const { loading } = useAuth();

    if (!loading) return null;

    return (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading...</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
