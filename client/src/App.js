import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const App = () => {
	const [tasks, setTasks] = useState([]);
	const [taskName, setTaskName] = useState('');
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		const newSocket = io('ws://localhost:8000', { transports: ['websocket'] });
		setSocket(newSocket);

		newSocket.on('updateData', (data) => {
			setTasks(data);
		});

		newSocket.on('addTask', (task) => {
			setTasks((tasks) => [...tasks, task]);
		});

		newSocket.on('removeTask', (id) => {
			setTasks((tasks) => tasks.filter((task) => task.id !== id));
		});

		return () => {
			newSocket.disconnect();
		};
	}, []);

	const addTask = (task) => {
		setTasks((tasks) => [...tasks, task]);
	};

	const removeTask = (id, emit = true) => {
		setTasks((tasks) => tasks.filter((task) => task.id !== id));
		if (emit) {
			socket.emit('removeTask', id);
		}
	};

	const submitForm = (e) => {
		e.preventDefault();
		if (!taskName.length) return;
		const task = { id: Date.now(), name: taskName };
		addTask(task);
		socket.emit('addTask', task);
		setTaskName('');
	};

	return (
		<div className='App'>
			<header>
				<h1>ToDoList.app</h1>
			</header>

			<section className='tasks-section' id='tasks-section'>
				<h2>Tasks</h2>

				<ul className='tasks-section__list' id='tasks-list'>
					{tasks.map((task) => (
						<li className='task' key={task.id}>
							{task.name}
							<button
								className='btn btn--red'
								onClick={() => removeTask(task.id)}
							>
								Remove
							</button>
						</li>
					))}
				</ul>

				<form id='add-task-form' onSubmit={submitForm}>
					<input
						className='text-input'
						autoComplete='off'
						type='text'
						placeholder='Type your description'
						value={taskName}
						onChange={(e) => setTaskName(e.target.value)}
					/>
					<button className='btn' type='submit'>
						Add
					</button>
				</form>
			</section>
		</div>
	);
};

export default App;
