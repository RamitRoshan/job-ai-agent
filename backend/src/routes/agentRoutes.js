import express from 'express';
import { handleAgentQuery } from '../controllers/agentController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/agent', optionalProtect, handleAgentQuery);

export default router;
