import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import api from '../../config/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/api/admin/dashboard');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
    );

    if (!stats) return <div className="text-center text-red-500">Error loading stats</div>;

    // Common Chart Options for "Modern" Look
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleFont: { size: 13 },
                bodyFont: { size: 13 },
                padding: 10,
                cornerRadius: 8,
                displayColors: true
            }
        }
    };

    // 1. Pie Chart: Vehicle Types (3D-like colors)
    const vehicleTypeData = {
        labels: stats.vehicleTypes.map(t => t._id),
        datasets: [{
            data: stats.vehicleTypes.map(t => t.count),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)', // Blue
                'rgba(16, 185, 129, 0.8)', // Green
                'rgba(245, 158, 11, 0.8)', // Yellow
                'rgba(239, 68, 68, 0.8)',  // Red
                'rgba(139, 92, 246, 0.8)'  // Purple
            ],
            borderColor: [
                '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'
            ],
            borderWidth: 2,
            hoverOffset: 20 // Pop out effect
        }]
    };

    // 2. Line Chart: User Growth (Smooth, Gradient Fill)
    const monthlySignupsData = {
        labels: stats.monthlySignups.map(m => `Month ${m._id}`),
        datasets: [{
            label: 'New Users',
            data: stats.monthlySignups.map(m => m.count),
            borderColor: '#3B82F6',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
                return gradient;
            },
            fill: true,
            tension: 0.4, // Smooth curves
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    // 3. Doughnut Chart: User Status (Modern Ring)
    const userStatusData = {
        labels: ['Active', 'Blocked'],
        datasets: [{
            data: [stats.userStatus.active, stats.userStatus.blocked],
            backgroundColor: ['#10B981', '#EF4444'],
            borderWidth: 0,
            hoverOffset: 10,
            cutout: '75%' // Thinner ring
        }]
    };

    // 4. Bar Chart: Services & Revenue (New!)
    const serviceBarData = {
        labels: stats.monthlyServices?.map(m => `Month ${m._id}`) || [],
        datasets: [
            {
                label: 'Services Count',
                data: stats.monthlyServices?.map(m => m.count) || [],
                backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo
                borderRadius: 6,
            },
            {
                label: 'Revenue (x100)', // Scaled for visibility if needed, or just use separate axis
                data: stats.monthlyServices?.map(m => m.revenue / 100) || [], // Example scaling
                backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald
                borderRadius: 6,
            }
        ]
    };

    return (
        <div className="space-y-8 p-2">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

            {/* Stats Cards with Gradients */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
                    <div className="text-blue-100 text-sm font-medium uppercase tracking-wider">Total Users</div>
                    <div className="mt-2 text-4xl font-bold">{stats.counts.users}</div>
                    <div className="mt-1 text-blue-200 text-sm">Registered accounts</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
                    <div className="text-purple-100 text-sm font-medium uppercase tracking-wider">Total Vehicles</div>
                    <div className="mt-2 text-4xl font-bold">{stats.counts.cars}</div>
                    <div className="mt-1 text-purple-200 text-sm">Managed vehicles</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
                    <div className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Total Services</div>
                    <div className="mt-2 text-4xl font-bold">{stats.counts.services}</div>
                    <div className="mt-1 text-emerald-200 text-sm">Completed services</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">📊</span>
                        Service Activity
                    </h3>
                    <div className="h-72">
                        <Bar data={serviceBarData} options={commonOptions} />
                    </div>
                </div>

                {/* Line Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">📈</span>
                        User Growth
                    </h3>
                    <div className="h-72">
                        <Line data={monthlySignupsData} options={commonOptions} />
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3">🍰</span>
                        Vehicle Types
                    </h3>
                    <div className="h-72 flex justify-center relative">
                        <Pie data={vehicleTypeData} options={commonOptions} />
                    </div>
                </div>

                {/* Doughnut Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-red-100 text-red-600 p-2 rounded-lg mr-3">🍩</span>
                        User Status
                    </h3>
                    <div className="h-72 flex justify-center relative">
                        <Doughnut data={userStatusData} options={commonOptions} />
                        {/* Center Text Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center mt-8">
                                <div className="text-3xl font-bold text-gray-800">{stats.counts.users}</div>
                                <div className="text-xs text-gray-500 uppercase">Total</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
