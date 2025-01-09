const express = require('express');
const router = express.Router();
const { authMiddleware, verifyAdmin } = require('../middleware/authMiddleware');
const planController = require('../controllers/planController');

router.get('/', planController.getAllPlans);
router.put('/:planId', authMiddleware, verifyAdmin, planController.updatePlan);
module.exports = router;
