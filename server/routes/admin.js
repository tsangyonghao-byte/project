const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// All routes are admin-only
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);

// Order management
router.get('/orders', adminController.getOrders);

// Activation code management
router.get('/activation-codes', adminController.getActivationCodes);
router.post('/activation-codes/generate', adminController.generateActivationCodes);
router.post('/activation-codes/export', adminController.exportActivationCodes);

// Category management
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

module.exports = router;