import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { toast } from 'react-toastify';
import CarCard from '../components/CarCard';
import { useAuth } from '../context/authContext';

const Cars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBrand, setFilterBrand] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const response = await api.get('/api/cars');
            setCars(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch cars');
            console.error('Error fetching cars:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCars = cars.filter(car => {
        const matchesSearch =
            car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.owner?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBrand = filterBrand === '' || car.brand === filterBrand;
        const matchesYear = filterYear === '' || car.year.toString() === filterYear;

        return matchesSearch && matchesBrand && matchesYear;
    });

    const uniqueBrands = [...new Set(cars.map(car => car.brand))].sort();
    const uniqueYears = [...new Set(cars.map(car => car.year))].sort((a, b) => b - a);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">All Vehicles</h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Browse through our collection of vehicles and find the perfect match for you.
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search by brand, model, or owner..."
                                className="w-full px-4 py-2.5 sm:py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all touch-target"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand
                            </label>
                            <select
                                className="w-full px-4 py-2.5 sm:py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all touch-target"
                                value={filterBrand}
                                onChange={(e) => setFilterBrand(e.target.value)}
                            >
                                <option value="">All Brands</option>
                                {uniqueBrands.map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year
                            </label>
                            <select
                                className="w-full px-4 py-2.5 sm:py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all touch-target"
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                            >
                                <option value="">All Years</option>
                                {uniqueYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterBrand('');
                                    setFilterYear('');
                                }}
                                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-2.5 sm:py-2 px-4 rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg touch-target"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add Car Button for authenticated users */}
                {isAuthenticated && (
                    <div className="mb-6">
                        <Link
                            to="/add-car"
                            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 touch-target"
                        >
                            <span className="mr-2 text-xl">+</span>
                            Add New Vehicle
                        </Link>
                    </div>
                )}

                {/* Cars Grid */}
                {filteredCars.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-lg">
                        <div className="text-5xl sm:text-6xl mb-4">🚗</div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">No vehicles found</h3>
                        <p className="text-gray-600 px-4 text-sm sm:text-base">
                            {searchTerm || filterBrand || filterYear
                                ? 'Try adjusting your search criteria'
                                : 'No vehicles are available at the moment'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredCars.map(car => (
                            <CarCard key={car._id} car={car} />
                        ))}
                    </div>
                )}

                {/* Results count */}
                <div className="mt-6 sm:mt-8 text-center text-gray-600 text-sm sm:text-base">
                    Showing {filteredCars.length} of {cars.length} vehicles
                </div>
            </div>
        </div>
    );
};

export default Cars;
