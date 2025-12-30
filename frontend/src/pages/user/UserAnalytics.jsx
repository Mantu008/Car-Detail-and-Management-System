import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../../config/api';
import { useAuth } from '../../context/authContext';

const UserAnalytics = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            const [carsRes, servicesRes] = await Promise.all([
                api.get('/api/cars/my-cars'),
                api.get('/api/services')
            ]);

            const cars = carsRes.data.data || carsRes.data || [];
            const services = servicesRes.data.data || servicesRes.data || [];

            // Calculate Stats
            const totalSpent = services.reduce((acc, curr) => acc + (curr.cost || 0), 0);
            const totalServices = services.length;
            const totalVehicles = cars.length;
            const avgCostPerService = totalServices > 0 ? totalSpent / totalServices : 0;

            // Service Costs by Vehicle
            const vehicleCosts = {};
            services.forEach(service => {
                const carName = service.car ? `${service.car.brand} ${service.car.model}` : 'Unknown';
                vehicleCosts[carName] = (vehicleCosts[carName] || 0) + (service.cost || 0);
            });

            // Service counts by type
            const serviceTypes = {};
            services.forEach(service => {
                const type = service.serviceType || 'other';
                serviceTypes[type] = (serviceTypes[type] || 0) + 1;
            });

            // Monthly spending (last 6 months)
            const monthlySpending = {};
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                monthlySpending[monthKey] = 0;
            }

            services.forEach(service => {
                const serviceDate = new Date(service.date);
                const monthKey = serviceDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                if (monthlySpending.hasOwnProperty(monthKey)) {
                    monthlySpending[monthKey] += (service.cost || 0);
                }
            });

            setStats({
                totalSpent,
                totalServices,
                totalVehicles,
                avgCostPerService,
                vehicleCosts,
                serviceTypes,
                monthlySpending
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <div className="text-5xl mb-4">📊</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Analytics</h2>
                    <p className="text-gray-600">Please try refreshing the page</p>
                </div>
            </div>
        );
    }

    const costData = {
        labels: Object.keys(stats.vehicleCosts),
        datasets: [{
            label: 'Cost per Vehicle',
            data: Object.values(stats.vehicleCosts),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)'
            ],
            borderColor: [
                'rgb(59, 130, 246)',
                'rgb(16, 185, 129)',
                'rgb(245, 158, 11)',
                'rgb(239, 68, 68)',
                'rgb(139, 92, 246)',
                'rgb(236, 72, 153)'
            ],
            borderWidth: 2
        }]
    };

    const serviceTypeData = {
        labels: Object.keys(stats.serviceTypes).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
        datasets: [{
            label: 'Service Count',
            data: Object.values(stats.serviceTypes),
            backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 146, 60, 0.8)',
                'rgba(248, 113, 113, 0.8)'
            ],
            borderColor: [
                'rgb(99, 102, 241)',
                'rgb(34, 197, 94)',
                'rgb(251, 146, 60)',
                'rgb(248, 113, 113)'
            ],
            borderWidth: 2
        }]
    };

    const monthlyData = {
        labels: Object.keys(stats.monthlySpending),
        datasets: [{
            label: 'Monthly Spending',
            data: Object.values(stats.monthlySpending),
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                        📊 My Analytics
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Track your vehicle expenses and service history
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold uppercase opacity-90">Total Spent</div>
                            <div className="text-3xl">💰</div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold">${stats.totalSpent.toLocaleString()}</div>
                        <div className="text-xs opacity-75 mt-2">All-time spending</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold uppercase opacity-90">Vehicles</div>
                            <div className="text-3xl">🚗</div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold">{stats.totalVehicles}</div>
                        <div className="text-xs opacity-75 mt-2">In your fleet</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold uppercase opacity-90">Services</div>
                            <div className="text-3xl">🔧</div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold">{stats.totalServices}</div>
                        <div className="text-xs opacity-75 mt-2">Total completed</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold uppercase opacity-90">Avg Cost</div>
                            <div className="text-3xl">📈</div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold">${stats.avgCostPerService.toFixed(0)}</div>
                        <div className="text-xs opacity-75 mt-2">Per service</div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                    {/* Spending by Vehicle */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">🚗</span>
                            Spending by Vehicle
                        </h3>
                        {Object.keys(stats.vehicleCosts).length > 0 ? (
                            <div className="h-64 sm:h-72">
                                <Doughnut data={costData} options={chartOptions} />
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">📭</div>
                                    <p>No vehicle data available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Service Types */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">🔧</span>
                            Service Types
                        </h3>
                        {Object.keys(stats.serviceTypes).length > 0 ? (
                            <div className="h-64 sm:h-72">
                                <Doughnut data={serviceTypeData} options={chartOptions} />
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">📭</div>
                                    <p>No service data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Monthly Spending Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">📈</span>
                        Monthly Spending Trend
                    </h3>
                    <div className="h-64 sm:h-80">
                        <Line data={monthlyData} options={chartOptions} />
                    </div>
                </div>

                {/* Summary Section */}
                {stats.totalVehicles > 0 && (
                    <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">💡 Quick Insights</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                            <div className="flex items-start">
                                <span className="text-blue-600 mr-2">✓</span>
                                <span className="text-gray-700">
                                    You have <strong>{stats.totalVehicles}</strong> vehicle{stats.totalVehicles !== 1 ? 's' : ''} in your fleet
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span className="text-gray-700">
                                    Completed <strong>{stats.totalServices}</strong> service{stats.totalServices !== 1 ? 's' : ''} so far
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="text-purple-600 mr-2">✓</span>
                                <span className="text-gray-700">
                                    Average service cost: <strong>${stats.avgCostPerService.toFixed(2)}</strong>
                                </span>
                            </div>
                            <div className="flex items-start">
                                <span className="text-orange-600 mr-2">✓</span>
                                <span className="text-gray-700">
                                    Total maintenance investment: <strong>${stats.totalSpent.toLocaleString()}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserAnalytics;
