import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';

const buildSchemas = async (
  db: Database<sqlite3.Database, sqlite3.Statement>
): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
  const createRideTableSchema = `
        CREATE TABLE Rides
        (
        rideID INTEGER PRIMARY KEY AUTOINCREMENT,
        startLat DECIMAL NOT NULL,
        startLong DECIMAL NOT NULL,
        endLat DECIMAL NOT NULL,
        endLong DECIMAL NOT NULL,
        riderName TEXT NOT NULL,
        driverName TEXT NOT NULL,
        driverVehicle TEXT NOT NULL,
        created DATETIME default CURRENT_TIMESTAMP
        )
    `;

  await db.run(createRideTableSchema);

  return db;
};

export default buildSchemas;
