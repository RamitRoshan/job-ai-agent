import { runJobAgent } from '../agents/jobAgent.js';
import SearchHistory from '../models/searchHistory.js';

export const handleAgentQuery = async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'A query string is required' });
  }

  try {
    console.log(`Processing query: "${query}"`);
    
    // Run the LangChain Agent
    const rawAgentOutput = await runJobAgent(query);
    console.log(`Raw Agent Output:\n${rawAgentOutput}`);

    // Parse the output
    let parsedResult;
    try {
      // Strip markdown code fences if present
      const cleanOutput = rawAgentOutput
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      parsedResult = JSON.parse(cleanOutput);
    } catch (parseErr) {
      console.error('Failed to parse agent JSON output, returning raw response:', parseErr.message);
      // Fallback response structure
      parsedResult = {
        role: '',
        location: '',
        jobs: [],
        message: rawAgentOutput,
      };
    }

    // Save search history if user is logged in
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
    console.error('Agent Endpoint Error:', error.message);
    res.status(500).json({ 
      error: 'An error occurred while processing the agent search.',
      details: error.message 
    });
  }
};
