'use strict'
var MongoClient = require('mongodb').MongoClient
var fs = require('fs')
var sslFilesRead = false
function readCertAndKeyFiles (config) {
  if (config.sslOptions) {
    Object.keys(config.sslOptions).forEach(function (opt) {
      if (config.sslOptions[opt].sslCA && !sslFilesRead) {
        config.sslOptions[opt].sslCA = fs.readFileSync(config.sslOptions[opt].sslCA)
      }
      if (config.sslOptions[opt].sslKey && !sslFilesRead) {
        config.sslOptions[opt].sslKey = fs.readFileSync(config.sslOptions[opt].sslKey)
      }
      if (config.sslOptions[opt].sslCert && !sslFilesRead) {
        config.sslOptions[opt].sslCert = fs.readFileSync(config.sslOptions[opt].sslCert)
      }
      sslFilesRead = true
    })
  }
}

function mongoConnect (config, cb) {
  if (config.sslOptions) {
    try {
      readCertAndKeyFiles(config)
      // avoid deprection message in mongodb 3.x drivers
      config.sslOptions.useUnifiedTopology = true
      MongoClient.connect(config.url, config.sslOptions, cb)
    } catch (error) {
      cb(error)
    }
  } else {
    MongoClient.connect(config.url, { useUnifiedTopology: true }, function (err, db) {
      if (err) {
        console.error('Error: ', err)
      }
      cb(err, db)
    })
  }
}

module.exports = mongoConnect
