import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const CarForm = ({ car, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        price: '',
        color: '',
        mileage: '',
        description: ''
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (car) {
            setFormData({
                brand: car.brand || '',
                model: car.model || '',
                year: car.year || new Date().getFullYear(),
                price: car.price || '',
                color: car.color || '',
                mileage: car.mileage || '',
                description: car.description || ''
            });
            if (car.image) {
                setImagePreview(car.image);
            }
        }
    }, [car]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
                year: parseInt(formData.year)
            };

            await onSubmit(submitData, image);
            toast.success(car ? 'Car updated successfully!' : 'Car added successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {car ? 'Edit Car' : 'Add New Car'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                            Brand *
                        </label>
                        <input
                            type="text"
                            id="brand"
                            name="brand"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.brand}
                            onChange={handleChange}
                            placeholder="e.g., Toyota, Honda, BMW"
                        />
                    </div>

                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                            Model *
                        </label>
                        <input
                            type="text"
                            id="model"
                            name="model"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.model}
                            onChange={handleChange}
                            placeholder="e.g., Camry, Civic, X5"
                        />
                    </div>

                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                            Year *
                        </label>
                        <input
                            type="number"
                            id="year"
                            name="year"
                            required
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.year}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                            Price *
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                        </label>
                        <input
                            type="text"
                            id="color"
                            name="color"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.color}
                            onChange={handleChange}
                            placeholder="e.g., Red, Blue, Silver"
                        />
                    </div>

                    <div>
                        <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
                            Mileage
                        </label>
                        <input
                            type="number"
                            id="mileage"
                            name="mileage"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.mileage}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Image Upload Section */}
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                        Car Image
                    </label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {imagePreview && (
                        <div className="mt-4">
                            <img
                                src={getImageUrl(imagePreview)}
                                alt="Car preview"
                                className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                onError={handleImageError}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        maxLength="500"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Additional details about the car..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        {formData.description.length}/500 characters
                    </p>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        {loading ? 'Saving...' : (car ? 'Update Car' : 'Add Car')}
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CarForm;
