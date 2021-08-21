import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import buildSchemas from './src/schemas';
import buildAppWithDb from './src/app';
import logger from './src/utils/logger';

void (async () => {
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database,
  });

  const port = 8010;

  await buildSchemas(db);

  const app = buildAppWithDb(db);

  app.listen(port, () =>
    logger.info(`App started and listening on port ${port}`)
  );
})();
