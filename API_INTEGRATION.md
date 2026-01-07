# API Integration Documentation

## Overview
This document outlines how the frontend connects to the backend API in the Livestock360 application.

## Backend API Configuration

### Base URL
- **Development**: `http://localhost:4000/api`
- **Port**: 4000

### Available Endpoints

#### Authentication Endpoints (`/api/auth`)

1. **Register User**
   - **POST** `/api/auth/register`
   - **Body**: 
     ```json
     {
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123"
     }
     ```
   - **Response**: Returns user data and JWT token

2. **Login User**
   - **POST** `/api/auth/login`
   - **Body**: 
     ```json
     {
       "email": "john@example.com",
       "password": "password123"
     }
     ```
   - **Response**: Returns user data and JWT token

3. **Get Current User Profile**
   - **GET** `/api/auth/me`
   - **Auth**: Required (Bearer Token)
   - **Response**: Returns current user's profile

#### Farmer Endpoints (`/api/farmers`)

1. **Register Farmer Profile**
   - **POST** `/api/farmers/register`
   - **Auth**: Required (Bearer Token)
   - **Body**:
     ```json
     {
       "personalDetails": {
         "phone": "1234567890",
         "address": "123 Farm Road",
         "aadharNumber": "123456789012"
       },
       "farmDetails": {
         "farmName": "Green Valley Farm",
         "farmAddress": "Farm Road, Village",
         "farmSize": 10.5,
         "farmType": "Dairy",
         "yearsOfFarming": 5
       }
     }
     ```

2. **Get Farmer Profile**
   - **GET** `/api/farmers/me`
   - **Auth**: Required (Bearer Token, Farmer role)

3. **Update Farmer Profile**
   - **PUT** `/api/farmers/me`
   - **Auth**: Required (Bearer Token, Farmer role)

4. **Upload Document**
   - **POST** `/api/farmers/documents`
   - **Auth**: Required (Bearer Token, Farmer role)

## Frontend Integration

### Service Architecture

The frontend uses a three-layer service architecture:

#### 1. API Configuration (`/src/services/api.js`)
- Creates axios instance with base URL
- Handles request/response interceptors
- Automatically adds JWT token to requests
- Handles global error responses (401 redirects to login)

#### 2. Authentication Service (`/src/services/authService.js`)
- `register(userData)` - Register new user
- `login(credentials)` - Login user
- `getProfile()` - Get current user profile
- `logout()` - Logout and clear tokens
- `isAuthenticated()` - Check authentication status
- `getCurrentUser()` - Get user from localStorage

#### 3. Farmer Service (`/src/services/farmerService.js`)
- `registerFarmer(farmerData)` - Register farmer profile
- `getMyProfile()` - Get farmer profile
- `updateProfile(updateData)` - Update farmer profile
- `uploadDocument(documentData)` - Upload verification documents

### Component Integration

#### Login Component (`/src/pages/Login.js`)
- Uses `authService.login()` to authenticate users
- Stores JWT token in localStorage
- Redirects based on user role
- Shows loading state during API calls
- Displays error messages from API

#### Farmer Registration Component (`/src/pages/FarmerRegistration.js`)
- Two-step registration process:
  1. Creates user account via `authService.register()`
  2. Creates farmer profile via `farmerService.registerFarmer()`
- Shows loading state during registration
- Displays success/error messages
- Automatic redirect on success

### Authentication Flow

1. **User Registration**
   - User fills registration form
   - Frontend calls `/api/auth/register`
   - Backend returns JWT token
   - Token stored in localStorage
   - User authenticated

2. **User Login**
   - User enters credentials
   - Frontend calls `/api/auth/login`
   - Backend validates and returns JWT token
   - Token stored in localStorage
   - User redirected to dashboard

3. **Authenticated Requests**
   - API interceptor adds token to headers
   - Format: `Authorization: Bearer <token>`
   - Backend validates token on protected routes

4. **Token Expiration**
   - Backend returns 401 status
   - Interceptor catches error
   - Clears token from localStorage
   - Redirects user to login page

## Testing the Integration

### Prerequisites
1. MongoDB should be running
2. Backend server should be running on port 4000
3. Frontend dev server should be running on port 5173 (Vite default)

### Start Backend Server
```bash
cd server
npm install
npm start
```

### Start Frontend Server
```bash
cd client
npm install
npm run dev
```

### Test Scenarios

1. **Test User Registration**
   - Navigate to `/farmer/register`
   - Fill in all required fields
   - Click "Register" button
   - Check browser console for API calls
   - Verify success message and redirect

2. **Test User Login**
   - Navigate to `/login`
   - Enter registered email and password
   - Click "Sign in" button
   - Check localStorage for token
   - Verify redirect to dashboard

3. **Test Authentication Persistence**
   - After login, refresh the page
   - Token should persist in localStorage
   - Check if authenticated requests work

4. **Test Logout**
   - Call `authService.logout()`
   - Verify token removed from localStorage
   - Verify redirect to login page

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend has CORS enabled
   - Check `server.js` has `app.use(cors())`

2. **Network Errors**
   - Verify backend server is running
   - Check baseURL in `api.js` matches server port
   - Use browser DevTools Network tab

3. **401 Unauthorized**
   - Check token is being sent in headers
   - Verify token hasn't expired
   - Check user has correct role for endpoint

4. **Connection Refused**
   - Ensure MongoDB is running
   - Check MongoDB connection string in `.env`
   - Verify server port is not in use

## Environment Variables

### Backend (`.env`)
```
MONGODB_URI=mongodb://localhost:27017/livestock360
PORT=4000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Frontend
- No environment variables required for local development
- API baseURL is hardcoded in `api.js`
- For production, use environment variables

## Security Considerations

1. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
2. **Password Validation**: Minimum 6 characters, must contain number
3. **Request Timeout**: 10 seconds to prevent hanging requests
4. **Input Sanitization**: Backend uses express-validator
5. **Error Messages**: Generic messages to avoid information leakage

## Next Steps

1. Add token refresh mechanism
2. Implement role-based route protection
3. Add request/response logging
4. Implement API response caching
5. Add loading states for better UX
6. Create protected route wrapper component
7. Add form validation on frontend
8. Implement file upload for documents
