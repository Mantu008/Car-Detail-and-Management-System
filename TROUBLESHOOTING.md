# 🔧 Troubleshooting Guide

## Report Generation Issues

### Problem: "⚠️ No cars found. Add some cars first to generate meaningful reports."

This error occurs when the Features Dashboard cannot fetch car data from the backend.

### Solutions:

#### 1. Check Backend Server
```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not done)
npm install

# Start the server
npm start
```

The backend should run on `http://localhost:5000`

#### 2. Test Backend Connectivity
```bash
# Run the test script
node test-backend.js
```

#### 3. Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages when loading the Features page
4. Check Network tab for failed API requests

#### 4. Verify Authentication
- Make sure you're logged in to the application
- Check if you have cars in your account
- Try accessing `/cars` page to see if cars load there

#### 5. API Endpoints
The following endpoints should be accessible:
- `GET /api/cars` - List all cars
- `GET /api/services` - List all services (requires admin access)

#### 6. Common Issues

**Backend not running:**
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```
Solution: Start the backend server

**Authentication required:**
```
Error: 401 Unauthorized
```
Solution: Make sure you're logged in

**No cars in database:**
```
Data loaded: 0 cars, 0 services
```
Solution: Add some cars through the application

**CORS issues:**
```
Error: CORS policy
```
Solution: Check backend CORS configuration

### Debug Steps:

1. **Check Backend Status:**
   ```bash
   curl http://localhost:5000/api/cars
   ```

2. **Check Frontend Console:**
   - Open browser dev tools
   - Look for network errors
   - Check console logs

3. **Verify Data:**
   - Go to `/cars` page
   - Check if cars are displayed
   - If no cars, add some first

4. **Test API Directly:**
   - Use the "🧪 Test API" button in Features Dashboard
   - Check console for detailed responses

### Quick Fixes:

1. **Refresh Data:** Click "🔄 Refresh Data" button
2. **Test API:** Click "🧪 Test API" button  
3. **Check Login:** Make sure you're logged in
4. **Add Cars:** If no cars exist, add some through the app
5. **Restart Backend:** Stop and start the backend server

### Still Having Issues?

1. Check the browser console for detailed error messages
2. Verify the backend server is running on port 5000
3. Make sure you have cars in your database
4. Try logging out and logging back in
5. Check if the frontend is connecting to the correct backend URL
