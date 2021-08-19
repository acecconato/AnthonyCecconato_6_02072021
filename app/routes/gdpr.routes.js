const express = require('express');

const router = express.Router();

const gdprController = require('../controllers/gdpr.controller');

router.delete('/delete-my-account', gdprController.deleteMyAccount);

router.get('/export-my-data', gdprController.exportMyData);

router.put('/update-my-password', gdprController.updateMyPassword);

router.post('/report-user/:id', gdprController.userReport);
router.post('/report-sauce/:id', gdprController.sauceReport);

module.exports = router;
