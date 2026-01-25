const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Car = require("./models/Car");
const Service = require("./models/Service");
const Announcement = require("./models/Announcement");
const SupportTicket = require("./models/SupportTicket");

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI ||
                "mongodb://localhost:27017/car-management-system"
        );
        console.log("MongoDB Connected for seeding...");
    } catch (error) {
        console.error("Database connection error:", error.message);
        process.exit(1);
    }
};

// Sample data
const sampleUsers = [
    {
        name: "John Smith",
        email: "john@example.com",
        password: "password123",
        role: "admin",
    },
    {
        name: "Alice Johnson",
        email: "alice@example.com",
        password: "password123",
        role: "user",
    },
    {
        name: "Bob Wilson",
        email: "bob@example.com",
        password: "password123",
        role: "user",
    },
    {
        name: "Sarah Davis",
        email: "sarah@example.com",
        password: "password123",
        role: "user",
    },
    {
        name: "Mike Brown",
        email: "mike@example.com",
        password: "password123",
        role: "user",
    },
];

const sampleCars = [
    {
        brand: "Toyota",
        model: "Camry",
        year: 2020,
        price: 2075000, // $25,000 × 83
        color: "Silver",
        mileage: 35000,
        description:
            "Well-maintained family sedan with excellent fuel economy.",
        type: "Car",
    },
    {
        brand: "Honda",
        model: "Civic",
        year: 2019,
        price: 1826000, // $22,000 × 83
        color: "Blue",
        mileage: 42000,
        description: "Reliable compact car perfect for city driving.",
        type: "Car",
    },
    {
        brand: "BMW",
        model: "X5",
        year: 2021,
        price: 4565000, // $55,000 × 83
        color: "Black",
        mileage: 18000,
        description:
            "Luxury SUV with advanced technology and premium features.",
        type: "Car",
    },
    {
        brand: "Ford",
        model: "F-150",
        year: 2020,
        price: 3735000, // $45,000 × 83
        color: "White",
        mileage: 28000,
        description: "Powerful pickup truck ideal for work and recreation.",
        type: "Truck",
    },
    {
        brand: "Tesla",
        model: "Model 3",
        year: 2022,
        price: 3984000, // $48,000 × 83
        color: "Red",
        mileage: 12000,
        description:
            "Electric vehicle with cutting-edge technology and autopilot features.",
        type: "Car",
    },
    {
        brand: "Mercedes-Benz",
        model: "C-Class",
        year: 2021,
        price: 3486000, // $42,000 × 83
        color: "Gray",
        mileage: 15000,
        description: "Luxury sedan with premium interior and smooth ride.",
        type: "Car",
    },
    {
        brand: "Nissan",
        model: "Altima",
        year: 2019,
        price: 1577000, // $19,000 × 83
        color: "White",
        mileage: 38000,
        description: "Comfortable midsize sedan with good reliability.",
        type: "Car",
    },
    {
        brand: "Audi",
        model: "A4",
        year: 2020,
        price: 3154000, // $38,000 × 83
        color: "Black",
        mileage: 22000,
        description: "German engineering meets luxury and performance.",
        type: "Car",
    },
];

const sampleServices = [
    {
        description: "Regular oil change and filter replacement",
        cost: 6225, // $75 × 83
        serviceType: "maintenance",
        serviceProvider: "Quick Lube Express",
    },
    {
        description: "Brake pad replacement and rotor resurfacing",
        cost: 29050, // $350 × 83
        serviceType: "repair",
        serviceProvider: "Auto Repair Center",
    },
    {
        description: "Annual safety inspection",
        cost: 3735, // $45 × 83
        serviceType: "inspection",
        serviceProvider: "State Inspection Station",
    },
    {
        description: "Transmission fluid change",
        cost: 9960, // $120 × 83
        serviceType: "maintenance",
        serviceProvider: "Transmission Specialists",
    },
    {
        description: "Air conditioning system repair",
        cost: 23240, // $280 × 83
        serviceType: "repair",
        serviceProvider: "AC Pro Services",
    },
    {
        description: "Tire rotation and alignment",
        cost: 7055, // $85 × 83
        serviceType: "maintenance",
        serviceProvider: "Tire World",
    },
    {
        description: "Battery replacement",
        cost: 12450, // $150 × 83
        serviceType: "repair",
        serviceProvider: "Battery Plus",
    },
    {
        description: "Spark plug replacement",
        cost: 7885, // $95 × 83
        serviceType: "maintenance",
        serviceProvider: "Engine Masters",
    },
    {
        description: "Windshield replacement",
        cost: 33200, // $400 × 83
        serviceType: "repair",
        serviceProvider: "Glass Doctor",
    },
    {
        description: "Emissions testing",
        cost: 2075, // $25 × 83
        serviceType: "inspection",
        serviceProvider: "Emissions Testing Center",
    },
];

const seedDatabase = async () => {
    try {
        // Clear existing data
        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Car.deleteMany({});
        await Service.deleteMany({});
        await Announcement.deleteMany({});
        await SupportTicket.deleteMany({});

        // Create users
        console.log("Creating users...");
        const users = [];
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            users.push(user);
            console.log(`Created user: ${user.name} (${user.email})`);
        }

        // Create cars
        console.log("Creating cars...");
        const cars = [];
        for (let i = 0; i < sampleCars.length; i++) {
            const carData = {
                ...sampleCars[i],
                owner: users[i % users.length]._id, // Distribute cars among users
            };
            const car = new Car(carData);
            await car.save();
            cars.push(car);
            console.log(`Created car: ${car.brand} ${car.model} (${car.year})`);
        }

        // Create services
        console.log("Creating services...");
        const services = [];
        for (let i = 0; i < sampleServices.length; i++) {
            const serviceData = {
                ...sampleServices[i],
                car: cars[i % cars.length]._id, // Distribute services among cars
                date: new Date(
                    Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
                ), // Random date within last year
            };
            const service = new Service(serviceData);
            await service.save();
            services.push(service);
            console.log(
                `Created service: ${service.description} - ₹${service.cost}`
            );

            // Add service to car's services array
            await Car.findByIdAndUpdate(
                service.car,
                { $push: { services: service._id } },
                { new: true }
            );
        }

        // Create announcements
        console.log("Creating announcements...");
        const sampleAnnouncements = [
            {
                title: "Welcome to the New System!",
                message:
                    "We have upgraded our vehicle management system with new features.",
                type: "info",
                createdBy: users[0]._id,
            },
            {
                title: "Maintenance Schedule Update",
                message:
                    "Please check your vehicle service dates for the upcoming month.",
                type: "warning",
                createdBy: users[0]._id,
            },
        ];
        for (const announcementData of sampleAnnouncements) {
            const announcement = new Announcement(announcementData);
            await announcement.save();
            console.log(`Created announcement: ${announcement.title}`);
        }

        // Create support tickets
        console.log("Creating support tickets...");
        const sampleTickets = [
            {
                user: users[1]._id,
                subject: "Cannot upload image",
                message:
                    "I am trying to upload a photo of my Camry but it fails.",
                status: "open",
                priority: "high",
            },
            {
                user: users[2]._id,
                subject: "Service record missing",
                message: "My last oil change record is not showing up.",
                status: "resolved",
                priority: "medium",
                adminResponse:
                    "We have updated your records. Please check again.",
            },
        ];
        for (const ticketData of sampleTickets) {
            const ticket = new SupportTicket(ticketData);
            await ticket.save();
            console.log(`Created support ticket: ${ticket.subject}`);
        }

        console.log("\n🎉 Database seeded successfully!");
        console.log(`\n📊 Summary:`);
        console.log(`- Users: ${users.length}`);
        console.log(`- Cars: ${cars.length}`);
        console.log(`- Services: ${services.length}`);
        console.log(`\n🔑 Admin Login Credentials:`);
        console.log(`Email: john@example.com`);
        console.log(`Password: password123`);
        console.log(`\n👥 User Login Credentials:`);
        console.log(`Email: alice@example.com`);
        console.log(`Password: password123`);
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close();
        console.log("\nDatabase connection closed.");
    }
};

// Run the seed function
connectDB().then(() => {
    seedDatabase();
});
