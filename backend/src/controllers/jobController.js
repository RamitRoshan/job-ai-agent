import Job from '../models/job.js';
import SavedJob from '../models/savedJob.js';
import SearchHistory from '../models/searchHistory.js';

// Save a job
export const saveJob = async (req, res) => {
  const { title, company, location, salary, experience, description, link, tags } = req.body;

  try {
    if (!title || !company || !location || !link) {
      return res.status(400).json({ error: 'Missing required job fields' });
    }

    // Try to find if this job already exists in DB
    let job = await Job.findOne({ link });

    if (!job) {
      // If it doesn't exist, create it in the database
      job = await Job.create({
        title,
        company,
        location,
        salary: salary || 'N/A',
        experience: experience || 'N/A',
        description: description || '',
        link,
        tags: tags || [],
      });
    }

    // Check if user already saved this job
    const alreadySaved = await SavedJob.findOne({ user: req.user.id, job: job._id });
    if (alreadySaved) {
      return res.status(400).json({ error: 'Job already saved' });
    }

    // Create SavedJob entry
    await SavedJob.create({
      user: req.user.id,
      job: job._id,
    });

    res.status(201).json({ message: 'Job saved successfully', job });
  } catch (error) {
    console.error('Save Job Error:', error.message);
    res.status(500).json({ error: 'Failed to save job' });
  }
};

// Unsave a job
export const unsaveJob = async (req, res) => {
  const jobId = req.params.id;

  try {
    const savedJob = await SavedJob.findOneAndDelete({ user: req.user.id, job: jobId });

    if (!savedJob) {
      return res.status(404).json({ error: 'Saved job not found' });
    }

    res.json({ message: 'Job removed from saved list' });
  } catch (error) {
    console.error('Unsave Job Error:', error.message);
    res.status(500).json({ error: 'Failed to unsave job' });
  }
};

// Get all saved jobs for current user
export const getSavedJobs = async (req, res) => {
  try {
    const saved = await SavedJob.find({ user: req.user.id })
      .populate('job')
      .sort({ savedAt: -1 });

    // Filter out cases where the job might have been deleted in DB
    const jobs = saved.map(item => item.job).filter(job => job !== null);
    res.json(jobs);
  } catch (error) {
    console.error('Get Saved Jobs Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
};

// Get search history
export const getSearchHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find({ user: req.user.id })
      .sort({ searchedAt: -1 })
      .limit(20);
    res.json(history);
  } catch (error) {
    console.error('Get Search History Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
};

// Delete a search history item
export const deleteHistoryItem = async (req, res) => {
  const historyId = req.params.id;

  try {
    const historyItem = await SearchHistory.findOneAndDelete({ user: req.user.id, _id: historyId });

    if (!historyItem) {
      return res.status(404).json({ error: 'History item not found' });
    }

    res.json({ message: 'History item deleted successfully' });
  } catch (error) {
    console.error('Delete History Item Error:', error.message);
    res.status(500).json({ error: 'Failed to delete history item' });
  }
};
