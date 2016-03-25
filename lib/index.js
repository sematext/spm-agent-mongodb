#!/bin/sh
':' //; export MAX_MEM="--max-old-space-size=60"; exec "$(command -v node || command -v nodejs)" "${NODE_OPTIONS:-$MAX_MEM}" "$0" "$@" 

/*
 * @copyright Copyright (c) Sematext Group, Inc. - All Rights Reserved
 *
 * @licence SPM Agent for MongoDB is free-to-use, proprietary software.
 * THIS IS PROPRIETARY SOURCE CODE OF Sematext Group, Inc. (Sematext)
 * This source code may not be copied, reverse engineered, or altered for any purpose.
 * This source code is to be used exclusively by users and customers of Sematext.
 * Please see the full license (found in LICENSE in this distribution) for details on its license and the licenses of its dependencies.
 */
var SpmAgent = require('spm-agent')
var osAgent = require ('./osAgent')
var mongoDbAgent = require('./mongodb-agent')
// this requires are here to compile with enclose.js 
var packageJson = require('../package.json')
var packageJson2 = require('spm-agent/package.json')

var url = require('url')
function MongoDbMonitor () {
  // config.collectionInterval = 1000
  var mongoDbCfgFromEnv = null
  if (process.env.SPM_MONGODB_URLS) {
    mongoDbCfgFromEnv = process.env.SPM_MONGODB_URLS.replace('  ', ' ').split(' ')
  }
  var mongoDbUrl = SpmAgent.Config.mongodb.url || ['mongodb://localhost:27017/admin']
  if (process.argv.length > 3) {
    var parsedUrl = url.parse(process.argv[3])
    if (/mongodb/.test (parsedUrl.protocol) && parsedUrl.port !== null) {
      mongoDbUrl = [process.argv[3]]
    } else {
      mongoDbUrl = [process.env.SPM_MONGODB_URL] || mongoDbUrl
      console.error('Invalid MongoDB-URL: ' + process.argv[3] + ' using ' + mongoDbUrl)
    }
  }
  var njsAgent = new SpmAgent()
  var agentsToLoad = [
      mongoDbAgent,
      osAgent
  ]
  agentsToLoad.forEach(function (a) {
    try {
      var Monitor = a
      if (a === mongoDbAgent) {
          mongoDbUrl.forEach(function (url) {
          var secureUrl = url.replace(/:.*@/i, ' ') 
          console.log('Start Monitor for: ' + secureUrl)
          njsAgent.createAgent(new Monitor(url))
        })
      } else {
        njsAgent.createAgent(new Monitor())
      }
    } catch (err) {
      console.log(err)
      SpmAgent.Logger.error('Error loading agent ' + a + ' ' + err)
    }
  })
  return njsAgent
}
var tokens = 0
console.log('SPM Token: ' + SpmAgent.Config.get('tokens.spm'))
if (SpmAgent.Config.get('tokens.spm') || process.env.SPM_TOKEN || process.argv[2] && process.argv[2].length > 30) {
  if (process.argv[2] && process.argv[2].length > 30)
  {
    process.env.SPM_TOKEN=process.argv[2]
  }
  tokens++
  MongoDbMonitor()
} else {
  console.log('Missing SPM_TOKEN')
}
if (tokens === 0) {
  console.log('Please specify the required environment variables: SPM_TOKEN or edit /etc/spmagent/config file')
  process.exit(-1)
}

process.on('uncaughtException', function (err) {
  console.error((new Date()).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})
