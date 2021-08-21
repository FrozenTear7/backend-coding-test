import { Response } from 'express';
import { CustomRequest, ErrorCode, Ride, RideBody } from '../../types';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';
import responseError from '../../utils/responseError';
import logger from '../../utils/logger';

const getRideById = (db: Database<sqlite3.Database, sqlite3.Statement>) => {
  return async (req: CustomRequest<RideBody>, res: Response): Promise<void> => {
    try {
      const rows = await db.all<Ride[]>(
        `SELECT * FROM Rides WHERE rideID='${req.params.id}'`
      );

      if (rows.length === 0) {
        res
          .status(404)
          .send(
            responseError(
              ErrorCode.RIDES_NOT_FOUND_ERROR,
              'Could not find any rides'
            )
          );
      } else {
        res.send(rows);
      }
    } catch (err) {
      logger.error(err);
      res
        .status(400)
        .send(responseError(ErrorCode.SERVER_ERROR, 'Unknown error'));
    }
  };
};

export default getRideById;
