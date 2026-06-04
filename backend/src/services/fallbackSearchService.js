import Job from '../models/job.js';
import { monitoringService } from './monitoringService.js';

class FallbackSearchService {
  async performFallbackSearch(userQuery) {
    monitoringService.recordFallbackSearch();
    console.log(`⚠️ Using MongoDB Fallback Search for query: "${userQuery}"`);

    // Basic extraction heuristics
    const queryLower = userQuery.toLowerCase();
    
    // Create a basic regex pattern from the query words
    const words = queryLower.split(/\s+/).filter(w => w.length > 2 && !['jobs', 'developer', 'engineer', 'in', 'under', 'for', 'lpa', 'the', 'a'].includes(w));
    
    let searchCriteria = {};
    if (words.length > 0) {
      const regexPattern = new RegExp(words.join('|'), 'i');
      searchCriteria = {
        $or: [
          { title: regexPattern },
          { company: regexPattern },
          { location: regexPattern },
          { description: regexPattern }
        ]
      };
    }

    try {
      // Find up to 10 matching jobs
      const jobs = await Job.find(searchCriteria).limit(10).lean();
      
      return {
        role: "Extracted via Fallback",
        location: "Extracted via Fallback",
        jobs: jobs.map(job => ({
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary || "Not Specified",
          link: job.applyLink || "#"
        })),
        message: "We're currently experiencing high AI traffic. These results were fetched using our standard keyword search."
      };
    } catch (err) {
      console.error("Fallback search failed:", err);
      throw new Error("Both AI Agent and Fallback Search are currently unavailable.");
    }
  }
}

export const fallbackSearchService = new FallbackSearchService();
