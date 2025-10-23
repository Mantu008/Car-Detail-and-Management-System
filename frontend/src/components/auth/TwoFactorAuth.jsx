import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import axios from 'axios';

const TwoFactorAuth = ({ user, onSetupComplete, onClose }) => {
    const [step, setStep] = useState(1); // 1: Setup, 2: Verify, 3: Complete
    const [secret, setSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [backupCodes, setBackupCodes] = useState([]);

    useEffect(() => {
        if (step === 1) {
            generateSecret();
        }
    }, [step]);

    const generateSecret = async () => {
        try {
            const response = await axios.post('/api/auth/2fa/setup', {
                userId: user._id,
                email: user.email
            });

            setSecret(response.data.secret);
            setQrCodeUrl(response.data.qrCodeUrl);
        } catch (error) {
            toast.error('Failed to generate 2FA secret');
            console.error('2FA setup error:', error);
        }
    };

    const verifyCode = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        setIsVerifying(true);
        try {
            const response = await axios.post('/api/auth/2fa/verify', {
                userId: user._id,
                code: verificationCode,
                secret: secret
            });

            if (response.data.valid) {
                setBackupCodes(response.data.backupCodes);
                setStep(3);
                toast.success('2FA setup completed successfully!');
            } else {
                toast.error('Invalid verification code');
            }
        } catch (error) {
            toast.error('Failed to verify code');
            console.error('2FA verification error:', error);
        } finally {
            setIsVerifying(false);
        }
    };

    const completeSetup = () => {
        onSetupComplete();
        onClose();
    };

    const copyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText).then(() => {
            toast.success('Backup codes copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy backup codes');
        });
    };

    const downloadBackupCodes = () => {
        const codesText = `Car Management System - 2FA Backup Codes\n\n${backupCodes.join('\n')}\n\nGenerated: ${new Date().toLocaleString()}\n\nKeep these codes safe! Each can only be used once.`;

        const blob = new Blob([codesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '2fa-backup-codes.txt';
        link.click();
        URL.revokeObjectURL(url);

        toast.success('Backup codes downloaded!');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Two-Factor Authentication Setup
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {step === 1 && (
                    <div className="text-center">
                        <div className="text-6xl mb-4">🔐</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Step 1: Scan QR Code
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                        </p>

                        {qrCodeUrl && (
                            <div className="flex justify-center mb-6">
                                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                    <QRCode
                                        value={qrCodeUrl}
                                        size={200}
                                        level="M"
                                        includeMargin={true}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-blue-800 mb-2">Popular Authenticator Apps:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Google Authenticator</li>
                                <li>• Microsoft Authenticator</li>
                                <li>• Authy</li>
                                <li>• 1Password</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                        >
                            I've Added the Account
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="text-center">
                        <div className="text-6xl mb-4">🔢</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Step 2: Verify Code
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Enter the 6-digit code from your authenticator app
                        </p>

                        <div className="max-w-xs mx-auto mb-6">
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength="6"
                            />
                        </div>

                        <div className="flex space-x-4 justify-center">
                            <button
                                onClick={() => setStep(1)}
                                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={verifyCode}
                                disabled={isVerifying || verificationCode.length !== 6}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                {isVerifying ? 'Verifying...' : 'Verify Code'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Step 3: Backup Codes
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Save these backup codes in a safe place. Each code can only be used once.
                        </p>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-2">
                                {backupCodes.map((code, index) => (
                                    <div key={index} className="font-mono text-sm bg-white p-2 rounded border">
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex space-x-4 justify-center mb-6">
                            <button
                                onClick={copyBackupCodes}
                                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                📋 Copy Codes
                            </button>
                            <button
                                onClick={downloadBackupCodes}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                💾 Download
                            </button>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800 text-sm">
                                <strong>Important:</strong> Store these codes securely. If you lose access to your authenticator app,
                                you'll need these codes to regain access to your account.
                            </p>
                        </div>

                        <button
                            onClick={completeSetup}
                            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                        >
                            Complete Setup
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        2FA adds an extra layer of security to your account
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorAuth;
