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
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">All Cars</h1>
                    <p className="text-gray-600">
                        Browse through our collection of cars and find the perfect match for you.
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search by brand, model, or owner..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
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
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                        >
                            <span className="mr-2">+</span>
                            Add New Car
                        </Link>
                    </div>
                )}

                {/* Cars Grid */}
                {filteredCars.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🚗</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No cars found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterBrand || filterYear
                                ? 'Try adjusting your search criteria'
                                : 'No cars are available at the moment'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCars.map(car => (
                            <CarCard key={car._id} car={car} />
                        ))}
                    </div>
                )}

                {/* Results count */}
                <div className="mt-8 text-center text-gray-600">
                    Showing {filteredCars.length} of {cars.length} cars
                </div>
            </div>
        </div>
    );
};

export default Cars;
