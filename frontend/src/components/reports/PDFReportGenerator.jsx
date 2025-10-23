import React from 'react';
import { toast } from 'react-toastify';
import { generateSimplePDF } from '../../utils/pdfGenerator';

// Dynamic import for jsPDF to handle potential loading issues
const loadJsPDF = async () => {
    try {
        const jsPDF = (await import('jspdf')).default;
        await import('jspdf-autotable');
        return jsPDF;
    } catch (error) {
        console.error('Failed to load jsPDF:', error);
        throw new Error('PDF library failed to load');
    }
};

// Fallback PDF generation using browser's print functionality
const generateFallbackPDF = (title, content) => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            ${content}
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
};

const PDFReportGenerator = ({ cars, services, reportType, onClose }) => {
    const generateAllCarsReport = async () => {
        try {
            console.log('Generating PDF report with:', { cars: cars?.length, services: services?.length, reportType });

            // Load jsPDF dynamically
            const jsPDF = await loadJsPDF();
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text('Car Management System - All Cars Report', 20, 20);
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

            if (!cars || cars.length === 0) {
                doc.setFontSize(14);
                doc.text('No cars found in the system.', 20, 50);
                doc.save('all-cars-report.pdf');
                toast.success('PDF report generated successfully!');
                return;
            }

            // Cars table data
            const tableData = cars.map(car => [
                car.brand || 'N/A',
                car.model || 'N/A',
                car.year || 'N/A',
                `$${car.price?.toLocaleString() || '0'}`,
                car.color || 'N/A',
                car.mileage ? `${car.mileage.toLocaleString()} miles` : 'N/A',
                car.owner?.name || 'N/A'
            ]);

            doc.autoTable({
                head: [['Brand', 'Model', 'Year', 'Price', 'Color', 'Mileage', 'Owner']],
                body: tableData,
                startY: 40,
                styles: { fontSize: 10 },
                headStyles: { fillColor: [66, 139, 202] }
            });

            // Summary
            const totalCars = cars.length;
            const totalValue = cars.reduce((sum, car) => sum + (car.price || 0), 0);
            const avgPrice = totalValue / totalCars;

            doc.setFontSize(12);
            doc.text('Summary:', 20, doc.lastAutoTable.finalY + 20);
            doc.text(`Total Cars: ${totalCars}`, 20, doc.lastAutoTable.finalY + 30);
            doc.text(`Total Value: $${totalValue.toLocaleString()}`, 20, doc.lastAutoTable.finalY + 40);
            doc.text(`Average Price: $${avgPrice.toLocaleString()}`, 20, doc.lastAutoTable.finalY + 50);

            doc.save('all-cars-report.pdf');
            toast.success('PDF report generated successfully!');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('PDF library failed, using fallback method...');

            // Use fallback method
            try {
                const tableData = cars.map(car => [
                    car.brand || 'N/A',
                    car.model || 'N/A',
                    car.year || 'N/A',
                    `$${car.price?.toLocaleString() || '0'}`,
                    car.color || 'N/A',
                    car.mileage ? `${car.mileage.toLocaleString()} miles` : 'N/A',
                    car.owner?.name || 'N/A'
                ]);

                const tableHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Brand</th>
                                <th>Model</th>
                                <th>Year</th>
                                <th>Price</th>
                                <th>Color</th>
                                <th>Mileage</th>
                                <th>Owner</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableData.map(row => `
                                <tr>
                                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;

                generateFallbackPDF('Car Management System - All Cars Report', tableHTML);
                toast.success('PDF report generated using fallback method!');
            } catch (fallbackError) {
                console.error('Fallback PDF generation failed:', fallbackError);
                // Try the simple PDF generator as last resort
                const success = generateSimplePDF('Car Management System - All Cars Report', cars, 'cars');
                if (success) {
                    toast.success('PDF report generated using simple method!');
                } else {
                    toast.error('All PDF generation methods failed');
                }
            }
        }
    };

    const generateServiceHistoryReport = async (carId) => {
        try {
            const car = cars.find(c => c._id === carId);
            const carServices = services.filter(s => s.car === carId);

            // Load jsPDF dynamically
            const jsPDF = await loadJsPDF();
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text('Service History Report', 20, 20);
            doc.setFontSize(12);
            doc.text(`Car: ${car?.brand || 'Unknown'} ${car?.model || 'Unknown'} (${car?.year || 'Unknown'})`, 20, 30);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);

            if (carServices.length === 0) {
                doc.text('No service records found for this car.', 20, 60);
            } else {
                // Services table data
                const tableData = carServices.map(service => [
                    new Date(service.date).toLocaleDateString(),
                    service.serviceType,
                    service.description,
                    `$${service.cost?.toFixed(2)}`,
                    service.serviceProvider || 'N/A'
                ]);

                doc.autoTable({
                    head: [['Date', 'Type', 'Description', 'Cost', 'Provider']],
                    body: tableData,
                    startY: 50,
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [66, 139, 202] }
                });

                // Summary
                const totalCost = carServices.reduce((sum, service) => sum + (service.cost || 0), 0);
                const avgCost = totalCost / carServices.length;

                doc.setFontSize(12);
                doc.text('Service Summary:', 20, doc.lastAutoTable.finalY + 20);
                doc.text(`Total Services: ${carServices.length}`, 20, doc.lastAutoTable.finalY + 30);
                doc.text(`Total Cost: $${totalCost.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 40);
                doc.text(`Average Cost: $${avgCost.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 50);
            }

            doc.save(`${car?.brand}-${car?.model}-service-history.pdf`);
            toast.success('Service history PDF generated successfully!');
        } catch (error) {
            toast.error('Failed to generate service history PDF');
            console.error('PDF generation error:', error);
        }
    };

    const generateMonthlyMaintenanceReport = async () => {
        try {
            // Load jsPDF dynamically
            const jsPDF = await loadJsPDF();
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text('Monthly Maintenance Cost Summary', 20, 20);
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

            if (!services || services.length === 0) {
                doc.setFontSize(14);
                doc.text('No service records found.', 20, 50);
                doc.save('monthly-maintenance-summary.pdf');
                toast.success('PDF report generated successfully!');
                return;
            }

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

            // Monthly summary table
            const tableData = Object.entries(monthlyData).map(([month, data]) => [
                month,
                data.count,
                `$${data.totalCost.toFixed(2)}`,
                `$${(data.totalCost / data.count).toFixed(2)}`
            ]);

            doc.autoTable({
                head: [['Month', 'Services', 'Total Cost', 'Avg Cost']],
                body: tableData,
                startY: 40,
                styles: { fontSize: 10 },
                headStyles: { fillColor: [66, 139, 202] }
            });

            // Overall summary
            const totalServices = services.length;
            const totalCost = services.reduce((sum, service) => sum + (service.cost || 0), 0);
            const avgCost = totalCost / totalServices;

            doc.setFontSize(12);
            doc.text('Overall Summary:', 20, doc.lastAutoTable.finalY + 20);
            doc.text(`Total Services: ${totalServices}`, 20, doc.lastAutoTable.finalY + 30);
            doc.text(`Total Cost: $${totalCost.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 40);
            doc.text(`Average Cost: $${avgCost.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 50);

            doc.save('monthly-maintenance-summary.pdf');
            toast.success('Monthly maintenance PDF generated successfully!');
        } catch (error) {
            toast.error('Failed to generate monthly maintenance PDF');
            console.error('PDF generation error:', error);
        }
    };

    const handleGenerateReport = async () => {
        try {
            switch (reportType) {
                case 'all-cars':
                    await generateAllCarsReport();
                    break;
                case 'service-history':
                    // For service history, we need to select a car
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
        } catch (error) {
            console.error('Report generation failed:', error);
            toast.error(`Failed to generate PDF: ${error.message}`);
        } finally {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Generate PDF Report
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-gray-600">
                        Generate a PDF report for: <strong>{reportType}</strong>
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleGenerateReport}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                        📄 Generate PDF Report
                    </button>

                    <button
                        onClick={async () => {
                            try {
                                await loadJsPDF();
                                toast.success('PDF library is working correctly!');
                            } catch (error) {
                                toast.error(`PDF library test failed: ${error.message}`);
                            }
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        🧪 Test PDF Library
                    </button>

                    <button
                        onClick={() => {
                            const success = generateSimplePDF(
                                `Car Management System - ${reportType.replace('-', ' ').toUpperCase()} Report`,
                                reportType === 'all-cars' ? cars : services,
                                reportType === 'all-cars' ? 'cars' : 'services'
                            );
                            if (success) {
                                toast.success('Simple PDF generated successfully!');
                                onClose();
                            } else {
                                toast.error('Simple PDF generation failed');
                            }
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        📄 Generate Simple PDF
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
                        The report will be automatically downloaded to your device
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PDFReportGenerator;
