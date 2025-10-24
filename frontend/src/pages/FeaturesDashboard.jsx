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

            // Fetch cars with better error handling
            console.log('Fetching cars from /api/cars...');
            const carsResponse = await api.get('/api/cars');
            console.log('Cars response:', carsResponse.data);

            // Handle different response structures
            let carsData = [];
            if (carsResponse.data && Array.isArray(carsResponse.data)) {
                carsData = carsResponse.data;
            } else if (carsResponse.data && carsResponse.data.data && Array.isArray(carsResponse.data.data)) {
                carsData = carsResponse.data.data;
            } else if (carsResponse.data && carsResponse.data.cars && Array.isArray(carsResponse.data.cars)) {
                carsData = carsResponse.data.cars;
            }

            setCars(carsData);
            console.log('Fetched cars:', carsData.length, carsData);

            // Fetch all services with better error handling
            console.log('Fetching services from /api/services...');
            let servicesData = [];

            try {
                const servicesResponse = await api.get('/api/services');
                console.log('Services response:', servicesResponse.data);

                // Handle different response structures
                if (servicesResponse.data && Array.isArray(servicesResponse.data)) {
                    servicesData = servicesResponse.data;
                } else if (servicesResponse.data && servicesResponse.data.data && Array.isArray(servicesResponse.data.data)) {
                    servicesData = servicesResponse.data.data;
                } else if (servicesResponse.data && servicesResponse.data.services && Array.isArray(servicesResponse.data.services)) {
                    servicesData = servicesResponse.data.services;
                }
            } catch (servicesError) {
                console.log('Services API failed (this is normal for non-admin users):', servicesError.message);
                // Try to fetch services from individual cars as fallback
                if (carsData.length > 0) {
                    console.log('Attempting to fetch services from individual cars...');
                    const allServices = [];
                    for (const car of carsData.slice(0, 5)) { // Limit to first 5 cars to avoid too many requests
                        try {
                            const carServicesResponse = await api.get(`/api/services/${car._id}`);
                            if (carServicesResponse.data && Array.isArray(carServicesResponse.data)) {
                                allServices.push(...carServicesResponse.data);
                            } else if (carServicesResponse.data && carServicesResponse.data.data && Array.isArray(carServicesResponse.data.data)) {
                                allServices.push(...carServicesResponse.data.data);
                            }
                        } catch (carServiceError) {
                            console.log(`Failed to fetch services for car ${car._id}:`, carServiceError.message);
                        }
                    }
                    servicesData = allServices;
                    console.log('Fetched services from individual cars:', servicesData.length);
                } else {
                    servicesData = [];
                }
            }

            setServices(servicesData);
            console.log('Fetched services:', servicesData.length, servicesData);

        } catch (error) {
            console.error('Error fetching data:', error);
            console.error('Error details:', error.response?.data);
            toast.error(`Failed to load data: ${error.response?.data?.message || error.message}`);
            // Set empty arrays as fallback
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
            description: 'Generate PDF and Excel reports for cars and services',
            icon: '📊',
            color: 'bg-blue-500',
            features: [
                {
                    name: 'All Cars Report',
                    description: 'Generate comprehensive report of all cars',
                    action: () => handleReportGeneration('all-cars'),
                    excelAction: () => handleExcelGeneration('all-cars')
                },
                {
                    name: 'Service History Report',
                    description: 'Detailed service history for specific cars',
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
            title: 'Car Comparison Tool',
            description: 'Compare two cars side-by-side with detailed analysis',
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
                toast.info('Please select a car first to track fuel efficiency');
            }
        },
        {
            id: 'cost-estimator',
            title: 'Service Cost Estimator',
            description: 'Predict service costs based on historical data',
            icon: '💰',
            color: 'bg-purple-500',
            action: () => {
                toast.info('Please select a car first to estimate service costs');
            }
        },
        {
            id: 'security',
            title: 'Two-Factor Authentication',
            description: 'Enhanced security with OTP verification',
            icon: '🔐',
            color: 'bg-red-500',
            action: () => setShow2FA(true)
        }
    ];

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
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Advanced Features</h1>
                    <p className="text-lg text-gray-600">
                        Explore powerful tools to manage and analyze your car data
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Data loaded: {cars.length} cars, {services.length} services
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={fetchData}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                🔄 Refresh Data
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        console.log('Testing API endpoints...');
                                        const carsTest = await api.get('/api/cars');
                                        console.log('Cars API test result:', carsTest.data);
                                        toast.success(`Cars API working: ${JSON.stringify(carsTest.data).substring(0, 100)}...`);
                                    } catch (error) {
                                        console.error('Cars API test failed:', error);
                                        toast.error(`Cars API failed: ${error.message}`);
                                    }
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                🧪 Test API
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="text-3xl font-bold text-blue-600">📊</div>
                        <div className="text-lg font-semibold text-gray-800">Reports</div>
                        <div className="text-sm text-gray-600">PDF & Excel generation</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="text-3xl font-bold text-green-600">⚖️</div>
                        <div className="text-lg font-semibold text-gray-800">Comparison</div>
                        <div className="text-sm text-gray-600">Side-by-side analysis</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="text-3xl font-bold text-yellow-600">⛽</div>
                        <div className="text-lg font-semibold text-gray-800">Fuel Tracking</div>
                        <div className="text-sm text-gray-600">Efficiency monitoring</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="text-3xl font-bold text-purple-600">💰</div>
                        <div className="text-lg font-semibold text-gray-800">Cost Estimation</div>
                        <div className="text-sm text-gray-600">Predictive analytics</div>
                    </div>
                </div>

                {/* Debug Panel - Only show if no data */}
                {cars.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-4">🔍 Debug Information</h3>
                        <div className="space-y-2 text-sm">
                            <p><strong>API Endpoints:</strong></p>
                            <ul className="ml-4 space-y-1">
                                <li>• Cars: <code>/api/cars</code></li>
                                <li>• Services: <code>/api/services</code></li>
                            </ul>
                            <p><strong>Troubleshooting Steps:</strong></p>
                            <ul className="ml-4 space-y-1">
                                <li>1. Check if backend server is running (usually on port 5000)</li>
                                <li>2. Verify you're logged in to the application</li>
                                <li>3. Check browser console for detailed error messages</li>
                                <li>4. Try the "Test API" button to verify connectivity</li>
                                <li>5. Make sure you have cars in your system</li>
                            </ul>
                            <p className="text-xs text-gray-600 mt-2">
                                Open browser console (F12) to see detailed error messages.
                            </p>
                        </div>
                    </div>
                )}

                {/* Features Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {features.map((feature) => (
                        <div key={feature.id} className="bg-white rounded-xl shadow-lg p-8">
                            <div className="flex items-center mb-6">
                                <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center text-white text-2xl mr-4`}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            </div>

                            {feature.features ? (
                                <div className="space-y-4">
                                    {feature.features.map((subFeature, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold text-gray-800">{subFeature.name}</h4>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={subFeature.action}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                                    >
                                                        PDF
                                                    </button>
                                                    <button
                                                        onClick={subFeature.excelAction}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                                    >
                                                        Excel
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">{subFeature.description}</p>
                                            {cars.length === 0 && (
                                                <p className="text-xs text-yellow-600 mt-1">
                                                    ⚠️ No cars found. Add some cars first to generate meaningful reports.
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <button
                                    onClick={feature.action}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                                >
                                    Open {feature.title}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Admin Features */}
                {isAdmin && (
                    <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Admin Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                                        📝
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800">Activity Logs</h4>
                                        <p className="text-gray-600">Monitor user activities and system events</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.location.href = '/admin/activity-logs'}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                    View Activity Logs
                                </button>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                                        🔧
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800">System Management</h4>
                                        <p className="text-gray-600">Manage users, settings, and system configuration</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.location.href = '/admin/dashboard'}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
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
                    <CarComparison onClose={() => setShowCarComparison(false)} />
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

                {show2FA && (
                    <TwoFactorAuth
                        user={user}
                        onSetupComplete={() => {
                            toast.success('2FA setup completed!');
                            setShow2FA(false);
                        }}
                        onClose={() => setShow2FA(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default FeaturesDashboard;
