const fs = require('fs').promises;
const path = require('path');

const RATES_FILE = path.join(__dirname, '../data/exchangeRates.json');

// Чтение курсов из файла
const readRates = async () => {
    try {
        const data = await fs.readFile(RATES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Ошибка чтения файла курсов:', error);
        return {};
    }
};

// Запись курсов в файл
const writeRates = async (rates) => {
    try {
        await fs.writeFile(RATES_FILE, JSON.stringify(rates, null, 2));
    } catch (error) {
        console.error('Ошибка записи файла курсов:', error);
    }
};

// Контроллеры
const currencyController = {
    // 1. Получить все курсы
    getAllRates: async (req, res) => {
        try {
            const rates = await readRates();
            res.json({
                success: true,
                timestamp: new Date().toISOString(),
                base: 'USD',
                rates
            });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // 2. Конвертация через GET (query-параметры)
    convertCurrency: async (req, res) => {
        const { from, to, amount = 1 } = req.query;
        
        if (!from || !to) {
            return res.status(400).json({
                error: 'Укажите параметры from и to',
                example: '/api/convert?from=USD&to=EUR&amount=100'
            });
        }

        try {
            const rates = await readRates();
            
            if (!rates[from] || !rates[to]) {
                return res.status(400).json({
                    error: 'Неизвестная валюта',
                    availableCurrencies: Object.keys(rates)
                });
            }

            const amountNum = parseFloat(amount);
            if (isNaN(amountNum)) {
                return res.status(400).json({ error: 'amount должен быть числом' });
            }

            // Конвертация через USD как базовую валюту
            const fromRate = rates[from];
            const toRate = rates[to];
            const result = (amountNum / fromRate) * toRate;

            res.json({
                success: true,
                conversion: {
                    from,
                    to,
                    amount: amountNum,
                    result: parseFloat(result.toFixed(4)),
                    rate: parseFloat((toRate / fromRate).toFixed(6))
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка конвертации' });
        }
    },

    // 3. Конвертация через POST (тело запроса)
    convertCurrencyPost: async (req, res) => {
        const { from, to, amount = 1 } = req.body;
        
        if (!from || !to) {
            return res.status(400).json({
                error: 'Укажите from и to в теле запроса'
            });
        }

        try {
            const rates = await readRates();
            
            if (!rates[from] || !rates[to]) {
                return res.status(400).json({
                    error: 'Неизвестная валюта',
                    availableCurrencies: Object.keys(rates)
                });
            }

            const amountNum = parseFloat(amount);
            if (isNaN(amountNum)) {
                return res.status(400).json({ error: 'amount должен быть числом' });
            }

            const fromRate = rates[from];
            const toRate = rates[to];
            const result = (amountNum / fromRate) * toRate;

            res.json({
                success: true,
                conversion: {
                    from,
                    to,
                    amount: amountNum,
                    result: parseFloat(result.toFixed(4)),
                    rate: parseFloat((toRate / fromRate).toFixed(6))
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка конвертации' });
        }
    },

    // 4. Список доступных валют
    getAvailableCurrencies: async (req, res) => {
        try {
            const rates = await readRates();
            const currencies = Object.keys(rates).map(code => ({
                code,
                name: getCurrencyName(code),
                rate: rates[code]
            }));
            
            res.json({
                success: true,
                count: currencies.length,
                currencies
            });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // 5. Обновление курса валюты
    updateExchangeRate: async (req, res) => {
        const { currency } = req.params;
        const { rate } = req.body;

        if (!rate || isNaN(parseFloat(rate))) {
            return res.status(400).json({ error: 'Укажите корректный курс' });
        }

        try {
            const rates = await readRates();
            
            if (!rates[currency]) {
                return res.status(404).json({ error: 'Валюта не найдена' });
            }

            rates[currency] = parseFloat(rate);
            await writeRates(rates);

            res.json({
                success: true,
                message: `Курс ${currency} обновлен`,
                currency,
                newRate: rates[currency]
            });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка обновления' });
        }
    }
};

// Вспомогательная функция для получения названия валюты
function getCurrencyName(code) {
    const names = {
        USD: 'Доллар США',
        EUR: 'Евро',
        RUB: 'Российский рубль',
        GBP: 'Фунт стерлингов',
        JPY: 'Японская иена',
        CNY: 'Китайский юань',
        KZT: 'Казахстанский тенге'
    };
    return names[code] || code;
}

module.exports = currencyController;