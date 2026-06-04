import { runJobAgent } from '../agents/jobAgent.js';
import SearchHistory from '../models/searchHistory.js';
import { cacheService } from '../services/cacheService.js';
import { geminiQueueService } from '../services/queueService.js';
import { fallbackSearchService } from '../services/fallbackSearchService.js';

export const handleAgentQuery = async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'A query string is required' });
  }

  try {
    console.log(`Processing query: "${query}"`);
    
    // 1. Check Cache First
    const cachedResult = cacheService.getCache(query);
    if (cachedResult) {
      // Save search history (Optional: you might want to throttle history saving, but we keep it here for UX)
      if (req.user) {
        await SearchHistory.create({
          user: req.user.id,
          query: query,
          role: cachedResult.role || '',
          location: cachedResult.location || '',
          resultsCount: (cachedResult.jobs && Array.isArray(cachedResult.jobs)) ? cachedResult.jobs.length : 0,
        }).catch(err => console.error('Failed to save search history:', err.message));
      }
      return res.json(cachedResult);
    }

    let parsedResult;

    try {
      // 2. Add to Queue and Run Gemini Agent
      const rawAgentOutput = await geminiQueueService.enqueue(() => runJobAgent(query));
      console.log(`Raw Agent Output:\n${rawAgentOutput}`);

      // Parse the output
      const cleanOutput = rawAgentOutput
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      parsedResult = JSON.parse(cleanOutput);
    } catch (agentErr) {
      console.error('Agent Execution Error:', agentErr.message);

      // 3. Fallback Search Trigger
      if (agentErr.name === 'AllKeysExhaustedError' || agentErr.message.includes('unavailable')) {
        parsedResult = await fallbackSearchService.performFallbackSearch(query);
      } else {
        // If it's a parsing error or some other unexpected error, attempt fallback anyway to save UX
        console.log("Attempting fallback due to unexpected agent error...");
        parsedResult = await fallbackSearchService.performFallbackSearch(query);
      }
    }

    // 4. Save to Cache
    if (parsedResult && parsedResult.jobs) {
      cacheService.setCache(query, parsedResult);
    }

    // 5. Save search history if user is logged in
    if (req.user) {
      try {
        await SearchHistory.create({
          user: req.user.id,
          query: query,
          role: parsedResult.role || '',
          location: parsedResult.location || '',
          resultsCount: (parsedResult.jobs && Array.isArray(parsedResult.jobs)) ? parsedResult.jobs.length : 0,
        });
        console.log(`Saved search history for user: ${req.user.email}`);
      } catch (historyErr) {
        console.error('Failed to save search history:', historyErr.message);
      }
    }

    // Return structured response
    res.json(parsedResult);
  } catch (error) {
    console.error('Unhandled Controller Error:', error.message);
    res.status(500).json({ 
      error: 'An error occurred while processing the agent search.',
      details: error.message 
    });
  }
};
