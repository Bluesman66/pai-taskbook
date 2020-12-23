const functions = require('firebase-functions');

const admin = require('firebase-admin');
const serviceAccount = require('./permissions.json');
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: true }));

app.get('/hello-world', (req, res) => {
	return res.status(200).send('Hello World!');
});

// create
app.post('/api/create', (req, res) => {
	(async () => {
		try {
			await db
				.collection('tasks')
				.doc('/' + req.body.id + '/')
				.create({ task: req.body.task });
			return res.status(200).send();
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

// read task
app.get('/api/read/:task_id', (req, res) => {
	(async () => {
		try {
			const document = db.collection('tasks').doc(req.params.task_id);
			let task = await document.get();
			let response = task.data();
			return res.status(200).send(response);
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

// read all
app.get('/api/read', (req, res) => {
	(async () => {
		try {
			let query = db.collection('tasks');
			let response = [];
			await query.get().then((querySnapshot) => {
				let docs = querySnapshot.docs;
				for (let doc of docs) {
					const selectedTask = {
						id: doc.id,
						task: doc.data().task,
					};
					response.push(selectedTask);
				}
				return;
			});
			return res.status(200).send(response);
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

// update
app.put('/api/update/:task_id', (req, res) => {
	(async () => {
		try {
			const document = db.collection('tasks').doc(req.params.task_id);
			await document.update({
				task: req.body.task,
			});
			return res.status(200).send();
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

// delete
app.delete('/api/delete/:task_id', (req, res) => {
	(async () => {
		try {
			const document = db.collection('tasks').doc(req.params.task_id);
			await document.delete();
			return res.status(200).send();
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

exports.app = functions.https.onRequest(app);
