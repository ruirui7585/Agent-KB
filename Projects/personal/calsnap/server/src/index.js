import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import foodRoutes from './routes/food.js';
import recordsRoutes from './routes/records.js';
import statsRoutes from './routes/stats.js';
import settingsRoutes from './routes/settings.js';
import profileRoutes from './routes/profile.js';
import exerciseRoutes from './routes/exercises.js';
import errorHandler from './middleware/error.js';

const app = Fastify({
  logger: true,
  bodyLimit: 10 * 1024 * 1024,
  trustProxy: true,
});

await app.register(cors, {
  origin: process.env.ALLOWED_ORIGIN || false,
});
await app.register(multipart, { limits: { fileSize: 8 * 1024 * 1024 } });

app.setErrorHandler(errorHandler);

app.addHook('onSend', async (req, reply, payload) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('Referrer-Policy', 'no-referrer');
  if (req.url.startsWith('/api/')) {
    reply.header('Cache-Control', 'no-store, max-age=0');
    reply.header('Pragma', 'no-cache');
  }
  return payload;
});

app.get('/api/health', async () => ({
  status: 'ok',
  service: 'calsnap',
  time: new Date().toISOString(),
}));

await app.register(foodRoutes,     { prefix: '/api/food' });
await app.register(recordsRoutes,  { prefix: '/api/records' });
await app.register(statsRoutes,    { prefix: '/api/stats' });
await app.register(settingsRoutes, { prefix: '/api/settings' });
await app.register(profileRoutes,  { prefix: '/api/profile' });
await app.register(exerciseRoutes, { prefix: '/api/exercises' });

const port = parseInt(process.env.PORT || '3000', 10);

try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`CalSnap API running on port ${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
