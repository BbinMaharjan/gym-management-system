const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { verifyToken, checkPermission } = require('../middleware/auth');

router.use(verifyToken, checkPermission('users:manage'));

router.get('/', ctrl.getUsers);
router.get('/:id', ctrl.getUser);
router.post('/', ctrl.createUser);
router.put('/:id', ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;
