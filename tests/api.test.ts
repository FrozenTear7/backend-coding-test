import request from 'supertest';
import sqlite3, { Database } from 'sqlite3';
import buildSchemas from '../src/schemas';
import buildAppWithDb from '../src/app';

const sqlite3Verbose = sqlite3.verbose();
const db: Database = new sqlite3Verbose.Database(':memory:');

const app = buildAppWithDb(db);

describe('API tests', () => {
  before((done) => {
    try {
      db.serialize(() => {
        buildSchemas(db);

        done();
      });
    } catch (err) {
      return done(err);
    }
  });

  describe('GET /health', () => {
    it('should return health', async (done) => {
      await request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });
});
