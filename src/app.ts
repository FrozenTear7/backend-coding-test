import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { Database } from 'sqlite3';
import { RideBody } from './types';

const app = express();

const swaggerDocument = YAML.load(
  './public/swagger.yaml'
) as swaggerUi.JsonObject;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

function buildAppWithDb(db: Database): express.Express {
  app.get('/health', (_req, res) => res.send('Healthy'));

  app.post('/rides', express.json(), (req, res) => {
    const rideBody = req.body as RideBody;

    const startLatitude = Number(rideBody.start_lat);
    const startLongitude = Number(rideBody.start_long);
    const endLatitude = Number(rideBody.end_lat);
    const endLongitude = Number(rideBody.end_long);
    const riderName = rideBody.rider_name;
    const driverName = rideBody.driver_name;
    const driverVehicle = rideBody.driver_vehicle;

    if (
      startLatitude < -90 ||
      startLatitude > 90 ||
      startLongitude < -180 ||
      startLongitude > 180
    ) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message:
          'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (
      endLatitude < -90 ||
      endLatitude > 90 ||
      endLongitude < -180 ||
      endLongitude > 180
    ) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message:
          'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non empty string',
      });
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver vehicle must be a non empty string',
      });
    }

    const values = [
      rideBody.start_lat,
      rideBody.start_long,
      rideBody.end_lat,
      rideBody.end_long,
      rideBody.rider_name,
      rideBody.driver_name,
      rideBody.driver_vehicle,
    ];

    return db.run(
      'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
      values,
      function (err) {
        if (err) {
          return res.status(400).send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }

        return db.all(
          'SELECT * FROM Rides WHERE rideID = ?',
          this.lastID,
          function (err, rows) {
            if (err) {
              return res.status(400).send({
                error_code: 'SERVER_ERROR',
                message: 'Unknown error',
              });
            }

            return res.send(rows);
          }
        );
      }
    );
  });

  app.get('/rides', (_req, res) => {
    db.all('SELECT * FROM Rides', function (err, rows) {
      if (err) {
        return res.status(400).send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      if (rows.length === 0) {
        return res.status(404).send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      return res.send(rows);
    });
  });

  app.get('/rides/:id', (req, res) => {
    db.all(
      `SELECT * FROM Rides WHERE rideID='${req.params.id}'`,
      function (err, rows) {
        if (err) {
          return res.status(400).send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }

        if (rows.length === 0) {
          return res.status(404).send({
            error_code: 'RIDES_NOT_FOUND_ERROR',
            message: 'Could not find any rides',
          });
        }

        return res.send(rows);
      }
    );
  });

  return app;
}

export default buildAppWithDb;
