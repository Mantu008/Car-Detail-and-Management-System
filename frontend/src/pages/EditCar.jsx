import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
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
            const response = await axios.get(`/api/cars/${id}`);
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

        await axios.put(`/api/cars/${id}`, formData, {
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
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Car not found</h2>
                    <button
                        onClick={() => navigate('/my-cars')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Back to My Cars
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
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
