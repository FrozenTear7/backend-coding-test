import { Response } from 'express';
import { CustomRequest, ErrorCode, Ride, RideBody } from '../../types';
import logger from '../../utils/logger';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';
import responseError from '../../utils/responseError';

const getRides = (db: Database<sqlite3.Database, sqlite3.Statement>) => {
  return async (req: CustomRequest<RideBody>, res: Response): Promise<void> => {
    const pageSize = 10;

    const page = req.query.page || '1';

    if (
      typeof page !== 'string' ||
      isNaN(+page) ||
      !isFinite(+page) ||
      +page < 1
    ) {
      const error = {
        error_code: 'VALIDATION_ERROR',
        message: 'Page must be an integer of value 1 or higher',
      };
      logger.error(`${error.error_code} - ${error.message}`);
      res.status(400).send(error);
    } else {
      try {
        const rows = await db.all<Ride[]>(
          `SELECT * FROM Rides ORDER BY rideID ASC LIMIT ${pageSize} OFFSET ${
            (+page - 1) * pageSize
          }`
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
    }
  };
};

export default getRides;
