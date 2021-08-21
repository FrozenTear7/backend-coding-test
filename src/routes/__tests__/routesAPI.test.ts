import request from 'supertest';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { expect } from 'chai';
import sinon from 'sinon';
import buildSchemas from '../../schemas';
import buildAppWithDb from '../../app';
import * as validateLatitude from '../../validators/validateLatitude';
import * as validateLongitude from '../../validators/validateLongitude';
import * as validateString from '../../validators/validateString';

void (async () => {
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database,
  });

  await buildSchemas(db);

  describe('POST /rides', () => {
    const exampleValidRideBody = {
      start_lat: 1,
      start_long: 1,
      end_lat: 1,
      end_long: 1,
      rider_name: 'test',
      driver_name: 'test',
      driver_vehicle: 'test',
    };

    afterEach(() => {
      sinon.restore();
    });

    describe('request body validation', () => {
      const app = buildAppWithDb(db);

      it('should return a validation error for invalid latitude', async () => {
        sinon.stub(validateLatitude, 'default').returns(true);

        const invalidRes = await request(app)
          .post('/rides')
          .send(exampleValidRideBody);

        expect(invalidRes.statusCode).to.equal(400);
        expect(invalidRes.type).to.equal('application/json');
        expect(invalidRes.body).to.exist;
        expect(invalidRes.body).to.include.keys('error_code', 'message');
      });

      it('should return a validation error for invalid longitude', async () => {
        sinon.stub(validateLongitude, 'default').returns(true);

        const invalidRes = await request(app)
          .post('/rides')
          .send(exampleValidRideBody);

        expect(invalidRes.statusCode).to.equal(400);
        expect(invalidRes.type).to.equal('application/json');
        expect(invalidRes.body).to.exist;
        expect(invalidRes.body).to.include.keys('error_code', 'message');
      });

      it('should return a validation error for invalid string', async () => {
        sinon.stub(validateString, 'default').returns(true);

        const invalidRes = await request(app)
          .post('/rides')
          .send(exampleValidRideBody);

        expect(invalidRes.statusCode).to.equal(400);
        expect(invalidRes.type).to.equal('application/json');
        expect(invalidRes.body).to.exist;
        expect(invalidRes.body).to.include.keys('error_code', 'message');
      });
    });

    describe('db insert', () => {
      afterEach(() => {
        sinon.restore();
      });

      it('should return a server error for a db error for insertion', async () => {
        sinon.stub(db, 'run').rejects('Server error during .run()');
        const app = buildAppWithDb(db);

        const invalidRes = await request(app)
          .post('/rides')
          .send(exampleValidRideBody);

        expect(invalidRes.statusCode).to.equal(400);
        expect(invalidRes.type).to.equal('application/json');
        expect(invalidRes.body).to.exist;
        expect(invalidRes.body).to.include.keys('error_code', 'message');
      });
    });
  });

  describe('GET /rides', () => {
    const exampleRides = {
      rideID: 1,
      start_lat: 1,
      start_long: 1,
      end_lat: 1,
      end_long: 1,
      rider_name: 'test',
      driver_name: 'test',
      driver_vehicle: 'test',
      created: '2021-01-01 00:00:00',
    };

    afterEach(() => {
      sinon.restore();
    });

    it('should return a validation error for invalid page query param', async () => {
      const app = buildAppWithDb(db);

      const invalidParams = ['invalid', Math.max(), -1];

      for (const invalidParam of invalidParams) {
        const invalidRes = await request(app)
          .get(`/rides`)
          .query({ page: invalidParam });

        expect(invalidRes.statusCode).to.equal(400);
        expect(invalidRes.type).to.equal('application/json');
        expect(invalidRes.body).to.exist;
        expect(invalidRes.body).to.include.keys('error_code', 'message');
      }
    });

    it('should return a server error for a db error', async () => {
      sinon.stub(db, 'all').throwsException();
      const app = buildAppWithDb(db);

      const invalidRes = await request(app).get('/rides');

      expect(invalidRes.statusCode).to.equal(400);
      expect(invalidRes.type).to.equal('application/json');
      expect(invalidRes.body).to.exist;
      expect(invalidRes.body).to.include.keys('error_code', 'message');
    });

    it('should return a rides not found error for no rows', async () => {
      sinon.stub(db, 'all').resolves([]);
      const app = buildAppWithDb(db);

      const invalidRes = await request(app).get('/rides');

      expect(invalidRes.statusCode).to.equal(404);
      expect(invalidRes.type).to.equal('application/json');
      expect(invalidRes.body).to.exist;
      expect(invalidRes.body).to.include.keys('error_code', 'message');
    });

    it('should return existing rides', async () => {
      sinon.stub(db, 'all').resolves(exampleRides);
      const app = buildAppWithDb(db);

      const validRes = await request(app).get('/rides');

      expect(validRes.statusCode).to.equal(200);
      expect(validRes.type).to.equal('application/json');
      expect(validRes.body).to.deep.equal(exampleRides);
    });
  });

  describe('GET /rides/:id', () => {
    const exampleRides = {
      rideID: 1,
      start_lat: 1,
      start_long: 1,
      end_lat: 1,
      end_long: 1,
      rider_name: 'test',
      driver_name: 'test',
      driver_vehicle: 'test',
      created: '2021-01-01 00:00:00',
    };

    afterEach(() => {
      sinon.restore();
    });

    it('should return a server error for a db error', async () => {
      sinon.stub(db, 'all').throwsException();
      const app = buildAppWithDb(db);

      const invalidRes = await request(app).get('/rides/1');

      expect(invalidRes.statusCode).to.equal(400);
      expect(invalidRes.type).to.equal('application/json');
      expect(invalidRes.body).to.exist;
      expect(invalidRes.body).to.include.keys('error_code', 'message');
    });

    it('should return a rides not found error for no rows', async () => {
      sinon.stub(db, 'all').resolves([]);
      const app = buildAppWithDb(db);

      const invalidRes = await request(app).get('/rides/1');

      expect(invalidRes.statusCode).to.equal(404);
      expect(invalidRes.type).to.equal('application/json');
      expect(invalidRes.body).to.exist;
      expect(invalidRes.body).to.include.keys('error_code', 'message');
    });

    it('should return existing rides', async () => {
      sinon.stub(db, 'all').resolves(exampleRides);
      const app = buildAppWithDb(db);

      const validRes = await request(app).get('/rides/1');

      expect(validRes.statusCode).to.equal(200);
      expect(validRes.type).to.equal('application/json');
      expect(validRes.body).to.deep.equal(exampleRides);
    });
  });

  await db.close();
})();
