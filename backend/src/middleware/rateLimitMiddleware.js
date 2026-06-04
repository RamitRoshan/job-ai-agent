import rateLimit from 'express-rate-limit';

export const agentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per IP per minute
  message: {
    error: 'Too many search requests from this IP, please try again after a minute.',
    details: 'You have exceeded the 20 requests/minute rate limit.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
