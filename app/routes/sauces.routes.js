const express = require('express');

const router = express.Router();

const saucesController = require('../controllers/sauces.controller');

router.get('/', saucesController.findAll);
router.get('/:id', saucesController.findOneById);

router.post('/', saucesController.create);

module.exports = router;
