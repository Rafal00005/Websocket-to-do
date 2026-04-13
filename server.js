const express = require('express');
const app = express();

const server = app.listen(8000, () => {
	console.log('Server is running...');
});

// integrate socket.io with our server
const io = require('socket.io')(server, { cors: { origin: '*' } });

// array of tasks stored on the server
let tasks = [];

// listen for new client connections
io.on('connection', (socket) => {
	console.log('New client connected:', socket.id);

	// send current tasks to the newly connected client
	socket.emit('updateData', tasks);

	// listen for adding a task
	socket.on('addTask', (task) => {
		tasks.push(task); // add task to server array
		socket.broadcast.emit('addTask', task); // inform other clients
	});

	// listen for removing a task
	socket.on('removeTask', (id) => {
		tasks = tasks.filter((task) => task.id !== id); // remove from server array
		socket.broadcast.emit('removeTask', id); // inform other clients
	});
});
