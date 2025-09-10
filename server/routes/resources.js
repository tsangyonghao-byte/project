const express = require('express');
const { protect, requireMembership } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const resourceController = require('../controllers/resourceController');

console.log('Upload middleware loaded:', typeof uploadMiddleware);
console.log('uploadSingle function:', typeof uploadMiddleware.uploadSingle);

const router = express.Router();

// Public routes
router.get('/', resourceController.getResources);
router.get('/featured', resourceController.getFeaturedResources);
router.get('/stats', resourceController.getResourceStats);
router.get('/:id', resourceController.getResource);

// Protected routes
router.get('/:id/download', protect, requireMembership, resourceController.downloadResource);
router.post('/favorites', protect, resourceController.addToFavorites);
router.delete('/favorites/:resourceId', protect, resourceController.removeFromFavorites);

// Admin routes
router.post('/', protect, uploadMiddleware.uploadSingle('file'), resourceController.createResource);
router.put('/:id', protect, uploadMiddleware.uploadSingle('file'), resourceController.updateResource);
router.delete('/:id', protect, resourceController.deleteResource);

module.exports = router;