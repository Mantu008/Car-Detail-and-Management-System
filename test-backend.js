// Simple script to test if the backend server is running
const axios = require('axios');

async function testBackend() {
    console.log('🔍 Testing backend server...');
    
    try {
        // Test cars endpoint
        console.log('Testing /api/cars endpoint...');
        const carsResponse = await axios.get('http://localhost:5000/api/cars');
        console.log('✅ Cars API working!');
        console.log('Response:', carsResponse.data);
        console.log('Number of cars:', Array.isArray(carsResponse.data) ? carsResponse.data.length : 
                   (carsResponse.data.data ? carsResponse.data.data.length : 'Unknown structure'));
        
    } catch (error) {
        console.log('❌ Cars API failed!');
        console.log('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Backend server is not running. Start it with:');
            console.log('   cd backend && npm start');
        } else if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data);
        }
    }
    
    try {
        // Test services endpoint
        console.log('\nTesting /api/services endpoint...');
        const servicesResponse = await axios.get('http://localhost:5000/api/services');
        console.log('✅ Services API working!');
        console.log('Response:', servicesResponse.data);
        
    } catch (error) {
        console.log('❌ Services API failed!');
        console.log('Error:', error.message);
        
        if (error.response && error.response.status === 401) {
            console.log('💡 Services API requires authentication (this is normal)');
        }
    }
}

testBackend();
