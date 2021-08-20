'use strict'

import express = require('express')
const app = express()
const port = 8010

import bodyParser = require('body-parser')
import { Database } from 'sqlite3'
const jsonParser = bodyParser.json()

const sqlite3 = require('sqlite3').verbose()
const db: Database = new sqlite3.Database(':memory:')

const buildSchemas = require('./src/schemas')

db.serialize(() => {
  buildSchemas(db)

  const app = require('./src/app')(db)

  app.listen(port, () =>
    console.log(`App started and listening on port ${port}`)
  )
})
