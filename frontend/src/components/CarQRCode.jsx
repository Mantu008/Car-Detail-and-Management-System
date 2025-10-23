import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';

const CarQRCode = ({ car, onClose }) => {
    const [showQR, setShowQR] = useState(false);

    // Generate QR code data with car information
    const generateQRData = () => {
        const baseUrl = window.location.origin;
        const carUrl = `${baseUrl}/cars/${car._id}`;

        const qrData = {
            carId: car._id,
            brand: car.brand,
            model: car.model,
            year: car.year,
            price: car.price,
            color: car.color,
            mileage: car.mileage,
            description: car.description,
            carUrl: carUrl,
            serviceHistoryUrl: `${baseUrl}/cars/${car._id}#services`,
            generatedAt: new Date().toISOString(),
            owner: car.owner ? {
                name: car.owner.name,
                email: car.owner.email
            } : null
        };

        return JSON.stringify(qrData, null, 2);
    };

    const handleDownloadQR = () => {
        try {
            const svg = document.getElementById('car-qr-code');
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `${car.brand}-${car.model}-${car.year}-QR.png`;
                downloadLink.href = pngFile;
                downloadLink.click();

                toast.success('QR Code downloaded successfully!');
            };

            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        } catch (error) {
            toast.error('Failed to download QR code');
            console.error('Download error:', error);
        }
    };

    const handleDownloadData = () => {
        try {
            const qrData = generateQRData();
            const blob = new Blob([qrData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.download = `${car.brand}-${car.model}-${car.year}-data.json`;
            downloadLink.href = url;
            downloadLink.click();
            URL.revokeObjectURL(url);

            toast.success('Car data downloaded as JSON!');
        } catch (error) {
            toast.error('Failed to download car data');
            console.error('Download error:', error);
        }
    };

    const handleCopyData = () => {
        const qrData = generateQRData();
        navigator.clipboard.writeText(qrData).then(() => {
            toast.success('Car data copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy data');
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Car QR Code
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {car.brand} {car.model} ({car.year})
                    </h3>
                    <p className="text-sm text-gray-600">
                        Scan this QR code to access car details and service history
                    </p>
                </div>

                <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                        <QRCode
                            id="car-qr-code"
                            value={generateQRData()}
                            size={200}
                            level="M"
                            includeMargin={true}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleDownloadQR}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        📥 Download QR Code (PNG)
                    </button>

                    <button
                        onClick={handleDownloadData}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        📄 Download Car Data (JSON)
                    </button>

                    <button
                        onClick={handleCopyData}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        📋 Copy Car Data
                    </button>

                    <button
                        onClick={() => setShowQR(!showQR)}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        {showQR ? 'Hide' : 'Show'} QR Data
                    </button>
                </div>

                {showQR && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            QR Code Data:
                        </h4>
                        <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                            {generateQRData()}
                        </pre>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        This QR code contains car details and links to service history
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CarQRCode;
