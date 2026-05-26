import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import Job from '../models/job.js';

// Fallback in-memory job database if MongoDB is down
const fallbackJobs = [
  {
    title: 'Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'Bangalore',
    salary: '8 LPA',
    experience: '2-4 years',
    description: 'Looking for a skilled React developer who is comfortable with Tailwind CSS, Redux, and modern web application development workflows.',
    link: 'https://careers.techcorp.com/jobs/frontend-dev',
    tags: ['React', 'JavaScript', 'Tailwind', 'CSS'],
  },
  {
    title: 'Senior Frontend Developer',
    company: 'Alpha Cloud Systems',
    location: 'Bangalore',
    salary: '18 LPA',
    experience: '5+ years',
    description: 'Lead frontend engineering for our SaaS dashboard. Expertise in React.js, Next.js, Webpack, and rendering optimizations is required.',
    link: 'https://alpha.systems/careers/sr-frontend',
    tags: ['React', 'Next.js', 'TypeScript', 'SaaS'],
  },
  {
    title: 'Backend Engineer',
    company: 'FinGo Financials',
    location: 'Mumbai',
    salary: '12 LPA',
    experience: '3-5 years',
    description: 'Design and build high-performance APIs. Experience with Node.js, Express, MongoDB, and Redis is highly preferred.',
    link: 'https://fingo.in/jobs/backend-engineer',
    tags: ['Node.js', 'Express', 'MongoDB', 'APIs'],
  },
  {
    title: 'Junior Node.js Developer',
    company: 'AppStart Media',
    location: 'Pune',
    salary: '5 LPA',
    experience: '1-2 years',
    description: 'Great opportunity for junior backend developers. Learn Node.js, Express, and databases from seasoned architects.',
    link: 'https://appstart.io/jobs/jr-node',
    tags: ['Node.js', 'Express', 'MongoDB', 'Backend'],
  },
  {
    title: 'Full Stack Engineer',
    company: 'Scribe AI',
    location: 'Remote',
    salary: '22 LPA',
    experience: '4-6 years',
    description: 'Work on cutting-edge AI integrations. Full stack capability with React, Node.js, PostgreSQL, and LLM orchestration is required.',
    link: 'https://scribeai.com/jobs/full-stack',
    tags: ['React', 'Node.js', 'AI', 'PostgreSQL', 'Remote'],
  },
  {
    title: 'Product Manager',
    company: 'Apex Logistics',
    location: 'Bangalore',
    salary: '16 LPA',
    experience: '3+ years',
    description: 'Drive the product roadmap for our logistics software. Work closely with design and engineering teams to deliver features.',
    link: 'https://apexlogistics.com/jobs/pm',
    tags: ['Product Management', 'Agile', 'Logistics'],
  },
  {
    title: 'UI/UX Designer',
    company: 'Creative Labs',
    location: 'Delhi',
    salary: '9 LPA',
    experience: '2-5 years',
    description: 'Design responsive, premium user interfaces. Proficiency with Figma, design systems, and wireframing is key.',
    link: 'https://creativelabs.design/careers/ui-ux',
    tags: ['Figma', 'UI/UX', 'Design System'],
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudScale Technologies',
    location: 'Hyderabad',
    salary: '14 LPA',
    experience: '3-6 years',
    description: 'Manage AWS infrastructure, CI/CD pipelines (GitHub Actions), Docker, and Kubernetes deployment environments.',
    link: 'https://cloudscale.tech/devops-job',
    tags: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    title: 'Data Scientist',
    company: 'Insight Analytics',
    location: 'Pune',
    salary: '15 LPA',
    experience: '2-4 years',
    description: 'Analyze complex datasets and build predictive models using Python, scikit-learn, and TensorFlow.',
    link: 'https://insightanalytics.com/careers/data-scientist',
    tags: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'],
  },
  {
    title: 'React Native Developer',
    company: 'Mobify App Agency',
    location: 'Remote',
    salary: '10 LPA',
    experience: '2-4 years',
    description: 'Build native iOS and Android applications using React Native. Experience with Redux and native bridge is a plus.',
    link: 'https://mobify.agency/careers/react-native',
    tags: ['React Native', 'Mobile', 'iOS', 'Android', 'Remote'],
  }
];

export const jobSearchTool = tool(
  async ({ role, location, salaryRange, experienceLevel }) => {
    console.log(`Tool run: searching jobs with criteria: role=${role}, location=${location}, salaryRange=${salaryRange}, experienceLevel=${experienceLevel}`);

    let jobs = [];
    let isDbConnected = false;

    // Check if mongoose is connected
    try {
      if (Job.db && Job.db.readyState === 1) {
        isDbConnected = true;
      }
    } catch (e) {
      console.warn('Mongoose state check failed:', e.message);
    }

    if (isDbConnected) {
      try {
        const query = {};

        if (role) {
          query.title = { $regex: role, $options: 'i' };
        }

        if (location && location.toLowerCase() !== 'remote') {
          query.location = { $regex: location, $options: 'i' };
        } else if (location && location.toLowerCase() === 'remote') {
          query.location = { $regex: 'remote', $options: 'i' };
        }

        console.log('MongoDB Query object:', query);
        jobs = await Job.find(query).limit(10).lean();
      } catch (err) {
        console.error('Error fetching jobs from MongoDB, using fallback:', err);
        isDbConnected = false;
      }
    }

    // Fallback search in memory
    if (!isDbConnected || jobs.length === 0) {
      console.log('Searching fallback jobs array...');
      jobs = fallbackJobs.filter(job => {
        let matchesRole = true;
        let matchesLoc = true;

        if (role) {
          const r = role.toLowerCase();
          matchesRole = job.title.toLowerCase().includes(r) ||
                        job.tags.some(t => t.toLowerCase().includes(r)) ||
                        job.description.toLowerCase().includes(r);
        }

        if (location) {
          const l = location.toLowerCase();
          matchesLoc = job.location.toLowerCase().includes(l);
        }

        return matchesRole && matchesLoc;
      });
    }

    // Shape the response: strip out description and tags to save tokens
    const shapedJobs = jobs.map(job => ({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      experience: job.experience,
      link: job.link,
    }));

    // Return the results
    return JSON.stringify(shapedJobs);
  },
  {
    name: 'job_search_tool',
    description: 'Fetch job listings from the database matching the criteria. Use this tool whenever the user searches for jobs.',
    schema: z.object({
      role: z.string().nullable().describe('The job role or title to search (e.g., "frontend developer", "product manager"). Pass null if not found.'),
      location: z.string().nullable().describe('The job location (e.g., "Bangalore", "Pune", "Remote"). Pass null if not found.'),
      salaryRange: z.string().nullable().describe('Optional salary range or requirements extracted (e.g., "under 10 LPA", "15 LPA"). Pass null if not found.'),
      experienceLevel: z.string().nullable().describe('Optional experience requirements extracted (e.g., "2-4 years", "senior"). Pass null if not found.'),
    }),
  }
);
