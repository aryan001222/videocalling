const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
app.use(cors());
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('offer', (data) => {
        const { offer, roomId } = data;
        socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (data) => {
        const { answer, roomId } = data;
        socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', (data) => {
        const { candidate, roomId } = data;
        socket.to(roomId).emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
