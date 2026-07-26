import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes';
import { notFound, errorHandler } from './middleware/error';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json());
  if (env.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
