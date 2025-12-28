const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const { initializeSocket } = require("./config/socket");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS - More permissive for development

app.use(
    cors({
        origin: "*", // ✅ allow all origins
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Serve static files from uploads directory (only for local development)
if (process.env.VERCEL !== "1") {
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/auth/2fa", require("./routes/authRoutes"));

app.get("/", (req, res) => {
    res.send("Car Management System API is running");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Car Management System API is running",
        timestamp: new Date().toISOString(),
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!",
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `🚗 Car Management System Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
});

module.exports = { app, server };
