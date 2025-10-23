import React, { useState } from 'react';
import { toast } from 'react-toastify';

const QRCodeScanner = ({ onClose, onScanResult }) => {
    const [scannedData, setScannedData] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    const handleManualInput = () => {
        const input = prompt('Enter QR code data manually:');
        if (input) {
            try {
                const parsedData = JSON.parse(input);
                setScannedData(parsedData);
                if (onScanResult) {
                    onScanResult(parsedData);
                }
                toast.success('QR code data processed successfully!');
            } catch (error) {
                toast.error('Invalid QR code data format');
            }
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileType = file.type;
            const fileName = file.name.toLowerCase();

            if (fileType === 'application/json' || fileName.endsWith('.json')) {
                // Handle JSON files
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target.result;
                        const parsedData = JSON.parse(content);
                        setScannedData(parsedData);
                        if (onScanResult) {
                            onScanResult(parsedData);
                        }
                        toast.success('QR code data loaded from JSON file!');
                    } catch (error) {
                        toast.error('Invalid JSON file format');
                    }
                };
                reader.readAsText(file);
            } else if (fileType === 'image/png' || fileName.endsWith('.png')) {
                // Handle PNG files (QR code images)
                toast.info('PNG files detected. Please use manual input or copy the QR code data from the downloaded JSON file.');
            } else if (fileName.endsWith('.txt')) {
                // Handle text files
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target.result;
                        const parsedData = JSON.parse(content);
                        setScannedData(parsedData);
                        if (onScanResult) {
                            onScanResult(parsedData);
                        }
                        toast.success('QR code data loaded from text file!');
                    } catch (error) {
                        toast.error('Invalid text file format');
                    }
                };
                reader.readAsText(file);
            } else {
                toast.error('Unsupported file type. Please upload JSON or TXT files.');
            }
        }
    };

    const handleNavigateToCar = () => {
        if (scannedData && scannedData.carUrl) {
            window.open(scannedData.carUrl, '_blank');
        }
    };

    const handleNavigateToServices = () => {
        if (scannedData && scannedData.serviceHistoryUrl) {
            window.open(scannedData.serviceHistoryUrl, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        QR Code Scanner
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="text-center mb-6">
                    <div className="bg-gray-100 rounded-lg p-8 mb-4">
                        <div className="text-6xl mb-4">📱</div>
                        <p className="text-gray-600 mb-2">
                            Scan a car QR code or use the manual options below
                        </p>
                        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                            <p><strong>💡 Tip:</strong> Download the JSON file from the QR code generator for easy upload!</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <button
                        onClick={handleManualInput}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                        📝 Enter QR Data Manually
                    </button>

                    <label className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer block text-center">
                        📁 Upload QR Data File (JSON/TXT)
                        <input
                            type="file"
                            accept=".json,.txt,.png"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>

                {scannedData && (
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Scanned Car Data:
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <span className="text-sm font-medium text-gray-600">Brand:</span>
                                <p className="font-semibold">{scannedData.brand}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600">Model:</span>
                                <p className="font-semibold">{scannedData.model}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600">Year:</span>
                                <p className="font-semibold">{scannedData.year}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600">Price:</span>
                                <p className="font-semibold text-green-600">${scannedData.price?.toLocaleString()}</p>
                            </div>
                        </div>

                        {scannedData.owner && (
                            <div className="mb-4 p-3 bg-white rounded border">
                                <span className="text-sm font-medium text-gray-600">Owner:</span>
                                <p className="font-semibold">{scannedData.owner.name}</p>
                                <p className="text-sm text-gray-600">{scannedData.owner.email}</p>
                            </div>
                        )}

                        <div className="flex space-x-2">
                            {scannedData.carUrl && (
                                <button
                                    onClick={handleNavigateToCar}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                    🔗 View Car Details
                                </button>
                            )}

                            {scannedData.serviceHistoryUrl && (
                                <button
                                    onClick={handleNavigateToServices}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                    🔧 View Service History
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        QR codes contain car information and direct links to details and service history
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        For PNG files: Use the downloaded JSON file instead, or copy the QR data manually
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRCodeScanner;
