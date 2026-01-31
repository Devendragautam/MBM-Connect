# MBM Connect - Frontend

A modern React + Vite frontend application for the MBM Connect platform with authentication, marketplace, stories, and messaging features.

## 🚀 Features

- **Authentication System**
  - User registration and login
  - Protected routes
  - JWT token management
  - Auto-logout on 401 response

- **Dashboard**
  - Overview of listings, stories, and feed
  - Stats cards
  - Recent content display

- **Marketplace**
  - Browse listings
  - Create new listings
  - Filter by category and price
  - Search functionality

- **Stories**
  - Read stories from community
  - Write and publish stories
  - View story details

- **Chat/Messaging**
  - View conversations
  - Send and receive messages
  - Real-time conversation list

## 📋 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MarketPage.jsx
│   │   ├── StoriesPage.jsx
│   │   └── ChatPage.jsx
│   ├── context/            # React Context
│   │   └── AuthContext.jsx
│   ├── services/           # API services
│   │   ├── api.js         # API endpoints
│   │   └── apiClient.js   # Axios configuration
│   ├── styles/            # Global styles
│   │   └── index.css
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
├── postcss.config.cjs     # PostCSS config
├── package.json
└── .gitignore
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file** (optional)
```bash
# Create .env or .env.local file
VITE_API_URL=http://localhost:8000
```

### Running the Application

**Development mode**
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

**Build for production**
```bash
npm run build
```

**Preview production build**
```bash
npm run preview
```

## 🔌 API Integration

The frontend is pre-configured to connect to the backend API. Update the API URL in `src/services/apiClient.js`:

```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000';
```

### Available API Services

All API calls are in `src/services/api.js`:

- **Auth**: signup, login, logout
- **User**: getProfile, updateProfile, getUserPosts
- **Market**: getListings, getListingDetail, createListing, updateListing, deleteListing
- **Stories**: getStories, getStoryDetail, createStory, deleteStory
- **Chat**: getConversations, getMessages, sendMessage

## 🔐 Authentication Flow

1. User signs up/logs in
2. Backend returns user data and JWT token
3. Token is stored in localStorage
4. Token is automatically included in API requests via axios interceptor
5. On 401 response, user is redirected to login

## 📱 Pages

| Page | Route | Protected | Purpose |
|------|-------|-----------|---------|
| Home | `/` | No | Landing page |
| Login | `/login` | No | User login |
| Signup | `/signup` | No | User registration |
| Dashboard | `/dashboard` | Yes | Main dashboard |
| Market | `/market` | Yes | Marketplace |
| Stories | `/stories` | Yes | Stories section |
| Chat | `/chat` | Yes | Messaging |

## 🎨 Styling

The project uses **Tailwind CSS** for styling. Key configuration:
- Responsive design
- Custom colors (primary, secondary, accent)
- Pre-built components

## 📦 Dependencies

- **react**: UI library
- **react-dom**: React DOM rendering
- **react-router-dom**: Routing
- **axios**: HTTP client
- **tailwindcss**: CSS framework

## 🔄 State Management

Uses React Context API for:
- Authentication state
- User information
- Token management

## 🚨 Error Handling

The application includes:
- API error handling with user-friendly messages
- Form validation
- Protected routes with loading states
- Error boundaries for components

## 🔮 Future Enhancements

- [ ] Real-time messaging with WebSocket
- [ ] Image upload functionality
- [ ] User profile page
- [ ] Search functionality
- [ ] Notifications system
- [ ] Dark mode
- [ ] Pagination
- [ ] Infinite scroll

## 📝 Environment Variables

Create `.env.local` file:
```
VITE_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

**CORS errors**: Make sure backend allows requests from `http://localhost:3000`

**API not working**: Check if backend is running on port 8000

**Styles not loading**: Ensure Tailwind CSS is properly built

## 📞 Support

For issues or questions, please check the backend documentation and ensure both frontend and backend are running correctly.
