import express from 'express';
import { handleAgentQuery } from '../controllers/agentController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

import { agentRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/agent', agentRateLimiter, optionalProtect, handleAgentQuery);

export default router;
