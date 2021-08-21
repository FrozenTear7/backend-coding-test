import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';
import rides from './routes/rides';

const app = express();

const swaggerDocument = YAML.load(
  './public/swagger.yaml'
) as swaggerUi.JsonObject;

const buildAppWithDb = (
  db: Database<sqlite3.Database, sqlite3.Statement>
): express.Express => {
  app.get('/health', (_req, res) => res.send('Healthy'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/rides', rides(db));

  return app;
};

export default buildAppWithDb;
