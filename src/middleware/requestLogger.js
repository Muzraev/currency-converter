// Кастомный middleware для логирования запросов
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
    
    // Логируем тело запроса для POST/PUT
    if (['POST', 'PUT'].includes(method) && req.body) {
        console.log('Body:', JSON.stringify(req.body));
    }
    
    // Логируем query-параметры
    if (Object.keys(req.query).length > 0) {
        console.log('Query:', req.query);
    }
    
    next(); // Передаем управление следующему middleware/маршруту
};

module.exports = requestLogger;