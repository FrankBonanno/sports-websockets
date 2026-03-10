import express from 'express';

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (_, res) => {
  res.json({ message: 'Hello! Welcome to the real-time WebSocket app.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
