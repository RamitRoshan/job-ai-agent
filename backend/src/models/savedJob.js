import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

// Avoid duplicate saves of same job by same user
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);
export default SavedJob;
