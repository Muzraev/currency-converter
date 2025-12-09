const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');

// GET /api/rates - все курсы валют
router.get('/rates', currencyController.getAllRates);

// GET /api/convert?from=USD&to=EUR&amount=100 - конвертация через query-параметры
router.get('/convert', currencyController.convertCurrency);

// POST /api/convert - конвертация через тело запроса
router.post('/convert', currencyController.convertCurrencyPost);

// GET /api/currencies - список доступных валют
router.get('/currencies', currencyController.getAvailableCurrencies);

// PUT /api/rates - обновление курса валюты (имитация админки)
router.put('/rates/:currency', currencyController.updateExchangeRate);

module.exports = router;