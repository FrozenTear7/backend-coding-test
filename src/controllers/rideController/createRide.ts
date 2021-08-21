import { Response } from 'express';
import { CustomRequest, Ride, RideBody } from '../../types';
import logger from '../../utils/logger';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';

function createRide(db: Database<sqlite3.Database, sqlite3.Statement>) {
  return async function (
    req: CustomRequest<RideBody>,
    res: Response
  ): Promise<Response> {
    const {
      start_lat: startLatitude,
      start_long: startLongitude,
      end_lat: endLatitude,
      end_long: endLongitude,
      rider_name: riderName,
      driver_name: driverName,
      driver_vehicle: driverVehicle,
    } = req.body;

    if (
      startLatitude < -90 ||
      startLatitude > 90 ||
      startLongitude < -180 ||
      startLongitude > 180
    ) {
      const error = {
        error_code: 'VALIDATION_ERROR',
        message:
          'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      };
      logger.error(`${error.error_code} - ${error.message}`);
      return res.status(400).send(error);
    }

    if (
      endLatitude < -90 ||
      endLatitude > 90 ||
      endLongitude < -180 ||
      endLongitude > 180
    ) {
      const error = {
        error_code: 'VALIDATION_ERROR',
        message:
          'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      };
      logger.error(`${error.error_code} - ${error.message}`);
      return res.status(400).send(error);
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      const error = {
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      };
      logger.error(`${error.error_code} - ${error.message}`);
      return res.status(400).send(error);
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      const error = {
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non empty string',
      };
      logger.error(`${error.error_code} - ${error.message}`);
      return res.status(400).send(error);
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      const error = {
        error_code: 'VALIDATION_ERROR',
        message: 'Driver vehicle must be a non empty string',
      };
      logger.error(`${error.error_code} - ${error.message}`);
      return res.status(400).send(error);
    }

    const values = [
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
      riderName,
      driverName,
      driverVehicle,
    ];

    try {
      const insertedRide = await db.run(
        'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
        values
      );

      const rows = await db.all<Ride[]>(
        'SELECT * FROM Rides WHERE rideID = ?',
        insertedRide.lastID
      );

      return res.send(rows);
    } catch (err) {
      const error = {
        error_code: 'SERVER_ERROR',
        message: 'Unknown errorrr',
      };
      logger.error(`${error.error_code} - ${error.message}`);
      return res.status(400).send(error);
    }
  };
}

export default createRide;
