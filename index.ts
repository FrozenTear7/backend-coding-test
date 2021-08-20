import sqlite3, { Database } from 'sqlite3';
import buildSchemas from './src/schemas';
import buildAppWithDb from './src/app';

const sqlite3Verbose = sqlite3.verbose();
const db: Database = new sqlite3Verbose.Database(':memory:');

const port = 8010;

db.serialize(() => {
  buildSchemas(db);

  const app = buildAppWithDb(db);

  app.listen(port, () =>
    console.log(`App started and listening on port ${port}`)
  );
});
