const express = require('express');

const router = express.Router();

const saucesController = require('../controllers/sauces.controller');

const imageValidatorMiddleware = require('../middlewares/imageValidator.middleware');

router.get('/', saucesController.readAll);
router.get('/:id', saucesController.readOneById);

router.post('/', imageValidatorMiddleware, saucesController.create);
router.post('/:id/like', saucesController.handleLike);

router.put('/:id', imageValidatorMiddleware, saucesController.update);

router.delete('/:id', saucesController.delete);

module.exports = router;
