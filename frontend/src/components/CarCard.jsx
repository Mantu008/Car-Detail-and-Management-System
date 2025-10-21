import React from 'react';
import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            {/* Car Image */}
            {car.image && (
                <div className="mb-4">
                    <img
                        src={car.image}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                    {car.brand} {car.model}
                </h3>
                <span className="text-sm text-gray-500">{car.year}</span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                    <span className="text-gray-600">Brand:</span>
                    <span className="font-medium">{car.brand}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium">{car.model}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">{car.year}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-green-600">${car.price?.toLocaleString()}</span>
                </div>
                {car.color && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Color:</span>
                        <span className="font-medium capitalize">{car.color}</span>
                    </div>
                )}
                {car.mileage && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Mileage:</span>
                        <span className="font-medium">{car.mileage.toLocaleString()} miles</span>
                    </div>
                )}
            </div>

            {car.owner && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Owner: {car.owner.name}</p>
                    <p className="text-xs text-gray-500">{car.owner.email}</p>
                </div>
            )}

            {car.services && car.services.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        Services: <span className="font-medium">{car.services.length}</span>
                    </p>
                </div>
            )}

            <div className="flex space-x-2">
                <Link
                    to={`/cars/${car._id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default CarCard;
