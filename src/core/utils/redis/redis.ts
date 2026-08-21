import Redis from 'ioredis';

const isNextBuild = process.env.NEXT_PHASE === "phase-production-build";

const createRedisClient = () => {
  if (isNextBuild) {
    return {
      get: async () => null,
      set: async () => "OK",
      incr: async () => 1,
      exists: async () => 0,
      expire: async () => 0,
      ttl: async () => -2,
      keys: async () => [],
      mget: async (...keys: string[]) => keys.map(() => null),
      del: async () => 0,
      on: () => undefined,
    } as unknown as Redis;
  }

  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 1000)),
    });
  }

  return new Redis({
    host: process.env.REDIS_HOST || 'redis',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 1000)),
  });
};

// 싱글톤 패턴으로 연결 관리 (메모리 낭비 방지)
const redisClient = createRedisClient();

redisClient.on('error', (err) => {
  if (isNextBuild) return;
  console.error('❌ Redis Error:', err);
});

export default redisClient;
