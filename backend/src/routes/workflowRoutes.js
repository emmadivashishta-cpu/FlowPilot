const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
  generateWorkflow,
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  executeWorkflow,
  deleteWorkflow
} = require('../controllers/workflowController');

const rateLimit = require('express-rate-limit');

// All workflow routes require JWT authentication
router.use(verifyToken);

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 AI generations per hour per user
  message: { success: false, message: 'AI Generation limit reached. Please try again later.' }
});

// POST /api/workflows/generate - AI Generation Route
router.post('/generate', aiLimiter, generateWorkflow);

// POST /api/workflows - Save created workflow
router.post('/', createWorkflow);

// GET /api/workflows - Fetch all user workflows
router.get('/', getWorkflows);

// GET /api/workflows/:id - Fetch single workflow with steps & execution logs
router.get('/:id', getWorkflowById);

// POST /api/workflows/:id/execute - Execute a workflow
router.post('/:id/execute', executeWorkflow);

// DELETE /api/workflows/:id - Delete a workflow
router.delete('/:id', deleteWorkflow);

module.exports = router;
