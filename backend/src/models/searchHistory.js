import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  query: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  resultsCount: {
    type: Number,
    default: 0,
  },
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
export default SearchHistory;
