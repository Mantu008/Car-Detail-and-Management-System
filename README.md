# 🚗 Car Detail and Management System

The **Car Detail and Management System** is a robust, full-stack web application designed to simplify the management of car information, service history, and user data. It's built on the modern **MERN stack** with a responsive and sleek interface powered by **Tailwind CSS**.

-----

## 🎯 Objectives

  * To design and develop a web-based system for managing car details.
  * To provide a **responsive and modern UI** using React.js and Tailwind CSS.
  * To allow users to securely register, log in, and manage their car data.
  * To implement **CRUD operations** for cars and services.
  * To provide secure access control using **JWT-based authentication**.
  * To demonstrate integration between frontend, backend, and database layers in the MERN stack.

-----

## 🌐 Project Scope

The system will serve as a complete solution for small car dealerships or individual car owners to maintain car records.

It allows management of:

  * Car details (brand, model, year, price)
  * Service history
  * User registration and login
  * Admin management for cars and users

The system can be extended in the future to include features such as service reminders, car part inventory, or integration with payment gateways.

-----

## ⚙️ Technology Stack (MERN)

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React.js, Tailwind CSS, React Toastify** | For building responsive UI and user notifications. |
| **Backend** | **Node.js + Express.js** | For RESTful APIs and server-side logic. |
| **Database** | **MongoDB** | To store car details, users, and service data. |
| **Other Tools** | **Axios, Postman, JWT, dotenv** | API communication, testing, and authentication. |

-----

## ✨ System Features

### 👨‍💼 Admin Features

  * Add, edit, delete, and view all car details.
  * Manage user records (optional advanced feature).
  * View service history for each car.

### 🚗 User Features

  * Register and log in securely.
  * Add and update personal car information.
  * View car details and service records.
  * Receive feedback messages via **Toast notifications**.
  * **Generate QR codes** for each car containing details and service history links.
  * **Scan QR codes** to quickly access car information and service records.

-----

## 🏗️ System Architecture

The application follows a three-tier MERN stack architecture:

**React.js (Frontend + Tailwind + Toastify)**
$$\downarrow \text{ (Axios)}$$
**Express.js + Node.js (Backend API)**
$$\downarrow \text{ (Mongoose ODM)}$$
**MongoDB (Database)**

-----

## 💻 Frontend Details (React + Tailwind CSS)

### ⚙️ Setup

```bash
npx create-react-app car-management-frontend
npm install axios react-router-dom react-toastify
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 🧩 Components 

| Component | Description |
| :--- | :--- |
| **Navbar** | Responsive navigation bar (Home, Cars, Login, Logout). |
| **Login/Register** | User authentication pages. |
| **Dashboard** | Displays statistics and shortcuts. |
| **CarList** | Displays all cars in responsive cards or tables. |
| **CarForm** | Add/Edit car details. |
| **CarDetail** | Show individual car info and services. |
| **ServiceList / ServiceForm** | Manage service records. |
| **UserProfile** | Display user’s profile and cars. |

### 🎨 UI Styling (Tailwind CSS)

Tailwind utility classes ensure a mobile-friendly, modern layout.

  * **Buttons:** `bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2`
  * **Cards:** `bg-white shadow-lg rounded-xl p-4`
  * **Inputs:** `border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-400`

### 🔔 Notifications

Implemented using **React Toastify**:

```javascript
import { toast } from "react-toastify";
toast.success("Car added successfully!");
toast.error("Login failed!");
```

### 📱 QR Code Features

**QR Code Generation:**
- Each car can generate a unique QR code containing car details
- QR codes include car information, owner details, and service history links
- Downloadable QR codes as PNG images
- Copy car data to clipboard functionality

**QR Code Scanning:**
- Scan QR codes to quickly access car information
- Manual QR data input option
- File upload for QR data processing
- Direct navigation to car details and service history

```javascript
// QR Code contains structured data:
{
  "carId": "car_id",
  "brand": "Toyota",
  "model": "Camry",
  "year": 2020,
  "carUrl": "https://app.com/cars/car_id",
  "serviceHistoryUrl": "https://app.com/cars/car_id#services"
}
```

-----

## 💾 Backend Details (Node.js + Express.js)

### ⚙️ Setup

```bash
npm init -y
npm install express mongoose cors bcryptjs jsonwebtoken dotenv
```

### 📁 Folder Structure

```
backend/
│── server.js
│── config/db.js
│── models/
│   ├── Car.js
│   ├── User.js
│   ├── Service.js
│── routes/
│   ├── carRoutes.js
│   ├── userRoutes.js
│   ├── serviceRoutes.js
│── controllers/
│   ├── carController.js
│   ├── userController.js
│   ├── serviceController.js
│── middleware/authMiddleware.js
│── .env
```

### 🔗 API Endpoints

| Entity | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **User** | `POST` | `/api/users/register` | Register new user |
| **User** | `POST` | `/api/users/login` | Login and get token |
| **Car** | `GET` | `/api/cars` | Get all cars |
| **Car** | `GET` | `/api/cars/:id` | Get car by ID |
| **Car** | `POST` | `/api/cars` | Add new car |
| **Car** | `PUT` | `/api/cars/:id` | Update car |
| **Car** | `DELETE` | `/api/cars/:id` | Delete car |
| **Service**| `POST` | `/api/services` | Add service |
| **Service**| `GET` | `/api/services/:carId` | Get car services |

-----

## 🗄️ Database Design (MongoDB)

### 🧾 User Schema

```javascript
{
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
}
```

### 🚗 Car Schema

```javascript
{
  brand: String,
  model: String,
  year: Number,
  price: Number,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }]
}
```

### 🔧 Service Schema

```javascript
{
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  date: Date,
  description: String,
  cost: Number
}
```

-----

## 🔒 Authentication & Authorization

  * Implemented using **JWT (JSON Web Token)**.
  * On login, the backend generates a token stored in `localStorage`.
  * **Protected routes** (like Add Car, Delete Car) require a valid token.
  * Middleware validates user roles (`admin`/`user`) for authorization.

## 🤝 Integration

  * Frontend communicates with backend via **Axios**.
  * Toast notifications indicate success or error responses from API calls.
  * React Hooks (`useEffect`, `useState`) handle data fetching and updates.

-----

## ✅ Project Deliverables

  * Responsive React + Tailwind frontend
  * RESTful backend with Express and MongoDB
  * JWT-based authentication system
  * CRUD operations for Cars and Services
  * Project report and documentation
  * Optional deployment on Vercel, Render, and MongoDB Atlas

-----

## 📅 Suggested Timeline

| Week | Task |
| :--- | :--- |
| **1** | Requirement analysis & planning |
| **2** | Backend setup and database models |
| **3** | Develop API endpoints |
| **4** | Frontend structure and UI components |
| **5** | API integration with frontend |
| **6** | Authentication and authorization |
| **7** | Testing and UI polishing |
| **8** | Final documentation and deployment |

-----

## 📈 Expected Outcome

The final system will:

  * Allow users and admins to manage car data effectively.
  * Maintain service records in a structured database.
  * Provide a secure, responsive, and modern user experience.
  * Demonstrate full-stack development using **React, Tailwind, Node.js, and MongoDB**.

-----

## 🚀 Future Enhancements

  * Add car part inventory and maintenance scheduling.
  * Integrate payment systems for service billing.
  * Enable report generation and data export features.
  * Implement role-based dashboards and analytics.
