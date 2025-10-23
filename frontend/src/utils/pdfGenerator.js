// Alternative PDF generation utility
export const generateSimplePDF = (title, data, type = 'cars') => {
    try {
        // Create a simple HTML table
        let tableHTML = '';
        
        if (type === 'cars' && data.length > 0) {
            tableHTML = `
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ddd; padding: 8px;">Brand</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Model</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Year</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Color</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Mileage</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Owner</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(car => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">${car.brand || 'N/A'}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${car.model || 'N/A'}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${car.year || 'N/A'}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">$${car.price?.toLocaleString() || '0'}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${car.color || 'N/A'}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${car.mileage ? `${car.mileage.toLocaleString()} miles` : 'N/A'}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${car.owner?.name || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else if (type === 'services' && data.length > 0) {
            tableHTML = `
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Type</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Cost</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Provider</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(service => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">${new Date(service.date).toLocaleDateString()}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${service.serviceType || 'N/A'}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${service.description || 'N/A'}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">$${service.cost?.toFixed(2) || '0.00'}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${service.serviceProvider || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        // Create the full HTML document
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        line-height: 1.6;
                    }
                    h1 { 
                        color: #333; 
                        border-bottom: 2px solid #333;
                        padding-bottom: 10px;
                    }
                    .summary {
                        background-color: #f9f9f9;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
                
                ${data.length === 0 ? '<p>No data available.</p>' : tableHTML}
                
                ${data.length > 0 ? `
                    <div class="summary">
                        <h3>Summary</h3>
                        <p><strong>Total Records:</strong> ${data.length}</p>
                        ${type === 'cars' ? `
                            <p><strong>Total Value:</strong> $${data.reduce((sum, car) => sum + (car.price || 0), 0).toLocaleString()}</p>
                            <p><strong>Average Price:</strong> $${(data.reduce((sum, car) => sum + (car.price || 0), 0) / data.length).toLocaleString()}</p>
                        ` : `
                            <p><strong>Total Cost:</strong> $${data.reduce((sum, service) => sum + (service.cost || 0), 0).toFixed(2)}</p>
                            <p><strong>Average Cost:</strong> $${(data.reduce((sum, service) => sum + (service.cost || 0), 0) / data.length).toFixed(2)}</p>
                        `}
                    </div>
                ` : ''}
                
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                        🖨️ Print as PDF
                    </button>
                </div>
            </body>
            </html>
        `;

        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Auto-print after a short delay
        setTimeout(() => {
            printWindow.print();
        }, 500);

        return true;
    } catch (error) {
        console.error('Simple PDF generation failed:', error);
        return false;
    }
};
