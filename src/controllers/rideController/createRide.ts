import { Response } from 'express';
import { CustomRequest, ErrorCode, Ride, RideBody } from '../../types';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';
import responseError from '../../utils/responseError';
import validateLatitude from '../../validators/validateLatitude';
import validateLongitude from '../../validators/validateLongitude';
import validateString from '../../validators/validateString';
import logger from '../../utils/logger';

const createRide = (db: Database<sqlite3.Database, sqlite3.Statement>) => {
  return async (req: CustomRequest<RideBody>, res: Response): Promise<void> => {
    const {
      start_lat: startLatitude,
      start_long: startLongitude,
      end_lat: endLatitude,
      end_long: endLongitude,
      rider_name: riderName,
      driver_name: driverName,
      driver_vehicle: driverVehicle,
    } = req.body;

    if (validateLatitude(startLatitude) || validateLongitude(startLongitude)) {
      res
        .status(400)
        .send(
          responseError(
            ErrorCode.VALIDATION_ERROR,
            'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
          )
        );
    } else if (
      validateLatitude(endLatitude) ||
      validateLongitude(endLongitude)
    ) {
      res
        .status(400)
        .send(
          responseError(
            ErrorCode.VALIDATION_ERROR,
            'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
          )
        );
    } else if (validateString(riderName)) {
      res
        .status(400)
        .send(
          responseError(
            ErrorCode.VALIDATION_ERROR,
            'Rider name must be a non empty string'
          )
        );
    } else if (validateString(driverName)) {
      res
        .status(400)
        .send(
          responseError(
            ErrorCode.VALIDATION_ERROR,
            'Driver name must be a non empty string'
          )
        );
    } else if (validateString(driverVehicle)) {
      res
        .status(400)
        .send(
          responseError(
            ErrorCode.VALIDATION_ERROR,
            'Driver vehicle must be a non empty string'
          )
        );
    } else {
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

        res.send(rows);
      } catch (err) {
        logger.error(err);
        res
          .status(400)
          .send(responseError(ErrorCode.SERVER_ERROR, 'Unknown error'));
      }
    }
  };
};

export default createRide;
