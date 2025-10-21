# 🚗 Car Detail and Management System

## 📘 Project Overview

The **Car Detail and Management System** is a full-stack web application designed to simplify car information management — including brand, model, year, price, and service details.  
It’s built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** with **Tailwind CSS** for a responsive, modern UI.

The system supports **two roles**:
- **Admin** – can add, edit, delete, and view all car details.
- **User** – can register, log in, and manage their personal car data and service records.

---

## 🎯 Objectives

- Design and develop a web-based system for managing car details.
- Build a modern and responsive UI using **React.js + Tailwind CSS**.
- Implement **secure authentication** using JWT.
- Enable **CRUD operations** for cars and services.
- Integrate all layers of the MERN stack efficiently.

---

## 📚 Project Scope

This project serves small car dealerships or individual car owners to maintain records such as:
- Car details (brand, model, year, price)
- Service history
- User registration and login
- Admin management of cars and users

**Future-ready:** can be extended to include service reminders, inventory, or payment integrations.

---

## 🧩 Technology Stack

| Layer | Technology | Description |
|-------|-------------|-------------|
| **Frontend** | React.js, Tailwind CSS, React Toastify | For building responsive UI and user notifications |
| **Backend** | Node.js, Express.js | RESTful API and server-side logic |
| **Database** | MongoDB | To store user, car, and service data |
| **Other Tools** | Axios, Postman, JWT, dotenv | API communication, testing, and authentication |

---

## ⚙️ System Features

### 👨‍💼 Admin Features
- Add, edit, delete, and view all cars  
- Manage user records  
- View service history for each car  

### 🚗 User Features
- Register and log in securely  
- Add and update car details  
- View personal car data and service records  
- Receive instant feedback via toast notifications  

---

## 🏗️ System Architecture

React.js (Frontend + Tailwind + Toastify)
↓ (Axios)
Express.js + Node.js (Backend API)
↓ (Mongoose ODM)
MongoDB (Database)

yaml
Copy code

---

## 💻 Frontend (React + Tailwind CSS)

### Setup
```bash
npx create-react-app car-management-frontend
npm install axios react-router-dom react-toastify
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
Components
Component	Description
Navbar	Navigation bar (Home, Cars, Login, Logout)
Login/Register	User authentication
Dashboard	Admin or user dashboard view
CarList	Displays all cars
CarForm	Add/Edit car details
CarDetail	Individual car info and services
ServiceList / ServiceForm	Manage service records
UserProfile	User’s profile and car list

Styling
Buttons: bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2

Cards: bg-white shadow-lg rounded-xl p-4

Inputs: border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-400

Notifications
js
Copy code
import { toast } from "react-toastify";
toast.success("Car added successfully!");
toast.error("Login failed!");
🖥️ Backend (Node.js + Express.js)
Setup
bash
Copy code
npm init -y
npm install express mongoose cors bcryptjs jsonwebtoken dotenv
Folder Structure
bash
Copy code
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
API Endpoints
Entity	Method	Endpoint	Description
User	POST	/api/users/register	Register new user
POST	/api/users/login	Login and get token
Car	GET	/api/cars	Get all cars
GET	/api/cars/:id	Get car by ID
POST	/api/cars	Add new car
PUT	/api/cars/:id	Update car
DELETE	/api/cars/:id	Delete car
Service	POST	/api/services	Add service
GET	/api/services/:carId	Get car services

🗄️ Database Design (MongoDB)
User Schema
js
Copy code
{
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
}
Car Schema
js
Copy code
{
  brand: String,
  model: String,
  year: Number,
  price: Number,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }]
}
Service Schema
js
Copy code
{
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  date: Date,
  description: String,
  cost: Number
}
🔒 Authentication & Authorization
Implemented using JWT (JSON Web Token)

Token stored in localStorage after login

Protected routes require valid token

Role-based middleware for admin/user access control

🔁 Integration
Frontend ↔ Backend via Axios

React Hooks (useEffect, useState) for state & data management

React Toastify for success/error alerts

📦 Deliverables
✅ Responsive React + Tailwind Frontend
✅ RESTful Backend (Node + Express)
✅ MongoDB Database
✅ JWT Authentication
✅ CRUD Operations for Cars & Services
✅ Optional Deployment (Vercel, Render, MongoDB Atlas)

⏰ Suggested Timeline
Week	Task
1	Requirement analysis & planning
2	Backend setup and database models
3	Develop API endpoints
4	Frontend structure and UI components
5	API integration
6	Authentication & authorization
7	Testing and UI polishing
8	Documentation & deployment

🎯 Expected Outcome
Manage car data efficiently

Maintain service records

Provide a secure and responsive user experience

Demonstrate a full-stack MERN integration

🚀 Future Enhancements
Car part inventory and maintenance scheduling

Payment system integration

Report generation and data export

Role-based dashboards and analytics

👨‍💻 Author
Mantu Kumar Morya
Full Stack Developer | MERN Stack | TypeScript | Next.js | Tailwind CSS
