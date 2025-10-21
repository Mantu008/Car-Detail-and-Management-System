# Car Management System - Frontend

This is the frontend application for the Car Detail and Management System, built with React.js, Vite, and Tailwind CSS.

## Features

- **Fast Development**: Powered by Vite for lightning-fast development and hot module replacement
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **User Authentication**: Login and registration with JWT tokens
- **Car Management**: Add, edit, delete, and view cars
- **Service Tracking**: Manage car service records
- **Search & Filter**: Find cars by brand, model, year, or owner
- **Role-based UI**: Different interfaces for admin and regular users
- **Toast Notifications**: User feedback with react-toastify
- **Protected Routes**: Secure pages that require authentication

## Technologies Used

- **React.js**: Frontend framework
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **React Toastify**: Toast notifications
- **Context API**: State management for authentication

## Components

### Core Components
- **Navbar**: Navigation bar with authentication state
- **ProtectedRoute**: Route wrapper for authentication
- **CarCard**: Card component for displaying car information
- **CarForm**: Form for adding/editing cars
- **LoginForm**: User login form
- **RegisterForm**: User registration form

### Pages
- **Home**: Landing page with features and statistics
- **Cars**: Browse all cars with search and filter
- **MyCars**: User's personal car management
- **AddCar**: Add new car form
- **EditCar**: Edit existing car form
- **CarDetail**: Detailed car view with service history

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
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── CarCard.jsx
│   ├── CarForm.jsx
│   ├── LoginForm.jsx
│   └── RegisterForm.jsx
├── context/            # React Context for state management
│   └── authContext.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Cars.jsx
│   ├── MyCars.jsx
│   ├── AddCar.jsx
│   ├── EditCar.jsx
│   └── CarDetail.jsx
├── App.jsx             # Main App component
├── main.jsx            # App entry point
└── index.css           # Global styles with Tailwind
```

## Vite Configuration

The project uses Vite for development and building:

- **Development Server**: Fast HMR (Hot Module Replacement)
- **Build Tool**: Optimized production builds
- **Proxy Configuration**: Automatic API proxying to backend
- **ES Modules**: Modern JavaScript module system

## Features Overview

### Authentication
- User registration with validation
- Secure login with JWT tokens
- Automatic token refresh
- Protected routes based on authentication state
- Role-based access control

### Car Management
- View all cars in a responsive grid
- Add new cars with comprehensive form validation
- Edit existing cars (owner or admin only)
- Delete cars with confirmation
- Search cars by brand, model, or owner
- Filter cars by brand and year

### Service Tracking
- Add service records to cars
- View complete service history
- Delete service records
- Track service costs and types
- Service provider information

### User Experience
- Responsive design for all screen sizes
- Toast notifications for user feedback
- Loading states for better UX
- Error handling with user-friendly messages
- Smooth animations and transitions

## Styling

The application uses Tailwind CSS for styling with:

- **Responsive Design**: Mobile-first approach
- **Custom Color Scheme**: Blue primary color with gray accents
- **Component Styling**: Consistent button, form, and card styles
- **Hover Effects**: Interactive elements with smooth transitions
- **Dark/Light Mode Ready**: Easy to extend with dark mode

## State Management

The application uses React Context API for state management:

- **Authentication Context**: Manages user state, login/logout
- **Global State**: User information, authentication status
- **Local State**: Component-specific state with useState hooks

## API Integration

The frontend communicates with the backend through:

- **Axios**: HTTP client with interceptors
- **Environment Variables**: Configurable API endpoints
- **Error Handling**: Comprehensive error handling and user feedback
- **Token Management**: Automatic token attachment to requests

## Development

### Available Scripts

- `npm run dev`: Start development server with Vite
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update routing in `App.jsx`
4. Add API calls using Axios
5. Style with Tailwind CSS classes

## Production Build

To build for production:

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

## Deployment

The frontend can be deployed to:

- **Vercel**: Easy deployment with Git integration
- **Netlify**: Static site hosting with CI/CD
- **AWS S3**: Static website hosting
- **GitHub Pages**: Free hosting for public repositories

Make sure to update the `VITE_API_URL` environment variable for production.

## Vite Benefits

- **Fast Development**: Lightning-fast cold starts
- **HMR**: Instant hot module replacement
- **Optimized Builds**: Tree-shaking and code splitting
- **ES Modules**: Native ES modules support
- **TypeScript Support**: Built-in TypeScript support (optional)
- **Plugin Ecosystem**: Rich plugin ecosystem

## Performance

Vite provides excellent performance benefits:

- **Faster Builds**: Up to 10x faster than traditional bundlers
- **Smaller Bundle Size**: Optimized production builds
- **Better Developer Experience**: Instant feedback during development
- **Modern Tooling**: Built on modern web standards
