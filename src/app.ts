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

function buildAppWithDb(
  db: Database<sqlite3.Database, sqlite3.Statement>
): express.Express {
  app.get('/health', (_req, res) => res.send('Healthy'));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use('/rides', rides(db));

  // app.get('/rides', async (req, res) => {
  //   const pageSize = 10;

  //   const page = req.query.page || '1';

  //   if (
  //     typeof page !== 'string' ||
  //     isNaN(+page) ||
  //     !isFinite(+page) ||
  //     +page < 1
  //   ) {
  //     const error = {
  //       error_code: 'VALIDATION_ERROR',
  //       message: 'Page must be an integer of value 1 or higher',
  //     };
  //     logger.error(`${error.error_code} - ${error.message}`);
  //     return res.status(400).send(error);
  //   }

  //   try {
  //     const rows: Ride[] = await db.all(
  //       `SELECT * FROM Rides ORDER BY rideID ASC LIMIT ${pageSize} OFFSET ${
  //         (+page - 1) * pageSize
  //       }`
  //     );

  //     if (rows.length === 0) {
  //       const error = {
  //         error_code: 'RIDES_NOT_FOUND_ERROR',
  //         message: 'Could not find any rides',
  //       };
  //       logger.error(`${error.error_code} - ${error.message}`);
  //       return res.status(404).send(error);
  //     }

  //     return res.send(rows);
  //   } catch (err) {
  //     const error = {
  //       error_code: 'SERVER_ERROR',
  //       message: 'Unknown error',
  //     };
  //     logger.error(`${error.error_code} - ${error.message}`);
  //     return res.status(400).send(error);
  //   }
  // });

  // app.get('/rides/:id', async (req, res) => {
  //   try {
  //     const rows: Ride[] = await db.all(
  //       `SELECT * FROM Rides WHERE rideID='${req.params.id}'`
  //     );

  //     if (rows.length === 0) {
  //       const error = {
  //         error_code: 'RIDES_NOT_FOUND_ERROR',
  //         message: 'Could not find any rides',
  //       };
  //       logger.error(`${error.error_code} - ${error.message}`);
  //       return res.status(404).send(error);
  //     }

  //     return res.send(rows);
  //   } catch (err) {
  //     const error = {
  //       error_code: 'SERVER_ERROR',
  //       message: 'Unknown error',
  //     };
  //     logger.error(`${error.error_code} - ${error.message}`);
  //     return res.status(400).send(error);
  //   }
  // });

  return app;
}

export default buildAppWithDb;
