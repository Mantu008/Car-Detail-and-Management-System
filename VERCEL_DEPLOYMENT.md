# Vercel Deployment Guide for Car Management System

## Environment Variables Required

### Backend Environment Variables
Set these in your Vercel backend project settings:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car-management-system
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Frontend Environment Variables
Set these in your Vercel frontend project settings:

```
VITE_API_URL=https://your-backend-api.vercel.app
VITE_CLIENT_URL=https://your-frontend-domain.vercel.app
```

## Database Setup
1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get your connection string and replace `<username>`, `<password>`, and `<dbname>` with your actual credentials
4. Add your Vercel IP addresses to MongoDB Atlas IP whitelist (0.0.0.0/0 for all IPs)

## Deployment Sequence

### Step 1: Deploy Backend First
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Set the root directory to `Car-Detail-and-Management-System/backend`
6. Set build command to: `npm run build`
7. Set output directory to: `.` (current directory)
8. Add environment variables (see above)
9. Deploy

### Step 2: Deploy Frontend
1. Create another new project in Vercel
2. Import the same repository
3. Set the root directory to `Car-Detail-and-Management-System/frontend`
4. Set build command to: `npm run build`
5. Set output directory to: `dist`
6. Add environment variables (see above)
7. Update the `CLIENT_URL` in backend environment variables with your frontend URL
8. Deploy

### Step 3: Update Frontend Configuration
After getting your backend URL, update the frontend `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://YOUR-BACKEND-URL.vercel.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Important Notes

1. **CORS Configuration**: The backend is already configured to accept requests from your frontend domain
2. **File Uploads**: Static files are served from `/uploads` directory
3. **Database**: Make sure to use MongoDB Atlas (cloud) not local MongoDB
4. **Environment Variables**: Never commit `.env` files to your repository
5. **Build Commands**: Vercel will automatically detect and run the build commands

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Make sure `CLIENT_URL` in backend matches your frontend domain
2. **Database Connection**: Verify MongoDB Atlas connection string and IP whitelist
3. **Build Failures**: Check that all dependencies are in `package.json`
4. **API Routes Not Working**: Verify the backend URL in frontend `vercel.json`

### Testing Your Deployment:
1. Backend health check: `https://your-backend.vercel.app/api/health`
2. Frontend should load at: `https://your-frontend.vercel.app`
3. Test API endpoints through your frontend application
