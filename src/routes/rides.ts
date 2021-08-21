import express, { Router } from 'express';
import createRide from '../controllers/rideController/createRide';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';

function ridesRouter(
  db: Database<sqlite3.Database, sqlite3.Statement>
): Router {
  const router = express.Router();

  router.post('/', express.json(), createRide(db));
  // router.get('/', getRides);
  // router.get('/:id', getRideById);

  return router;
}

export default ridesRouter;
