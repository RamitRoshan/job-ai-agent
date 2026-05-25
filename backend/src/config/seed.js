import mongoose from 'mongoose';
import Job from '../models/job.js';
import connectDB from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleJobs = [
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
  },
  {
    title: 'Software Development Engineer (SDE-1)',
    company: 'Innovate HQ',
    location: 'Bangalore',
    salary: '7 LPA',
    experience: '0-2 years',
    description: 'Ideal entry-level position. Work on Core Java, Spring Boot, and SQL databases. Strong problem-solving skills are expected.',
    link: 'https://innovatehq.co/sde-1',
    tags: ['Java', 'Spring Boot', 'SQL', 'Entry Level'],
  },
  {
    title: 'Lead Software Architect',
    company: 'Global Tech Systems',
    location: 'Hyderabad',
    salary: '35 LPA',
    experience: '10+ years',
    description: 'Design core system architectures and lead engineering practices across multiple product verticals.',
    link: 'https://globaltech.com/careers/architect',
    tags: ['Architecture', 'System Design', 'Microservices'],
  },
  {
    title: 'Python Django Developer',
    company: 'PyWeb Corp',
    location: 'Delhi',
    salary: '8 LPA',
    experience: '2-4 years',
    description: 'Build secure, scalable backend architectures using Django and Django Rest Framework.',
    link: 'https://pyweb.corp/jobs/django',
    tags: ['Python', 'Django', 'REST API'],
  },
  {
    title: 'ML Engineering Specialist',
    company: 'Neuro Networks',
    location: 'Bangalore',
    salary: '25 LPA',
    experience: '4+ years',
    description: 'Deploy deep learning models in production environments. Experience with PyTorch, AWS, and model quantization.',
    link: 'https://neuronetworks.ai/jobs/ml-eng',
    tags: ['Machine Learning', 'PyTorch', 'AWS', 'LLM'],
  },
  {
    title: 'QA Automation Engineer',
    company: 'Secure QA',
    location: 'Pune',
    salary: '7.5 LPA',
    experience: '2-4 years',
    description: 'Develop automation test suites using Selenium, Cypress, or Playwright. Maintain CI test runs.',
    link: 'https://secureqa.net/careers/automation',
    tags: ['QA', 'Automation', 'Cypress', 'Playwright'],
  },
  {
    title: 'Marketing Specialist',
    company: 'SaaSify Marketing',
    location: 'Mumbai',
    salary: '6 LPA',
    experience: '1-3 years',
    description: 'Drive growth and user acquisition campaigns. Experience with Google Ads, SEO, and email marketing.',
    link: 'https://saasifymarketing.com/jobs/marketing',
    tags: ['SEO', 'Marketing', 'Growth'],
  },
  {
    title: 'Golang Engineer',
    company: 'Speedy Systems',
    location: 'Hyderabad',
    salary: '18 LPA',
    experience: '3-6 years',
    description: 'Develop high-concurrency systems using Go and Docker. Strong knowledge of microservice principles.',
    link: 'https://speedysystems.dev/careers/golang',
    tags: ['Golang', 'Go', 'Docker', 'Microservices'],
  },
  {
    title: 'HR Manager',
    company: 'PeopleFirst Co',
    location: 'Bangalore',
    salary: '9 LPA',
    experience: '4+ years',
    description: 'Manage recruitment pipelines, onboarding, and employee relations in a fast-paced environment.',
    link: 'https://peoplefirst.co/careers/hr',
    tags: ['HR', 'Recruitment', 'Operations'],
  },
  {
    title: 'Cloud Security Analyst',
    company: 'CyberShield Ltd',
    location: 'Remote',
    salary: '19 LPA',
    experience: '4-7 years',
    description: 'Ensure cloud security posture, audit configurations, and mitigate threat vectors in AWS and Azure environments.',
    link: 'https://cybershield.net/jobs/security',
    tags: ['Cybersecurity', 'AWS', 'Azure', 'Remote'],
  },
  {
    title: 'SQL Database Administrator (DBA)',
    company: 'DataKeepers Inc',
    location: 'Chennai',
    salary: '11 LPA',
    experience: '3-5 years',
    description: 'Maintain high availability, performance tuning, and backup recovery routines for SQL Server and PostgreSQL databases.',
    link: 'https://datakeepers.com/careers/dba',
    tags: ['SQL', 'PostgreSQL', 'Database Admin'],
  }
];

export const seedJobs = async () => {
  try {
    const count = await Job.countDocuments();
    if (count === 0) {
      console.log('No jobs found in the database. Seeding sample jobs...');
      await Job.insertMany(sampleJobs);
      console.log(`${sampleJobs.length} sample jobs seeded successfully.`);
    } else {
      console.log(`Database already has ${count} job records. Skipping seeding.`);
    }
  } catch (error) {
    console.error('Error seeding job listings:', error);
  }
};

// If run directly: node src/config/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  const run = async () => {
    await connectDB();
    await seedJobs();
    await mongoose.connection.close();
    console.log('Database connection closed.');
  };
  run();
}
