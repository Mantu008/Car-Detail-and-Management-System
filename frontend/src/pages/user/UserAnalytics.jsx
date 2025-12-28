import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
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
            // We'll need to fetch cars and services to calculate stats locally
            // or create a new endpoint. For now, let's fetch cars and services.
            const [carsRes, servicesRes] = await Promise.all([
                api.get('/api/cars/my-cars'),
                api.get('/api/services')
            ]);

            const cars = carsRes.data.data;
            const services = servicesRes.data.data;

            // Calculate Stats
            const totalSpent = services.reduce((acc, curr) => acc + (curr.cost || 0), 0);
            const totalServices = services.length;
            const totalVehicles = cars.length;

            // Service Costs by Vehicle
            const vehicleCosts = {};
            services.forEach(service => {
                const carName = service.car ? `${service.car.brand} ${service.car.model}` : 'Unknown';
                vehicleCosts[carName] = (vehicleCosts[carName] || 0) + (service.cost || 0);
            });

            setStats({
                totalSpent,
                totalServices,
                totalVehicles,
                vehicleCosts
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
    if (!stats) return <div>Error loading analytics</div>;

    const costData = {
        labels: Object.keys(stats.vehicleCosts),
        datasets: [{
            label: 'Cost per Vehicle',
            data: Object.values(stats.vehicleCosts),
            backgroundColor: [
                '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
            ]
        }]
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Analytics</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-gray-500 text-sm font-medium uppercase">Total Spent</div>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-gray-500 text-sm font-medium uppercase">Total Vehicles</div>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">{stats.totalVehicles}</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-gray-500 text-sm font-medium uppercase">Total Services</div>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">{stats.totalServices}</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Vehicle</h3>
                <div className="h-64 flex justify-center">
                    <Doughnut data={costData} />
                </div>
            </div>
        </div>
    );
};

export default UserAnalytics;
