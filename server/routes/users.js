const express = require('express');
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// All routes are protected
router.get('/dashboard', protect, userController.getDashboard);
router.get('/favorites', protect, userController.getFavorites);
router.get('/orders', protect, userController.getOrders);
router.get('/membership', protect, userController.getMembershipStatus);
router.post('/activate', protect, userController.activateMembership);

module.exports = router;