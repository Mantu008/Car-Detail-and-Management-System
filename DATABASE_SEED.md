# Database Seeding Guide

This guide explains how to populate your database with sample data for testing and development.

## 🗄️ Sample Data Overview

The seed script creates realistic sample data including:

### 👥 Users (5 users)
- **1 Admin User**: john@example.com
- **4 Regular Users**: alice@example.com, bob@example.com, sarah@example.com, mike@example.com

### 🚗 Cars (8 cars)
- Toyota Camry 2020 - $25,000
- Honda Civic 2019 - $22,000
- BMW X5 2021 - $55,000
- Ford F-150 2020 - $45,000
- Tesla Model 3 2022 - $48,000
- Mercedes-Benz C-Class 2021 - $42,000
- Nissan Altima 2019 - $19,000
- Audi A4 2020 - $38,000

### 🔧 Services (10 services)
- Oil changes, brake repairs, inspections, etc.
- Various service types: maintenance, repair, inspection
- Realistic pricing and service providers

## 🚀 How to Seed the Database

### Method 1: Using npm script (Recommended)

```bash
# From the project root directory
npm run seed
```

### Method 2: Direct backend command

```bash
# Navigate to backend directory
cd backend

# Run the seed script
npm run seed
```

### Method 3: Direct node command

```bash
# Navigate to backend directory
cd backend

# Run with node directly
node seed.js
```

## 📋 Prerequisites

Before running the seed script, make sure:

1. **MongoDB is running** on your system
2. **Environment variables are set** in your `.env` file
3. **Dependencies are installed** (`npm install` in backend directory)

## 🔑 Login Credentials

After seeding, you can use these credentials to test the application:

### Admin Account
- **Email**: john@example.com
- **Password**: password123
- **Role**: admin (can manage all cars and users)

### Regular User Accounts
- **Email**: alice@example.com
- **Password**: password123
- **Role**: user

- **Email**: bob@example.com
- **Password**: password123
- **Role**: user

- **Email**: sarah@example.com
- **Password**: password123
- **Role**: user

- **Email**: mike@example.com
- **Password**: password123
- **Role**: user

## 🗑️ Clearing Existing Data

The seed script automatically clears all existing data before adding new data. This ensures a clean slate for testing.

**⚠️ Warning**: This will delete all existing users, cars, and services in your database!

## 📊 Data Distribution

- **Cars are distributed** among users (each user gets 1-2 cars)
- **Services are distributed** among cars (each car gets 1-2 services)
- **Service dates** are randomized within the last year
- **Realistic pricing** and service descriptions

## 🔄 Re-running the Seed Script

You can run the seed script multiple times. Each time it will:
1. Clear all existing data
2. Create fresh sample data
3. Maintain the same structure and relationships

## 🛠️ Customizing Sample Data

To modify the sample data:

1. **Edit the seed.js file** in the backend directory
2. **Modify the arrays**:
   - `sampleUsers` - for user data
   - `sampleCars` - for car data
   - `sampleServices` - for service data
3. **Run the seed script** again

## 📈 Expected Output

When the seed script runs successfully, you should see:

```
MongoDB Connected for seeding...
Clearing existing data...
Creating users...
Created user: John Smith (john@example.com)
Created user: Alice Johnson (alice@example.com)
...
Creating cars...
Created car: Toyota Camry (2020)
Created car: Honda Civic (2019)
...
Creating services...
Created service: Regular oil change and filter replacement - $75
Created service: Brake pad replacement and rotor resurfacing - $350
...

🎉 Database seeded successfully!

📊 Summary:
- Users: 5
- Cars: 8
- Services: 10

🔑 Admin Login Credentials:
Email: john@example.com
Password: password123

👥 User Login Credentials:
Email: alice@example.com
Password: password123

Database connection closed.
```

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Error**: Make sure MongoDB is running
2. **Permission Error**: Check your MongoDB connection string
3. **Module Not Found**: Run `npm install` in the backend directory

### Getting Help:

If you encounter issues:
1. Check the console output for error messages
2. Verify your MongoDB connection
3. Ensure all dependencies are installed
4. Check your `.env` file configuration

## 🎯 Next Steps

After seeding your database:

1. **Start your application**: `npm run dev`
2. **Open the frontend**: http://localhost:3000
3. **Login with admin credentials**: john@example.com / password123
4. **Explore the features** with real data
5. **Test different user roles** and permissions
