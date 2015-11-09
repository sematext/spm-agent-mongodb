#!/usr/bin/env node
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
var url = require('url')
function MongoDbMonitor () {
  // config.collectionInterval = 1000
  var mongoDbUrl = 'mongodb://localhost:27017/admin'
  if (process.env.SPM_TOKEN && !SpmAgent.Config.tokens.spm) {
    SpmAgent.Config.tokens.spm = process.env.SPM_TOKEN
  }
  if (process.argv[2] && process.argv[2].length > 30) {
    SpmAgent.Config.tokens.spm = process.argv[2]
  }
  if (process.argv.length > 3) {
    var parsedUrl = url.parse(process.argv[3])
    if (/mongodb/.test (parsedUrl.protocol) && parsedUrl.port !== null) {
      mongoDbUrl = process.argv[3]
    } else {
      mongoDbUrl = process.env.SPM_MONGODB_URL || mongoDbUrl
      console.error('Invalid MongoDB-URL: ' + process.argv[3] + ' using ' + mongoDbUrl)
    }
  }
  var njsAgent = new SpmAgent()
  njsAgent.on('metrics', console.log)
  var agentsToLoad = [
    './mongodb-agent',
    './osAgent'
  ]
  agentsToLoad.forEach(function (a) {
    try {
      var Monitor = require(a)
      if (a === './mongodb-agent') {
        njsAgent.createAgent(new Monitor(mongoDbUrl))
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
if (process.env.SPM_TOKEN || process.argv[2] && process.argv[2].length > 30) {
  tokens++
  MongoDbMonitor()
} else {
  console.log('Missing SPM_TOKEN')
}
if (tokens === 0) {
  console.log('Please specify the required environment variables: SPM_TOKEN')
  process.exit(-1)
}

process.on('uncaughtException', function (err) {
  console.error((new Date()).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
})
