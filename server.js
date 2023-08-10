const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
