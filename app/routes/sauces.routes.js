const express = require('express');

const router = express.Router();

const saucesController = require('../controllers/sauces.controller');

const imageValidatorMiddleware = require('../middlewares/imageValidator.middleware');

router.get('/', saucesController.findAll);
router.get('/:id', saucesController.findOneById);

router.post('/', imageValidatorMiddleware, saucesController.create);
router.post('/:id/like', saucesController.handleLike);

router.put('/:id', imageValidatorMiddleware, saucesController.findOneByIdAndUpdate);

router.delete('/:id', saucesController.findOneByIdAndDelete);

module.exports = router;
