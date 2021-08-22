import express, { Router } from 'express';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';
import createRide from '../controllers/rideController/createRide';
import getRides from '../controllers/rideController/getRides';
import getRideById from '../controllers/rideController/getRideById';

const ridesRouter = (
  db: Database<sqlite3.Database, sqlite3.Statement>
): Router => {
  const router = express.Router();

  router.post('/', express.json(), createRide(db));
  router.get('/', express.json(), getRides(db));
  router.get('/:id', getRideById(db));

  return router;
};

export default ridesRouter;
