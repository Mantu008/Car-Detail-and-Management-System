import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/api';
import CarForm from '../components/CarForm';

const EditCar = () => {
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCar();
    }, [id]);

    const fetchCar = async () => {
        try {
            const response = await api.get(`/api/cars/${id}`);
            setCar(response.data.data);
        } catch (error) {
            console.error('Error fetching car:', error);
            navigate('/my-cars');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (carData, image) => {
        const formData = new FormData();

        // Append all car data to FormData
        Object.keys(carData).forEach(key => {
            formData.append(key, carData[key]);
        });

        // Append image if provided
        if (image) {
            formData.append('image', image);
        }

        await api.put(`/api/cars/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        navigate('/my-cars');
    };

    const handleCancel = () => {
        navigate('/my-cars');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Vehicle not found</h2>
                    <button
                        onClick={() => navigate('/my-cars')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 touch-target"
                    >
                        Back to My Vehicles
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <CarForm
                    car={car}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
};

export default EditCar;
