const express = require('express');

const router = express.Router();

const saucesController = require('../controllers/sauces.controller');

const imageUploadMiddleware = require('../middlewares/imageUpload.middleware');

router.get('/', saucesController.findAll);
router.get('/:id', saucesController.findOneById);

router.post('/', imageUploadMiddleware, saucesController.create);

module.exports = router;
