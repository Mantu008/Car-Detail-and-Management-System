import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import PDFReportGenerator from '../components/reports/PDFReportGenerator';
import ExcelReportGenerator from '../components/reports/ExcelReportGenerator';
import CarComparison from '../components/CarComparison';
import FuelTracker from '../components/FuelTracker';
import ServiceCostEstimator from '../components/ServiceCostEstimator';
import TwoFactorAuth from '../components/auth/TwoFactorAuth';
import { toast } from 'react-toastify';
import api from '../config/api';

const FeaturesDashboard = () => {
    const { user, isAdmin } = useAuth();
    const [showPDFReport, setShowPDFReport] = useState(false);
    const [showExcelReport, setShowExcelReport] = useState(false);
    const [showCarComparison, setShowCarComparison] = useState(false);
    const [showFuelTracker, setShowFuelTracker] = useState(false);
    const [showCostEstimator, setShowCostEstimator] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
    const [reportType, setReportType] = useState('');
    const [cars, setCars] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleReportGeneration = (type) => {
        setReportType(type);
        setShowPDFReport(true);
    };

    const handleExcelGeneration = (type) => {
        setReportType(type);
        setShowExcelReport(true);
    };

    const handleCarSelection = (car) => {
        setSelectedCar(car);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const carsResponse = await api.get('/api/cars/my-cars');
            let carsData = [];
            if (carsResponse.data && Array.isArray(carsResponse.data)) {
                carsData = carsResponse.data;
            } else if (carsResponse.data && carsResponse.data.data && Array.isArray(carsResponse.data.data)) {
                carsData = carsResponse.data.data;
            } else if (carsResponse.data && carsResponse.data.cars && Array.isArray(carsResponse.data.cars)) {
                carsData = carsResponse.data.cars;
            }

            setCars(carsData);

            let servicesData = [];
            try {
                const servicesResponse = await api.get('/api/services');
                if (servicesResponse.data && Array.isArray(servicesResponse.data)) {
                    servicesData = servicesResponse.data;
                } else if (servicesResponse.data && servicesResponse.data.data && Array.isArray(servicesResponse.data.data)) {
                    servicesData = servicesResponse.data.data;
                } else if (servicesResponse.data && servicesResponse.data.services && Array.isArray(servicesResponse.data.services)) {
                    servicesData = servicesResponse.data.services;
                }
            } catch (servicesError) {
                if (carsData.length > 0) {
                    const allServices = [];
                    for (const car of carsData.slice(0, 5)) {
                        try {
                            const carServicesResponse = await api.get(`/api/services/${car._id}`);
                            if (carServicesResponse.data && Array.isArray(carServicesResponse.data)) {
                                allServices.push(...carServicesResponse.data);
                            } else if (carServicesResponse.data && carServicesResponse.data.data && Array.isArray(carServicesResponse.data.data)) {
                                allServices.push(...carServicesResponse.data.data);
                            }
                        } catch (carServiceError) {
                            // Silent fail
                        }
                    }
                    servicesData = allServices;
                }
            }

            setServices(servicesData);
        } catch (error) {
            toast.error(`Failed to load data: ${error.response?.data?.message || error.message}`);
            setCars([]);
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            id: 'reports',
            title: 'Report Generation',
            description: 'Generate PDF and Excel reports for vehicles and services',
            icon: '📊',
            color: 'bg-blue-500',
            features: [
                {
                    name: 'All Vehicles Report',
                    description: 'Generate comprehensive report of all vehicles',
                    action: () => handleReportGeneration('all-cars'),
                    excelAction: () => handleExcelGeneration('all-cars')
                },
                {
                    name: 'Service History Report',
                    description: 'Detailed service history for specific vehicles',
                    action: () => handleReportGeneration('service-history'),
                    excelAction: () => handleExcelGeneration('service-history')
                },
                {
                    name: 'Monthly Maintenance Summary',
                    description: 'Monthly cost analysis and trends',
                    action: () => handleReportGeneration('monthly-maintenance'),
                    excelAction: () => handleExcelGeneration('monthly-maintenance')
                }
            ]
        },
        {
            id: 'comparison',
            title: 'Vehicle Comparison Tool',
            description: 'Compare two vehicles side-by-side with detailed analysis',
            icon: '⚖️',
            color: 'bg-green-500',
            action: () => setShowCarComparison(true)
        },
        {
            id: 'fuel-tracker',
            title: 'Fuel Efficiency Tracker',
            description: 'Track fuel consumption and calculate efficiency',
            icon: '⛽',
            color: 'bg-yellow-500',
            action: () => {
                if (!selectedCar) {
                    toast.info('Please select a vehicle from the dropdown above first');
                    return;
                }
                setShowFuelTracker(true);
            }
        },
        {
            id: 'cost-estimator',
            title: 'Service Cost Estimator',
            description: 'Predict service costs based on historical data',
            icon: '💰',
            color: 'bg-purple-500',
            action: () => {
                if (!selectedCar) {
                    toast.info('Please select a vehicle from the dropdown above first');
                    return;
                }
                setShowCostEstimator(true);
            }
        },
    ];

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
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">Advanced Features</h1>
                    <p className="text-base sm:text-lg text-gray-600">
                        Explore powerful tools to manage and analyze your vehicle data
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-sm text-gray-500">
                            Data loaded: {cars.length} vehicles, {services.length} services
                        </div>
                        <button
                            onClick={fetchData}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 touch-target"
                        >
                            🔄 Refresh Data
                        </button>
                    </div>

                    {/* Vehicle Selection for Tools */}
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mt-6">
                        <label htmlFor="vehicle-select" className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Vehicle for Analysis Tools
                        </label>
                        <select
                            id="vehicle-select"
                            className="w-full px-4 py-2.5 sm:py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all touch-target"
                            value={selectedCar?._id || ''}
                            onChange={(e) => {
                                const car = cars.find(c => c._id === e.target.value);
                                handleCarSelection(car);
                            }}
                        >
                            <option value="">-- Select a Vehicle --</option>
                            {cars.map(car => (
                                <option key={car._id} value={car._id}>
                                    {car.brand} {car.model} ({car.year})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                            Select a vehicle to use Fuel Tracker and Cost Estimator
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">📊</div>
                        <div className="text-sm sm:text-lg font-semibold text-gray-800">Reports</div>
                        <div className="text-xs sm:text-sm text-gray-600">PDF & Excel generation</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                        <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">⚖️</div>
                        <div className="text-sm sm:text-lg font-semibold text-gray-800">Comparison</div>
                        <div className="text-xs sm:text-sm text-gray-600">Side-by-side analysis</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                        <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">⛽</div>
                        <div className="text-sm sm:text-lg font-semibold text-gray-800">Fuel Tracking</div>
                        <div className="text-xs sm:text-sm text-gray-600">Efficiency monitoring</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                        <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">💰</div>
                        <div className="text-sm sm:text-lg font-semibold text-gray-800">Cost Estimation</div>
                        <div className="text-xs sm:text-sm text-gray-600">Predictive analytics</div>
                    </div>
                </div>

                {/* Debug Panel - Only show if no data */}
                {cars.length === 0 && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                        <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-3 sm:mb-4">🔍 Debug Information</h3>
                        <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                            <p><strong>No vehicles found.</strong> Please add some vehicles to use the advanced features.</p>
                            <p className="text-gray-600 mt-2">
                                Open browser console (F12) to see detailed error messages if you're experiencing issues.
                            </p>
                        </div>
                    </div>
                )}

                {/* Features Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {features.map((feature) => (
                        <div key={feature.id} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl shadow-md flex-shrink-0`}>
                                    {feature.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{feature.title}</h3>
                                    <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                                </div>
                            </div>

                            {feature.features ? (
                                <div className="space-y-4">
                                    {feature.features.map((subFeature, index) => (
                                        <div key={index} className="border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
                                                <h4 className="font-semibold text-gray-800">{subFeature.name}</h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={subFeature.action}
                                                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md touch-target"
                                                    >
                                                        PDF
                                                    </button>
                                                    <button
                                                        onClick={subFeature.excelAction}
                                                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md touch-target"
                                                    >
                                                        Excel
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600">{subFeature.description}</p>
                                            {cars.length === 0 && (
                                                <p className="text-xs text-yellow-600 mt-2">
                                                    ⚠️ No vehicles found. Add some vehicles first to generate meaningful reports.
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <button
                                    onClick={feature.action}
                                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 touch-target"
                                >
                                    Open {feature.title}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Admin Features */}
                {isAdmin && (
                    <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Admin Features</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="border-2 border-gray-100 rounded-2xl p-4 sm:p-6 hover:border-red-200 transition-colors">
                                <div className="flex items-center mb-4 gap-3">
                                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md flex-shrink-0">
                                        📝
                                    </div>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-semibold text-gray-800">Activity Logs</h4>
                                        <p className="text-xs sm:text-sm text-gray-600">Monitor user activities and system events</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.location.href = '/admin/activity-logs'}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all touch-target"
                                >
                                    View Activity Logs
                                </button>
                            </div>

                            <div className="border-2 border-gray-100 rounded-2xl p-4 sm:p-6 hover:border-indigo-200 transition-colors">
                                <div className="flex items-center mb-4 gap-3">
                                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md flex-shrink-0">
                                        🔧
                                    </div>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-semibold text-gray-800">System Management</h4>
                                        <p className="text-xs sm:text-sm text-gray-600">Manage users, settings, and system configuration</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.location.href = '/admin/dashboard'}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all touch-target"
                                >
                                    Admin Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modals */}
                {showPDFReport && (
                    <PDFReportGenerator
                        cars={cars}
                        services={services}
                        reportType={reportType}
                        onClose={() => setShowPDFReport(false)}
                    />
                )}

                {showExcelReport && (
                    <ExcelReportGenerator
                        cars={cars}
                        services={services}
                        reportType={reportType}
                        onClose={() => setShowExcelReport(false)}
                    />
                )}

                {showCarComparison && (
                    <CarComparison
                        cars={cars}
                        onClose={() => setShowCarComparison(false)}
                    />
                )}

                {showFuelTracker && selectedCar && (
                    <FuelTracker
                        car={selectedCar}
                        onClose={() => setShowFuelTracker(false)}
                    />
                )}

                {showCostEstimator && selectedCar && (
                    <ServiceCostEstimator
                        car={selectedCar}
                        onClose={() => setShowCostEstimator(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default FeaturesDashboard;
