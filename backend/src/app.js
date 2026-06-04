import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { seedJobs } from './config/seed.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import agentRoutes from './routes/agentRoutes.js';


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect and seed database
const initializeApp = async () => {
  await connectDB();
  await seedJobs();
};
initializeApp();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', agentRoutes); // provides POST /api/agent

// Basic Healthcheck Route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Trigger nodemon restart for env port change
export default app;
