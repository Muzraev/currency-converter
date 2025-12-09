const express = require('express');
const path = require('path');
const currencyRoutes = require('./routes/currencyRoutes');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Кастомный middleware
app.use(express.static(path.join(__dirname, '../public'))); // Статические файлы

// Маршруты
app.use('/api', currencyRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Обработка 404
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});