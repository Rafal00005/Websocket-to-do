const express = require('express');
const app = express();

const server = app.listen(process.env.PORT || 8000, () => {
	console.log('Server is running...');
});

// integrate socket.io with our server
const io = require('socket.io')(server, {
	cors: { origin: '*' },
});

// array of tasks stored on the server
let tasks = [];

io.on('connection', (socket) => {
	console.log('New client connected:', socket.id);

	// send current tasks to the newly connected client
	socket.emit('updateData', tasks);

	socket.on('addTask', (task) => {
		// validate: reject if name is not a non-empty string
		if (!task || typeof task.name !== 'string' || task.name.trim() === '') {
			return;
		}

		// generate ID on the server side to guarantee uniqueness
		const newTask = {
			id: crypto.randomUUID(),
			name: task.name.trim(),
		};

		tasks.push(newTask);

		// send new task (with server-generated ID) to ALL clients
		io.emit('addTask', newTask);
	});

	socket.on('removeTask', (id) => {
		// validate: reject if id is not a string
		if (typeof id !== 'string') {
			return;
		}

		tasks = tasks.filter((task) => task.id !== id);
		socket.broadcast.emit('removeTask', id);
	});

	socket.on('disconnect', () => {
		console.log('Client disconnected:', socket.id);
	});
});

app.use((req, res) => {
	res.status(404).send({ message: 'Not found...' });
});
