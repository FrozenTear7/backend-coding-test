import request from 'supertest';
import sqlite3, { Database } from 'sqlite3';
import buildSchemas from '../src/schemas';
import buildAppWithDb from '../src/app';
import { expect } from 'chai';
import sinon from 'sinon';

const sqlite3Verbose = sqlite3.verbose();
const db: Database = new sqlite3Verbose.Database(':memory:');

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

  const exampleRides = [
    {
      rideID: 1,
      startLat: 1,
      startLong: 1,
      endLat: 1,
      endLong: 1,
      riderName: 'test',
      driverName: 'test',
      driverVehicle: 'test',
      created: '2021-01-01 00:00:00',
    },
  ];

  describe('GET /health', () => {
    const app = buildAppWithDb(db);

    it('should return health', async () => {
      const validRes = await request(app).get('/health');
      expect(validRes.statusCode).to.equal(200);
      expect(validRes.type).to.equal('text/html');
      expect(validRes.body).to.exist;
    });
  });

  describe('POST /rides', () => {
    describe('request body validation', () => {
      const app = buildAppWithDb(db);

      it('should return a validation error for invalid lat/long', async () => {
        // Check all possible violations of lat/long checks
        const invalidRides = [
          {
            start_lat: -91,
          },
          {
            start_lat: 91,
          },
          {
            start_lat: 1,
            start_long: -181,
          },
          {
            start_lat: 1,
            start_long: 181,
          },
          {
            start_lat: 1,
            start_long: 1,
            end_lat: -91,
          },
          {
            start_lat: 1,
            start_long: 1,
            end_lat: 91,
          },
          {
            start_lat: 1,
            start_long: 1,
            end_lat: 1,
            end_long: -181,
          },
          {
            start_lat: 1,
            start_long: 1,
            end_lat: 1,
            end_long: 181,
          },
        ];

        for (const invalidRide of invalidRides) {
          const invalidRes = await request(app)
            .post('/rides')
            .send(invalidRide);

          expect(invalidRes.statusCode).to.equal(400);
          expect(invalidRes.type).to.equal('application/json');
          expect(invalidRes.body).to.exist;
          expect(invalidRes.body).to.include.keys('error_code', 'message');
        }
      });

      it('should return a validation error for invalid riderName', async () => {
        // Either nonexistent or an empty string
        const invalidRides = [
          {
            start_lat: 1,
            start_long: 1,
            end_lat: 1,
            end_long: 1,
          },
          {
            start_lat: 1,
            start_long: 1,
            end_lat: 1,
            end_long: 1,
            rider_name: '',
          },
        ];

        for (const invalidRide of invalidRides) {
          const invalidRes = await request(app)
            .post('/rides')
            .send(invalidRide);

          expect(invalidRes.statusCode).to.equal(400);
          expect(invalidRes.type).to.equal('application/json');
          expect(invalidRes.body).to.exist;
          expect(invalidRes.body).to.include.keys('error_code', 'message');
        }
      });

      it('should return a validation error for invalid driverName', async () => {
        const invalidRides = [
          {
            start_lat: 1,
            start_long: 1,
            end_lat: 1,
            end_long: 1,
            rider_name: 'test',
          },
          {
            start_lat: 1,
            start_long: 1,
            end_lat: 1,
            end_long: 1,
            rider_name: 'test',
            driver_name: '',
          },
        ];

        for (const invalidRide of invalidRides) {
          const invalidRes = await request(app)
            .post('/rides')
            .send(invalidRide);

          expect(invalidRes.statusCode).to.equal(400);
          expect(invalidRes.type).to.equal('application/json');
          expect(invalidRes.body).to.exist;
          expect(invalidRes.body).to.include.keys('error_code', 'message');
        }
      });

      it('should return a validation error for invalid driverVehicle', async () => {
        const invalidRides = [
          {
            start_lat: 1,
            start_long: 1,
            end_lat: 1,
            end_long: 1,
            rider_name: 'test',
            driver_name: 'test',
          },
          {
            start_lat: 1,
            start_long: 1,
            end_lat: 1,
            end_long: 1,
            rider_name: 'test',
            driver_name: 'test',
            driver_vehicle: '',
          },
        ];

        for (const invalidRide of invalidRides) {
          const invalidRes = await request(app)
            .post('/rides')
            .send(invalidRide);

          expect(invalidRes.statusCode).to.equal(400);
          expect(invalidRes.type).to.equal('application/json');
          expect(invalidRes.body).to.exist;
          expect(invalidRes.body).to.include.keys('error_code', 'message');
        }
      });
    });

    describe('db insert', () => {
      afterEach(function () {
        sinon.restore();
      });

      const testRide = {
        start_lat: 1,
        start_long: 1,
        end_lat: 1,
        end_long: 1,
        rider_name: 'test',
        driver_name: 'test',
        driver_vehicle: 'test',
      };

      it('should return a server error for a db error for insertion', async () => {
        sinon.stub(db, 'run').yields(true); // Mock an error outcome
        const app = buildAppWithDb(db);

        const invalidRes = await request(app).post('/rides').send(testRide);

        expect(invalidRes.statusCode).to.equal(400);
        expect(invalidRes.type).to.equal('application/json');
        expect(invalidRes.body).to.exist;
        expect(invalidRes.body).to.include.keys('error_code', 'message');
      });

      it('should return a server error for a db error selection after insertion', async () => {
        sinon.stub(db, 'run').callsArgOnWith(2, { lastID: 1 }, false); // Mock a valid return with an artificial context of 'this'
        sinon.stub(db, 'all').yields(true);
        const app = buildAppWithDb(db);

        const invalidRes = await request(app).post('/rides').send(testRide);

        expect(invalidRes.statusCode).to.equal(400);
        expect(invalidRes.type).to.equal('application/json');
        expect(invalidRes.body).to.exist;
        expect(invalidRes.body).to.include.keys('error_code', 'message');
      });

      it('should return a ride after its creation', async () => {
        sinon.stub(db, 'run').callsArgOnWith(2, { lastID: 1 }, false);
        sinon.stub(db, 'all').yields(false, exampleRides);
        const app = buildAppWithDb(db);

        const validRes = await request(app).post('/rides').send(testRide);

        expect(validRes.statusCode).to.equal(200);
        expect(validRes.type).to.equal('application/json');
        expect(validRes.body).to.deep.equal(exampleRides);
      });
    });
  });

  describe('GET /rides', () => {
    afterEach(function () {
      sinon.restore();
    });

    it('should return a server error for a db error', async () => {
      sinon.stub(db, 'all').yields(true);
      const app = buildAppWithDb(db);

      const invalidRes = await request(app).get('/rides');

      expect(invalidRes.statusCode).to.equal(400);
      expect(invalidRes.type).to.equal('application/json');
      expect(invalidRes.body).to.exist;
      expect(invalidRes.body).to.include.keys('error_code', 'message');
    });

    it('should return a rides not found error for no rows', async () => {
      sinon.stub(db, 'all').yields(false, []);
      const app = buildAppWithDb(db);

      const invalidRes = await request(app).get('/rides');

      expect(invalidRes.statusCode).to.equal(404);
      expect(invalidRes.type).to.equal('application/json');
      expect(invalidRes.body).to.exist;
      expect(invalidRes.body).to.include.keys('error_code', 'message');
    });

    it('should return existing rides', async () => {
      sinon.stub(db, 'all').yields(false, exampleRides);
      const app = buildAppWithDb(db);

      const validRes = await request(app).get('/rides');

      expect(validRes.statusCode).to.equal(200);
      expect(validRes.type).to.equal('application/json');
      expect(validRes.body).to.deep.equal(exampleRides);
    });
  });

  describe('GET /rides/:id', () => {
    afterEach(function () {
      sinon.restore();
    });

    it('should return a server error for a db error', async () => {
      sinon.stub(db, 'all').yields(true);
      const app = buildAppWithDb(db);

      const invalidRes = await request(app).get('/rides/1');

      expect(invalidRes.statusCode).to.equal(400);
      expect(invalidRes.type).to.equal('application/json');
      expect(invalidRes.body).to.exist;
      expect(invalidRes.body).to.include.keys('error_code', 'message');
    });

    it('should return a rides not found error for no rows', async () => {
      sinon.stub(db, 'all').yields(false, []);
      const app = buildAppWithDb(db);

      const invalidRes = await request(app).get('/rides/1');

      expect(invalidRes.statusCode).to.equal(404);
      expect(invalidRes.type).to.equal('application/json');
      expect(invalidRes.body).to.exist;
      expect(invalidRes.body).to.include.keys('error_code', 'message');
    });

    it('should return existing rides', async () => {
      sinon.stub(db, 'all').yields(false, exampleRides);
      const app = buildAppWithDb(db);

      const validRes = await request(app).get('/rides/1');

      expect(validRes.statusCode).to.equal(200);
      expect(validRes.type).to.equal('application/json');
      expect(validRes.body).to.deep.equal(exampleRides);
    });
  });
});
