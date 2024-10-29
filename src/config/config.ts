export default () => ({
    jwt: {
      secret: process.env.JWT_SECRET,
    },
    database: {
      connectionString: process.env.DATABASE_URL,
    },
    redis: {
        password: process.env.REDIS_PASSWORD,
        host: process.env.REDIS_URL || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        url: process.env.REDIS_URL || undefined
      },
  });
  