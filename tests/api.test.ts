import request from 'supertest'
import { Database } from 'sqlite3'

const sqlite3 = require('sqlite3').verbose()
const db: Database = new sqlite3.Database(':memory:')

const app = require('../src/app')(db)
const buildSchemas = require('../src/schemas')

describe('API tests', () => {
  before((done) => {
    try {
      db.serialize(() => {
        buildSchemas(db)

        done()
      })
    } catch (err) {
      return done(err)
    }
  })

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done)
    })
  })
})
