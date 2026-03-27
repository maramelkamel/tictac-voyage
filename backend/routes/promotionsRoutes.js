const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/promotionsController');

router.get('/',                    ctrl.getAll);
router.get('/accueil',             ctrl.getAccueil);
router.get('/categorie/:categorie', ctrl.getByCategorie);
router.post('/',                   ctrl.create);
router.put('/:id',                 ctrl.update);
router.patch('/:id/toggle',        ctrl.toggle);
router.delete('/:id',              ctrl.remove);

module.exports = router;