import express, { Router } from 'express';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';
import rateLimit from 'express-rate-limit';
import createRide from '../controllers/rideController/createRide';
import getRides from '../controllers/rideController/getRides';
import getRideById from '../controllers/rideController/getRideById';

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 mins
  max: 100, // 100 requests per windowsMs for each IP
  message: 'Too many requestes from this IP, try again in 5 minutes',
  skip: (req) => {
    const addr = req.socket.remoteAddress;
    if (addr && ['127.0.0.1', '::ffff:127.0.0.1', '::1'].includes(addr))
      // Don't block localhost
      return true;
    else return false;
  },
});

const ridesRouter = (
  db: Database<sqlite3.Database, sqlite3.Statement>
): Router => {
  const router = express.Router();

  router.post('/', [express.json({ limit: '3kb' }), limiter], createRide(db));
  router.get('/', getRides(db));
  router.get('/:id', getRideById(db));

  return router;
};

export default ridesRouter;
