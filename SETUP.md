# Car Detail and Management System - Setup Guide

This guide will help you set up and run the Car Detail and Management System on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (version 4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Car-Detail-and-Management-System
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit the .env file with your configuration
# You can use any text editor to modify the values
```

**Environment Variables:**
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment mode (development/production)
- `CLIENT_URL`: Frontend URL for CORS

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit the .env file with your configuration
```

**Environment Variables:**
- `VITE_API_URL`: Backend API URL (default: http://localhost:5000)

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB service (macOS/Linux)
sudo systemctl start mongod
# or
brew services start mongodb-community
```

The application will automatically create the database and collections when you first run it.

## Running the Application

### Start the Backend Server

```bash
# From the backend directory
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

### Start the Frontend Application

```bash
# From the frontend directory (in a new terminal)
cd frontend
npm run dev
```

The frontend application will start on `http://localhost:3000`

## Testing the Application

1. Open your browser and go to `http://localhost:3000`
2. Register a new account or login
3. Add your first car
4. Add service records
5. Explore all features

## Default Admin Account

To create an admin account, you can either:

1. **Register normally and manually update in database:**
   ```javascript
   // In MongoDB shell or MongoDB Compass
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Create admin account directly in database:**
   ```javascript
   // In MongoDB shell
   db.users.insertOne({
     name: "Admin User",
     email: "admin@example.com",
     password: "$2a$10$...", // hashed password
     role: "admin",
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create new car (protected)
- `PUT /api/cars/:id` - Update car (protected)
- `DELETE /api/cars/:id` - Delete car (protected)
- `GET /api/cars/my-cars` - Get user's cars (protected)

### Services
- `GET /api/services/:carId` - Get car services (protected)
- `POST /api/services` - Create new service (protected)
- `PUT /api/services/:id` - Update service (protected)
- `DELETE /api/services/:id` - Delete service (protected)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Make sure MongoDB is running
   - Check the connection string in `.env` file
   - Verify MongoDB port (default: 27017)

2. **Port Already in Use:**
   - Change the PORT in backend `.env` file
   - Or kill the process using the port

3. **CORS Issues:**
   - Check CLIENT_URL in backend `.env` file
   - Make sure frontend and backend URLs match

4. **JWT Token Issues:**
   - Make sure JWT_SECRET is set in backend `.env`
   - Clear browser localStorage if having authentication issues

### Getting Help

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Make sure all dependencies are installed
4. Ensure MongoDB is running and accessible

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend `.env`
2. Use a secure JWT secret
3. Set up MongoDB Atlas or a production MongoDB instance
4. Update CORS settings for production domain
5. Build the frontend: `npm run build`
6. Deploy backend to services like Heroku, Railway, or AWS
7. Deploy frontend to services like Vercel, Netlify, or AWS

## Features

- ✅ User Registration and Authentication
- ✅ JWT-based Security
- ✅ Car Management (CRUD operations)
- ✅ Service History Tracking
- ✅ Role-based Access Control
- ✅ Responsive Design with Tailwind CSS
- ✅ Toast Notifications
- ✅ Search and Filter Functionality
- ✅ Admin Panel Features
