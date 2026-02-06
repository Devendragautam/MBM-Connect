# MBM CONNECT

A modern full-stack social media platform built with React, Node.js, Express, and MongoDB. Connect, share, and trade with your community!

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)
![Express](https://img.shields.io/badge/Express-4+-lightgrey)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Frontend Architecture](#frontend-architecture)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🌐 Core Features
- **User Authentication** - Register, login, token refresh with JWT
- **User Profiles** - View and edit profiles, follow/unfollow users
- **Feed System** - Create posts, like, comment, share updates with community
- **Stories** - Ephemeral content sharing with likes and comments
- **Marketplace** - Buy/sell items, list products with images and descriptions
- **Real-time Chat** - Direct messaging between users (WebSocket ready)
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Mobile-friendly interface with Tailwind CSS

### 🔒 Security Features
- JWT-based authentication with refresh tokens
- Password validation and encryption
- Protected routes with role-based access
- Request validation and error handling
- CORS enabled for cross-origin requests

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6 with lazy loading
- **State Management:** React Context API (Auth, DarkMode)
- **HTTP Client:** Axios with interceptors
- **Styling:** Tailwind CSS with responsive design
- **Real-time:** Socket.io client (prepared for WebSocket integration)
- **Icons & UI:** Custom component library (Button, Input, Loader, ErrorBox)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer + Cloudinary
- **Environment:** dotenv
- **Utilities:** bcryptjs for password hashing

## 📁 Project Structure

```
MBM CONNECT/
├── frontend/                          # React + Vite application
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.jsx               # Root component
│   │   │   ├── providers.jsx         # Context providers wrapper
│   │   │   └── routes.jsx            # Centralized routing with lazy loading
│   │   │
│   │   ├── features/                 # Feature-based modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.api.js       # Authentication API methods
│   │   │   │   ├── auth.hooks.js     # Custom auth hooks (useAuth, useAuthInit)
│   │   │   │   ├── AuthContext.jsx   # Auth state management
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── SignupPage.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── feed/
│   │   │   │   ├── feed.api.js       # Posts/feed API
│   │   │   │   ├── Feed.jsx          # Feed component with infinite scroll
│   │   │   │   ├── CreatePost.jsx    # Post creation form
│   │   │   │   ├── PostCard.jsx      # Individual post component
│   │   │   │   └── FeedPage.jsx
│   │   │   ├── market/
│   │   │   │   ├── market.api.js     # Marketplace API
│   │   │   │   └── MarketPage.jsx    # Marketplace listing
│   │   │   ├── stories/
│   │   │   │   ├── stories.api.js    # Stories API
│   │   │   │   └── StoriesPage.jsx   # Stories feed
│   │   │   ├── chat/
│   │   │   │   ├── chat.api.js       # Chat API
│   │   │   │   ├── chat.socket.js    # WebSocket integration
│   │   │   │   ├── ChatPage.jsx      # Messaging interface
│   │   │   │   └── isMessageFromMe.js # Helper function
│   │   │   ├── profile/
│   │   │   │   ├── user.api.js       # User API methods
│   │   │   │   └── UserProfile.jsx   # User profile page
│   │   │   ├── home/
│   │   │   │   └── home.api.js       # Dashboard data aggregation
│   │   │   └── user/
│   │   │       └── user.api.js       # User management API
│   │   │
│   │   ├── shared/                   # Shared across features
│   │   │   ├── components/
│   │   │   │   ├── Home.jsx          # Landing page
│   │   │   │   ├── HomePage.jsx      # Authenticated home
│   │   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   │   └── Dashboard.jsx     # Dashboard with aggregated data
│   │   │   ├── ui/                   # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── ErrorBox.jsx
│   │   │   │   └── index.js          # UI component exports
│   │   │   ├── DarkModeContext.jsx   # Dark mode state
│   │   │   └── utils/
│   │   │       └── navigation.js     # Centralized navigation utility
│   │   │
│   │   ├── services/
│   │   │   └── apiClient.js          # Axios instance with interceptors
│   │   │
│   │   ├── styles/
│   │   │   └── index.css             # Global styles
│   │   │
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                           # Node.js/Express API
│   ├── controllers/
│   │   ├── auth.controller.js        # Authentication logic
│   │   ├── post.controller.js        # Posts/feed logic
│   │   ├── user.controller.js        # User management
│   │   ├── chat.controller.js        # Messaging logic
│   │   ├── market.controller.js      # Marketplace logic
│   │   └── stories.controller.js     # Stories logic
│   │
│   ├── models/
│   │   ├── user.models.js
│   │   ├── post.models.js
│   │   ├── chat.models.js
│   │   ├── market.models.js
│   │   └── stories.models.js (shares Post model)
│   │
│   ├── Routes/
│   │   ├── auth.js                  # Auth endpoints
│   │   ├── post.js                  # Posts endpoints
│   │   ├── user.js                  # User endpoints
│   │   ├── chat.js                  # Chat endpoints
│   │   ├── market.js                # Market endpoints
│   │   └── stories.js               # Stories endpoints
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── multer.middleware.js     # File upload handling
│   │   └── validation.middleware.js # Request validation
│   │
│   ├── utils/
│   │   ├── asyncHandler.js          # Async error wrapper
│   │   ├── ApiError.js              # Custom error class
│   │   ├── ApiResponse.js           # Standard response format
│   │   └── cloudinary.js            # Image upload utility
│   │
│   ├── app.js                       # Express app setup
│   ├── package.json
│   └── .env.example
│
├── FRONTEND_BACKEND_SYNC.md         # API synchronization documentation
└── README.md                        # This file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local instance or MongoDB Atlas account)
- **Git**

## 🚀 Installation

### Clone the Repository
```bash
git clone https://github.com/yourusername/mbm-connect.git
cd mbm-connect
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration (see Environment Variables section)

# Start MongoDB locally or use MongoDB Atlas connection string

# Run the server
npm start
# or for development with auto-reload:
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (if needed for environment-specific config)
# Add VITE_API_URL pointing to your backend

# Start the development server
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mbm-connect
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mbm-connect

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# Cloudinary (for image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env or .env.local)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Optional: Feature flags
VITE_ENABLE_SOCKET_IO=true
```

## ▶️ Running the Project

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Application runs on http://localhost:5173
```

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
```
POST   /auth/register      - Register new user
POST   /auth/login         - Login user
POST   /auth/logout        - Logout user
POST   /auth/refresh-token - Refresh access token
GET    /auth/me            - Get current user
```

### Posts/Feed Endpoints
```
GET    /posts/feed/all          - Get all posts (public)
GET    /posts/feed/following    - Get following feed (auth required)
GET    /posts/user/:userId      - Get user's posts
GET    /posts/:postId           - Get single post
POST   /posts/create            - Create new post (auth required)
PUT    /posts/:postId           - Update post (auth required)
DELETE /posts/:postId           - Delete post (auth required)
POST   /posts/:postId/like      - Like/unlike post (auth required)
POST   /posts/:postId/comment   - Add comment (auth required)
DELETE /posts/:postId/comment/:commentId - Delete comment (auth required)
```

### User Endpoints
```
GET    /user/:userId        - Get user profile
PUT    /user/:userId/profile - Update profile (auth required)
GET    /user/:userId/posts  - Get user's posts (auth required)
POST   /user/:userId/follow   - Follow user (auth required)
POST   /user/:userId/unfollow - Unfollow user (auth required)
```

### Chat Endpoints
```
GET    /chat                    - Get conversations (auth required)
POST   /chat                    - Start new conversation (auth required)
GET    /chat/:conversationId    - Get messages (auth required)
POST   /chat/:conversationId    - Send message (auth required)
```

### Market Endpoints
```
GET    /market              - Get all items
POST   /market              - Create listing (auth required)
DELETE /market/:id          - Delete listing (auth required)
```

### Stories Endpoints
```
GET    /stories             - Get all stories (auth required)
POST   /stories             - Create story (auth required)
DELETE /stories/:id         - Delete story (auth required)
POST   /stories/:id/like    - Like/unlike story (auth required)
POST   /stories/:id/comment - Add comment (auth required)
```

### Response Format
All endpoints return standardized responses:
```javascript
{
  statusCode: number,      // HTTP status
  data: any,              // Response payload
  message: string,        // Status message
  success: boolean        // true if statusCode < 400
}
```

## 🏗️ Frontend Architecture

### State Management
- **AuthContext** - User authentication state, tokens, login/logout
- **DarkModeContext** - Theme preference (light/dark)
- **useAuthInit Hook** - Automatically re-hydrates user session on page refresh

### API Layer
Each feature has its own API module (`*.api.js`) that:
- Encapsulates endpoint definitions
- Handles request/response formatting
- Provides type-safe method signatures
- Centralizes error handling

### Routing
- **Protected Routes** - Wrapped with `ProtectedRoute` component
- **Lazy Loading** - Pages loaded on-demand with React.lazy and Suspense
- **Fallback UI** - Loading state while chunks are being loaded

### Performance Optimizations
- `useCallback` - Memoized functions prevent unnecessary re-renders
- `useMemo` - Expensive computations cached
- Lazy-loaded pages reduce initial bundle size
- Image optimization with Cloudinary CDN

### Styling
- **Tailwind CSS** - Utility-first styling framework
- **Dark Mode** - CSS variables toggle theme
- **Responsive** - Mobile-first design approach
- **No Inline Styles** - All styling through Tailwind classes

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/mbm-connect.git
   cd mbm-connect
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test your changes locally

4. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

5. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Provide clear description of changes
   - Reference any related issues

## 📝 Code Style Guidelines

### Frontend (React/JavaScript)
- Use functional components with hooks
- Use arrow functions for event handlers
- Prefer `const` over `let` or `var`
- Use descriptive variable names
- Add JSDoc comments for complex functions

### Backend (Node.js/Express)
- Use async/await for asynchronous operations
- Wrap async routes with asyncHandler
- Return standardized ApiResponse objects
- Throw ApiError for error handling
- Use meaningful error messages

## 📦 Dependencies

### Frontend Key Packages
```json
{
  "react": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "axios": "^1.0.0",
  "socket.io-client": "^4.0.0",
  "tailwindcss": "^3.0.0"
}
```

### Backend Key Packages
```json
{
  "express": "^4.18.0",
  "mongoose": "^7.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.0",
  "multer": "^1.4.0",
  "dotenv": "^16.0.0",
  "cloudinary": "^1.32.0"
}
```

## 🐛 Troubleshooting

### Frontend Issues

**Issue:** CORS errors
```
Solution: Check VITE_API_URL in .env matches backend CORS_ORIGIN
```

**Issue:** Token expired errors
```
Solution: Clear localStorage, refresh token middleware will auto-refresh
```

**Issue:** Images not loading
```
Solution: Verify Cloudinary credentials and image URLs in responses
```

### Backend Issues

**Issue:** MongoDB connection failed
```
Solution: Check MONGODB_URI, ensure MongoDB is running or Atlas is accessible
```

**Issue:** File upload errors
```
Solution: Verify Cloudinary API keys and bucket configuration
```

**Issue:** JWT errors
```
Solution: Check ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are set in .env
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Devendra Gautam** - Full-stack development

## 🙏 Acknowledgments

- Tailwind CSS for styling framework
- Cloudinary for image hosting
- MongoDB for database
- Express.js community
- React ecosystem

## 📞 Support

For support, email support@mbmconnect.com or open an issue on GitHub.

---

**Last Updated:** February 1, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
