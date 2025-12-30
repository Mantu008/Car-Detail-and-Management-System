import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import CarForm from '../components/CarForm';

const AddCar = () => {
    const navigate = useNavigate();

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

        await api.post('/api/cars', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        navigate('/my-cars');
    };

    const handleCancel = () => {
        navigate('/my-cars');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <CarForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
};

export default AddCar;
