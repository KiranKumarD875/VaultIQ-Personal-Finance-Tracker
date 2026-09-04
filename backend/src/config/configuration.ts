export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER || 'finsight',
    password: process.env.DB_PASSWORD || 'finsight_pass',
    name: process.env.DB_NAME || 'finsight_db',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
});