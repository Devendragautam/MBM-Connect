# MBM Connect

MBM Connect is a comprehensive social platform exclusive to MBM college students and professionals. It provides a dedicated environment for networking, resource sharing, and community building.

## Features

- **Authentication System:** Secure registration and login.
- **User Profiles:** Customizable profiles for students and professionals.
- **Real-time Messaging:** Private messaging and real-time chat using Socket.io.
- **Video Calling:** Integrated peer-to-peer video calls using WebRTC (SimplePeer).
- **Feed System:** Post text, images, or media, share updates, like, and comment with the community.
- **Marketplace:** Dedicated space to share and discover resources, books, and items.
- **Stories System:** Share 24-hour update stories with your connections.
- **Feedback Module:** Easily submit bugs or feature ideas.

## Technology Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.io (Real-time communication)
- JWT (JSON Web Tokens for Auth)
- Cloudinary (Media storage)
- Multer (File uploads)

### Frontend
- React (built with Vite)
- Tailwind CSS (Styling & Animations)
- Socket.io-client (Real-time updates)
- Simple-peer (WebRTC for video calls)
- React Router (Routing)
- Lucide React (Icons)

## Project Structure

```
mbm-connect/
├── backend/            # Express server, MongoDB models, controllers, and routes
│   ├── controllers/
│   ├── models/
│   ├── Routes/
│   ├── utils/
│   └── app.js
└── frontend/           # React frontend built with Vite and Tailwind
    └── src/
        ├── features/   # Feature-based folder structure (auth, chat, feed, market, etc.)
        ├── pages/
        ├── shared/     # Shared UI components
        └── main.jsx
```

## Setup and Installation

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd "MBM CONNECT"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file in the `backend` folder based on your configuration requirements (e.g., `PORT`, `MONGO_URI`, `JWT_SECRET`, Cloudinary secrets).
   - Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   - Create a `.env` file in the `frontend` folder if needed (e.g., matching the backend API URL).
   - Start the frontend development server:
   ```bash
   npm run dev
   ```

##  Contributing

Contributions, issues, and feature requests are welcome. Feel free to check issues page if you want to contribute.

## License

This project is licensed under the MIT License.
