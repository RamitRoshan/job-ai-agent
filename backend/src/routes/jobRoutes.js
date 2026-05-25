import express from 'express';
import { saveJob, unsaveJob, getSavedJobs, getSearchHistory, deleteHistoryItem } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all job routes

router.post('/save', saveJob);
router.get('/saved', getSavedJobs);
router.delete('/saved/:id', unsaveJob);
router.get('/history', getSearchHistory);
router.delete('/history/:id', deleteHistoryItem);

export default router;
