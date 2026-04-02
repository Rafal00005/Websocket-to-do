const express = require('express');
const app = express();
const server = app.listen(8000, () => {
	console.log('Server is running...');
});

const io = require('socket.io')(server, { cors: { origin: '*' } });

let tasks = [];

io.on('connection', (socket) => {
	console.log('New client connected:', socket.id);
});
