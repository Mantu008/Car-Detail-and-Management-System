# Car Management System - Backend

This is the backend API for the Car Detail and Management System, built with Node.js, Express.js, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication system
- **Car Management**: Full CRUD operations for car data
- **Service Tracking**: Manage car service records
- **Role-based Access**: Admin and user roles with different permissions
- **Data Validation**: Comprehensive input validation and error handling
- **Security**: Password hashing, CORS protection, and secure routes

## API Endpoints

### Authentication Routes (`/api/users`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `GET /profile` - Get current user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `GET /` - Get all users (admin only)

### Car Routes (`/api/cars`)
- `GET /` - Get all cars
- `GET /:id` - Get car by ID
- `POST /` - Create new car (protected)
- `PUT /:id` - Update car (protected)
- `DELETE /:id` - Delete car (protected)
- `GET /my-cars` - Get current user's cars (protected)

### Service Routes (`/api/services`)
- `GET /:carId` - Get services for a specific car (protected)
- `POST /` - Create new service record (protected)
- `PUT /:id` - Update service record (protected)
- `DELETE /:id` - Delete service record (protected)
- `GET /` - Get all services (admin only)

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'user']),
  timestamps: true
}
```

### Car Model
```javascript
{
  brand: String,
  model: String,
  year: Number,
  price: Number,
  color: String,
  mileage: Number,
  owner: ObjectId (ref: User),
  services: [ObjectId] (ref: Service),
  description: String,
  timestamps: true
}
```

### Service Model
```javascript
{
  car: ObjectId (ref: Car),
  date: Date,
  description: String,
  cost: Number,
  serviceType: String (enum: ['maintenance', 'repair', 'inspection', 'other']),
  serviceProvider: String,
  timestamps: true
}
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/car-management-system
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Security Features

- **Password Hashing**: Using bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication with JSON Web Tokens
- **Input Validation**: Schema validation plus field whitelisting on every write (no mass assignment)
- **Two-Factor Authentication**: TOTP with hashed, single-use backup codes; login issues a short-lived challenge token until the code is verified
- **Rate Limiting**: Login, registration and 2FA endpoints (see below)
- **Security Headers**: `nosniff`, `X-Frame-Options: DENY`, referrer policy; `X-Powered-By` removed
- **Uploads**: Only JPG, PNG, WEBP and GIF up to 5 MB
- **CORS Protection**: Configurable CORS settings
- **Role-based Access**: Different permissions for admin and regular users
- **Error Handling**: Secure error messages without sensitive information

## Middleware

- **Authentication Middleware**: Verifies JWT tokens
- **Authorization Middleware**: Checks user roles and permissions
- **Error Handling Middleware**: Centralized error handling
- **CORS Middleware**: Cross-origin resource sharing configuration

## Development

The backend uses the following technologies:

- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Testing

Automated tests use Node's built-in test runner and need no extra packages:

```bash
npm test
```

The suite starts a throwaway `mongod` (must be on your PATH, or set `MONGOD_PATH`)
with a temporary data directory and runs the real server against it, so your
development or Atlas database is never touched. To use an existing test database
instead, set `MONGODB_TEST_URI`.

- `tests/api.test.js` - end-to-end API tests: auth, ownership checks, mass
  assignment, uploads, services, fuel log, admin actions, support, announcements,
  the full two-factor flow and cascade deletes.
- `tests/rateLimit.test.js` - verifies login and 2FA rate limits on the real routes.
- `tests/unit.test.js` - rate limiter, backup-code hashing, field whitelisting.

For manual testing, any HTTP client (Postman, Thunder Client, curl) works.

## Error Handling

The API returns consistent error responses:

```javascript
{
  success: false,
  message: "Error description"
}
```

Success responses:

```javascript
{
  success: true,
  data: {...},
  message: "Success message" // optional
}
```

## Rate Limiting

Sensitive endpoints are rate limited in memory (`middleware/rateLimit.js`) and
answer `429` with a `Retry-After` header when exceeded:

| Endpoint | Limit |
| --- | --- |
| `POST /api/users/login` | 10 per IP + email / 15 min |
| `POST /api/users/register` | 20 per IP / hour |
| `POST /api/auth/2fa/validate`, `/verify`, `/disable` | 5 per IP / 5 min |

Counters are per process. On serverless platforms each instance keeps its own,
so put a shared limiter (e.g. at the CDN / gateway) in front for strict limits.
Set `DISABLE_RATE_LIMIT=1` only for automated tests.
