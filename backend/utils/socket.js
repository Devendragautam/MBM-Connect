import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: true, // Allow all origins (or restrict to frontend URL)
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // Track online users: userId -> socketId
    const onlineUsers = new Map();

    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id);

        socket.on("join_room", (userId) => {
            if (userId) {
                socket.join(userId);
                onlineUsers.set(userId, socket.id);
                console.log(`👤 User ${userId} joined room ${userId}`);

                // Broadcast to everyone that this user is online
                io.emit("user:online", userId);
            }
        });

        // Typing events
        socket.on("typing:start", (data) => {
            const { receiverId, conversationId, senderId } = data;
            if (receiverId) {
                io.to(receiverId).emit("typing:start", { conversationId, senderId });
            }
        });

        socket.on("typing:stop", (data) => {
            const { receiverId, conversationId, senderId } = data;
            if (receiverId) {
                io.to(receiverId).emit("typing:stop", { conversationId, senderId });
            }
        });

        // Video Call Events
        socket.on("call:user", (data) => {
            const { userToCall, signalData, from, name } = data;
            if (onlineUsers.has(userToCall)) {
                const socketId = onlineUsers.get(userToCall);
                io.to(socketId).emit("call:user", { signal: signalData, from, name });
            }
        });

        socket.on("answer:call", (data) => {
            const { to, signal } = data;
            if (onlineUsers.has(to)) {
                const socketId = onlineUsers.get(to);
                io.to(socketId).emit("call:accepted", signal);
            }
        });
        
        socket.on("end:call", (data) => {
             const { to } = data;
             if (onlineUsers.has(to)) {
                const socketId = onlineUsers.get(to);
                io.to(socketId).emit("call:ended");
             }
        });

        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
            // Find userId
            let disconnectedUserId = null;
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    onlineUsers.delete(userId);
                    break;
                }
            }
            if (disconnectedUserId) {
                io.emit("user:offline", disconnectedUserId);
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
