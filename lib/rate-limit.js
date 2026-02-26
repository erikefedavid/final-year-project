const rateLimit = new Map();

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;

  if (!rateLimit.has(key)) {
    rateLimit.set(key, { count: 1, startTime: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  const record = rateLimit.get(key);

  if (now - record.startTime > windowMs) {
    rateLimit.set(key, { count: 1, startTime: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}