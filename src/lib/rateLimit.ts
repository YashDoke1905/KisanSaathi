import { prisma } from "./prisma";

interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Portable rate limiter storing timestamps in database.
 * Safe for serverless and multi-instance environments.
 */
export async function checkRateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<{ success: boolean; remaining: number }> {
  try {
    const windowStart = new Date(Date.now() - windowSeconds * 1000);

    // Count recent records within window
    const count = await prisma.rateLimitRecord.count({
      where: {
        key,
        timestamp: {
          gte: windowStart,
        },
      },
    });

    if (count >= limit) {
      return { success: false, remaining: 0 };
    }

    // Record this attempt
    await prisma.rateLimitRecord.create({
      data: {
        key,
        timestamp: new Date(),
      },
    });

    // Cleanup old records older than 1 hour asynchronously
    prisma.rateLimitRecord
      .deleteMany({
        where: {
          timestamp: {
            lt: new Date(Date.now() - 3600 * 1000),
          },
        },
      })
      .catch(() => {});

    return { success: true, remaining: limit - count - 1 };
  } catch (err) {
    console.error("Rate limit check error:", err);
    // Fail open in case of DB transient error so users aren't locked out
    return { success: true, remaining: 1 };
  }
}
