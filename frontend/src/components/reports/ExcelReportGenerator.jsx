import React from 'react';
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';

const ExcelReportGenerator = ({ cars, services, reportType, onClose }) => {
    const generateAllCarsReport = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('All Cars Report');

            // Header
            worksheet.mergeCells('A1:H1');
            worksheet.getCell('A1').value = 'Car Management System - All Cars Report';
            worksheet.getCell('A1').font = { size: 16, bold: true };
            worksheet.getCell('A1').alignment = { horizontal: 'center' };

            worksheet.getCell('A2').value = `Generated on: ${new Date().toLocaleDateString()}`;
            worksheet.getCell('A2').font = { size: 12 };

            if (!cars || cars.length === 0) {
                worksheet.getCell('A4').value = 'No cars found in the system.';
                worksheet.getCell('A4').font = { size: 14 };
            } else {
                // Table headers
                const headers = ['Brand', 'Model', 'Year', 'Price', 'Color', 'Mileage', 'Owner', 'Services Count'];
                worksheet.getRow(4).values = headers;
                worksheet.getRow(4).font = { bold: true };
                worksheet.getRow(4).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4285F4' }
                };

                // Data rows
                cars.forEach((car, index) => {
                    const row = worksheet.getRow(index + 5);
                    row.values = [
                        car.brand || 'N/A',
                        car.model || 'N/A',
                        car.year || 'N/A',
                        car.price || 0,
                        car.color || 'N/A',
                        car.mileage || 'N/A',
                        car.owner?.name || 'N/A',
                        car.services?.length || 0
                    ];
                });
            }

            // Auto-fit columns
            worksheet.columns.forEach(column => {
                column.width = 15;
            });

            // Add summary
            const summaryRow = cars.length + 6;
            worksheet.getCell(`A${summaryRow}`).value = 'Summary:';
            worksheet.getCell(`A${summaryRow}`).font = { bold: true };

            const totalCars = cars.length;
            const totalValue = cars.reduce((sum, car) => sum + (car.price || 0), 0);
            const avgPrice = totalValue / totalCars;

            worksheet.getCell(`A${summaryRow + 1}`).value = `Total Cars: ${totalCars}`;
            worksheet.getCell(`A${summaryRow + 2}`).value = `Total Value: $${totalValue.toLocaleString()}`;
            worksheet.getCell(`A${summaryRow + 3}`).value = `Average Price: $${avgPrice.toLocaleString()}`;

            // Save file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'all-cars-report.xlsx';
            link.click();
            URL.revokeObjectURL(url);

            toast.success('Excel report generated successfully!');
        } catch (error) {
            toast.error('Failed to generate Excel report');
            console.error('Excel generation error:', error);
        }
    };

    const generateServiceHistoryReport = async (carId) => {
        try {
            const car = cars.find(c => c._id === carId);
            const carServices = services.filter(s => s.car === carId);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Service History');

            // Header
            worksheet.mergeCells('A1:F1');
            worksheet.getCell('A1').value = 'Service History Report';
            worksheet.getCell('A1').font = { size: 16, bold: true };
            worksheet.getCell('A1').alignment = { horizontal: 'center' };

            worksheet.getCell('A2').value = `Car: ${car?.brand} ${car?.model} (${car?.year})`;
            worksheet.getCell('A3').value = `Generated on: ${new Date().toLocaleDateString()}`;

            if (carServices.length > 0) {
                // Table headers
                const headers = ['Date', 'Service Type', 'Description', 'Cost', 'Provider'];
                worksheet.getRow(5).values = headers;
                worksheet.getRow(5).font = { bold: true };
                worksheet.getRow(5).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4285F4' }
                };

                // Data rows
                carServices.forEach((service, index) => {
                    const row = worksheet.getRow(index + 6);
                    row.values = [
                        new Date(service.date).toLocaleDateString(),
                        service.serviceType,
                        service.description,
                        service.cost,
                        service.serviceProvider || 'N/A'
                    ];
                });

                // Summary
                const summaryRow = carServices.length + 7;
                const totalCost = carServices.reduce((sum, service) => sum + (service.cost || 0), 0);
                const avgCost = totalCost / carServices.length;

                worksheet.getCell(`A${summaryRow}`).value = 'Service Summary:';
                worksheet.getCell(`A${summaryRow}`).font = { bold: true };
                worksheet.getCell(`A${summaryRow + 1}`).value = `Total Services: ${carServices.length}`;
                worksheet.getCell(`A${summaryRow + 2}`).value = `Total Cost: $${totalCost.toFixed(2)}`;
                worksheet.getCell(`A${summaryRow + 3}`).value = `Average Cost: $${avgCost.toFixed(2)}`;
            } else {
                worksheet.getCell('A5').value = 'No service records found for this car.';
            }

            // Auto-fit columns
            worksheet.columns.forEach(column => {
                column.width = 20;
            });

            // Save file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${car?.brand}-${car?.model}-service-history.xlsx`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success('Service history Excel report generated successfully!');
        } catch (error) {
            toast.error('Failed to generate service history Excel report');
            console.error('Excel generation error:', error);
        }
    };

    const generateMonthlyMaintenanceReport = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Monthly Maintenance');

            // Header
            worksheet.mergeCells('A1:D1');
            worksheet.getCell('A1').value = 'Monthly Maintenance Cost Summary';
            worksheet.getCell('A1').font = { size: 16, bold: true };
            worksheet.getCell('A1').alignment = { horizontal: 'center' };

            worksheet.getCell('A2').value = `Generated on: ${new Date().toLocaleDateString()}`;

            // Group services by month
            const monthlyData = {};
            services.forEach(service => {
                const month = new Date(service.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                });
                if (!monthlyData[month]) {
                    monthlyData[month] = { count: 0, totalCost: 0, services: [] };
                }
                monthlyData[month].count++;
                monthlyData[month].totalCost += service.cost || 0;
                monthlyData[month].services.push(service);
            });

            // Table headers
            const headers = ['Month', 'Services Count', 'Total Cost', 'Average Cost'];
            worksheet.getRow(4).values = headers;
            worksheet.getRow(4).font = { bold: true };
            worksheet.getRow(4).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4285F4' }
            };

            // Data rows
            Object.entries(monthlyData).forEach(([month, data], index) => {
                const row = worksheet.getRow(index + 5);
                row.values = [
                    month,
                    data.count,
                    data.totalCost,
                    data.totalCost / data.count
                ];
            });

            // Summary
            const summaryRow = Object.keys(monthlyData).length + 6;
            const totalServices = services.length;
            const totalCost = services.reduce((sum, service) => sum + (service.cost || 0), 0);
            const avgCost = totalCost / totalServices;

            worksheet.getCell(`A${summaryRow}`).value = 'Overall Summary:';
            worksheet.getCell(`A${summaryRow}`).font = { bold: true };
            worksheet.getCell(`A${summaryRow + 1}`).value = `Total Services: ${totalServices}`;
            worksheet.getCell(`A${summaryRow + 2}`).value = `Total Cost: $${totalCost.toFixed(2)}`;
            worksheet.getCell(`A${summaryRow + 3}`).value = `Average Cost: $${avgCost.toFixed(2)}`;

            // Auto-fit columns
            worksheet.columns.forEach(column => {
                column.width = 20;
            });

            // Save file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'monthly-maintenance-summary.xlsx';
            link.click();
            URL.revokeObjectURL(url);

            toast.success('Monthly maintenance Excel report generated successfully!');
        } catch (error) {
            toast.error('Failed to generate monthly maintenance Excel report');
            console.error('Excel generation error:', error);
        }
    };

    const handleGenerateReport = async () => {
        switch (reportType) {
            case 'all-cars':
                await generateAllCarsReport();
                break;
            case 'service-history':
                const carId = prompt('Enter car ID for service history report:');
                if (carId) {
                    await generateServiceHistoryReport(carId);
                }
                break;
            case 'monthly-maintenance':
                await generateMonthlyMaintenanceReport();
                break;
            default:
                toast.error('Invalid report type');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Generate Excel Report
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-gray-600">
                        Generate an Excel report for: <strong>{reportType}</strong>
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleGenerateReport}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                        📊 Generate Excel Report
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        The Excel file will be automatically downloaded to your device
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExcelReportGenerator;
